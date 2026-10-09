import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  FileText, 
  Search, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Lock, 
  AlertCircle, 
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { DEFAULT_TEAMS } from '../utils/storage';

export default function TeamManagement({
  teams,
  assignments,
  isLocked,
  onAddTeam,
  onBulkAddTeams,
  onUpdateTeam,
  onDeleteTeam,
  onResetTeamsToDefault
}) {
  const [singleName, setSingleName] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [editName, setEditName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Map of assignments by teamId
  const assignmentMap = new Map();
  assignments.forEach(a => assignmentMap.set(a.teamId, a));

  // Filtered teams
  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `team ${team.teamNumber}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSingleAdd = (e) => {
    e.preventDefault();
    setErrorMessage('');
    const trimmed = singleName.trim();
    if (!trimmed) {
      setErrorMessage('Please enter a team name.');
      return;
    }
    // Check duplicates
    if (teams.some(t => t.name.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMessage(`A team named "${trimmed}" already exists.`);
      return;
    }
    onAddTeam(trimmed);
    setSingleName('');
  };

  const handleBulkSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    const lines = bulkText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length === 0) {
      setErrorMessage('Please enter at least one team name.');
      return;
    }

    onBulkAddTeams(lines);
    setBulkText('');
    setShowBulkModal(false);
  };

  const startEditing = (team) => {
    if (isLocked) return;
    setEditingTeamId(team.id);
    setEditName(team.name);
  };

  const saveEditing = (teamId) => {
    const trimmed = editName.trim();
    if (!trimmed) return;
    
    // Check duplicate among other teams
    const duplicate = teams.some(t => t.id !== teamId && t.name.toLowerCase() === trimmed.toLowerCase());
    if (duplicate) {
      setErrorMessage(`Another team already has the name "${trimmed}".`);
      return;
    }

    onUpdateTeam(teamId, trimmed);
    setEditingTeamId(null);
    setEditName('');
    setErrorMessage('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner if Locked */}
      {isLocked && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-amber-300 text-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-xl">
              <Lock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="font-bold">Team Roster Locked</div>
              <div className="text-xs text-amber-200/80">
                Allocation is currently in progress. Team additions, edits, and deletions are disabled to ensure competitive integrity. Reset allocation in Admin to make changes.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error notification */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between text-red-400 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="p-1 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Action Controls & Input Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Quick Add Team */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2 font-heading">
              <UserPlus className="w-4 h-4 text-cyan-400" />
              Add Individual Team
            </h3>
            <span className="text-[11px] font-mono-code text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
              #{teams.length + 1}
            </span>
          </div>

          <form onSubmit={handleSingleAdd} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Team Name
              </label>
              <input
                type="text"
                value={singleName}
                onChange={(e) => setSingleName(e.target.value)}
                disabled={isLocked}
                placeholder={isLocked ? "Roster locked" : "e.g. Byte Busters, Team 26"}
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={isLocked || !singleName.trim()}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-cyan-950/50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Team</span>
            </button>
          </form>

          {/* Quick actions separator */}
          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setShowBulkModal(true)}
              disabled={isLocked}
              className="w-full py-2 px-3 text-xs font-semibold text-cyan-300 hover:text-white bg-cyan-950/30 hover:bg-cyan-900/40 border border-cyan-500/30 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Bulk Add Teams (Paste List)</span>
            </button>

            <button
              type="button"
              onClick={onResetTeamsToDefault}
              disabled={isLocked}
              className="w-full py-2 px-3 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900/40 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset to Default 25 Teams</span>
            </button>
          </div>
        </div>

        {/* Right 2 Columns: Team List Table */}
        <div className="lg:col-span-2 glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-heading">
                <Users className="w-4 h-4 text-purple-400" />
                Registered Teams ({teams.length})
              </h3>
              <p className="text-xs text-slate-400">
                Live list of participating college teams for Round 2.
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search teams..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-[#070d1e]/80 flex-1 max-h-[460px] overflow-y-auto">
            {filteredTeams.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                {searchTerm ? 'No teams match your search term.' : 'No teams added yet. Add individual teams or paste a bulk list.'}
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 sticky top-0 z-10">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold w-12 text-center">#</th>
                    <th className="py-2.5 px-3 font-semibold">Team Name</th>
                    <th className="py-2.5 px-3 font-semibold">Theme Status</th>
                    <th className="py-2.5 px-3 font-semibold text-right w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredTeams.map((team, index) => {
                    const assignment = assignmentMap.get(team.id);
                    const isAssigned = !!assignment;
                    const isEditing = editingTeamId === team.id;

                    return (
                      <tr key={team.id} className="hover:bg-slate-800/30 transition-colors group">
                        <td className="py-2.5 px-3 text-center font-mono-code text-slate-400">
                          {team.teamNumber || (index + 1)}
                        </td>

                        <td className="py-2.5 px-3">
                          {isEditing ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                autoFocus
                                className="px-2 py-1 bg-slate-900 border border-cyan-500 rounded text-xs text-white focus:outline-none"
                              />
                              <button
                                onClick={() => saveEditing(team.id)}
                                className="p-1 text-emerald-400 hover:bg-emerald-500/20 rounded"
                                title="Save"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingTeamId(null)}
                                className="p-1 text-slate-400 hover:bg-slate-700 rounded"
                                title="Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="font-semibold text-slate-200 group-hover:text-white">
                              {team.name}
                            </span>
                          )}
                        </td>

                        <td className="py-2.5 px-3">
                          {isAssigned ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-medium text-[11px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span className="truncate max-w-[140px]">{assignment.themeName}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-400 font-medium text-[11px]">
                              <Clock className="w-3 h-3 text-amber-400" />
                              <span>Pending Draw</span>
                            </span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {!isLocked && !isEditing && (
                              <>
                                <button
                                  onClick={() => startEditing(team)}
                                  className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors cursor-pointer"
                                  title="Edit Team Name"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onDeleteTeam(team.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                  title="Remove Team"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                            {isLocked && (
                              <span className="text-[10px] text-slate-500 font-mono-code">
                                Locked
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

        </div>

      </div>

      {/* Bulk Add Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg p-6 rounded-2xl glass-panel border border-slate-700 bg-[#0b1329]/95 text-slate-100 shadow-2xl">
            <button
              onClick={() => setShowBulkModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-heading text-white">
                  Bulk Register Teams
                </h3>
                <p className="text-xs text-slate-400">
                  Paste a list of team names below (one team per line).
                </p>
              </div>
            </div>

            <form onSubmit={handleBulkSubmit} className="space-y-4">
              <div>
                <textarea
                  rows={8}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={`Team Alpha\nTeam Beta\nTeam Gamma\nCyber Titans\nCode Crafters\nQuantum Coders`}
                  className="w-full p-3.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono-code text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
                <div className="mt-1 text-[11px] text-slate-400 flex justify-between">
                  <span>Empty lines will be skipped automatically.</span>
                  <span>
                    {bulkText.split('\n').filter(l => l.trim()).length} teams ready to add
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-850 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!bulkText.trim()}
                  className="px-5 py-2 text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 rounded-xl shadow-lg shadow-cyan-500/25 disabled:opacity-40 cursor-pointer"
                >
                  Add All Teams
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
