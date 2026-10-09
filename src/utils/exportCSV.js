/**
 * THEME RUSH — Export and Print Utility
 */

export function exportResultsToCSV(teams, themes, assignments) {
  if (!teams || teams.length === 0) {
    alert('No teams available to export.');
    return;
  }

  // Create a map of assignments by teamId
  const assignmentMap = new Map();
  assignments.forEach(a => {
    assignmentMap.set(a.teamId, a);
  });

  // Prepare CSV Headers
  const headers = [
    'Sl. No',
    'Team Number',
    'Team Name',
    'Assignment Status',
    'Assigned Theme',
    'Theme Category',
    'Theme Description',
    'Assigned Timestamp'
  ];

  // Map rows
  const sortedTeams = [...teams].sort((a, b) => (a.teamNumber || 0) - (b.teamNumber || 0));

  const rows = sortedTeams.map((team, index) => {
    const assignment = assignmentMap.get(team.id);
    const isAssigned = !!assignment;
    
    return [
      index + 1,
      team.teamNumber || (index + 1),
      `"${(team.name || '').replace(/"/g, '""')}"`,
      isAssigned ? 'ASSIGNED' : 'UNASSIGNED',
      `"${(assignment?.themeName || 'Pending Draw').replace(/"/g, '""')}"`,
      `"${(assignment?.themeCategory || '-').replace(/"/g, '""')}"`,
      `"${(assignment?.themeDescription || '-').replace(/"/g, '""')}"`,
      assignment?.assignedAt ? new Date(assignment.assignedAt).toLocaleString() : '-'
    ];
  });

  // Combine CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\r\n');

  // Create Blob and trigger download
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'theme-rush-round-2-results.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function triggerPrintWindow() {
  window.print();
}
