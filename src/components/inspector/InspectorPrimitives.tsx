import React from 'react';
import { motion, Variants } from 'motion/react';

export const tabPanelVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
    scale: 0.985,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 340,
      damping: 28,
      staggerChildren: 0.042,
      delayChildren: 0.02,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.985,
    transition: {
      duration: 0.14,
      ease: 'easeOut',
    },
  },
};

export const cardItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 380,
      damping: 26,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: -6,
    transition: {
      duration: 0.14,
    },
  },
};

interface InspectorCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const InspectorCard: React.FC<InspectorCardProps> = ({
  children,
  className = '',
  onClick,
}) => (
  <motion.div
    variants={cardItemVariants}
    onClick={onClick}
    className={`p-3 rounded-xl bg-slate-950/80 border border-slate-800 ${className}`}
  >
    {children}
  </motion.div>
);

interface InspectorSectionHeaderProps {
  icon: React.FC<{ className?: string }>;
  iconColor?: string;
  title: string;
  actionSlot?: React.ReactNode;
  className?: string;
}

export const InspectorSectionHeader: React.FC<InspectorSectionHeaderProps> = ({
  icon: Icon,
  iconColor = 'text-amber-400',
  title,
  actionSlot,
  className = '',
}) => (
  <div className={`flex items-center justify-between ${className}`}>
    <div className="flex items-center gap-1.5 min-w-0">
      <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />
      <h3 className="text-xs font-bold text-slate-100 truncate">{title}</h3>
    </div>
    {actionSlot && <div className="shrink-0">{actionSlot}</div>}
  </div>
);
