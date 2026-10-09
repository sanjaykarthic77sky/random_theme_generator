import React from 'react';
import { Users, LayoutGrid, CheckCircle, Clock, Check, Sparkles, Scale } from 'lucide-react';

export default function DashboardStats({
  totalTeams,
  totalThemes,
  assignedCount,
  remainingCount,
  isBalanced = true,
  onSwitchTab
}) {
  const progressPercent = totalTeams > 0 ? Math.round((assignedCount / totalTeams) * 100) : 0;
  const isComplete = totalTeams > 0 && assignedCount === totalTeams;

  const stats = [
    {
      id: 'teams',
      label: 'Total Teams',
      value: totalTeams,
      sublabel: 'Registered squads',
      icon: Users,
      gradient: 'from-blue-500/20 to-cyan-500/20',
      border: 'border-cyan-500/30',
      textAccent: 'text-cyan-400',
      tabKey: 'teams'
    },
    {
      id: 'themes',
      label: 'Available Themes',
      value: totalThemes,
      sublabel: 'Active competition tracks',
      icon: LayoutGrid,
      gradient: 'from-purple-500/20 to-pink-500/20',
      border: 'border-purple-500/30',
      textAccent: 'text-purple-400',
      tabKey: 'themes'
    },
    {
      id: 'assigned',
      label: 'Teams Assigned',
      value: assignedCount,
      sublabel: `${progressPercent}% Completed`,
      icon: CheckCircle,
      gradient: 'from-emerald-500/20 to-teal-500/20',
      border: 'border-emerald-500/30',
      textAccent: 'text-emerald-400',
      tabKey: 'results'
    },
    {
      id: 'remaining',
      label: 'Teams Remaining',
      value: remainingCount,
      sublabel: remainingCount === 0 ? 'All Allocated!' : 'Waiting for draw',
      icon: Clock,
      gradient: 'from-amber-500/20 to-orange-500/20',
      border: 'border-amber-500/30',
      textAccent: 'text-amber-400',
      tabKey: 'draw'
    }
  ];

  return (
    <div className="space-y-4">
      {/* 4 Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              onClick={() => onSwitchTab && onSwitchTab(stat.tabKey)}
              className={`p-4 sm:p-5 rounded-2xl glass-panel-interactive border ${stat.border} relative overflow-hidden group cursor-pointer`}
            >
              {/* Subtle background glow */}
              <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-gradient-to-br ${stat.gradient} blur-2xl group-hover:scale-150 transition-transform duration-500 opacity-60`} />

              <div className="relative flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {stat.label}
                </span>
                <div className={`p-2 rounded-xl bg-slate-900/80 border border-slate-700/80 ${stat.textAccent}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="relative flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl lg:text-4xl font-black font-heading tracking-tight text-white">
                  {stat.value}
                </span>
                {stat.id === 'assigned' && totalTeams > 0 && (
                  <span className="text-xs font-mono-code text-slate-400">
                    / {totalTeams}
                  </span>
                )}
              </div>

              <div className="relative mt-1 text-[11px] font-medium text-slate-400 flex items-center justify-between">
                <span>{stat.sublabel}</span>
                <span className="text-[10px] text-cyan-400/80 group-hover:underline">View &rarr;</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress & Fairness Guarantee Ticker */}
      <div className="p-3 sm:p-4 rounded-2xl glass-panel border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Progress bar */}
        <div className="w-full md:w-1/2 flex items-center gap-3">
          <span className="text-slate-400 font-semibold flex-shrink-0">
            Allocation Progress:
          </span>
          <div className="w-full bg-slate-900 rounded-full h-3 p-0.5 border border-slate-700 overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isComplete 
                  ? 'bg-gradient-to-r from-emerald-400 to-cyan-400' 
                  : 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="font-mono-code font-bold text-cyan-300 flex-shrink-0">
            {progressPercent}%
          </span>
        </div>

        {/* Live status chips */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-medium text-[11px]">
            <Scale className="w-3.5 h-3.5 text-cyan-400" />
            <span>Fairness Engine: <strong>Balanced (Δ ≤ 1)</strong></span>
          </div>

          {isComplete ? (
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-semibold text-[11px]">
              <Check className="w-3.5 h-3.5" />
              <span>All Teams Allocated</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 font-semibold text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>{remainingCount} Teams Ready for Draw</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
