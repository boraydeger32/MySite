'use client';

import { useRef, useCallback, useState } from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Download, Image, FileCode, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface QRCodeGeneratorProps {
  /** Restaurant slug for URL generation */
  restaurantSlug: string;
  /** Table number for URL generation */
  tableNumber: string;
  /** Optional logo URL to overlay on the QR code */
  logoUrl?: string;
  /** Size of the QR code in pixels */
  size?: number;
  /** Background color of the QR code */
  bgColor?: string;
  /** Foreground (dot) color of the QR code */
  fgColor?: string;
  /** Additional className for the wrapper */
  className?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE_PATH = '/MySite';

function buildMenuUrl(restaurantSlug: string, tableNumber: string): string {
  return `${BASE_PATH}/${restaurantSlug}/masa/${tableNumber}`;
}

function getFullUrl(restaurantSlug: string, tableNumber: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${buildMenuUrl(restaurantSlug, tableNumber)}`;
  }
  return buildMenuUrl(restaurantSlug, tableNumber);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function QRCodeGenerator({
  restaurantSlug,
  tableNumber,
  logoUrl,
  size = 256,
  bgColor = '#FFFFFF',
  fgColor = '#000000',
  className,
}: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const menuUrl = getFullUrl(restaurantSlug, tableNumber);

  const imageSettings = logoUrl
    ? {
        src: logoUrl,
        height: Math.round(size * 0.2),
        width: Math.round(size * 0.2),
        excavate: true,
      }
    : undefined;

  // Download QR code as PNG via canvas.toDataURL
  const handleDownloadPng = useCallback(() => {
    const container = canvasRef.current;
    if (!container) return;

    const canvas = container.querySelector('canvas');
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `qr-masa-${tableNumber}.png`;
    link.href = dataUrl;
    link.click();
  }, [tableNumber]);

  // Download QR code as SVG
  const handleDownloadSvg = useCallback(() => {
    const container = svgRef.current;
    if (!container) return;

    const svgElement = container.querySelector('svg');
    if (!svgElement) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.download = `qr-masa-${tableNumber}.svg`;
    link.href = url;
    link.click();

    URL.revokeObjectURL(url);
  }, [tableNumber]);

  // Copy URL to clipboard
  const handleCopyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(menuUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = menuUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [menuUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'flex flex-col items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl',
        className
      )}
    >
      {/* QR Code label */}
      <div className="text-center">
        <h3 className="font-display text-lg font-bold text-text-main">
          Masa {tableNumber}
        </h3>
        <p className="mt-0.5 text-xs text-text-muted">QR Kodu</p>
      </div>

      {/* Canvas QR (for PNG download, visible) */}
      <div
        ref={canvasRef}
        className="overflow-hidden rounded-lg bg-white p-3"
      >
        <QRCodeCanvas
          value={menuUrl}
          size={size}
          bgColor={bgColor}
          fgColor={fgColor}
          level="H"
          marginSize={1}
          imageSettings={imageSettings}
        />
      </div>

      {/* SVG QR (hidden, only for SVG download) */}
      <div ref={svgRef} className="hidden" aria-hidden="true">
        <QRCodeSVG
          value={menuUrl}
          size={size}
          bgColor={bgColor}
          fgColor={fgColor}
          level="H"
          marginSize={1}
          imageSettings={imageSettings}
        />
      </div>

      {/* URL display */}
      <div className="flex w-full items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
        <span className="flex-1 truncate text-xs text-text-muted">
          {menuUrl}
        </span>
        <motion.button
          onClick={handleCopyUrl}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 text-text-muted transition-colors hover:text-text-main"
          aria-label="URL kopyala"
          title="URL kopyala"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </motion.button>
      </div>

      {/* Download buttons */}
      <div className="flex w-full gap-2">
        <motion.button
          onClick={handleDownloadPng}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
            'border border-accent-orange/30 bg-accent-orange/10 text-accent-orange',
            'hover:bg-accent-orange/20 hover:border-accent-orange/50'
          )}
          aria-label="PNG olarak indir"
        >
          <Image className="h-4 w-4" />
          <span>PNG</span>
          <Download className="h-3.5 w-3.5" />
        </motion.button>

        <motion.button
          onClick={handleDownloadSvg}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
            'border border-accent-blue/30 bg-accent-blue/10 text-accent-blue',
            'hover:bg-accent-blue/20 hover:border-accent-blue/50'
          )}
          aria-label="SVG olarak indir"
        >
          <FileCode className="h-4 w-4" />
          <span>SVG</span>
          <Download className="h-3.5 w-3.5" />
        </motion.button>
      </div>
    </motion.div>
  );
}
