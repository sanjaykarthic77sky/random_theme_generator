import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  Maximize, 
  Minimize, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Flame, 
  Tv, 
  Volume2, 
  VolumeX, 
  Dices,
  CheckCircle2,
  Clock,
  Tag
} from 'lucide-react';
import ThemeIcon from './ThemeIcon';
import { playTickSound, playRevealFanfare, playClickSound } from '../utils/sound';

export default function PresentationMode({
  teams,
  themes,
  assignments,
  onClose,
  isMuted,
  onToggleSound,
  onPerformDraw
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDrawingLive, setIsDrawingLive] = useState(false);
  const [liveSpinTheme, setLiveSpinTheme] = useState(null);

  // Unassigned teams
  const unassignedTeams = teams.filter(team => 
    !assignments.some(a => a.teamId === team.id)
  );

  // All revealed assignments sorted by team number
  const revealedAssignments = [...assignments].sort((a, b) => (a.teamNumber || 0) - (b.teamNumber || 0));

  // Default to showing latest assignment if available
  useEffect(() => {
    if (revealedAssignments.length > 0) {
      setCurrentIndex(revealedAssignments.length - 1);
    }
  }, [revealedAssignments.length]);

  // Fullscreen API toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        if (!document.fullscreenElement) {
          onClose();
        }
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, revealedAssignments.length, unassignedTeams.length]);

  const handleNext = () => {
    if (currentIndex < revealedAssignments.length - 1) {
      playClickSound();
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      playClickSound();
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Perform live stage draw
  const handleLiveStageDraw = () => {
    if (unassignedTeams.length === 0 || isDrawingLive || themes.length === 0) return;

    const nextTeam = unassignedTeams[0];
    setIsDrawingLive(true);
    playClickSound();

    const result = onPerformDraw(nextTeam.id);
    if (!result) {
      setIsDrawingLive(false);
      return;
    }

    const targetTheme = themes.find(t => t.id === result.themeId) || themes[0];

    let counter = 0;
    const totalTicks = 24;
    let speed = 55;

    const runLiveTick = () => {
      counter++;
      const randomIdx = Math.floor(Math.random() * themes.length);
      setLiveSpinTheme(themes[randomIdx]);
      playTickSound(300 + counter * 25, 0.04);

      if (counter < totalTicks) {
        speed += counter > 16 ? 35 : 10;
        setTimeout(runLiveTick, speed);
      } else {
        setLiveSpinTheme(targetTheme);
        setIsDrawingLive(false);
        playRevealFanfare();

        // Big auditorium celebration
        try {
          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.55 },
            colors: ['#06b6d4', '#a855f7', '#ec4899', '#3b82f6', '#10b981']
          });
        } catch (err) {}
      }
    };

    runLiveTick();
  };

  const currentItem = revealedAssignments[currentIndex];
  const totalAssigned = assignments.length;
  const totalRemaining = unassignedTeams.length;

  return (
    <div className="fixed inset-0 z-50 bg-[#020510] text-white flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden font-['Outfit',sans-serif]">
      
      {/* Dynamic ambient backdrop */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[70vw] h-[50vh] bg-gradient-to-tr from-cyan-600/15 via-purple-600/15 to-pink-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      {/* Top Projector Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-cyan-500/20 pb-4">
        
        {/* Event Banner */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/30">
            <div className="w-full h-full bg-[#050b1c] rounded-[14px] flex items-center justify-center">
              <Flame className="w-7 h-7 text-cyan-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-black tracking-wider bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                THEME RUSH
              </span>
              <span className="px-3 py-0.5 text-xs font-black uppercase tracking-widest bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 rounded-full font-mono-code">
                ROUND 2 — CREATIVITY
              </span>
            </div>
            <p className="text-xs sm:text-sm text-cyan-300/70 font-mono-code mt-0.5">
              Rapid Website Development & Theme Allocation Arena
            </p>
          </div>
        </div>

        {/* Projector Controls */}
        <div className="flex items-center gap-3">
          
          <button
            onClick={onToggleSound}
            className="p-3 rounded-2xl bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={isMuted ? "Unmute sound" : "Mute sound"}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-3 rounded-2xl bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Toggle Fullscreen (F)"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>

          <button
            onClick={onClose}
            className="p-3 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-300 hover:bg-red-900/60 hover:text-white transition-colors cursor-pointer"
            title="Exit Presentation (Esc)"
          >
            <X className="w-5 h-5" />
          </button>

        </div>

      </div>

      {/* Center Stage Presentation Canvas */}
      <div className="relative z-10 my-auto max-w-5xl mx-auto w-full text-center px-4">
        
        {isDrawingLive ? (
          /* Live Roulette Draw on Stage */
          <div className="p-8 sm:p-14 rounded-3xl glass-panel neon-border-purple animate-pulse bg-purple-950/20 space-y-6">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-2xl">
              <ThemeIcon name={liveSpinTheme?.icon || 'Sparkles'} className="w-12 h-12" />
            </div>

            <div>
              <div className="text-sm font-mono-code text-purple-300 uppercase tracking-widest font-bold">
                Drawing For {unassignedTeams[0]?.name}...
              </div>
              <div className="text-3xl sm:text-6xl font-black text-white mt-2 tracking-tight">
                {liveSpinTheme?.name || 'Allocating...'}
              </div>
            </div>
          </div>
        ) : currentItem ? (
          /* Main Revealed Team Assignment Billboard */
          <div className="space-y-6 sm:space-y-8 animate-in zoom-in-95 duration-300">
            
            {/* Team Title Banner */}
            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-slate-900/90 border border-cyan-500/40 shadow-xl shadow-cyan-950/50">
              <span className="text-sm sm:text-base font-mono-code text-cyan-400 font-bold">
                TEAM #{currentItem.teamNumber}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
              <span className="text-lg sm:text-2xl font-black text-white">
                {currentItem.teamName}
              </span>
            </div>

            {/* Giant Assigned Theme Display Card */}
            <div className="p-8 sm:p-14 rounded-3xl glass-panel neon-border-cyan bg-gradient-to-b from-[#0e1938]/90 via-[#0a1228]/95 to-[#060b18]/90 shadow-2xl relative overflow-hidden">
              
              {/* Category Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-xs sm:text-sm font-mono-code text-cyan-300 font-bold mb-4">
                <Tag className="w-4 h-4 text-cyan-400" />
                <span>{currentItem.themeCategory}</span>
              </div>

              {/* Theme Name (Huge Typography) */}
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight bg-gradient-to-r from-white via-cyan-100 to-purple-200 bg-clip-text text-transparent leading-tight sm:leading-none my-3">
                {currentItem.themeName}
              </h2>

              {/* Theme Description */}
              <p className="text-sm sm:text-lg text-slate-300 max-w-3xl mx-auto mt-6 leading-relaxed font-sans">
                {currentItem.themeDescription}
              </p>

              {/* Live allocation status badge */}
              <div className="mt-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-mono-code">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Theme Assigned Successfully</span>
              </div>
            </div>

          </div>
        ) : (
          /* Empty / No Assignments yet */
          <div className="p-12 glass-panel rounded-3xl border border-slate-800 space-y-4">
            <Sparkles className="w-14 h-14 text-cyan-400 mx-auto animate-pulse-glow" />
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Ready for Round 2 Allocation
            </h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              No assignments have been revealed yet. Click "Draw Next Team on Stage" below or return to the main dashboard.
            </p>
          </div>
        )}

      </div>

      {/* Bottom Stage Footer & Navigation Controls */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-cyan-500/20 pt-4">
        
        {/* Left: Stats Ticker */}
        <div className="flex items-center gap-6 text-xs sm:text-sm font-mono-code">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">Assigned:</span>
            <strong className="text-white text-base">{totalAssigned}</strong>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">Remaining:</span>
            <strong className="text-white text-base">{totalRemaining}</strong>
          </div>
        </div>

        {/* Center: Slide Carousel Controls */}
        {revealedAssignments.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              disabled={currentIndex <= 0}
              className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Previous assignment (Left Arrow)"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-xs sm:text-sm font-mono-code font-bold text-cyan-300">
              {currentIndex + 1} / {revealedAssignments.length}
            </span>

            <button
              onClick={handleNext}
              disabled={currentIndex >= revealedAssignments.length - 1}
              className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Next assignment (Right Arrow or Space)"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Right: Stage Live Draw Button if teams remain */}
        <div>
          {totalRemaining > 0 ? (
            <button
              onClick={handleLiveStageDraw}
              disabled={isDrawingLive}
              className="px-5 py-2.5 text-xs sm:text-sm font-black uppercase tracking-wider bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 rounded-xl shadow-xl shadow-cyan-500/30 flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 disabled:opacity-50"
            >
              <Dices className="w-4 h-4" />
              <span>Draw Next Team ({unassignedTeams[0]?.name})</span>
            </button>
          ) : (
            <div className="text-xs font-mono-code text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>All Teams Assigned</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
