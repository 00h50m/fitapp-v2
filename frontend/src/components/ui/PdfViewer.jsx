import React, { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, ExternalLink, FileText, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Carrega PDF.js via CDN (não precisa instalar nada)
const PDFJS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDFJS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

function loadPdfJs() {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) { resolve(window.pdfjsLib); return; }
    const script = document.createElement("script");
    script.src = PDFJS_CDN;
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
      resolve(window.pdfjsLib);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * PdfViewer — renderiza PDF via PDF.js canvas, sem iframe.
 * Funciona com URLs do Supabase Storage (públicas).
 *
 * Props:
 *   url: string       — URL pública do PDF
 *   className: string — classes extras no container
 */
const PdfViewer = ({ url, className }) => {
  const canvasRef   = useRef(null);
  const [pdf, setPdf]         = useState(null);
  const [page, setPage]       = useState(1);
  const [totalPages, setTotal] = useState(0);
  const [scale, setScale]     = useState(1.2);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [rendering, setRendering] = useState(false);

  // Carrega o documento PDF
  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPdf(null);
    setPage(1);

    loadPdfJs()
      .then(pdfjs => pdfjs.getDocument({ url, withCredentials: false }).promise)
      .then(doc => {
        if (cancelled) return;
        setPdf(doc);
        setTotal(doc.numPages);
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        console.error("PDF load error:", err);
        setError("Não foi possível carregar o PDF.");
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [url]);

  // Renderiza a página atual no canvas
  const renderPage = useCallback(async () => {
    if (!pdf || !canvasRef.current || rendering) return;
    setRendering(true);
    try {
      const pdfPage = await pdf.getPage(page);
      const viewport = pdfPage.getViewport({ scale });
      const canvas   = canvasRef.current;
      const ctx      = canvas.getContext("2d");

      canvas.width  = viewport.width;
      canvas.height = viewport.height;

      await pdfPage.render({ canvasContext: ctx, viewport }).promise;
    } catch (err) {
      console.error("Render error:", err);
    } finally {
      setRendering(false);
    }
  }, [pdf, page, scale, rendering]);

  useEffect(() => { renderPage(); }, [pdf, page, scale]);

  const changePage = (delta) => setPage(p => Math.max(1, Math.min(totalPages, p + delta)));
  const changeZoom = (delta) => setScale(s => Math.max(0.5, Math.min(3, +(s + delta).toFixed(1))));

  return (
    <div className={cn("flex flex-col h-full bg-muted/30", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card flex-shrink-0 gap-2">
        {/* Paginação */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost" size="icon" className="h-7 w-7"
            onClick={() => changePage(-1)} disabled={page <= 1 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground min-w-[60px] text-center">
            {loading ? "…" : `${page} / ${totalPages}`}
          </span>
          <Button
            variant="ghost" size="icon" className="h-7 w-7"
            onClick={() => changePage(1)} disabled={page >= totalPages || loading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => changeZoom(-0.2)} disabled={loading}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground w-10 text-center">{Math.round(scale * 100)}%</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => changeZoom(0.2)} disabled={loading}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        {/* Abrir em nova aba */}
        <a href={url} target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </a>
      </div>

      {/* Área de conteúdo */}
      <div className="flex-1 overflow-auto flex items-start justify-center p-3">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm">Carregando PDF...</span>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="text-sm text-destructive font-medium">{error}</p>
            <a href={url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Abrir em nova aba
              </Button>
            </a>
          </div>
        )}

        {!loading && !error && (
          <div className="relative">
            {rendering && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
            <canvas
              ref={canvasRef}
              className="shadow-lg rounded border border-border max-w-full"
              style={{ display: "block" }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfViewer;