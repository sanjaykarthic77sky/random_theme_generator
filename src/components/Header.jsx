import React from 'react';
import { 
  Sparkles, 
  Tv, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  RotateCcw, 
  Trash2, 
  ChevronDown, 
  SlidersHorizontal,
  Flame,
  Radio
} from 'lucide-react';

export default function Header({
  onEnterPresentation,
  onOpenRules,
  isMuted,
  onToggleSound,
  onResetAllocation,
  onClearAllData,
  hasAssignments,
  totalTeams,
  totalThemes
}) {
  const [showAdminMenu, setShowAdminMenu] = React.useState(false);

  return (
    <header className="relative border-b border-cyan-500/20 bg-[#060b18]/90 backdrop-blur-xl sticky top-0 z-40">
      {/* Top neon glow strip */}
      <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Brand & Event Title */}
          <div className="flex items-center gap-3.5">
            <div className="relative group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/25 group-hover:shadow-cyan-400/40 transition-all">
                <div className="w-full h-full bg-[#070d1e] rounded-[10px] flex items-center justify-center">
                  <Flame className="w-6 h-6 text-cyan-400 animate-pulse-glow" />
                </div>
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black font-heading tracking-wider bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                  THEME RUSH
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 rounded-full font-mono-code">
                  Round 2 — Creativity
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
                  <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" />
                  Live Event
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Random Theme Allocation System &bull; College Web Development Championship
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            
            {/* Rules Button */}
            <button
              onClick={onOpenRules}
              className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              title="View Competition Rules & Guidelines"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Rules & Guidelines</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              className={`p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                isMuted 
                  ? 'bg-slate-900/80 text-slate-500 border-slate-800 hover:text-slate-300' 
                  : 'bg-cyan-950/40 text-cyan-300 border-cyan-500/40 hover:bg-cyan-900/50'
              }`}
              title={isMuted ? "Unmute sound effects" : "Mute sound effects"}
              aria-label={isMuted ? "Unmute sound effects" : "Mute sound effects"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Presentation Mode Button */}
            <button
              onClick={onEnterPresentation}
              className="px-3.5 py-1.5 text-xs sm:text-sm font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white rounded-xl shadow-lg shadow-purple-900/30 border border-purple-400/30 flex items-center gap-2 transition-all cursor-pointer hover:scale-102"
              title="Launch Projector Full-Screen View"
            >
              <Tv className="w-4 h-4" />
              <span>Projector View</span>
            </button>

            {/* Admin Controls Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowAdminMenu(!showAdminMenu)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                title="Organizer Admin Options"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Admin</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdminMenu ? 'rotate-180' : ''}`} />
              </button>

              {showAdminMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setShowAdminMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 p-1.5 rounded-2xl glass-panel bg-[#0d152a] border border-slate-700 shadow-2xl z-40 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                      Organizer Controls
                    </div>

                    <button
                      onClick={() => {
                        setShowAdminMenu(false);
                        onResetAllocation();
                      }}
                      disabled={!hasAssignments}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/10 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                      <div>
                        <div>Reset Allocation</div>
                        <div className="text-[10px] text-slate-400 font-normal">Clears assignments, keeps teams</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowAdminMenu(false);
                        onClearAllData();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      <div>
                        <div>Clear All Data</div>
                        <div className="text-[10px] text-slate-400 font-normal">Wipes all teams & themes</div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
