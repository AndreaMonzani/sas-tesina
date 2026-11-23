import React, { useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'motion/react';

/* --- SET ICONE VETTORIALI AEROSPAZIALI (SOSTITUISCE TUTTE LE EMOJI) --- */
export function IconBolt({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
    </svg>
  );
}

export function IconPhoneShake({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="7" y="3" width="10" height="18" rx="2.5" />
      <line x1="11" y1="18" x2="13" y2="18" />
      <path d="M3 8c-1 1.5-1 6.5 0 8" />
      <path d="M21 8c1 1.5 1 6.5 0 8" />
    </svg>
  );
}

export function IconClose({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function IconChevronLeft({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

export function IconChevronRight({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export function IconArrowUpRight({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  );
}

/* --- 1. KOKONUTUI INSPIRED: MAGNET BUTTON --- */
export function MagnetButton({
  children,
  className = '',
  strength = 0.28,
  onClick,
  onMouseEnter,
  onMouseLeave,
  ...rest
}) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 320, damping: 22, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 320, damping: 22, mass: 0.4 });

  const handleMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * strength);
    y.set((e.clientY - centerY) * strength);
  };

  const handleLeave = (e) => {
    x.set(0);
    y.set(0);
    onMouseLeave?.(e);
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      className={className}
      style={{ x: springX, y: springY }}
      whileTap={{ scale: 0.96 }}
      onMouseMove={handleMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={handleLeave}
      onClick={onClick}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

/* --- 2. KOKONUTUI INSPIRED: PARTICLE BURST BUTTON --- */
export function ParticleButton({
  children,
  className = '',
  particleColor = 'var(--accent-cyan)',
  onClick,
  ...rest
}) {
  const [bursts, setBursts] = useState([]);

  const triggerBurst = (e) => {
    const id = Date.now() + Math.random();
    const particles = Array.from({ length: 10 }, (_, idx) => {
      const angle = (idx / 10) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const dist = 26 + Math.random() * 22;
      return {
        key: idx,
        tx: Math.cos(angle) * dist,
        ty: Math.sin(angle) * dist,
        size: 2.5 + Math.random() * 2
      };
    });

    setBursts((prev) => [...prev, { id, particles }]);
    setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== id));
    }, 650);

    onClick?.(e);
  };

  return (
    <MagnetButton
      className={`particle-btn-host ${className}`}
      onClick={triggerBurst}
      {...rest}
    >
      {children}
      <AnimatePresence>
        {bursts.map((b) => (
          <span key={b.id} className="particle-burst-layer" aria-hidden="true">
            {b.particles.map((p) => (
              <motion.span
                key={p.key}
                className="particle-spark"
                style={{
                  width: p.size,
                  height: p.size,
                  backgroundColor: particleColor
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: p.tx, y: p.ty, opacity: 0, scale: 0.2 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              />
            ))}
          </span>
        ))}
      </AnimatePresence>
    </MagnetButton>
  );
}

/* --- 3. KOKONUTUI INSPIRED: SLIDE TEXT LINK / BUTTON --- */
export function SlideTextLink({ href, children, className = '', onMouseEnter }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`slide-text-link ${className}`}
      whileHover="hovered"
      initial="rest"
      onMouseEnter={onMouseEnter}
    >
      <span className="slide-text-track">
        <motion.span
          className="slide-text-line"
          variants={{
            rest: { y: '0%' },
            hovered: { y: '-105%' }
          }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.span>
        <motion.span
          className="slide-text-line clone"
          aria-hidden="true"
          variants={{
            rest: { y: '105%' },
            hovered: { y: '0%' }
          }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.span>
      </span>
      <motion.span
        className="slide-text-icon"
        variants={{
          rest: { x: 0, y: 0 },
          hovered: { x: 2, y: -2 }
        }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      >
        <IconArrowUpRight size={13} />
      </motion.span>
    </motion.a>
  );
}

/* --- 4. KOKONUTUI INSPIRED: TELEMETRY ACTIVITY RING (PROGRESSO LABS 00/10) --- */
export function TelemetryActivityRing({ current, total }) {
  const size = 24;
  const stroke = 2.4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.min(1, Math.max(0, current / Math.max(1, total)));
  const dashOffset = circumference * (1 - ratio);

  return (
    <div className="telemetry-ring-badge" title={`Laboratori esplorati: ${current} su ${total}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ratio === 1 ? 'var(--accent-green)' : 'var(--accent-cyan)'}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
      </svg>
      <span className="telemetry-ring-label">
        LABS {String(current).padStart(2, '0')}/{String(total).padStart(2, '0')}
      </span>
    </div>
  );
}