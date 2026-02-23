import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border/50 py-6">
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <p>Diario del Junior — Explora el mapa de personajes</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <span className="text-border">|</span>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
          </div>
          <p className="font-mono text-xs">v1.0.0</p>
        </div>
      </div>
    </footer>
  );
}
