import { LogoConfig } from '../types/motion';
import { renderMotionLogoFrame } from './canvasRenderer';
import { soundEngine } from './soundEngine';

/**
 * Helper to construct a QuickTime Atom (4-byte big-endian size + 4-byte ASCII type + payload)
 */
function makeAtom(type: string, ...payloads: Uint8Array[]): Uint8Array {
  const payloadLen = payloads.reduce((sum, p) => sum + p.byteLength, 0);
  const totalLen = 8 + payloadLen;
  const out = new Uint8Array(totalLen);
  const view = new DataView(out.buffer);
  view.setUint32(0, totalLen, false);
  for (let i = 0; i < 4; i++) {
    out[4 + i] = type.charCodeAt(i) & 0xff;
  }
  let offset = 8;
  for (const p of payloads) {
    out.set(p, offset);
    offset += p.byteLength;
  }
  return out;
}

function u32(val: number): Uint8Array {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, val >>> 0, false);
  return b;
}

function u16(val: number): Uint8Array {
  const b = new Uint8Array(2);
  new DataView(b.buffer).setUint16(0, val & 0xffff, false);
  return b;
}

function ascii(str: string): Uint8Array {
  const b = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    b[i] = str.charCodeAt(i) & 0xff;
  }
  return b;
}

function identityMatrix(): Uint8Array {
  const b = new Uint8Array(36);
  const v = new DataView(b.buffer);
  v.setUint32(0, 0x00010000, false);
  v.setUint32(16, 0x00010000, false);
  v.setUint32(32, 0x40000000, false);
  return b;
}

function canvasToPngBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to encode PNG frame'));
        return;
      }
      blob
        .arrayBuffer()
        .then((buf) => resolve(new Uint8Array(buf)))
        .catch(reject);
    }, 'image/png');
  });
}

/**
 * Builds a QuickTime .MOV container (ftyp 'qt  ') containing:
 * - Track 1: 32-bit RGBA PNG Video ('png ', depth 32 with full Alpha channel)
 * - Track 2: 16-bit Little-Endian PCM Audio ('sowt', 48kHz) when SFX is enabled
 */
function muxQuickTimeMov(
  width: number,
  height: number,
  fps: number,
  durationSeconds: number,
  pngFrames: Uint8Array[],
  pcm16Audio: Int16Array | null,
  audioSampleRate: number
): Blob {
  const numFrames = pngFrames.length;
  const movieTimescale = 600;
  const movieDuration = Math.round(durationSeconds * movieTimescale);
  const videoTimescale = fps * 100;
  const videoSampleDuration = 100;
  const videoMediaDuration = numFrames * videoSampleDuration;

  // 1. ftyp atom (20 bytes)
  const ftyp = makeAtom(
    'ftyp',
    ascii('qt  '),
    u32(0x00000200),
    ascii('qt  ')
  );

  // Calculate exact byte offsets inside the file for mdat payload
  const mdatHeaderSize = 8;
  const mdatStartOffset = ftyp.byteLength + mdatHeaderSize;

  const videoOffsets: number[] = [];
  const videoSizes: number[] = [];
  let runningOffset = mdatStartOffset;

  for (let i = 0; i < numFrames; i++) {
    videoOffsets.push(runningOffset);
    const sz = pngFrames[i].byteLength;
    videoSizes.push(sz);
    runningOffset += sz;
  }

  let audioBytes: Uint8Array | null = null;
  let audioChunkOffset = 0;
  if (pcm16Audio && pcm16Audio.length > 0) {
    audioChunkOffset = runningOffset;
    audioBytes = new Uint8Array(pcm16Audio.byteLength);
    const audioView = new DataView(audioBytes.buffer);
    for (let i = 0; i < pcm16Audio.length; i++) {
      audioView.setInt16(i * 2, pcm16Audio[i], true); // 'sowt' = 16-bit little-endian signed PCM
    }
    runningOffset += audioBytes.byteLength;
  }

  const mdatTotalSize = mdatHeaderSize + (runningOffset - mdatStartOffset);
  const mdatHeader = new Uint8Array(8);
  const mdatHeaderView = new DataView(mdatHeader.buffer);
  mdatHeaderView.setUint32(0, mdatTotalSize, false);
  mdatHeader.set(ascii('mdat'), 4);

  // 2. Movie Header Atom (mvhd)
  const mvhd = makeAtom(
    'mvhd',
    u32(0), // version 0 + flags 0
    u32(0), // creation time
    u32(0), // modification time
    u32(movieTimescale),
    u32(movieDuration),
    u32(0x00010000), // preferred rate 1.0
    u16(0x0100), // preferred volume 1.0
    new Uint8Array(10), // reserved
    identityMatrix(),
    new Uint8Array(24), // preview/poster/selection/current time
    u32(audioBytes ? 3 : 2) // next track ID
  );

  // 3. Video Track (trak)
  const videoTkhd = makeAtom(
    'tkhd',
    u32(0x0000000f), // version 0 + flags (enabled, in movie, in preview, in poster)
    u32(0), // creation time
    u32(0), // modification time
    u32(1), // track ID = 1
    u32(0), // reserved
    u32(movieDuration),
    new Uint8Array(8), // reserved
    u16(0), // layer
    u16(0), // alternate group
    u16(0), // volume 0 for video
    u16(0), // reserved
    identityMatrix(),
    u32(width << 16), // 16.16 fixed point width
    u32(height << 16) // 16.16 fixed point height
  );

  const videoMdhd = makeAtom(
    'mdhd',
    u32(0), // version + flags
    u32(0), // creation
    u32(0), // modification
    u32(videoTimescale),
    u32(videoMediaDuration),
    u16(0), // language
    u16(0) // quality
  );

  const videoHdlr = makeAtom(
    'hdlr',
    u32(0),
    ascii('mhlr'),
    ascii('vide'),
    u32(0),
    u32(0),
    u32(0),
    new Uint8Array([11, ...ascii('Video Media')])
  );

  const vmhd = makeAtom(
    'vmhd',
    u32(0x00000001), // version 0 + flags 1
    u16(0x0040), // graphicsMode = ditherCopy
    new Uint8Array(6) // opcolor = 0,0,0
  );

  const dataHdlr = makeAtom(
    'hdlr',
    u32(0),
    ascii('dhlr'),
    ascii('alis'),
    u32(0),
    u32(0),
    u32(0),
    new Uint8Array([9, ...ascii('DataHndlr')])
  );

  const alisEntry = makeAtom('alis', u32(0x00000001));
  const dref = makeAtom('dref', u32(0), u32(1), alisEntry);
  const dinf = makeAtom('dinf', dref);

  // QuickTime Video Sample Description ('png ', depth = 32 for RGBA Alpha)
  const compressorName = new Uint8Array(32);
  compressorName[0] = 3;
  compressorName.set(ascii('PNG'), 1);

  const pngSampleEntry = makeAtom(
    'png ',
    new Uint8Array(6), // reserved
    u16(1), // data reference index = 1
    u16(0), // version = 0
    u16(0), // revision level = 0
    ascii('appl'), // vendor
    u32(512), // temporal quality
    u32(1024), // spatial quality (lossless)
    u16(width),
    u16(height),
    u32(0x00480000), // 72 dpi horizontal
    u32(0x00480000), // 72 dpi vertical
    u32(0), // data size
    u16(1), // frame count = 1
    compressorName,
    u16(32), // depth = 32 (24-bit RGB + 8-bit Alpha channel!)
    u16(0xffff) // color table ID = -1 (default)
  );

  const videoStsd = makeAtom('stsd', u32(0), u32(1), pngSampleEntry);
  const videoStts = makeAtom(
    'stts',
    u32(0),
    u32(1),
    u32(numFrames),
    u32(videoSampleDuration)
  );
  const videoStsc = makeAtom(
    'stsc',
    u32(0),
    u32(1),
    u32(1), // first chunk = 1
    u32(1), // 1 frame per chunk
    u32(1) // sample description ID = 1
  );

  const stszPayload = new Uint8Array(numFrames * 4);
  const stszView = new DataView(stszPayload.buffer);
  for (let i = 0; i < numFrames; i++) {
    stszView.setUint32(i * 4, videoSizes[i], false);
  }
  const videoStsz = makeAtom(
    'stsz',
    u32(0),
    u32(0), // variable sample size
    u32(numFrames),
    stszPayload
  );

  const stcoPayload = new Uint8Array(numFrames * 4);
  const stcoView = new DataView(stcoPayload.buffer);
  for (let i = 0; i < numFrames; i++) {
    stcoView.setUint32(i * 4, videoOffsets[i], false);
  }
  const videoStco = makeAtom('stco', u32(0), u32(numFrames), stcoPayload);

  const videoStbl = makeAtom(
    'stbl',
    videoStsd,
    videoStts,
    videoStsc,
    videoStsz,
    videoStco
  );
  const videoMinf = makeAtom('minf', vmhd, dataHdlr, dinf, videoStbl);
  const videoMdia = makeAtom('mdia', videoMdhd, videoHdlr, videoMinf);
  const videoTrak = makeAtom('trak', videoTkhd, videoMdia);

  // 4. Optional Audio Track (trak) when SFX is enabled
  const moovChildren: Uint8Array[] = [mvhd, videoTrak];

  if (audioBytes && pcm16Audio) {
    const numAudioSamples = pcm16Audio.length;
    const audioTkhd = makeAtom(
      'tkhd',
      u32(0x0000000f),
      u32(0),
      u32(0),
      u32(2), // track ID = 2
      u32(0),
      u32(movieDuration),
      new Uint8Array(8),
      u16(0),
      u16(0),
      u16(0x0100), // volume 1.0
      u16(0),
      identityMatrix(),
      u32(0),
      u32(0)
    );

    const audioMdhd = makeAtom(
      'mdhd',
      u32(0),
      u32(0),
      u32(0),
      u32(audioSampleRate),
      u32(numAudioSamples),
      u16(0),
      u16(0)
    );

    const audioHdlr = makeAtom(
      'hdlr',
      u32(0),
      ascii('mhlr'),
      ascii('soun'),
      u32(0),
      u32(0),
      u32(0),
      new Uint8Array([11, ...ascii('Sound Media')])
    );

    const smhd = makeAtom('smhd', u32(0), u16(0), u16(0));

    // Sound Sample Description v0 ('sowt' 16-bit little-endian PCM)
    const sowtSampleEntry = makeAtom(
      'sowt',
      new Uint8Array(6), // reserved
      u16(1), // data reference index = 1
      u16(0), // version 0
      u16(0), // revision 0
      u32(0), // vendor
      u16(1), // 1 channel (mono)
      u16(16), // 16 bits per sample
      u16(0), // compression ID
      u16(0), // packet size
      u32(audioSampleRate << 16) // 16.16 fixed-point sample rate
    );

    const audioStsd = makeAtom('stsd', u32(0), u32(1), sowtSampleEntry);
    const audioStts = makeAtom(
      'stts',
      u32(0),
      u32(1),
      u32(numAudioSamples),
      u32(1)
    );
    const audioStsc = makeAtom(
      'stsc',
      u32(0),
      u32(1),
      u32(1),
      u32(numAudioSamples),
      u32(1)
    );
    const audioStsz = makeAtom(
      'stsz',
      u32(0),
      u32(2), // 2 bytes per 16-bit sample
      u32(numAudioSamples)
    );
    const audioStco = makeAtom('stco', u32(0), u32(1), u32(audioChunkOffset));

    const audioStbl = makeAtom(
      'stbl',
      audioStsd,
      audioStts,
      audioStsc,
      audioStsz,
      audioStco
    );
    const audioMinf = makeAtom('minf', smhd, dataHdlr, dinf, audioStbl);
    const audioMdia = makeAtom('mdia', audioMdhd, audioHdlr, audioMinf);
    const audioTrak = makeAtom('trak', audioTkhd, audioMdia);
    moovChildren.push(audioTrak);
  }

  const moov = makeAtom('moov', ...moovChildren);

  const blobParts: BlobPart[] = [
    ftyp.buffer as ArrayBuffer,
    mdatHeader.buffer as ArrayBuffer,
    ...pngFrames.map((f) => f.buffer as ArrayBuffer),
  ];
  if (audioBytes) {
    blobParts.push(audioBytes.buffer as ArrayBuffer);
  }
  blobParts.push(moov.buffer as ArrayBuffer);

  return new Blob(blobParts, { type: 'video/quicktime' });
}

/**
 * Deterministically renders the 4.0s Motion Logo animation frame-by-frame into a
 * genuine QuickTime .MOV file (with 32-bit RGBA Alpha Channel support and synced PCM audio).
 */
export async function exportQuickTimeMov(options: {
  config: LogoConfig;
  width: number;
  height: number;
  forceTransparent: boolean;
  fps?: number;
  durationSeconds?: number;
  onProgress?: (progress: number, currentTime: number) => void;
}): Promise<Blob> {
  const {
    config,
    width,
    height,
    forceTransparent,
    fps = 30,
    durationSeconds = 4.0,
    onProgress,
  } = options;

  // Render at standard 1080p dimensions for fast, crisp encoding
  const targetW = Math.round(width / (config.physics.supersampling ? 1.25 : 1));
  const targetH = Math.round(height / (config.physics.supersampling ? 1.25 : 1));

  const offscreen = document.createElement('canvas');
  offscreen.width = targetW;
  offscreen.height = targetH;
  const ctx = offscreen.getContext('2d');
  if (!ctx) {
    throw new Error('Could not initialize 2D context for .MOV export');
  }

  const effectiveConfig: LogoConfig = forceTransparent
    ? { ...config, bgMode: 'transparent' }
    : config;

  const numFrames = Math.round(durationSeconds * fps);
  const pngFrames: Uint8Array[] = [];

  // Synthesize offline 48kHz PCM audio in parallel
  const audioSampleRate = 48000;
  const audioPromise = soundEngine.renderOfflineAudioTrack(
    config.sfx,
    durationSeconds,
    audioSampleRate
  );

  for (let i = 0; i < numFrames; i++) {
    const t = (i / numFrames) * durationSeconds;
    renderMotionLogoFrame(ctx, targetW, targetH, effectiveConfig, t);
    const pngBytes = await canvasToPngBytes(offscreen);
    pngFrames.push(pngBytes);

    if (onProgress) {
      onProgress((i + 1) / numFrames, t);
    }

    // Yield briefly every 3 frames so the browser UI & progress bar remain 60fps responsive
    if (i % 3 === 0) {
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  const pcm16Audio = await audioPromise;

  return muxQuickTimeMov(
    targetW,
    targetH,
    fps,
    durationSeconds,
    pngFrames,
    pcm16Audio,
    audioSampleRate
  );
}
