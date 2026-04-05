"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Footer } from "@/components/Footer";

import { socialLinks } from "@/lib/social-links";

export default function Page() {
  const [totalCharacters, setTotalCharacters] = useState<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/characters/count');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setTotalCharacters(typeof data.total === 'number' ? data.total : 0);
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
                `${(totalCharacters ?? 0).toLocaleString()} personajes en el mapa`
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
