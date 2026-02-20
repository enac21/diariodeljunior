export default function GaleriaV2Loading() {
  return (
    <main className="flex h-screen w-screen items-center justify-center bg-slate-900">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-white/70">Cargando mapa del universo...</p>
      </div>
    </main>
  );
}
