import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { MobileContainer, MobileHeader, MobileContent, MobileFooter } from "@/components/layout/MobileContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User, Dumbbell, LogOut, Loader2, RefreshCw,
  AlertCircle, Lock, FileText, Play, CheckCircle2,
  Clock, X, ChevronRight, Flame, Trophy, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── helpers ──────────────────────────────────────────────────────────────
const todayStr = () => new Date().toISOString().split("T")[0];

function isExpiredWorkout(w) {
  if (!w.end_date) return false;
  return new Date(w.end_date + "T23:59:59") < new Date();
}

function getNextWorkoutIndex(workouts, sessions) {
  if (!workouts.length) return 0;
  const finished = sessions
    .filter(s => s.finished)
    .sort((a, b) => new Date(b.session_date) - new Date(a.session_date));
  if (!finished.length) return 0;
  const lastIdx = workouts.findIndex(w => w.id === finished[0].workout_id);
  return lastIdx === -1 ? 0 : (lastIdx + 1) % workouts.length;
}

function trainedToday(sessions) {
  return sessions.some(s => s.session_date === todayStr() && s.finished);
}

function activeSessionToday(sessions) {
  return sessions.find(s => s.session_date === todayStr() && !s.finished) || null;
}

const WA_NUMBER = "5511949997913";
const waLink = (msg) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;

const WhatsAppIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// ─── PDF Modal ─────────────────────────────────────────────────────────────
const PDFJS_CDN    = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDFJS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
function loadPdfJs() {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) { resolve(window.pdfjsLib); return; }
    const s = document.createElement("script");
    s.src = PDFJS_CDN;
    s.onload = () => { window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER; resolve(window.pdfjsLib); };
    s.onerror = reject;
    document.head.appendChild(s);
  });
}
const PdfModal = ({ url, onClose }) => {
  const canvasRef = React.useRef(null);
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [pdfDoc, setPdfDoc] = React.useState(null);
  const [pdfLoading, setPdfLoading] = React.useState(true);
  const [pdfError, setPdfError] = React.useState(null);
  React.useEffect(() => {
    let cancelled = false;
    setPdfLoading(true); setPdfError(null);
    loadPdfJs()
      .then(lib => lib.getDocument({ url, withCredentials: false }).promise)
      .then(doc => { if (!cancelled) { setPdfDoc(doc); setTotal(doc.numPages); setPdfLoading(false); } })
      .catch(() => { if (!cancelled) { setPdfError(true); setPdfLoading(false); } });
    return () => { cancelled = true; };
  }, [url]);
  React.useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;
    pdfDoc.getPage(page).then(p => {
      const vp = p.getViewport({ scale: 1.4 });
      const canvas = canvasRef.current;
      canvas.width = vp.width; canvas.height = vp.height;
      p.render({ canvasContext: canvas.getContext("2d"), viewport: vp });
    });
  }, [pdfDoc, page]);
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/90 backdrop-blur-sm p-0 sm:p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl flex flex-col overflow-hidden" style={{ height: "92dvh" }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">PDF do Treino</span>
          </div>
          <div className="flex items-center gap-3">
            {total > 1 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page <= 1} className="px-2 py-1 rounded bg-muted disabled:opacity-40">‹</button>
                {page}/{total}
                <button onClick={() => setPage(p => Math.min(total, p+1))} disabled={page >= total} className="px-2 py-1 rounded bg-muted disabled:opacity-40">›</button>
              </div>
            )}
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">Abrir</a>
            <button className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center" onClick={onClose}><X className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="flex-1 overflow-auto flex items-start justify-center p-3 bg-muted/20">
          {pdfLoading && <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
          {pdfError && <div className="flex flex-col items-center py-16 gap-3"><p className="text-sm text-muted-foreground">Não foi possível carregar o PDF.</p><a href={url} target="_blank" rel="noopener noreferrer"><button className="px-4 py-2 rounded-xl border border-border text-sm">Abrir em nova aba</button></a></div>}
          {!pdfLoading && !pdfError && <canvas ref={canvasRef} className="shadow-lg max-w-full rounded" />}
        </div>
      </div>
    </div>
  );
};

// ─── Paleta de cores por seção ────────────────────────────────────────────
const SECTION_PALETTES = [
  { bg: "from-primary/20 to-primary/5",   accent: "bg-primary/20 text-primary border-primary/30",     dot: "bg-primary" },
  { bg: "from-blue-500/20 to-blue-500/5", accent: "bg-blue-500/20 text-blue-400 border-blue-500/30",  dot: "bg-blue-400" },
  { bg: "from-purple-500/20 to-purple-500/5", accent: "bg-purple-500/20 text-purple-400 border-purple-500/30", dot: "bg-purple-400" },
  { bg: "from-emerald-500/20 to-emerald-500/5", accent: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", dot: "bg-emerald-400" },
  { bg: "from-rose-500/20 to-rose-500/5", accent: "bg-rose-500/20 text-rose-400 border-rose-500/30",  dot: "bg-rose-400" },
  { bg: "from-orange-500/20 to-orange-500/5", accent: "bg-orange-500/20 text-orange-400 border-orange-500/30", dot: "bg-orange-400" },
];

// ─── Workout Card (estilo capa, formato retrato) ───────────────────────────
const WorkoutCard = ({ workout, isNext, isOngoing, alreadyToday, sessions, onPdf, palette }) => {
  const navigate = useNavigate();
  const expired   = isExpiredWorkout(workout);
  const doneCount = sessions.filter(s => s.workout_id === workout.id && s.finished).length;
  const locked    = expired;

  const handleClick = () => {
    if (locked) return;
    navigate(`/student/workout/${workout.id}`);
  };

  return (
    <div
      className={cn(
        "relative flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer",
        "transition-all duration-200 active:scale-[0.96]",
        "w-[152px]",
        locked ? "opacity-55 cursor-default" : "hover:scale-[1.02]"
      )}
      style={{ aspectRatio: "2/3" }}
      onClick={handleClick}
    >
      {/* Capa / fundo */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-b",
        locked
          ? "from-muted/60 to-muted/90"
          : isOngoing
          ? "from-blue-500/30 to-blue-900/70"
          : isNext && !alreadyToday
          ? `${palette.bg} to-[hsl(var(--card))]`
          : "from-card/80 to-card"
      )} />

      {/* Padrão decorativo sutil no fundo */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: "repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)", backgroundSize: "12px 12px" }} />

      {/* Conteúdo */}
      <div className="relative h-full flex flex-col justify-between p-3">
        {/* Topo — badges */}
        <div className="flex items-start justify-between gap-1">
          {/* Badge de estado */}
          {locked ? (
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground bg-muted/80 border border-border/50 px-1.5 py-0.5 rounded-full">
              Expirado
            </span>
          ) : isOngoing ? (
            <span className="text-[9px] font-bold uppercase tracking-widest text-blue-400 bg-blue-500/15 border border-blue-500/25 px-1.5 py-0.5 rounded-full">
              Em andamento
            </span>
          ) : isNext && !alreadyToday ? (
            <span className="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/15 border border-primary/25 px-1.5 py-0.5 rounded-full">
              ⚡ Hoje
            </span>
          ) : doneCount > 0 ? (
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground bg-muted/60 border border-border/40 px-1.5 py-0.5 rounded-full">
              {doneCount}× feito
            </span>
          ) : (
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 bg-transparent px-1.5 py-0.5 rounded-full">
              Disponível
            </span>
          )}

          {/* Ícone de cadeado */}
          {locked && (
            <div className="h-6 w-6 rounded-full bg-muted/80 border border-border/50 flex items-center justify-center">
              <Lock className="h-3 w-3 text-muted-foreground/60" />
            </div>
          )}
        </div>

        {/* Ícone central */}
        <div className="flex items-center justify-center flex-1">
          <div className={cn(
            "h-14 w-14 rounded-2xl flex items-center justify-center border",
            locked
              ? "bg-muted/40 border-border/30"
              : isOngoing
              ? "bg-blue-500/20 border-blue-500/30"
              : isNext && !alreadyToday
              ? "bg-primary/15 border-primary/25"
              : "bg-muted/50 border-border/50"
          )}>
            {locked ? (
              <Lock className="h-6 w-6 text-muted-foreground/40" />
            ) : isOngoing ? (
              <Play className="h-6 w-6 text-blue-400" />
            ) : isNext && !alreadyToday ? (
              <Flame className="h-6 w-6 text-primary" />
            ) : doneCount > 0 ? (
              <CheckCircle2 className="h-6 w-6 text-muted-foreground/60" />
            ) : (
              <Dumbbell className="h-6 w-6 text-muted-foreground/50" />
            )}
          </div>
        </div>

        {/* Base — título + PDF */}
        <div className="space-y-2">
          <div>
            <p className={cn(
              "font-bold text-sm leading-tight line-clamp-2",
              locked ? "text-muted-foreground/60" : "text-foreground"
            )}>
              {workout.title}
            </p>
          </div>

          {/* Botão PDF — só se tiver e não expirado */}
          {workout.pdf_url && !locked && (
            <button
              className="flex items-center gap-1.5 w-full py-1.5 px-2 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors"
              onClick={e => { e.stopPropagation(); onPdf(workout.pdf_url); }}
            >
              <FileText className="h-3 w-3 text-primary flex-shrink-0" />
              <span className="text-[10px] text-primary font-semibold truncate">Ver PDF</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Row de seção (scroll horizontal) ─────────────────────────────────────
const CatalogRow = ({ title, workouts, sessions, nextIdx, alreadyToday, ongoingId, onPdf, paletteIndex }) => {
  const palette = SECTION_PALETTES[paletteIndex % SECTION_PALETTES.length];
  const scrollRef = useRef(null);

  if (!workouts.length) return null;

  return (
    <div className="space-y-3">
      {/* Header da seção */}
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className={cn("h-2 w-2 rounded-full", palette.dot)} />
          <h2 className="font-bold text-sm text-foreground tracking-tight">{title}</h2>
          <span className="text-xs text-muted-foreground">({workouts.length})</span>
        </div>
      </div>

      {/* Scroll horizontal */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto px-4 pb-1 scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {workouts.map((workout, idx) => (
          <WorkoutCard
            key={workout.id}
            workout={workout}
            isNext={workout.id === workouts[nextIdx]?.id}
            isOngoing={workout.id === ongoingId}
            alreadyToday={alreadyToday}
            sessions={sessions}
            onPdf={onPdf}
            palette={palette}
          />
        ))}
        {/* Spacer final */}
        <div className="flex-shrink-0 w-1" />
      </div>
    </div>
  );
};

// ─── Componente principal ──────────────────────────────────────────────────
const StudentWorkoutsPage = () => {
  const navigate = useNavigate();
  const { user, profile, logout, loading: authLoading } = useAuth();

  const [workouts,  setWorkouts]  = useState([]);
  const [sessions,  setSessions]  = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [pdfUrl,    setPdfUrl]    = useState(null);

  const isExpired = profile?.access_end
    ? new Date(profile.access_end + "T23:59") < new Date()
    : false;

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const [wRes, sRes] = await Promise.all([
        supabase.from("student_workouts")
          .select("id, title, status, end_date, pdf_url, created_at, template_id, catalog_section, catalog_order")
          .eq("student_id", user.id)
          .eq("status", "active")
          .order("catalog_order", { ascending: true })
          .order("created_at", { ascending: true }),
        supabase.from("workout_sessions")
          .select("id, workout_id, session_date, finished, status")
          .eq("student_id", user.id)
          .gte("session_date", new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0])
          .order("session_date", { ascending: false }),
      ]);
      if (wRes.error) throw wRes.error;
      if (sRes.error) throw sRes.error;

      const rawWorkouts = wRes.data || [];
      const templateIds = [...new Set(rawWorkouts.map(w => w.template_id).filter(Boolean))];
      let pdfMap = {};
      if (templateIds.length) {
        const { data: tmplData } = await supabase
          .from("workout_templates").select("id, pdf_url").in("id", templateIds);
        (tmplData || []).forEach(t => { if (t.pdf_url) pdfMap[t.id] = t.pdf_url; });
      }

      setWorkouts(rawWorkouts.map(w => ({
        ...w,
        pdf_url: w.pdf_url || pdfMap[w.template_id] || null,
      })));
      setSessions(sRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (user?.id) load();
    else setLoading(false);
  }, [user?.id, authLoading]); // eslint-disable-line

  // ── Derived state ──────────────────────────────────────────────────────
  const activeWorkouts  = workouts.filter(w => !isExpiredWorkout(w));
  const expiredWorkouts = workouts.filter(w =>  isExpiredWorkout(w));
  const allExpired      = workouts.length > 0 && activeWorkouts.length === 0;
  const alreadyToday    = trainedToday(sessions);
  const ongoing         = activeSessionToday(sessions);
  const nextIdx         = getNextWorkoutIndex(activeWorkouts, sessions);
  const todayWorkout    = activeWorkouts[nextIdx] || null;

  // Streak
  const streak = (() => {
    let count = alreadyToday ? 1 : 0;
    const done = new Set(sessions.filter(s => s.finished).map(s => s.session_date));
    const d = new Date(); d.setDate(d.getDate() - 1);
    while (done.has(d.toISOString().split("T")[0])) { count++; d.setDate(d.getDate() - 1); }
    return count;
  })();

  const weekCount = sessions.filter(s => {
    if (!s.finished) return false;
    const d = new Date(); d.setDate(d.getDate() - d.getDay());
    return new Date(s.session_date + "T12:00") >= d;
  }).length;

  // Agrupar por catalog_section
  const sectionMap = {};
  activeWorkouts.forEach(w => {
    const sec = w.catalog_section?.trim() || "Meus Treinos";
    if (!sectionMap[sec]) sectionMap[sec] = [];
    sectionMap[sec].push(w);
  });
  const sections = Object.entries(sectionMap);

  // ── Estados de tela ────────────────────────────────────────────────────
  const showEmpty    = !loading && !error && workouts.length === 0;
  const showExpired  = !loading && !error && (isExpired || allExpired);
  const showCatalog  = !loading && !error && !isExpired && !allExpired && workouts.length > 0;

  return (
    <MobileContainer>
      {/* ── Header ── */}
      <MobileHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="h-9 w-9 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              {streak >= 3 && (
                <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-background flex items-center justify-center">
                  <Flame className="h-2.5 w-2.5 text-orange-400" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-foreground leading-tight truncate">
                {profile?.name?.split(" ")[0] || "Aluno"}
              </p>
              <p className="text-[11px] leading-tight">
                {isExpired
                  ? <span className="text-destructive font-medium">Acesso expirado</span>
                  : streak >= 2
                  ? <span className="text-orange-400 font-medium">{streak} dias seguidos 🔥</span>
                  : <span className="text-muted-foreground">Bora treinar 💪</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={load} disabled={loading}>
              <RefreshCw className={cn("h-4 w-4 text-muted-foreground", loading && "animate-spin")} />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9"
              onClick={async () => { try { await logout(); } catch {} }}>
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </MobileHeader>

      <MobileContent className="pb-32 px-0">

        {/* ── Loading ── */}
        {loading && (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="flex flex-col items-center py-16 gap-4 text-center px-6">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={load}>
              <RefreshCw className="h-4 w-4 mr-2" />Tentar novamente
            </Button>
          </div>
        )}

        {/* ── Acesso ou treinos expirados ── */}
        {!loading && !error && (isExpired || allExpired) && (
          <div className="flex flex-col items-center justify-center min-h-[75vh] px-6 text-center gap-6 animate-fade-in">
            <div className="h-24 w-24 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center">
              <Lock className="h-11 w-11 text-destructive/60" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                {isExpired ? "Acesso Expirado" : "Treinos Expirados"}
              </h2>
              <p className="text-sm text-muted-foreground max-w-[260px] leading-relaxed">
                {isExpired && profile?.access_end
                  ? `Seu plano expirou em ${new Date(profile.access_end + "T12:00").toLocaleDateString("pt-BR")}.`
                  : "Seus treinos expiraram."}{" "}
                Fale com seu personal para renovar!
              </p>
            </div>
            <Button variant="premium" className="gap-2 py-6 px-6 text-base"
              onClick={() => window.open(waLink("Olá! Gostaria de renovar meu acesso. 🏋️"), "_blank")}>
              <WhatsAppIcon />Falar com o Personal
            </Button>
          </div>
        )}

        {/* ── Sem treinos ── */}
        {showEmpty && (
          <div className="flex flex-col items-center justify-center min-h-[65vh] px-6 text-center gap-5 animate-fade-in">
            <div className="h-20 w-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Dumbbell className="h-9 w-9 text-primary" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-foreground">Nenhum treino ainda</h2>
              <p className="text-sm text-muted-foreground max-w-[240px]">
                Seu personal ainda não adicionou treinos. Aguarde ou entre em contato.
              </p>
            </div>
            <Button variant="outline" className="gap-2"
              onClick={() => window.open(waLink("Olá! Estou aguardando meu treino. 💪"), "_blank")}>
              <WhatsAppIcon />Avisar o Personal
            </Button>
          </div>
        )}

        {/* ── Catálogo principal ── */}
        {showCatalog && (
          <div className="flex flex-col gap-0 animate-fade-in">

            {/* ── Hero: stats + treino de hoje ── */}
            <div className="px-4 pt-3 pb-5 space-y-4">
              {/* Stats mini */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: Dumbbell, label: "Treinos",      value: activeWorkouts.length, color: "text-primary" },
                  { icon: Trophy,   label: "Essa semana",  value: weekCount,             color: "text-foreground" },
                  { icon: Flame,    label: streak >= 2 ? "🔥 Streak" : "Sequência",
                                    value: streak,                                        color: streak >= 3 ? "text-orange-400" : "text-foreground" },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="bg-card border border-border rounded-xl p-3 text-center">
                    <p className={cn("text-xl font-black leading-none mb-1", color)}>{value}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide leading-tight">{label}</p>
                  </div>
                ))}
              </div>

              {/* Destaque treino de hoje */}
              {todayWorkout && !alreadyToday && (
                <button
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-primary/8 border border-primary/25 hover:bg-primary/12 transition-colors active:scale-[0.98]"
                  onClick={() => navigate(`/student/workout/${todayWorkout.id}`)}
                >
                  <div className="h-12 w-12 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-0.5">Treino de hoje</p>
                    <p className="font-bold text-foreground text-sm truncate">{todayWorkout.title}</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Play className="h-4 w-4 text-primary-foreground ml-0.5" />
                  </div>
                </button>
              )}

              {/* Concluído hoje */}
              {alreadyToday && (
                <div className="flex items-center gap-3.5 bg-green-500/8 border border-green-500/20 rounded-2xl px-4 py-3">
                  <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-green-400">Treino concluído hoje! 🏆</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {activeWorkouts.length > 1 ? "Amanhã começa o próximo." : "Repita quando quiser!"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Divisor ── */}
            <div className="h-px bg-border/30 mx-4 mb-5" />

            {/* ── Rows do catálogo por seção ── */}
            <div className="flex flex-col gap-7">
              {sections.map(([sectionTitle, sectionWorkouts], i) => (
                <CatalogRow
                  key={sectionTitle}
                  title={sectionTitle}
                  workouts={sectionWorkouts}
                  sessions={sessions}
                  nextIdx={nextIdx}
                  alreadyToday={alreadyToday}
                  ongoingId={ongoing?.workout_id}
                  onPdf={setPdfUrl}
                  paletteIndex={i}
                />
              ))}

              {/* ── Seção de expirados (colapsada) ── */}
              {expiredWorkouts.length > 0 && (
                <ExpiredSection workouts={expiredWorkouts} sessions={sessions} onPdf={setPdfUrl} />
              )}
            </div>

            <div className="h-6" />
          </div>
        )}
      </MobileContent>

      {/* ── Footer CTA ── */}
      {!loading && !error && !isExpired && !allExpired && todayWorkout && (
        <MobileFooter>
          <Button
            variant="premium"
            size="xl"
            className="w-full gap-2"
            onClick={() => {
              const target = ongoing
                ? (workouts.find(w => w.id === ongoing.workout_id) || todayWorkout)
                : todayWorkout;
              navigate(`/student/workout/${target.id}`);
            }}
          >
            {ongoing
              ? <><Play className="h-5 w-5" />Continuar Treino</>
              : alreadyToday
              ? <><RefreshCw className="h-5 w-5" />Repetir Treino</>
              : <><Zap className="h-5 w-5" />Iniciar Treino de Hoje</>}
          </Button>
        </MobileFooter>
      )}

      {/* Modal PDF */}
      {pdfUrl && <PdfModal url={pdfUrl} onClose={() => setPdfUrl(null)} />}
    </MobileContainer>
  );
};

// ─── Seção de expirados colapsável ─────────────────────────────────────────
const ExpiredSection = ({ workouts, sessions, onPdf }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="px-4 space-y-3">
      <button
        className="flex items-center gap-2 w-full"
        onClick={() => setOpen(p => !p)}
      >
        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
          Expirados ({workouts.length})
        </p>
        <div className="flex-1 h-px bg-border/30" />
        <ChevronRight className={cn("h-3.5 w-3.5 text-muted-foreground/40 transition-transform", open && "rotate-90")} />
      </button>

      {open && (
        <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {workouts.map(w => (
            <div
              key={w.id}
              className="flex-shrink-0 rounded-2xl overflow-hidden opacity-40"
              style={{ width: 152, aspectRatio: "2/3" }}
            >
              <div className="h-full bg-muted/40 border border-border/30 rounded-2xl flex flex-col items-center justify-center gap-2 p-3">
                <Lock className="h-6 w-6 text-muted-foreground/40" />
                <p className="text-[11px] font-semibold text-muted-foreground/60 text-center line-clamp-2">{w.title}</p>
                <span className="text-[9px] font-bold text-destructive/60 bg-destructive/10 border border-destructive/20 px-2 py-0.5 rounded-full">
                  Expirado
                </span>
              </div>
            </div>
          ))}
          <div className="flex-shrink-0 w-1" />
        </div>
      )}
    </div>
  );
};

export default StudentWorkoutsPage;