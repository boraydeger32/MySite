'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// Public Menu - Waiter Call Button
// =============================================================================
// Floating action button that allows customers to call a waiter.
// Shows a confirmation state after tapping, then resets.
// Used at /[restoran-slug]/masa/[masa-no]
// =============================================================================

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface WaiterCallButtonProps {
  /** Called when the customer requests a waiter */
  onCallWaiter?: () => void | Promise<void>;
  /** Theme primary color */
  primaryColor?: string;
  /** Theme text color */
  textColor?: string;
  /** Theme border radius */
  borderRadius?: string;
  /** Optional className override */
  className?: string;
}

// ---------------------------------------------------------------------------
// State type
// ---------------------------------------------------------------------------

type CallState = 'idle' | 'loading' | 'called';

// ---------------------------------------------------------------------------
// Auto-reset duration (ms)
// ---------------------------------------------------------------------------

const RESET_DELAY = 5000;

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function WaiterCallButton({
  onCallWaiter,
  primaryColor = '#FF6B2B',
  textColor = '#F0F4FF',
  borderRadius = '12px',
  className,
}: WaiterCallButtonProps) {
  const [callState, setCallState] = useState<CallState>('idle');

  // ---------------------------------------------------------------------------
  // Auto-reset after successful call
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (callState !== 'called') return;

    const timer = setTimeout(() => {
      setCallState('idle');
    }, RESET_DELAY);

    return () => clearTimeout(timer);
  }, [callState]);

  // ---------------------------------------------------------------------------
  // Handle tap
  // ---------------------------------------------------------------------------

  const handleCall = useCallback(async () => {
    if (callState !== 'idle') return;

    setCallState('loading');

    try {
      await onCallWaiter?.();
      setCallState('called');
    } catch {
      // Reset on error so user can retry
      setCallState('idle');
    }
  }, [callState, onCallWaiter]);

  // ---------------------------------------------------------------------------
  // Dynamic styles based on state
  // ---------------------------------------------------------------------------

  const bgColor =
    callState === 'called'
      ? '#10B981'
      : callState === 'loading'
        ? `${primaryColor}cc`
        : `${textColor}12`;

  const borderColor =
    callState === 'called'
      ? '#10B98140'
      : callState === 'loading'
        ? `${primaryColor}40`
        : `${textColor}20`;

  const iconColor =
    callState === 'called' ? '#fff' : callState === 'loading' ? '#fff' : textColor;

  return (
    <motion.button
      type="button"
      onClick={handleCall}
      disabled={callState !== 'idle'}
      className={cn(
        'fixed bottom-6 left-6 z-40 flex items-center gap-2 shadow-lg',
        'transition-all duration-300',
        callState !== 'idle' && 'cursor-default',
        className
      )}
      style={{
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius,
        padding: '12px 16px',
      }}
      whileTap={callState === 'idle' ? { scale: 0.93 } : undefined}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
      aria-label={
        callState === 'called'
          ? 'Garson cagirildi'
          : callState === 'loading'
            ? 'Garson cagriliyor'
            : 'Garson cagir'
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        {callState === 'loading' && (
          <motion.span
            key="loading"
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
          >
            <Loader2 className="h-4 w-4 animate-spin" style={{ color: iconColor }} />
          </motion.span>
        )}
        {callState === 'called' && (
          <motion.span
            key="called"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <Check className="h-4 w-4" style={{ color: iconColor }} />
          </motion.span>
        )}
        {callState === 'idle' && (
          <motion.span
            key="idle"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <Bell className="h-4 w-4" style={{ color: iconColor }} />
          </motion.span>
        )}
      </AnimatePresence>

      <span
        className="text-xs font-semibold"
        style={{
          color: callState === 'idle' ? `${textColor}90` : '#fff',
        }}
      >
        {callState === 'called'
          ? 'Garson Cagirildi'
          : callState === 'loading'
            ? 'Cagriliyor...'
            : 'Garson Cagir'}
      </span>
    </motion.button>
  );
}
