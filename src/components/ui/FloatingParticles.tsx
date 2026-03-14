'use client';

import { useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface Particle {
  x: number;
  y: number;
  radius: number;
  speedX: number;
  speedY: number;
  opacity: number;
  /** Color hue in degrees (orange=25, purple=270, blue=195) */
  hue: number;
}

interface FloatingParticlesProps {
  /** Total number of particles on desktop. Default: 80 */
  count?: number;
  /** Number of particles on mobile (< 640px). Default: 30 */
  mobileCount?: number;
  /** Base speed multiplier. Default: 0.3 */
  speed?: number;
  /** Min particle radius in pixels. Default: 1 */
  minRadius?: number;
  /** Max particle radius in pixels. Default: 3 */
  maxRadius?: number;
  /** Min particle opacity. Default: 0.2 */
  minOpacity?: number;
  /** Max particle opacity. Default: 0.6 */
  maxOpacity?: number;
  /** Additional class names for the canvas container */
  className?: string;
  /** Color palette for particles */
  colors?: Array<{ hue: number; saturation: number; lightness: number }>;
}

const DEFAULT_COLORS = [
  { hue: 25, saturation: 100, lightness: 56 },   // Orange (#FF6B2B area)
  { hue: 195, saturation: 100, lightness: 50 },   // Blue (#00D4FF area)
  { hue: 262, saturation: 83, lightness: 58 },    // Purple (#7C3AED area)
  { hue: 25, saturation: 80, lightness: 70 },     // Light orange
  { hue: 210, saturation: 60, lightness: 65 },    // Soft blue
];

function createParticle(
  canvasWidth: number,
  canvasHeight: number,
  speed: number,
  minRadius: number,
  maxRadius: number,
  minOpacity: number,
  maxOpacity: number,
  colors: Array<{ hue: number; saturation: number; lightness: number }>
): Particle {
  const color = colors[Math.floor(Math.random() * colors.length)];
  return {
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    radius: minRadius + Math.random() * (maxRadius - minRadius),
    speedX: (Math.random() - 0.5) * speed,
    speedY: (Math.random() - 0.5) * speed,
    opacity: minOpacity + Math.random() * (maxOpacity - minOpacity),
    hue: color.hue + (Math.random() - 0.5) * 20,
  };
}

export default function FloatingParticles({
  count = 80,
  mobileCount = 30,
  speed = 0.3,
  minRadius = 1,
  maxRadius = 3,
  minOpacity = 0.2,
  maxOpacity = 0.6,
  className,
  colors = DEFAULT_COLORS,
}: FloatingParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const sizeRef = useRef({ width: 0, height: 0 });

  const initParticles = useCallback(
    (width: number, height: number) => {
      const isMobile = width < 640;
      const particleCount = isMobile ? mobileCount : count;
      const particles: Particle[] = [];

      for (let i = 0; i < particleCount; i++) {
        particles.push(
          createParticle(width, height, speed, minRadius, maxRadius, minOpacity, maxOpacity, colors)
        );
      }

      particlesRef.current = particles;
    },
    [count, mobileCount, speed, minRadius, maxRadius, minOpacity, maxOpacity, colors]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const { width, height } = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      sizeRef.current = { width, height };
      initParticles(width, height);
    };

    handleResize();

    const resizeObserver = new ResizeObserver(handleResize);
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const drawFrame = () => {
      const { width, height } = sizeRef.current;
      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Update position
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around edges
        if (p.x < -p.radius) p.x = width + p.radius;
        if (p.x > width + p.radius) p.x = -p.radius;
        if (p.y < -p.radius) p.y = height + p.radius;
        if (p.y > height + p.radius) p.y = -p.radius;

        // Draw particle with glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${p.opacity})`;
        ctx.fill();

        // Add subtle glow effect for larger particles
        if (p.radius > 1.5) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${p.opacity * 0.15})`;
          ctx.fill();
        }
      }

      animationFrameRef.current = requestAnimationFrame(drawFrame);
    };

    animationFrameRef.current = requestAnimationFrame(drawFrame);

    return () => {
      resizeObserver.disconnect();
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [initParticles]);

  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      />
    </div>
  );
}
