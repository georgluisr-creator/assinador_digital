export function DatabaseConnectionError() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-6 text-left shadow-sm">
      <h2 className="text-lg font-semibold text-amber-950">
        Não foi possível conectar ao banco de dados
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-amber-900/90">
        Isso costuma acontecer no deploy quando a URL do PostgreSQL não está
        configurada no ambiente da Vercel ou o banco não aceita conexões
        (SSL, pooling, firewall).
      </p>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-amber-950/90">
        <li>
          No projeto na Vercel:{" "}
          <strong>Settings → Environment Variables</strong>, adicione{" "}
          <code className="rounded bg-white/80 px-1.5 py-0.5 font-mono text-xs">
            DATABASE_URL
          </code>{" "}
          com a connection string do Neon (marque Production, Preview e
          Development conforme o uso).
        </li>
        <li>
          No Neon, use a string com{" "}
          <strong>SSL</strong> (ex.:{" "}
          <code className="rounded bg-white/80 px-1.5 py-0.5 font-mono text-xs">
            ?sslmode=require
          </code>
          ). Para serverless, prefira o endpoint de{" "}
          <strong>connection pooling</strong> que o Neon oferece.
        </li>
        <li>
          Depois de salvar, faça um <strong>Redeploy</strong> (Deployments → ⋮
          → Redeploy) para a aplicação enxergar a variável.
        </li>
        <li>
          Confira os logs:{" "}
          <strong>Vercel → seu deploy → Logs</strong> (ou “Functions”) para a
          mensagem de erro exata do Prisma.
        </li>
      </ol>
    </div>
  );
}
