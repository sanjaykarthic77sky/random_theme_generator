import React from 'react';
import { X, ShieldCheck, Zap, Scale, Award, Terminal, CheckCircle2 } from 'lucide-react';

export default function RulesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 rounded-2xl glass-panel border border-cyan-500/30 shadow-2xl shadow-cyan-950/80 bg-[#090e1f]/95 text-slate-100"
        role="dialog"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-purple-600/20 rounded-xl border border-cyan-500/40 text-cyan-400">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black font-heading bg-gradient-to-r from-cyan-400 via-sky-200 to-purple-400 bg-clip-text text-transparent">
              THEME RUSH — Round 2 Guidelines
            </h2>
            <p className="text-xs md:text-sm text-cyan-300/80 font-mono-code">
              Round 2: Creativity & Rapid Web Development
            </p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-slate-300">
          {/* Section 1: Allocation Protocol */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
              <Scale className="w-4 h-4 text-cyan-400" />
              Fair Allocation Algorithm
            </h3>
            <ul className="space-y-2 text-slate-300 text-xs md:text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span><strong>Zero Bias & Cryptographic Randomness:</strong> Every team is allocated a theme using a balanced Fisher-Yates shuffle engine.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span><strong>Guaranteed Uniformity:</strong> The difference in the number of teams assigned to any two themes is mathematically constrained to $\le 1$.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span><strong>Immutable Assignments:</strong> Once a team reveals its theme, the result is permanently recorded and persisted to prevent tampering.</span>
              </li>
            </ul>
          </div>

          {/* Section 2: Hackathon Rules */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-purple-400" />
              Development & Competition Rules
            </h3>
            <ul className="space-y-2 text-slate-300 text-xs md:text-sm">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
                <span>Teams must build a functional website tailored strictly to their allocated theme.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
                <span>Any frontend tech stack (React, Vue, HTML/CSS/JS, Next.js, etc.) is allowed unless restricted by event coordinators.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
                <span>All code must be written during the official competition window. Pre-built templates are strictly prohibited.</span>
              </li>
            </ul>
          </div>

          {/* Section 3: Evaluation Criteria */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-amber-400" />
              Judging Criteria (100 Points)
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="font-bold text-amber-300">Theme Relevance & Innovation</div>
                <div className="text-slate-400 mt-1">30 Points — Creative alignment with the assigned domain.</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="font-bold text-amber-300">UI / UX Design & Polish</div>
                <div className="text-slate-400 mt-1">30 Points — Aesthetics, responsiveness, and usability.</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="font-bold text-amber-300">Technical Functionality</div>
                <div className="text-slate-400 mt-1">25 Points — Working features, state handling, logic.</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="font-bold text-amber-300">Pitch & Demonstration</div>
                <div className="text-slate-400 mt-1">15 Points — Clear live presentation to judges.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 rounded-xl transition-all shadow-lg shadow-cyan-500/25 cursor-pointer"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}
