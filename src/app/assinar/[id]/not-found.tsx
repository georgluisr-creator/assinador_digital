import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4">
      <h1 className="text-xl font-semibold text-ink">Recibo não encontrado</h1>
      <p className="mt-2 text-center text-sm text-ink-muted">
        Verifique o link ou peça um novo ao contratante.
      </p>
      <Link
        href="/"
        className="mt-6 text-sm font-medium text-accent hover:underline"
      >
        Ir ao início
      </Link>
    </div>
  );
}
