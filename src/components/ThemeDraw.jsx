import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Dices, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Zap, 
  RotateCcw, 
  AlertCircle,
  Clock,
  Tv,
  HelpCircle,
  Tag,
  Flame,
  Check
} from 'lucide-react';
import ThemeIcon from './ThemeIcon';
import { playTickSound, playRevealFanfare, playClickSound } from '../utils/sound';

export default function ThemeDraw({
  teams,
  themes,
  assignments,
  onPerformDraw,
  onAllocateAll,
  onEnterPresentation,
  onSwitchTab
}) {
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayTheme, setDisplayTheme] = useState(null);
  const [lastRevealedAssignment, setLastRevealedAssignment] = useState(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const spinIntervalRef = useRef(null);

  // Unassigned teams
  const unassignedTeams = teams.filter(team => 
    !assignments.some(a => a.teamId === team.id)
  );

  // Keep selected team synced to next unassigned team
  useEffect(() => {
    if (unassignedTeams.length > 0) {
      if (!selectedTeamId || !unassignedTeams.some(t => t.id === selectedTeamId)) {
        setSelectedTeamId(unassignedTeams[0].id);
      }
    } else {
      setSelectedTeamId('');
    }
  }, [unassignedTeams, selectedTeamId]);

  // Selected team object
  const currentSelectedTeam = teams.find(t => t.id === selectedTeamId);

  // Trigger exciting confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#a855f7', '#ec4899', '#3b82f6', '#10b981']
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#06b6d4', '#a855f7', '#f59e0b']
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#ec4899', '#3b82f6', '#10b981']
        });
      }, 250);
    } catch (e) {
      // ignore
    }
  };

  const handleDrawClick = () => {
    if (isSpinning || !currentSelectedTeam || themes.length === 0) return;

    playClickSound();
    setIsSpinning(true);
    setLastRevealedAssignment(null);

    // 1. Instantly perform backend balanced assignment & save to persistent storage!
    const assignmentResult = onPerformDraw(currentSelectedTeam.id);
    if (!assignmentResult) {
      setIsSpinning(false);
      return;
    }

    // Target theme that will be revealed
    const targetTheme = themes.find(t => t.id === assignmentResult.themeId) || themes[0];

    // 2. Run high-energy roulette slot spinning animation
    let counter = 0;
    const totalTicks = 22;
    let tickSpeed = 60; // ms

    const runTick = () => {
      counter++;
      const randomIdx = Math.floor(Math.random() * themes.length);
      setDisplayTheme(themes[randomIdx]);
      playTickSound(350 + counter * 25, 0.04);

      if (counter < totalTicks) {
        // Exponentially decelerate for suspense
        tickSpeed += counter > 14 ? 35 : 10;
        spinIntervalRef.current = setTimeout(runTick, tickSpeed);
      } else {
        // Final landing on the actual assigned theme!
        setDisplayTheme(targetTheme);
        setLastRevealedAssignment(assignmentResult);
        setIsSpinning(false);
        playRevealFanfare();
        triggerConfetti();
      }
    };

    runTick();
  };

  // Clean up timer
  useEffect(() => {
    return () => {
      if (spinIntervalRef.current) clearTimeout(spinIntervalRef.current);
    };
  }, []);

  const handleNextTeam = () => {
    playClickSound();
    setLastRevealedAssignment(null);
    if (unassignedTeams.length > 0) {
      setSelectedTeamId(unassignedTeams[0].id);
    }
  };

  const isAllAllocated = teams.length > 0 && unassignedTeams.length === 0;

  return (
    <div className="space-y-6">
      
      {/* Top Controls Bar */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Team Selector / Status */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Dices className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Selected Draw Candidate
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {isAllAllocated ? (
                <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> All {teams.length} Teams Allocated!
                </span>
              ) : (
                <select
                  value={selectedTeamId}
                  onChange={(e) => {
                    setSelectedTeamId(e.target.value);
                    setLastRevealedAssignment(null);
                  }}
                  disabled={isSpinning || isAllAllocated}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {unassignedTeams.map(t => (
                    <option key={t.id} value={t.id}>
                      #{t.teamNumber} &bull; {t.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto justify-end">
          
          {/* Allocate All button */}
          {!isAllAllocated && (
            <button
              onClick={() => setShowBulkConfirm(true)}
              disabled={isSpinning || teams.length === 0 || themes.length === 0}
              className="px-3.5 py-2 text-xs font-semibold text-purple-300 hover:text-white bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
              title="Perform balanced allocation for all remaining teams simultaneously"
            >
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>Allocate All Teams</span>
            </button>
          )}

          {/* Projector Mode Launch */}
          <button
            onClick={onEnterPresentation}
            className="px-3.5 py-2 text-xs font-semibold text-cyan-300 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            title="Present on large projector screen"
          >
            <Tv className="w-3.5 h-3.5 text-cyan-400" />
            <span>Launch Presentation</span>
          </button>
        </div>

      </div>

      {/* Main Interactive Stage */}
      {teams.length === 0 || themes.length === 0 ? (
        <div className="p-12 text-center glass-panel rounded-2xl border border-slate-800 space-y-3">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h4 className="text-base font-bold text-white">Setup Required</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Please register teams in the <strong>Team Management</strong> tab and define tracks in <strong>Theme Management</strong> before starting the draw.
          </p>
        </div>
      ) : isAllAllocated && !lastRevealedAssignment ? (
        /* Finished State */
        <div className="p-10 sm:p-14 text-center glass-panel rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 to-[#070d1e] space-y-6 shadow-2xl relative overflow-hidden">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-950/50">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black font-heading text-white">
              Allocation Complete!
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
              All {teams.length} teams have received their randomly balanced themes for Round 2 — Creativity.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onSwitchTab('results')}
              className="px-5 py-2.5 text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 rounded-xl shadow-lg shadow-emerald-500/30 cursor-pointer"
            >
              View Results Table &rarr;
            </button>
            <button
              onClick={onEnterPresentation}
              className="px-5 py-2.5 text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl cursor-pointer"
            >
              Open Projector View
            </button>
          </div>
        </div>
      ) : (
        /* Active Draw Panel */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Live Spinning Roulette / Reveal Card */}
          <div className="lg:col-span-8 glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 relative overflow-hidden flex flex-col justify-between shadow-2xl bg-gradient-to-b from-[#0d162c] to-[#060b18]">
            
            {/* Ambient Background Lights */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Target Team Header */}
            <div className="relative flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div>
                <div className="text-[11px] font-mono-code uppercase tracking-widest text-cyan-400 font-semibold">
                  Round 2 Theme Allocation
                </div>
                <h3 className="text-2xl sm:text-3xl font-black font-heading text-white mt-0.5">
                  {currentSelectedTeam ? currentSelectedTeam.name : 'Select a team'}
                </h3>
              </div>

              <div className="text-right">
                <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-mono-code text-slate-300">
                  Team #{currentSelectedTeam?.teamNumber || '-'}
                </span>
              </div>
            </div>

            {/* Central Reveal Display Box */}
            <div className="my-8 relative">
              <div className={`p-8 sm:p-10 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                lastRevealedAssignment 
                  ? 'neon-border-cyan bg-cyan-950/20 shadow-2xl shadow-cyan-900/30' 
                  : isSpinning 
                    ? 'border-purple-500/60 bg-purple-950/20 animate-pulse' 
                    : 'border-slate-800 bg-slate-900/50'
              }`}>
                
                {isSpinning ? (
                  /* Spinning State */
                  <div className="text-center space-y-4 py-4 animate-slot-fast">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                      <ThemeIcon name={displayTheme?.icon || 'Sparkles'} className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="text-xs font-mono-code text-purple-300 uppercase tracking-widest">
                        {displayTheme?.category || 'Selecting...'}
                      </div>
                      <div className="text-2xl sm:text-3xl font-black font-heading text-white mt-1">
                        {displayTheme?.name || 'Rolling Themes...'}
                      </div>
                    </div>
                  </div>
                ) : lastRevealedAssignment ? (
                  /* Revealed Success State */
                  <div className="space-y-4 text-center py-2 animate-in zoom-in-95 duration-300">
                    <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-purple-600/30 border border-cyan-400/50 text-cyan-300 shadow-xl shadow-cyan-500/20">
                      <ThemeIcon name={lastRevealedAssignment.themeIcon} className="w-10 h-10" />
                    </div>

                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-xs font-mono-code text-cyan-300 font-bold mb-2">
                        <Tag className="w-3.5 h-3.5" />
                        <span>{lastRevealedAssignment.themeCategory}</span>
                      </div>
                      <h4 className="text-2xl sm:text-4xl font-black font-heading bg-gradient-to-r from-white via-cyan-100 to-purple-200 bg-clip-text text-transparent">
                        {lastRevealedAssignment.themeName}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mt-3 leading-relaxed">
                        {lastRevealedAssignment.themeDescription}
                      </p>
                    </div>

                    <div className="pt-2 text-[11px] font-mono-code text-emerald-400 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Assignment Confirmed & Saved to Records</span>
                    </div>
                  </div>
                ) : (
                  /* Idle Ready State */
                  <div className="text-center py-6 space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500">
                      <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse-glow" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-200 font-heading">
                        Ready for Random Allocation
                      </h4>
                      <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                        Click the button below to randomly draw a balanced theme for <strong>{currentSelectedTeam?.name}</strong>.
                      </p>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Bottom Action Button Area */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span><strong>{unassignedTeams.length}</strong> teams remaining in draw queue</span>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                {lastRevealedAssignment && unassignedTeams.length > 0 && (
                  <button
                    onClick={handleNextTeam}
                    className="flex-1 sm:flex-initial px-5 py-3 text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Next Team</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={handleDrawClick}
                  disabled={isSpinning || !currentSelectedTeam}
                  className={`flex-1 sm:flex-initial px-8 py-3 text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl transition-all shadow-xl flex items-center justify-center gap-2.5 cursor-pointer ${
                    isSpinning
                      ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 shadow-cyan-500/30 hover:scale-102'
                  }`}
                >
                  <Dices className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
                  <span>{isSpinning ? 'Rolling Theme...' : 'DRAW RANDOM THEME'}</span>
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Queue & Recent Assignments */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Draw Queue */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-heading">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  Draw Queue ({unassignedTeams.length})
                </h4>
                <span className="text-[10px] text-slate-400 font-mono-code">
                  Click to select
                </span>
              </div>

              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                {unassignedTeams.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-xs">
                    Queue is empty.
                  </div>
                ) : (
                  unassignedTeams.map((team, idx) => {
                    const isCurrent = team.id === selectedTeamId;
                    return (
                      <div
                        key={team.id}
                        onClick={() => {
                          if (!isSpinning) {
                            setSelectedTeamId(team.id);
                            setLastRevealedAssignment(null);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-cyan-950/60 border-cyan-500/50 text-white font-bold'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono-code text-[11px] text-slate-500">
                            #{team.teamNumber}
                          </span>
                          <span>{team.name}</span>
                        </div>
                        {isCurrent && (
                          <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                            Active
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Recent Reveals */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-heading">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Recently Assigned ({assignments.length})
                </h4>
                <button
                  onClick={() => onSwitchTab('results')}
                  className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                >
                  Full Table &rarr;
                </button>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {assignments.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-xs">
                    No draws executed yet.
                  </div>
                ) : (
                  [...assignments].reverse().slice(0, 5).map(a => (
                    <div
                      key={a.teamId}
                      className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-white">
                          {a.teamName}
                        </div>
                        <div className="text-[11px] text-cyan-300 flex items-center gap-1 mt-0.5">
                          <ThemeIcon name={a.themeIcon} className="w-3 h-3" />
                          <span className="truncate max-w-[150px]">{a.themeName}</span>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono-code text-slate-500">
                        {new Date(a.assignedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Bulk Allocation Confirmation Modal */}
      {showBulkConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md p-6 rounded-2xl glass-panel border border-purple-500/40 bg-[#0c1226]/95 text-slate-100 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-heading text-white">
                  Allocate All Remaining Teams?
                </h3>
                <p className="text-xs text-slate-400">
                  Instant balanced allocation for {unassignedTeams.length} teams.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
              This will automatically compute balanced random themes for all remaining teams in one step and update the results table. You can still reveal them sequentially in Presentation Mode!
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowBulkConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-850 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowBulkConfirm(false);
                  onAllocateAll();
                  triggerConfetti();
                  playRevealFanfare();
                }}
                className="px-5 py-2 text-xs font-bold bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-xl shadow-lg shadow-purple-900/30 cursor-pointer"
              >
                Confirm & Allocate All
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
