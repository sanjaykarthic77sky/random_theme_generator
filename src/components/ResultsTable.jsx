import React, { useState, useMemo } from 'react';
import { 
  Download, 
  Printer, 
  Search, 
  Tv, 
  CheckCircle2, 
  Clock, 
  Filter, 
  ArrowUpDown, 
  LayoutGrid, 
  ChevronUp, 
  ChevronDown,
  Sparkles,
  Tag,
  Flame,
  FileSpreadsheet
} from 'lucide-react';
import ThemeIcon from './ThemeIcon';
import { exportResultsToCSV, triggerPrintWindow } from '../utils/exportCSV';

export default function ResultsTable({
  teams,
  themes,
  assignments,
  onEnterPresentation
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedThemeFilter, setSelectedThemeFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL'); // 'ALL' | 'ASSIGNED' | 'UNASSIGNED'
  const [sortField, setSortField] = useState('teamNumber'); // 'teamNumber' | 'name' | 'theme' | 'status'
  const [sortAsc, setSortAsc] = useState(true);

  // Map of assignments by teamId
  const assignmentMap = useMemo(() => {
    const map = new Map();
    assignments.forEach(a => map.set(a.teamId, a));
    return map;
  }, [assignments]);

  // Per-theme assignment stats breakdown
  const themeStats = useMemo(() => {
    return themes.map(t => {
      const count = assignments.filter(a => a.themeId === t.id).length;
      return {
        ...t,
        assignedCount: count
      };
    });
  }, [themes, assignments]);

  // Combined and filtered data
  const processedRows = useMemo(() => {
    let rows = teams.map((team, idx) => {
      const assignment = assignmentMap.get(team.id);
      return {
        id: team.id,
        teamNumber: team.teamNumber || (idx + 1),
        name: team.name,
        isAssigned: !!assignment,
        themeId: assignment?.themeId || null,
        themeName: assignment?.themeName || 'Pending Draw',
        themeCategory: assignment?.themeCategory || '-',
        themeIcon: assignment?.themeIcon || 'Sparkles',
        themeDescription: assignment?.themeDescription || '',
        assignedAt: assignment?.assignedAt || null
      };
    });

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      rows = rows.filter(r => 
        r.name.toLowerCase().includes(q) ||
        `team ${r.teamNumber}`.toLowerCase().includes(q) ||
        r.themeName.toLowerCase().includes(q) ||
        r.themeCategory.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (selectedStatusFilter === 'ASSIGNED') {
      rows = rows.filter(r => r.isAssigned);
    } else if (selectedStatusFilter === 'UNASSIGNED') {
      rows = rows.filter(r => !r.isAssigned);
    }

    // Theme filter
    if (selectedThemeFilter !== 'ALL') {
      rows = rows.filter(r => r.themeId === selectedThemeFilter);
    }

    // Sort
    rows.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'teamNumber') {
        comparison = a.teamNumber - b.teamNumber;
      } else if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'theme') {
        comparison = a.themeName.localeCompare(b.themeName);
      } else if (sortField === 'status') {
        comparison = Number(b.isAssigned) - Number(a.isAssigned);
      }
      return sortAsc ? comparison : -comparison;
    });

    return rows;
  }, [teams, assignmentMap, searchTerm, selectedStatusFilter, selectedThemeFilter, sortField, sortAsc]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleExportCSV = () => {
    exportResultsToCSV(teams, themes, assignments);
  };

  return (
    <div className="space-y-6">
      
      {/* Theme Distribution Breakdown Cards */}
      <div className="space-y-3 no-print">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 font-heading">
            <LayoutGrid className="w-4 h-4 text-cyan-400" />
            Theme Distribution Matrix ({themes.length} Tracks)
          </h3>
          <span className="text-xs text-slate-400">
            Click any track to filter table
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {themeStats.map(t => {
            const isSelected = selectedThemeFilter === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setSelectedThemeFilter(isSelected ? 'ALL' : t.id)}
                className={`p-3.5 rounded-2xl glass-panel-interactive border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/60 shadow-lg shadow-cyan-900/40 scale-102'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400">
                    <ThemeIcon name={t.icon} className="w-4 h-4" />
                  </div>
                  <span className="text-base font-black font-mono-code text-white">
                    {t.assignedCount}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-200 line-clamp-1">
                  {t.name}
                </div>
                <div className="text-[10px] text-slate-400 font-mono-code truncate">
                  {t.category}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
        
        {/* Actions & Filters Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print">
          
          {/* Left: Search & Status Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search team or theme..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setSelectedStatusFilter('ALL')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  selectedStatusFilter === 'ALL'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({teams.length})
              </button>
              <button
                onClick={() => setSelectedStatusFilter('ASSIGNED')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  selectedStatusFilter === 'ASSIGNED'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Assigned ({assignments.length})
              </button>
              <button
                onClick={() => setSelectedStatusFilter('UNASSIGNED')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  selectedStatusFilter === 'UNASSIGNED'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Pending ({teams.length - assignments.length})
              </button>
            </div>

            {/* Theme filter badge if active */}
            {selectedThemeFilter !== 'ALL' && (
              <button
                onClick={() => setSelectedThemeFilter('ALL')}
                className="px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-700 text-xs flex items-center gap-1.5 cursor-pointer hover:bg-cyan-900"
              >
                <span>Track: {themes.find(t => t.id === selectedThemeFilter)?.name}</span>
                <span className="font-bold">&times;</span>
              </button>
            )}

          </div>

          {/* Right: Export & Presentation buttons */}
          <div className="flex items-center gap-2.5 flex-wrap justify-end">
            
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-900 border border-slate-700/80 hover:bg-slate-800 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download results as CSV spreadsheet (opens in Excel)"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={triggerPrintWindow}
              className="px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-900 border border-slate-700/80 hover:bg-slate-800 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print official event sheet or save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-purple-400" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onEnterPresentation}
              className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white rounded-xl shadow-lg shadow-purple-900/30 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Projector Mode</span>
            </button>

          </div>

        </div>

        {/* Printable Header (Visible only when printed) */}
        <div className="hidden print:block pb-4 mb-4 border-b border-black">
          <h1 className="text-2xl font-black text-black">THEME RUSH — ROUND 2 (CREATIVITY)</h1>
          <p className="text-xs text-gray-600">Official Random Theme Allocation Results &bull; Generated: {new Date().toLocaleString()}</p>
        </div>

        {/* Table View */}
        <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-[#070d1e]/80">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/95 text-slate-400 border-b border-slate-800 sticky top-0">
                <tr>
                  <th 
                    onClick={() => handleSort('teamNumber')}
                    className="py-3 px-4 font-semibold w-16 text-center cursor-pointer hover:text-cyan-400 select-none"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>#</span>
                      {sortField === 'teamNumber' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                    </div>
                  </th>

                  <th 
                    onClick={() => handleSort('name')}
                    className="py-3 px-4 font-semibold cursor-pointer hover:text-cyan-400 select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>Team Name</span>
                      {sortField === 'name' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                    </div>
                  </th>

                  <th 
                    onClick={() => handleSort('status')}
                    className="py-3 px-4 font-semibold cursor-pointer hover:text-cyan-400 select-none w-32"
                  >
                    <div className="flex items-center gap-1">
                      <span>Status</span>
                      {sortField === 'status' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                    </div>
                  </th>

                  <th 
                    onClick={() => handleSort('theme')}
                    className="py-3 px-4 font-semibold cursor-pointer hover:text-cyan-400 select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>Assigned Theme</span>
                      {sortField === 'theme' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                    </div>
                  </th>

                  <th className="py-3 px-4 font-semibold w-40">Track Category</th>

                  <th className="py-3 px-4 font-semibold text-right w-36">Allocated At</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60">
                {processedRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No matching records found.
                    </td>
                  </tr>
                ) : (
                  processedRows.map((row, idx) => {
                    return (
                      <tr key={row.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 text-center font-mono-code text-slate-400 font-bold">
                          {row.teamNumber}
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-200 text-sm">
                            {row.name}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          {row.isAssigned ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-semibold text-[11px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Assigned</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-400 font-medium text-[11px]">
                              <Clock className="w-3 h-3 text-amber-400" />
                              <span>Pending</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          {row.isAssigned ? (
                            <div className="flex items-center gap-2">
                              <div className="p-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                <ThemeIcon name={row.themeIcon} className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-white">
                                {row.themeName}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-500 italic font-mono-code">
                              -- Awaiting Draw --
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span className="text-slate-400 font-mono-code text-[11px]">
                            {row.themeCategory}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right font-mono-code text-slate-500 text-[11px]">
                          {row.assignedAt 
                            ? new Date(row.assignedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
                            : '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
