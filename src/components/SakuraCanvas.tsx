import React, { useEffect, useRef } from 'react';

interface SakuraCanvasProps {
  active?: boolean;
  density?: number;
  isDarkMode?: boolean;
}

interface Petal {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  angle: number;
  angularSpeed: number;
  opacity: number;
  color: string;
}

export const SakuraCanvas: React.FC<SakuraCanvasProps> = ({
  active = true,
  density = 28,
  isDarkMode = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Color palettes for light/dark pastel themes
    const petalColorsLight = [
      'rgba(255, 182, 193, 0.85)', // Light Pink
      'rgba(255, 192, 203, 0.75)', // Pink
      'rgba(255, 209, 220, 0.90)', // Soft Rose
      'rgba(252, 228, 236, 0.80)', // Pastel Light
      'rgba(248, 187, 208, 0.70)', // Light Cherry
    ];

    const petalColorsDark = [
      'rgba(255, 154, 181, 0.65)',
      'rgba(244, 143, 177, 0.55)',
      'rgba(240, 98, 146, 0.45)',
      'rgba(255, 192, 203, 0.60)',
    ];

    const colors = isDarkMode ? petalColorsDark : petalColorsLight;

    const createPetal = (resetTop = false): Petal => ({
      x: Math.random() * width,
      y: resetTop ? -20 : Math.random() * height,
      size: Math.random() * 8 + 6,
      speedY: Math.random() * 0.9 + 0.4,
      speedX: Math.random() * 0.8 - 0.4,
      angle: Math.random() * Math.PI * 2,
      angularSpeed: (Math.random() - 0.5) * 0.02,
      opacity: Math.random() * 0.5 + 0.4,
      color: colors[Math.floor(Math.random() * colors.length)],
    });

    const petals: Petal[] = Array.from({ length: density }, () => createPetal(false));

    // Draw single organic sakura petal shape
    const drawPetal = (p: Petal) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;

      ctx.beginPath();
      // Draw petal geometry
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-p.size / 2, -p.size / 2, -p.size, p.size / 3, 0, p.size);
      ctx.bezierCurveTo(p.size, p.size / 3, p.size / 2, -p.size / 2, 0, 0);
      ctx.closePath();
      ctx.fill();

      // Subtle center vein
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, p.size * 0.7);
      ctx.stroke();

      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      petals.forEach((p, idx) => {
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.angle) * 0.3;
        p.angle += p.angularSpeed;

        // Reset if off bottom or off horizontal edges
        if (p.y > height + 20 || p.x < -20 || p.x > width + 20) {
          petals[idx] = createPetal(true);
        }

        drawPetal(p);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [active, density, isDarkMode]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      id="sakura-petals-canvas"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-90 transition-opacity duration-500"
    />
  );
};
