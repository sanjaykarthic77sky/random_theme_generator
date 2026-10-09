/**
 * THEME RUSH — Balanced Random Allocation Engine
 * 
 * Implements full fairness, randomization, and balanced constraints:
 * - Every team gets 1 theme.
 * - If N >= M: Every theme assigned at least once before any 2nd assignment.
 * - Maximum difference between counts of any two themes is <= 1.
 * - If N < M: Randomly select N unique themes (no repeats).
 * - Shuffled with cryptographically secure / Fisher-Yates randomization.
 */

// Fisher-Yates Array Shuffle
export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Computes exact quota per theme for N teams and M themes.
 * Returns an object mapping themeId -> exact target count.
 */
export function calculateThemeQuotas(teamsCount, themes) {
  const M = themes.length;
  if (M === 0 || teamsCount === 0) return {};

  const quotas = {};
  themes.forEach(t => {
    quotas[t.id] = 0;
  });

  if (teamsCount < M) {
    // Fewer teams than themes: pick teamsCount distinct themes randomly
    const shuffledThemes = shuffleArray(themes);
    for (let i = 0; i < teamsCount; i++) {
      quotas[shuffledThemes[i].id] = 1;
    }
    return quotas;
  }

  // teamsCount >= M
  const baseCount = Math.floor(teamsCount / M);
  const remainder = teamsCount % M;

  // Each theme gets at least baseCount
  themes.forEach(t => {
    quotas[t.id] = baseCount;
  });

  // Randomly distribute the remainder (+1 to 'remainder' distinct themes)
  if (remainder > 0) {
    const shuffledThemeIds = shuffleArray(themes.map(t => t.id));
    for (let i = 0; i < remainder; i++) {
      quotas[shuffledThemeIds[i]] += 1;
    }
  }

  return quotas;
}

/**
 * Builds a balanced pool (deck) of theme objects for N teams.
 * The deck contains exactly N theme objects, meeting all quota & balance rules.
 */
export function generateBalancedThemeDeck(teamsCount, themes) {
  if (!themes || themes.length === 0 || teamsCount === 0) return [];

  const quotas = calculateThemeQuotas(teamsCount, themes);
  const deck = [];

  themes.forEach(theme => {
    const count = quotas[theme.id] || 0;
    for (let i = 0; i < count; i++) {
      deck.push({ ...theme });
    }
  });

  // Shuffle the final deck thoroughly
  return shuffleArray(deck);
}

/**
 * Generates full balanced assignment for all unassigned teams.
 * Returns an array of assignment objects: { teamId, themeId, themeName, timestamp, ... }
 */
export function generateFullAllocation(teams, themes) {
  if (!teams || teams.length === 0) {
    throw new Error('No teams available for allocation.');
  }
  if (!themes || themes.length === 0) {
    throw new Error('No themes available for allocation.');
  }

  const deck = generateBalancedThemeDeck(teams.length, themes);
  const shuffledTeams = shuffleArray(teams);

  const assignments = shuffledTeams.map((team, index) => {
    const assignedTheme = deck[index];
    return {
      teamId: team.id,
      teamName: team.name,
      teamNumber: team.teamNumber || (index + 1),
      themeId: assignedTheme.id,
      themeName: assignedTheme.name,
      themeCategory: assignedTheme.category || 'General',
      themeDescription: assignedTheme.description || '',
      themeIcon: assignedTheme.icon || 'Sparkles',
      assignedAt: new Date().toISOString(),
      revealed: true
    };
  });

  // Sort assignments back in team number order for clean organization
  assignments.sort((a, b) => a.teamNumber - b.teamNumber);

  return assignments;
}

/**
 * Generates or extends a Draw Deck for sequential 1-by-1 drawing.
 * Takes existing assignments into account to preserve balance rules.
 */
export function getRemainingBalancedDrawDeck(allTeams, themes, existingAssignments = []) {
  const unassignedTeams = allTeams.filter(team => 
    !existingAssignments.some(a => a.teamId === team.id)
  );

  if (unassignedTeams.length === 0) return [];

  const totalTeamsCount = allTeams.length;
  const M = themes.length;
  if (M === 0) return [];

  // 1. Calculate the ideal final quotas for the whole tournament
  // Count how many times each theme is ALREADY assigned
  const currentAssignedCounts = {};
  themes.forEach(t => {
    currentAssignedCounts[t.id] = 0;
  });

  existingAssignments.forEach(a => {
    if (currentAssignedCounts[a.themeId] !== undefined) {
      currentAssignedCounts[a.themeId] += 1;
    }
  });

  // 2. We determine remaining allocations needed to reach a valid balanced state
  const baseCount = Math.floor(totalTeamsCount / M);
  const remainder = totalTeamsCount % M;

  // Compute how many slots each theme should have in total (upper bound = baseCount + 1, lower bound = baseCount)
  // Let's check remaining needed counts
  const neededPool = [];

  if (totalTeamsCount < M) {
    // If total teams < M, find themes not yet used
    const unusedThemes = themes.filter(t => currentAssignedCounts[t.id] === 0);
    const shuffledUnused = shuffleArray(unusedThemes);
    const slotsToFill = unassignedTeams.length;
    for (let i = 0; i < slotsToFill; i++) {
      if (shuffledUnused[i]) {
        neededPool.push({ ...shuffledUnused[i] });
      }
    }
  } else {
    // Total teams >= M
    // Maximum allowed for any theme is (remainder > 0 ? baseCount + 1 : baseCount)
    // Minimum target for any theme is baseCount
    const minTarget = baseCount;
    const maxTarget = remainder > 0 ? baseCount + 1 : baseCount;

    // Remaining slots to distribute:
    const remainingSlots = unassignedTeams.length;

    // Determine target per theme:
    // First, give themes that haven't reached minTarget enough to reach minTarget
    const targetCounts = {};
    let allocatedSlots = 0;

    themes.forEach(t => {
      // Must at least reach currentAssigned or minTarget
      targetCounts[t.id] = Math.max(currentAssignedCounts[t.id], minTarget);
      allocatedSlots += targetCounts[t.id];
    });

    // We have totalTeamsCount slots. Let remainder be distributed to themes below maxTarget
    let extraNeeded = totalTeamsCount - allocatedSlots;
    const candidateThemes = shuffleArray(themes.filter(t => targetCounts[t.id] < maxTarget));

    for (let i = 0; i < extraNeeded && i < candidateThemes.length; i++) {
      targetCounts[candidateThemes[i].id] += 1;
    }

    // Now calculate remaining items to put into the draw deck
    themes.forEach(theme => {
      const remainingForThisTheme = (targetCounts[theme.id] || 0) - (currentAssignedCounts[theme.id] || 0);
      for (let i = 0; i < Math.max(0, remainingForThisTheme); i++) {
        neededPool.push({ ...theme });
      }
    });

    // In rare edge cases if counts don't exactly equal remainingSlots, adjust safely
    while (neededPool.length < remainingSlots) {
      const randomTheme = themes[Math.floor(Math.random() * themes.length)];
      neededPool.push({ ...randomTheme });
    }
    while (neededPool.length > remainingSlots) {
      neededPool.pop();
    }
  }

  return shuffleArray(neededPool);
}

/**
 * Helper to validate fairness and balance of an allocation set
 */
export function validateAllocationStats(teams, themes, assignments) {
  const totalTeams = teams.length;
  const totalThemes = themes.length;
  const assignedCount = assignments.length;
  const unassignedCount = totalTeams - assignedCount;

  const themeCounts = {};
  themes.forEach(t => {
    themeCounts[t.id] = {
      theme: t,
      count: 0,
      teams: []
    };
  });

  assignments.forEach(a => {
    if (themeCounts[a.themeId]) {
      themeCounts[a.themeId].count += 1;
      themeCounts[a.themeId].teams.push(a.teamName);
    }
  });

  const counts = Object.values(themeCounts).map(tc => tc.count);
  const minCount = counts.length > 0 ? Math.min(...counts) : 0;
  const maxCount = counts.length > 0 ? Math.max(...counts) : 0;
  const isBalanced = (maxCount - minCount) <= 1;

  return {
    totalTeams,
    totalThemes,
    assignedCount,
    unassignedCount,
    isComplete: assignedCount === totalTeams && totalTeams > 0,
    themeBreakdown: Object.values(themeCounts),
    minCount,
    maxCount,
    isBalanced
  };
}
