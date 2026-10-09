import React, { useState } from 'react';
import { 
  LayoutGrid, 
  Plus, 
  Edit3, 
  Trash2, 
  Lock, 
  RotateCcw, 
  X, 
  AlertCircle, 
  HelpCircle,
  Tag,
  Sparkles,
  Check,
  CheckCircle2,
  Info
} from 'lucide-react';
import ThemeIcon, { AVAILABLE_ICONS } from './ThemeIcon';

export default function ThemeManagement({
  themes,
  totalTeams,
  assignments,
  isLocked,
  onAddTheme,
  onUpdateTheme,
  onDeleteTheme,
  onResetThemesToDefault
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTheme, setEditingTheme] = useState(null);
  const [inlineEditingId, setInlineEditingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form state for Modal
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    icon: 'Sparkles',
    description: '',
    notes: ''
  });

  // Inline Form State
  const [inlineData, setInlineData] = useState({
    name: '',
    category: '',
    description: '',
    notes: ''
  });

  // Calculate assigned teams per theme
  const assignedCounts = {};
  themes.forEach(t => { assignedCounts[t.id] = 0; });
  assignments.forEach(a => {
    if (assignedCounts[a.themeId] !== undefined) {
      assignedCounts[a.themeId] += 1;
    }
  });

  // Expected quota estimation for organizers
  const baseCount = themes.length > 0 ? Math.floor(totalTeams / themes.length) : 0;
  const remainder = themes.length > 0 ? totalTeams % themes.length : 0;

  const openAddModal = () => {
    if (isLocked) {
      setErrorMessage('Adding new tracks during an active draw alters balanced quotas. Please reset allocation in Admin if you need to add or remove tracks.');
      return;
    }
    setFormData({
      name: '',
      category: '',
      icon: 'Sparkles',
      description: '',
      notes: ''
    });
    setEditingTheme(null);
    setShowAddModal(true);
    setErrorMessage('');
  };

  const openEditModal = (theme) => {
    setFormData({
      name: theme.name || '',
      category: theme.category || '',
      icon: theme.icon || 'Sparkles',
      description: theme.description || '',
      notes: theme.notes || ''
    });
    setEditingTheme(theme);
    setShowAddModal(true);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const startInlineEdit = (theme) => {
    setInlineEditingId(theme.id);
    setInlineData({
      name: theme.name || '',
      category: theme.category || '',
      description: theme.description || '',
      notes: theme.notes || ''
    });
    setErrorMessage('');
  };

  const saveInlineEdit = (themeId) => {
    const trimmedName = inlineData.name.trim();
    if (!trimmedName) {
      setErrorMessage('Theme title cannot be empty.');
      return;
    }

    const duplicate = themes.some(t => t.id !== themeId && t.name.toLowerCase() === trimmedName.toLowerCase());
    if (duplicate) {
      setErrorMessage(`Another theme already has the name "${trimmedName}".`);
      return;
    }

    const currentTheme = themes.find(t => t.id === themeId);
    onUpdateTheme(themeId, {
      ...currentTheme,
      name: trimmedName,
      category: inlineData.category.trim() || 'General',
      description: inlineData.description.trim() || currentTheme.description,
      notes: inlineData.notes.trim() || ''
    });

    setInlineEditingId(null);
    setSuccessMessage(`Updated "${trimmedName}" successfully! All active assignments have been synced.`);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      setErrorMessage('Theme name is required.');
      return;
    }

    // Check duplicate name
    const isDuplicate = themes.some(t => 
      (!editingTheme || t.id !== editingTheme.id) && 
      t.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      setErrorMessage(`A theme named "${trimmedName}" already exists.`);
      return;
    }

    if (editingTheme) {
      onUpdateTheme(editingTheme.id, {
        ...formData,
        name: trimmedName,
        category: formData.category.trim() || 'General Web App',
        description: formData.description.trim() || 'Build a creative web application for this domain.'
      });
      setSuccessMessage(`Theme "${trimmedName}" updated! Synced with results & live display.`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } else {
      onAddTheme({
        name: trimmedName,
        category: formData.category.trim() || 'General Web App',
        icon: formData.icon || 'Sparkles',
        description: formData.description.trim() || 'Build a creative web application for this domain.',
        notes: formData.notes.trim() || ''
      });
      setSuccessMessage(`Theme "${trimmedName}" created successfully!`);
      setTimeout(() => setSuccessMessage(''), 4000);
    }

    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Notification if Draw Active */}
      {isLocked && (
        <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between gap-3 text-cyan-300 text-xs sm:text-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-xl text-cyan-400">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white">Themes are 100% Editable</div>
              <div className="text-slate-300 text-xs">
                You can edit theme titles, descriptions, categories, and notes at any time. Any changes will instantly sync across all assigned teams and the presentation view.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-emerald-400 text-xs sm:text-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="p-1 hover:text-white">
            <X className="w-4 h-4" />
          </button>
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

      {/* Header bar with actions & quota hint */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white font-heading">
              Competition Themes ({themes.length})
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-mono-code">
              Target: {baseCount}{remainder > 0 ? `–${baseCount + 1}` : ''} teams/track
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Click <strong>"Edit Theme"</strong> on any card to modify title, category, descriptions, or judge notes.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onResetThemesToDefault}
            disabled={isLocked}
            className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-700/80 rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Reset to default 6 curated themes"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset 6 Themes</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2 text-xs sm:text-sm font-bold bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white rounded-xl shadow-lg shadow-purple-900/40 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Theme</span>
          </button>
        </div>
      </div>

      {/* Themes Grid */}
      {themes.length === 0 ? (
        <div className="p-12 text-center glass-panel rounded-2xl border border-slate-800 space-y-3">
          <LayoutGrid className="w-12 h-12 text-slate-600 mx-auto" />
          <h4 className="text-base font-bold text-slate-300">No Themes Defined</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You must have at least one theme to perform allocations. Click "Reset 6 Themes" or "Add New Theme".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {themes.map((theme) => {
            const count = assignedCounts[theme.id] || 0;
            const isInline = inlineEditingId === theme.id;

            return (
              <div
                key={theme.id}
                className={`glass-panel p-5 rounded-2xl border transition-all duration-300 relative group flex flex-col justify-between ${
                  isInline 
                    ? 'border-cyan-500 ring-1 ring-cyan-500 bg-slate-900/90' 
                    : 'border-slate-800/90 hover:border-purple-500/40'
                }`}
              >
                {isInline ? (
                  /* Inline Edit Form */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                        Quick Edit Theme
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => saveInlineEdit(theme.id)}
                          className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={() => setInlineEditingId(null)}
                          className="p-1 text-slate-400 hover:text-white rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Theme Title
                      </label>
                      <input
                        type="text"
                        value={inlineData.name}
                        onChange={(e) => setInlineData({ ...inlineData, name: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Category Tag
                      </label>
                      <input
                        type="text"
                        value={inlineData.category}
                        onChange={(e) => setInlineData({ ...inlineData, category: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Description
                      </label>
                      <textarea
                        rows={2}
                        value={inlineData.description}
                        onChange={(e) => setInlineData({ ...inlineData, description: e.target.value })}
                        className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Judge Notes
                      </label>
                      <input
                        type="text"
                        value={inlineData.notes}
                        onChange={(e) => setInlineData({ ...inlineData, notes: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                ) : (
                  /* Normal Card View */
                  <div>
                    {/* Top Bar: Icon + Category + Actions */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30 text-cyan-300 group-hover:scale-105 transition-transform">
                        <ThemeIcon name={theme.icon} className="w-6 h-6" />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700/80 text-[10px] font-mono-code text-cyan-300 font-bold">
                          {count} Assigned
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(theme)}
                            className="px-2 py-1 text-slate-300 hover:text-white bg-slate-900/80 hover:bg-cyan-950/80 border border-slate-700 hover:border-cyan-500/50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                            title="Edit full theme details"
                          >
                            <Edit3 className="w-3 h-3 text-cyan-400" />
                            <span>Edit</span>
                          </button>

                          {!isLocked && (
                            <button
                              onClick={() => onDeleteTheme(theme.id)}
                              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                              title="Delete theme"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Category Pill */}
                    <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-300 mb-1.5 font-mono-code">
                      <Tag className="w-3 h-3 text-purple-400" />
                      <span>{theme.category || 'General'}</span>
                    </div>

                    {/* Theme Title */}
                    <h4 className="text-base font-bold text-white mb-2 font-heading leading-snug group-hover:text-cyan-200 transition-colors">
                      {theme.name}
                    </h4>

                    {/* Description */}
                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                      {theme.description}
                    </p>
                  </div>
                )}

                {/* Organizer Reference Notes */}
                {!isInline && theme.notes && (
                  <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-1.5 bg-slate-900/40 p-2.5 rounded-xl mt-2">
                    <HelpCircle className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-slate-300">Judge Note:</strong> {theme.notes}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Theme Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg p-6 rounded-2xl glass-panel border border-slate-700 bg-[#0b1329]/95 text-slate-100 shadow-2xl">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-heading text-white">
                  {editingTheme ? 'Edit Competition Theme' : 'Create New Theme'}
                </h3>
                <p className="text-xs text-slate-400">
                  Update theme parameters. Changes sync across all assigned teams instantly.
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleModalSubmit} className="space-y-3.5">
              
              {/* Theme Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Theme Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Fintech & Micro-Investing Platform"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Category & Icon Picker */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. FinTech / Web3"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Theme Icon
                  </label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {AVAILABLE_ICONS.map(iconName => (
                      <option key={iconName} value={iconName}>
                        {iconName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description for Participants
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the expected application scope, features, and target users..."
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Organizer Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Organizer / Judge Evaluation Notes (Optional)
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Look for real-time charting, payment gateway mock, UX polish..."
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-850 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-xl shadow-lg shadow-purple-900/30 cursor-pointer"
                >
                  {editingTheme ? 'Save Changes' : 'Create Theme'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
