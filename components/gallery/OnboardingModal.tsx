'use client';

import { useEffect, useState, useCallback } from 'react';

const DISCORD_URL = 'https://discord.com/invite/xzMJDUke9k';

interface OnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Si true, las 3 tarjetas aparecen completamente visibles desde el inicio (modo info) */
    allVisible?: boolean;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Tarjeta 1 · Discord
───────────────────────────────────────────────────────────────────────────── */
function DiscordCard({ active }: { active: boolean }) {
    return (
        <div
            className="onboarding-card"
            style={{ opacity: active ? 1 : 0.32, pointerEvents: active ? 'auto' : 'none' }}
        >
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 'inherit',
                    background: 'radial-gradient(ellipse at 60% 0%, rgba(88,101,242,0.18) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }}
            />
            <span className="onboarding-step-num">01</span>
            <div style={{ marginBottom: 16 }}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.678.782 1.325 1.226 1.994a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" fill="#5865F2" />
                </svg>
            </div>
            <h3 className="onboarding-card-title">Únete a la comunidad</h3>
            <p className="onboarding-card-body">
                Pregunta dudas, conoce a quienes comparten tus intereses, aprende e inspírate junto a miles de juniors.
            </p>
            <a
                href={DISCORD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="onboarding-btn"
                style={{ background: '#5865F2', marginTop: 'auto' }}
                onClick={(e) => e.stopPropagation()}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.678.782 1.325 1.226 1.994a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                </svg>
                Entrar al servidor
            </a>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Tarjeta 2 · Descubre tu personaje — animación de reveal en loop
───────────────────────────────────────────────────────────────────────────── */
function RevealCard({ active }: { active: boolean }) {
    return (
        <div
            className="onboarding-card"
            style={{ opacity: active ? 1 : 0.32, pointerEvents: active ? 'auto' : 'none' }}
        >
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 'inherit',
                    background: 'radial-gradient(ellipse at 40% 0%, rgba(249,115,22,0.18) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }}
            />
            <span className="onboarding-step-num">02</span>
            <div className="reveal-demo-wrapper" aria-hidden="true">
                <div className="reveal-gift-box">
                    <div className="reveal-gift-overlay">
                        <div className="reveal-gift-bg" />
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#f97316', position: 'relative', zIndex: 1 }}>
                            <polyline points="20 12 20 22 4 22 4 12" />
                            <rect x="2" y="7" width="20" height="5" />
                            <line x1="12" y1="22" x2="12" y2="7" />
                            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                        </svg>
                    </div>
                    <div className="reveal-avatar">
                        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: '#f97316' }}>
                            <circle cx="12" cy="8" r="4" />
                            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                        </svg>
                    </div>
                    <div className="reveal-particles">
                        {[...Array(6)].map((_, i) => (
                            <span key={i} className={`reveal-particle reveal-particle-${i}`} />
                        ))}
                    </div>
                </div>
            </div>
            <h3 className="onboarding-card-title">Descubre tu personaje</h3>
            <p className="onboarding-card-body">
                Cada tarjeta en el mapa oculta a un miembro de la comunidad. ¡Haz clic para revelarlos y colecciónalos todos!
            </p>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Tarjeta 3 · Disfruta
───────────────────────────────────────────────────────────────────────────── */
function EnjoyCard({ active, onClose }: { active: boolean; onClose: () => void }) {
    return (
        <div
            className="onboarding-card"
            style={{ opacity: active ? 1 : 0.32, pointerEvents: active ? 'auto' : 'none' }}
        >
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 'inherit',
                    background: 'radial-gradient(ellipse at 50% 0%, rgba(251,191,36,0.15) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }}
            />
            <span className="onboarding-step-num">03</span>
            <div style={{ fontSize: 52, lineHeight: 1, marginBottom: 12, filter: 'drop-shadow(0 0 12px rgba(251,191,36,0.4))' }}>
                🎉
            </div>
            <h3 className="onboarding-card-title">¡Disfruta!</h3>
            <p className="onboarding-card-body">
                Muchas gracias por unirte a la comunidad. Explora el mapa, descubre a tus compañeros y sé parte de algo especial.{' '}
                <span style={{ color: '#f97316' }}>¡Bienvenido/a! 🚀</span>
            </p>
            <button
                className="onboarding-btn"
                style={{ marginTop: 'auto', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
            >
                Empezar a explorar
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Modal principal
───────────────────────────────────────────────────────────────────────────── */
export function OnboardingModal({ isOpen, onClose, allVisible = false }: OnboardingModalProps) {
    // 0 = carta 1 activa | 1 = cartas 1+2 | 2 = todas activas | 3 → cierra
    const [step, setStep] = useState(0);
    const [visible, setVisible] = useState(false);

    // Reset step cuando se abre
    useEffect(() => {
        if (isOpen) {
            setStep(allVisible ? 2 : 0);
            const t = setTimeout(() => setVisible(true), 50);
            return () => clearTimeout(t);
        } else {
            setVisible(false);
        }
    }, [isOpen, allVisible]);

    const handleClose = useCallback(() => {
        setVisible(false);
        setTimeout(onClose, 400);
    }, [onClose]);

    // Clic en el container: avanza step o cierra si ya están todas visibles
    const handleContainerClick = useCallback(() => {
        if (step < 2) {
            setStep((s) => s + 1);
        } else {
            // Tercer clic → cerrar
            handleClose();
        }
    }, [step, handleClose]);

    if (!isOpen) return null;

    // En modo allVisible siempre step=2, pero igualmente el clic cierra
    const effectiveStep = allVisible ? 2 : step;

    return (
        <>
            {/* ── Estilos ── */}
            <style>{`
        /* Backdrop */
        .onboarding-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9998;
          background: rgba(10, 8, 6, 0.78);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          transition: opacity 0.4s ease;
        }

        /* Container de tarjetas */
        .onboarding-container {
          display: flex;
          gap: 16px;
          max-width: 900px;
          width: 100%;
          transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
          cursor: pointer;
        }

        /* Card base */
        .onboarding-card {
          position: relative;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 10px;
          padding: 28px 22px 24px;
          border-radius: 20px;
          border: 1px solid hsl(30 5% 18%);
          background: hsl(30 5% 8% / 0.96);
          min-height: 360px;
          overflow: hidden;
          transition: opacity 0.6s ease, box-shadow 0.4s ease;
          cursor: default;
        }

        .onboarding-card[style*="opacity: 1"] {
          box-shadow: 0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px hsl(30 5% 22%);
        }

        /* Número de paso */
        .onboarding-step-num {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: hsl(30 10% 40%);
          font-family: monospace;
          margin-bottom: 4px;
          align-self: flex-start;
        }

        /* Título */
        .onboarding-card-title {
          font-size: 18px;
          font-weight: 700;
          color: hsl(39 35% 95%);
          line-height: 1.25;
          margin: 0;
        }

        /* Cuerpo */
        .onboarding-card-body {
          font-size: 13.5px;
          color: hsl(30 10% 55%);
          line-height: 1.6;
          margin: 0;
          flex: 1;
        }

        /* Botón */
        .onboarding-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 22px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          font-size: 13.5px;
          font-weight: 600;
          color: #fff;
          text-decoration: none;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          width: 100%;
        }

        .onboarding-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.35);
        }

        .onboarding-btn:active {
          transform: scale(0.97);
        }

        /* ── Botón cerrar ── */
        .onboarding-close-btn {
          position: fixed;
          top: 18px;
          right: 18px;
          z-index: 9999;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid hsl(30 5% 22%);
          background: hsl(30 5% 10%);
          color: hsl(30 10% 55%);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }

        .onboarding-close-btn:hover {
          background: hsl(30 5% 16%);
          color: hsl(39 35% 95%);
        }

        /* ────────────────────────────────────────────
           Indicador de clic con mano animada
        ──────────────────────────────────────────── */
        .onboarding-click-hint {
          position: absolute;
          bottom: 22px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 10px;
          pointer-events: none;
          white-space: nowrap;
        }

        /* Riel de movimiento de la mano */
        .onboarding-hand-track {
          position: relative;
          width: 80px;
          height: 28px;
          overflow: visible;
        }

        .onboarding-hand-icon {
          position: absolute;
          top: 0;
          left: 0;
          animation: hand-slide 2s cubic-bezier(0.45,0,0.55,1) infinite;
          filter: drop-shadow(0 2px 6px rgba(249,115,22,0.4));
        }

        /* tap animation on the hand */
        .onboarding-hand-icon svg {
          animation: hand-tap 2s cubic-bezier(0.45,0,0.55,1) infinite;
        }

        @keyframes hand-slide {
          0%   { left: 0px;  opacity: 0; }
          10%  { opacity: 1; }
          80%  { left: 56px; opacity: 1; }
          92%  { left: 60px; opacity: 0; }
          100% { left: 60px; opacity: 0; }
        }

        @keyframes hand-tap {
          0%, 35%  { transform: scale(1) rotate(0deg); }
          50%      { transform: scale(0.82) rotate(-8deg); }
          65%      { transform: scale(1) rotate(0deg); }
          100%     { transform: scale(1) rotate(0deg); }
        }

        /* Las pequeñas líneas de "impacto" del clic */
        .onboarding-click-ripples {
          position: absolute;
          top: 50%;
          right: -2px;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
        }

        .onboarding-click-ripple {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1.5px solid rgba(249,115,22,0.7);
          opacity: 0;
          animation: ripple-expand 2s ease-out infinite;
        }

        .onboarding-click-ripple:nth-child(2) { animation-delay: 0.2s; }
        .onboarding-click-ripple:nth-child(3) { animation-delay: 0.4s; }

        @keyframes ripple-expand {
          0%   { transform: scale(0.5); opacity: 0; }
          45%  { opacity: 0; }
          50%  { transform: scale(0.5); opacity: 0.8; }
          90%  { transform: scale(2.5); opacity: 0; }
          100% { opacity: 0; }
        }

        .onboarding-hint-label {
          font-size: 11px;
          color: hsl(30 10% 45%);
          animation: hint-label-pulse 2s ease-in-out infinite;
        }

        @keyframes hint-label-pulse {
          0%, 100% { opacity: 0.55; }
          50%      { opacity: 1; }
        }

        /* ── Animación reveal demo ── */
        .reveal-demo-wrapper {
          position: relative;
          width: 100px;
          height: 100px;
          margin: 4px auto 4px;
        }

        .reveal-gift-box {
          width: 100%;
          height: 100%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .reveal-gift-overlay {
          position: absolute;
          inset: 0;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          animation: reveal-overlay 4s ease-in-out infinite;
        }

        .reveal-gift-bg {
          position: absolute;
          inset: 0;
          background: hsl(30 5% 12%);
          border-radius: 14px;
          border: 2px solid rgba(249,115,22,0.5);
        }

        .reveal-avatar {
          position: absolute;
          inset: 0;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: hsl(30 5% 10%);
          animation: reveal-avatar 4s ease-in-out infinite;
        }

        .reveal-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .reveal-particle {
          position: absolute;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          opacity: 0;
        }

        .reveal-particle-0 { top: 20%; left: 10%; background: #f97316; animation: particle-fly-0 4s ease-in-out infinite; }
        .reveal-particle-1 { top: 10%; right: 15%; background: #fbbf24; animation: particle-fly-1 4s ease-in-out infinite; }
        .reveal-particle-2 { bottom: 20%; left: 20%; background: #fff; animation: particle-fly-2 4s ease-in-out infinite; }
        .reveal-particle-3 { bottom: 10%; right: 10%; background: #f59e0b; animation: particle-fly-3 4s ease-in-out infinite; }
        .reveal-particle-4 { top: 50%; left: 5%; background: #f97316; animation: particle-fly-4 4s ease-in-out infinite; }
        .reveal-particle-5 { top: 30%; right: 5%; background: #fbbf24; animation: particle-fly-5 4s ease-in-out infinite; }

        @keyframes reveal-overlay {
          0%    { opacity: 1; transform: scale(1); }
          35%   { opacity: 1; transform: scale(1); }
          55%   { opacity: 0; transform: scale(1.08); }
          80%   { opacity: 0; }
          90%   { opacity: 1; transform: scale(1); }
          100%  { opacity: 1; transform: scale(1); }
        }

        @keyframes reveal-avatar {
          0%    { opacity: 0; transform: scale(0.92); }
          35%   { opacity: 0; transform: scale(0.92); }
          55%   { opacity: 1; transform: scale(1.04); }
          72%   { opacity: 1; transform: scale(1); }
          88%   { opacity: 0; transform: scale(0.95); }
          100%  { opacity: 0; transform: scale(0.92); }
        }

        @keyframes particle-fly-0 {
          0%, 40% { opacity: 0; transform: translate(0,0); }
          50%  { opacity: 1; }
          65%  { opacity: 0; transform: translate(-18px, -18px); }
          100% { opacity: 0; }
        }
        @keyframes particle-fly-1 {
          0%, 42% { opacity: 0; transform: translate(0,0); }
          52%  { opacity: 1; }
          67%  { opacity: 0; transform: translate(16px, -20px); }
          100% { opacity: 0; }
        }
        @keyframes particle-fly-2 {
          0%, 44% { opacity: 0; transform: translate(0,0); }
          54%  { opacity: 1; }
          69%  { opacity: 0; transform: translate(-14px, 16px); }
          100% { opacity: 0; }
        }
        @keyframes particle-fly-3 {
          0%, 43% { opacity: 0; transform: translate(0,0); }
          53%  { opacity: 1; }
          68%  { opacity: 0; transform: translate(18px, 14px); }
          100% { opacity: 0; }
        }
        @keyframes particle-fly-4 {
          0%, 46% { opacity: 0; transform: translate(0,0); }
          56%  { opacity: 0.8; }
          70%  { opacity: 0; transform: translate(-20px, 0px); }
          100% { opacity: 0; }
        }
        @keyframes particle-fly-5 {
          0%, 45% { opacity: 0; transform: translate(0,0); }
          55%  { opacity: 0.8; }
          70%  { opacity: 0; transform: translate(20px, -10px); }
          100% { opacity: 0; }
        }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .onboarding-container {
            flex-direction: column;
            max-height: 85vh;
            overflow-y: auto;
            gap: 12px;
          }

          .onboarding-card {
            min-height: unset;
            padding: 20px 18px;
          }
        }
      `}</style>

            {/* Backdrop — clic para cerrar cuando step=2 */}
            <div
                className="onboarding-backdrop"
                style={{ opacity: visible ? 1 : 0 }}
                onClick={effectiveStep >= 2 ? handleClose : undefined}
            >
                {/* Botón X */}
                <button
                    className="onboarding-close-btn"
                    onClick={(e) => { e.stopPropagation(); handleClose(); }}
                    aria-label="Cerrar"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                {/* Container de las 3 tarjetas */}
                <div
                    className="onboarding-container"
                    style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? 'translateY(0)' : 'translateY(28px)',
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleContainerClick();
                    }}
                >
                    <DiscordCard active={effectiveStep >= 0} />
                    <RevealCard active={effectiveStep >= 1} />
                    <EnjoyCard active={effectiveStep >= 2} onClose={handleClose} />
                </div>

                {/* Indicador animado de clic — solo visible mientras no estén todas activas */}
                {effectiveStep < 2 && (
                    <div className="onboarding-click-hint" style={{ opacity: visible ? 1 : 0 }}>
                        {/* Mano que se desliza de izquierda a derecha */}
                        <div className="onboarding-hand-track">
                            <div className="onboarding-hand-icon">
                                {/* ripples en el punto de clic */}
                                <div className="onboarding-click-ripples">
                                    <div className="onboarding-click-ripple" />
                                    <div className="onboarding-click-ripple" />
                                    <div className="onboarding-click-ripple" />
                                </div>
                                <svg
                                    width="22"
                                    height="22"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#f97316"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    {/* Mano señalando / haciendo clic */}
                                    <path d="M9 11V6a1.5 1.5 0 0 1 3 0v5" />
                                    <path d="M12 11V5a1.5 1.5 0 0 1 3 0v6" />
                                    <path d="M15 11V8a1.5 1.5 0 0 1 3 0v5c0 3.314-2.686 6-6 6a6 6 0 0 1-6-6v-2a1.5 1.5 0 0 1 3 0v2" />
                                    <path d="M9 11V9a1.5 1.5 0 0 0-3 0v2" />
                                </svg>
                            </div>
                        </div>
                        <span className="onboarding-hint-label">Haz clic para continuar</span>
                    </div>
                )}
            </div>
        </>
    );
}
