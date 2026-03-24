declare module "html2pdf.js" {
  // Tipagem mínima para o fluxo usado no projeto
  interface Html2PdfChain {
    set(options: Record<string, unknown>): Html2PdfChain;
    from(element: HTMLElement): Html2PdfChain;
    save(): Promise<void>;
  }

  function html2pdf(): Html2PdfChain;
  export default html2pdf;
}
