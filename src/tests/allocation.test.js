import { 
  generateBalancedThemeDeck, 
  generateFullAllocation, 
  getRemainingBalancedDrawDeck, 
  calculateThemeQuotas, 
  validateAllocationStats 
} from '../utils/allocation.js';
import { DEFAULT_TEAMS, DEFAULT_THEMES } from '../utils/storage.js';

console.log('🧪 RUNNING THEME RUSH ALGORITHM SUITE...\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
    passedTests++;
  }
}

// TEST 1: Default 25 Teams & 6 Themes Quota Calculation
console.log('\n--- Test 1: Quota Calculation (25 teams, 6 themes) ---');
const quotas25 = calculateThemeQuotas(25, DEFAULT_THEMES);
const quotaValues = Object.values(quotas25);
const sumQuotas = quotaValues.reduce((a, b) => a + b, 0);
assert(sumQuotas === 25, 'Total assigned quota must equal exactly 25 teams.');
const minQ = Math.min(...quotaValues);
const maxQ = Math.max(...quotaValues);
assert(maxQ - minQ <= 1, 'Difference between any two theme quotas must be <= 1 (4 and 5).');
assert(minQ === 4 && maxQ === 5, 'Min quota is 4 and max quota is 5 for 25 teams across 6 themes.');

// TEST 2: Fewer Teams than Themes (e.g. 4 teams, 6 themes)
console.log('\n--- Test 2: Edge Case N < M (4 teams, 6 themes) ---');
const quotas4 = calculateThemeQuotas(4, DEFAULT_THEMES);
const usedCount4 = Object.values(quotas4).filter(q => q === 1).length;
assert(usedCount4 === 4, 'Exactly 4 distinct themes must be chosen when teams = 4.');

// TEST 3: Full Bulk Allocation
console.log('\n--- Test 3: Bulk Allocation Execution ---');
const assignments = generateFullAllocation(DEFAULT_TEAMS, DEFAULT_THEMES);
assert(assignments.length === 25, 'Every team receives an assignment.');
const teamIds = new Set(assignments.map(a => a.teamId));
assert(teamIds.size === 25, 'No duplicate teams in assignments.');

const stats = validateAllocationStats(DEFAULT_TEAMS, DEFAULT_THEMES, assignments);
assert(stats.isComplete === true, 'Allocation is marked complete.');
assert(stats.isBalanced === true, 'Theme allocation is verified balanced (max diff <= 1).');

// TEST 4: Sequential 1-by-1 Draws Simulation
console.log('\n--- Test 4: Sequential 1-by-1 Draw Simulation ---');
let simulatedAssignments = [];
for (let i = 0; i < DEFAULT_TEAMS.length; i++) {
  const currentTeam = DEFAULT_TEAMS[i];
  const remainingDeck = getRemainingBalancedDrawDeck(DEFAULT_TEAMS, DEFAULT_THEMES, simulatedAssignments);
  assert(remainingDeck.length === (25 - i), `Remaining deck length should be ${25 - i} before draw #${i + 1}`);
  
  const chosenTheme = remainingDeck[0];
  simulatedAssignments.push({
    teamId: currentTeam.id,
    teamName: currentTeam.name,
    teamNumber: currentTeam.teamNumber,
    themeId: chosenTheme.id,
    themeName: chosenTheme.name
  });
}

const finalStats = validateAllocationStats(DEFAULT_TEAMS, DEFAULT_THEMES, simulatedAssignments);
assert(finalStats.isComplete === true, 'Sequential draw completed 25 teams.');
assert(finalStats.isBalanced === true, 'Sequential draw produced 100% mathematically balanced allocation.');
console.log('Final Sequential Breakdown:');
finalStats.themeBreakdown.forEach(tb => {
  console.log(`  Track "${tb.theme.name}": ${tb.count} teams`);
});

console.log(`\n🎉 ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
