'use client';

import { useEffect, useCallback } from 'react';
import Image from 'next/image';
import { socialLinks } from '@/lib/social-links';

interface LinksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const linkColors: Record<string, string> = {
  TikTok: 'bg-black hover:bg-gray-900',
  Discord: 'bg-[#5865F2] hover:bg-[#4752C4]',
  X: 'bg-black hover:bg-gray-900',
  YouTube: 'bg-[#FF0000] hover:bg-[#CC0000]',
};

export function LinksModal({ isOpen, onClose }: LinksModalProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative mx-4 w-full max-w-sm rounded-2xl border border-border/50 bg-card/95 p-8 backdrop-blur-xl"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-card border border-border text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="mb-4 h-24 w-24 relative">
            <Image
              src="/logo.png"
              alt="Diario del Junior Logo"
              fill
              className="object-contain"
            />
          </div>
          
          <h2 className="mb-2 text-xl font-bold text-foreground">
            @diariodeljunior
          </h2>
          
          <p className="text-sm text-muted-foreground text-center">
            Explora el mundo de la programación conmigo 🌎
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-3 rounded-xl px-4 py-3.5 text-white transition-all hover:scale-[1.02] active:scale-[0.98] ${linkColors[link.name] || 'bg-gray-800'}`}
            >
              {link.icon}
              <span className="font-semibold">{link.name}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
