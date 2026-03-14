'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  href: string;
  className?: string;
}

const cardVariants = {
  initial: { y: 0 },
  hover: {
    y: -8,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
};

const arrowVariants = {
  initial: { x: 0 },
  hover: {
    x: 6,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 15,
    },
  },
};

export default function ServiceCard({
  icon,
  title,
  description,
  href,
  className,
}: ServiceCardProps) {
  return (
    <motion.div
      className={cn(
        'group relative rounded-xl',
        'border border-white/10 bg-white/5 backdrop-blur-xl',
        'p-6 sm:p-8',
        'transition-all duration-300',
        'hover:border-[#FF6B2B]/30 hover:shadow-[0_0_30px_rgba(255,107,43,0.15)]',
        className
      )}
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
    >
      {/* Icon */}
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-accent-orange/10 text-accent-orange transition-colors duration-300 group-hover:bg-accent-orange/20">
        {icon}
      </div>

      {/* Title */}
      <h3 className="mb-3 font-display text-xl font-semibold text-text-main sm:text-2xl">
        {title}
      </h3>

      {/* Description */}
      <p className="mb-6 text-sm leading-relaxed text-text-muted sm:text-base line-clamp-3">
        {description}
      </p>

      {/* Link */}
      <Link
        href={href}
        className="inline-flex items-center gap-2 text-sm font-semibold text-accent-orange transition-colors duration-300 hover:text-accent-blue"
      >
        <span>Detayli Incele</span>
        <motion.span variants={arrowVariants} className="inline-flex">
          <ArrowRight className="h-4 w-4" />
        </motion.span>
      </Link>
    </motion.div>
  );
}
