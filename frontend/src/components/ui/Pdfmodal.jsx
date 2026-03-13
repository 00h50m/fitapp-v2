/**
 * Como usar no StudentWorkoutPage — substitua o bloco do modal de PDF por:
 *
 * import PdfViewer from "@/components/ui/PdfViewer";
 *
 * {showPdfModal && workout?.pdf_url && (
 *   <PdfModal url={workout.pdf_url} onClose={() => setShowPdfModal(false)} />
 * )}
 */

import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, X } from "lucide-react";
import PdfViewer from "@/components/ui/PdfViewer";

const PdfModal = ({ url, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/90 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl flex flex-col overflow-hidden"
        style={{ height: "90dvh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm text-foreground">PDF do Treino</span>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Viewer ocupa o resto */}
        <PdfViewer url={url} className="flex-1 min-h-0" />
      </div>
    </div>
  );
};

export default PdfModal;