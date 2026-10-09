import React, { useState, useEffect } from 'react';
import { 
  Users, 
  LayoutGrid, 
  Dices, 
  FileSpreadsheet, 
  Sparkles,
  Flame,
  CheckCircle2,
  Clock,
  Zap,
  Info
} from 'lucide-react';

import Header from './components/Header';
import DashboardStats from './components/DashboardStats';
import TeamManagement from './components/TeamManagement';
import ThemeManagement from './components/ThemeManagement';
import ThemeDraw from './components/ThemeDraw';
import ResultsTable from './components/ResultsTable';
import PresentationMode from './components/PresentationMode';
import ConfirmDialog from './components/ConfirmDialog';
import RulesModal from './components/RulesModal';

import { 
  STORAGE_KEYS, 
  DEFAULT_TEAMS, 
  DEFAULT_THEMES, 
  loadFromStorage, 
  saveToStorage, 
  resetAllStorage 
} from './utils/storage';

import { 
  generateFullAllocation, 
  getRemainingBalancedDrawDeck, 
  validateAllocationStats 
} from './utils/allocation';

import { 
  getSoundMuted, 
  setSoundMuted, 
  playClickSound 
} from './utils/sound';

export default function App() {
  // Application State backed by LocalStorage
  const [teams, setTeams] = useState(() => 
    loadFromStorage(STORAGE_KEYS.TEAMS, DEFAULT_TEAMS)
  );

  const [themes, setThemes] = useState(() => 
    loadFromStorage(STORAGE_KEYS.THEMES, DEFAULT_THEMES)
  );

  const [assignments, setAssignments] = useState(() => 
    loadFromStorage(STORAGE_KEYS.ASSIGNMENTS, [])
  );

  const [activeTab, setActiveTab] = useState(() => 
    loadFromStorage(STORAGE_KEYS.ACTIVE_TAB, 'draw')
  );

  const [isMuted, setIsMutedState] = useState(() => getSoundMuted());

  // UI Modals
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    isDanger: false,
    action: null
  });

  // Persist state changes to LocalStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TEAMS, teams);
  }, [teams]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.THEMES, themes);
  }, [themes]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ASSIGNMENTS, assignments);
  }, [assignments]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ACTIVE_TAB, activeTab);
  }, [activeTab]);

  // Sound toggle handler
  const handleToggleSound = () => {
    const nextMuted = !isMuted;
    setIsMutedState(nextMuted);
    setSoundMuted(nextMuted);
    if (!nextMuted) playClickSound();
  };

  // Tab switcher
  const handleTabSwitch = (tabId) => {
    playClickSound();
    setActiveTab(tabId);
  };

  // Check if allocation has started (locks rosters to prevent accidental corruptions)
  const isAllocationLocked = assignments.length > 0;

  // Validation metrics
  const stats = validateAllocationStats(teams, themes, assignments);

  // --- TEAM MANAGEMENT HANDLERS ---
  const handleAddTeam = (teamName) => {
    if (isAllocationLocked) return;
    const newTeam = {
      id: `team_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: teamName,
      teamNumber: teams.length + 1,
      createdAt: new Date().toISOString()
    };
    setTeams(prev => [...prev, newTeam]);
    playClickSound();
  };

  const handleBulkAddTeams = (teamNames) => {
    if (isAllocationLocked) return;
    const currentCount = teams.length;
    const newTeams = teamNames.map((name, index) => ({
      id: `team_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 4)}`,
      name: name,
      teamNumber: currentCount + index + 1,
      createdAt: new Date().toISOString()
    }));
    setTeams(prev => [...prev, ...newTeams]);
    playClickSound();
  };

  const handleUpdateTeam = (teamId, newName) => {
    if (isAllocationLocked) return;
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, name: newName } : t));
    playClickSound();
  };

  const handleDeleteTeam = (teamId) => {
    if (isAllocationLocked) return;
    setTeams(prev => {
      const remaining = prev.filter(t => t.id !== teamId);
      // Re-number sequentially
      return remaining.map((t, idx) => ({ ...t, teamNumber: idx + 1 }));
    });
    playClickSound();
  };

  const handleResetTeamsToDefault = () => {
    if (isAllocationLocked) return;
    setConfirmDialog({
      isOpen: true,
      title: 'Reset Teams to Default 25?',
      message: 'This will replace current registered teams with Team 01 through Team 25.',
      confirmText: 'Reset Teams',
      isDanger: false,
      action: () => {
        setTeams(DEFAULT_TEAMS);
        playClickSound();
      }
    });
  };

  // --- THEME MANAGEMENT HANDLERS ---
  const handleAddTheme = (themeData) => {
    if (isAllocationLocked) return;
    const newTheme = {
      id: `theme_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      ...themeData
    };
    setThemes(prev => [...prev, newTheme]);
    playClickSound();
  };

  const handleUpdateTheme = (themeId, updatedData) => {
    setThemes(prev => prev.map(t => t.id === themeId ? { ...t, ...updatedData } : t));
    // Synchronize changes to active assignments using this themeId
    setAssignments(prev => prev.map(a => {
      if (a.themeId === themeId) {
        return {
          ...a,
          themeName: updatedData.name || a.themeName,
          themeCategory: updatedData.category || a.themeCategory,
          themeDescription: updatedData.description || a.themeDescription,
          themeIcon: updatedData.icon || a.themeIcon
        };
      }
      return a;
    }));
    playClickSound();
  };

  const handleDeleteTheme = (themeId) => {
    if (isAllocationLocked) return;
    setThemes(prev => prev.filter(t => t.id !== themeId));
    playClickSound();
  };

  const handleResetThemesToDefault = () => {
    if (isAllocationLocked) return;
    setConfirmDialog({
      isOpen: true,
      title: 'Reset to Default 6 Tracks?',
      message: 'This will replace custom tracks with the 6 standard competition themes.',
      confirmText: 'Reset Themes',
      isDanger: false,
      action: () => {
        setThemes(DEFAULT_THEMES);
        playClickSound();
      }
    });
  };

  // --- DRAW & ALLOCATION HANDLERS ---
  const handlePerformIndividualDraw = (teamId) => {
    const targetTeam = teams.find(t => t.id === teamId);
    if (!targetTeam) return null;

    // Check if team already assigned
    const alreadyAssigned = assignments.find(a => a.teamId === teamId);
    if (alreadyAssigned) return alreadyAssigned;

    // Determine balanced remaining theme tokens
    const remainingDeck = getRemainingBalancedDrawDeck(teams, themes, assignments);
    if (remainingDeck.length === 0) return null;

    // Pick top token from shuffled remaining deck
    const chosenTheme = remainingDeck[0];

    const newAssignment = {
      teamId: targetTeam.id,
      teamName: targetTeam.name,
      teamNumber: targetTeam.teamNumber || 1,
      themeId: chosenTheme.id,
      themeName: chosenTheme.name,
      themeCategory: chosenTheme.category || 'General',
      themeDescription: chosenTheme.description || '',
      themeIcon: chosenTheme.icon || 'Sparkles',
      assignedAt: new Date().toISOString(),
      revealed: true
    };

    const updatedAssignments = [...assignments, newAssignment];
    setAssignments(updatedAssignments);
    saveToStorage(STORAGE_KEYS.ASSIGNMENTS, updatedAssignments);

    return newAssignment;
  };

  const handleAllocateAllTeams = () => {
    if (teams.length === 0 || themes.length === 0) return;

    try {
      const allAssignments = generateFullAllocation(teams, themes);
      setAssignments(allAssignments);
      saveToStorage(STORAGE_KEYS.ASSIGNMENTS, allAssignments);
      playClickSound();
    } catch (err) {
      alert(err.message);
    }
  };

  // --- ADMIN RESET HANDLERS ---
  const handleResetAllocation = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reset Allocation Results?',
      message: 'This will clear all generated theme assignments and unlock team & theme rosters for editing. Existing team and theme names will be preserved.',
      confirmText: 'Reset Allocation',
      isDanger: true,
      action: () => {
        setAssignments([]);
        saveToStorage(STORAGE_KEYS.ASSIGNMENTS, []);
        playClickSound();
      }
    });
  };

  const handleClearAllData = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Clear All Event Data?',
      message: 'DANGER: This will permanently wipe all teams, themes, and assignments from local storage.',
      confirmText: 'Wipe Everything',
      isDanger: true,
      action: () => {
        resetAllStorage();
        setTeams([]);
        setThemes([]);
        setAssignments([]);
        playClickSound();
      }
    });
  };

  const navTabs = [
    {
      id: 'draw',
      label: 'Random Allocation',
      sublabel: 'Interactive Draw Experience',
      icon: Dices,
      badge: stats.unassignedCount > 0 ? `${stats.unassignedCount} Remaining` : 'Completed',
      badgeColor: stats.unassignedCount > 0 ? 'text-amber-400 bg-amber-950/60 border-amber-500/30' : 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30'
    },
    {
      id: 'results',
      label: 'Assignment Results',
      sublabel: 'Live Standings & Export',
      icon: FileSpreadsheet,
      badge: `${stats.assignedCount} Assigned`,
      badgeColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-500/30'
    },
    {
      id: 'teams',
      label: 'Team Management',
      sublabel: 'Roster & Registration',
      icon: Users,
      badge: `${teams.length} Teams`,
      badgeColor: 'text-blue-400 bg-blue-950/60 border-blue-500/30'
    },
    {
      id: 'themes',
      label: 'Theme Management',
      sublabel: 'Competition Tracks',
      icon: LayoutGrid,
      badge: `${themes.length} Tracks`,
      badgeColor: 'text-purple-400 bg-purple-950/60 border-purple-500/30'
    }
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col relative selection:bg-cyan-500 selection:text-black">
      
      {/* Background ambient lighting effects */}
      <div className="fixed inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-radial-gradient pointer-events-none" />

      {/* Main Header */}
      <Header
        onEnterPresentation={() => setIsPresentationOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        onResetAllocation={handleResetAllocation}
        onClearAllData={handleClearAllData}
        hasAssignments={assignments.length > 0}
        totalTeams={teams.length}
        totalThemes={themes.length}
      />

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* Top Metric Cards */}
        <DashboardStats
          totalTeams={teams.length}
          totalThemes={themes.length}
          assignedCount={stats.assignedCount}
          remainingCount={stats.unassignedCount}
          isBalanced={stats.isBalanced}
          onSwitchTab={handleTabSwitch}
        />

        {/* 4 Main Navigation Tabs */}
        <div className="glass-panel p-1.5 sm:p-2 rounded-2xl border border-slate-800 grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2 no-print">
          {navTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabSwitch(tab.id)}
                className={`p-3 sm:p-3.5 rounded-xl text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950/90 to-blue-950/80 border border-cyan-500/50 shadow-lg shadow-cyan-950/60 text-white'
                    : 'bg-slate-900/40 hover:bg-slate-900/80 border border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="font-bold font-heading text-xs sm:text-sm">
                      {tab.label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] mt-1 w-full">
                  <span className="hidden sm:inline text-slate-500 text-[10px]">
                    {tab.sublabel}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-mono-code font-semibold ${tab.badgeColor}`}>
                    {tab.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Section Body */}
        <div className="min-h-[500px]">
          {activeTab === 'draw' && (
            <ThemeDraw
              teams={teams}
              themes={themes}
              assignments={assignments}
              onPerformDraw={handlePerformIndividualDraw}
              onAllocateAll={handleAllocateAllTeams}
              onEnterPresentation={() => setIsPresentationOpen(true)}
              onSwitchTab={handleTabSwitch}
            />
          )}

          {activeTab === 'results' && (
            <ResultsTable
              teams={teams}
              themes={themes}
              assignments={assignments}
              onEnterPresentation={() => setIsPresentationOpen(true)}
            />
          )}

          {activeTab === 'teams' && (
            <TeamManagement
              teams={teams}
              assignments={assignments}
              isLocked={isAllocationLocked}
              onAddTeam={handleAddTeam}
              onBulkAddTeams={handleBulkAddTeams}
              onUpdateTeam={handleUpdateTeam}
              onDeleteTeam={handleDeleteTeam}
              onResetTeamsToDefault={handleResetTeamsToDefault}
            />
          )}

          {activeTab === 'themes' && (
            <ThemeManagement
              themes={themes}
              totalTeams={teams.length}
              assignments={assignments}
              isLocked={isAllocationLocked}
              onAddTheme={handleAddTheme}
              onUpdateTheme={handleUpdateTheme}
              onDeleteTheme={handleDeleteTheme}
              onResetThemesToDefault={handleResetThemesToDefault}
            />
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 bg-[#040814]/80 backdrop-blur-md no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-cyan-500" />
            <span className="font-bold text-slate-400 font-heading">THEME RUSH</span>
            <span>&bull;</span>
            <span>Round 2 — Creativity</span>
          </div>

          <div>
            Built with React, Vite & Tailwind CSS &bull; 100% Fair Balanced Random Allocation System
          </div>
        </div>
      </footer>

      {/* Fullscreen Projector / Presentation View */}
      {isPresentationOpen && (
        <PresentationMode
          teams={teams}
          themes={themes}
          assignments={assignments}
          onClose={() => setIsPresentationOpen(false)}
          isMuted={isMuted}
          onToggleSound={handleToggleSound}
          onPerformDraw={handlePerformIndividualDraw}
        />
      )}

      {/* Rules & Guidelines Modal */}
      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        isDanger={confirmDialog.isDanger}
        onConfirm={() => {
          if (confirmDialog.action) confirmDialog.action();
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />

    </div>
  );
}
