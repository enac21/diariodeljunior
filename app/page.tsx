"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Footer } from "@/components/Footer";

const socialLinks = [
  {
    name: 'TikTok',
    url: 'https://www.tiktok.com/@diariodeljunior',
    icon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
      </svg>
    ),
  },
  {
    name: 'Discord',
    url: 'https://discord.com/invite/xzMJDUke9k',
    icon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.678.782 1.325 1.226 1.994a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
      </svg>
    ),
  },
  {
    name: 'X',
    url: 'https://x.com/diariodeljunior',
    icon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/channel/UCLH3XvVu2hbmy7injwG4lXA',
    icon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
];

export default function Page() {
  const [totalCharacters, setTotalCharacters] = useState<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/characters/count');
        const data = await res.json();
        setTotalCharacters(data.total);
      } catch {
        setTotalCharacters(0);
      }
      requestAnimationFrame(() => {
        setIsReady(true);
      });
    };
    fetchData();
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern bg-grid opacity-[0.02]" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-orange-500/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 h-[400px] w-[400px] rounded-full bg-amber-500/5 blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className={`flex flex-col items-center text-center transition-all duration-500 ${isReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600">
                <Image src="/logo.png" alt="Logo" width={40} height={40} className="object-contain" />
              </div>
            </Link>

            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl mb-3">
              <span className="text-foreground">Diario del</span>{" "}
              <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">Junior</span>
            </h1>

            <p className="text-lg text-muted-foreground md:text-xl max-w-md mb-6">
              Explora el mundo de la programación conmigo
            </p>

            <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/30 px-4 py-1.5 text-sm text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              {totalCharacters === null ? (
                <span className="inline-block h-4 w-16 animate-pulse rounded bg-muted-foreground/20" />
              ) : (
                `${totalCharacters.toLocaleString()} personajes en el mapa`
              )}
            </div>

            <div className={`grid gap-4 w-full max-w-lg transition-all duration-500 delay-100 ${isReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Link
                href="/galeriav2"
                className="group flex items-center justify-center gap-3 rounded-xl border border-primary/30 bg-gradient-to-r from-orange-500/10 to-amber-500/10 px-6 py-4 transition-all hover:border-primary/50 hover:from-orange-500/20 hover:to-amber-500/20 hover:shadow-lg hover:shadow-primary/10"
              >
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  Explorar el Mapa
                </span>
              </Link>

              <Link
                href="/galeria"
                className="group flex items-center justify-center gap-3 rounded-xl border border-border/50 bg-card/50 px-6 py-4 transition-all hover:border-border hover:bg-card"
              >
                <svg className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span className="text-lg font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  Ver Galería
                </span>
              </Link>
            </div>

            <div className={`mt-12 transition-all duration-500 delay-200 ${isReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <p className="text-sm text-muted-foreground mb-4">Sígueme en redes</p>
              <div className="flex items-center justify-center gap-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-11 items-center justify-center rounded-lg border border-border/50 bg-card/50 text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground hover:bg-card"
                    aria-label={link.name}
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </main>
  );
}
