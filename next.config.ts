import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Habilita import dinâmico de html2pdf apenas no cliente */
  transpilePackages: ["html2pdf.js"],
};

export default nextConfig;
