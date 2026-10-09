/**
 * THEME RUSH — Data Persistence & Storage Layer
 * Handles LocalStorage caching, initial default datasets, and state preservation.
 */

export const STORAGE_KEYS = {
  TEAMS: 'theme_rush_teams_v1',
  THEMES: 'theme_rush_themes_v1',
  ASSIGNMENTS: 'theme_rush_assignments_v1',
  DRAW_QUEUE: 'theme_rush_draw_queue_v1',
  ACTIVE_TAB: 'theme_rush_active_tab_v1',
  SETTINGS: 'theme_rush_settings_v1'
};

// Default 25 sample teams (Team 01 to Team 25)
export const DEFAULT_TEAMS = Array.from({ length: 25 }, (_, i) => {
  const num = (i + 1).toString().padStart(2, '0');
  return {
    id: `team_${i + 1}`,
    name: `Team ${num}`,
    teamNumber: i + 1,
    createdAt: new Date().toISOString()
  };
});

// Default 6 themes with rich metadata, categories, icons, and organizer notes
export const DEFAULT_THEMES = [
  {
    id: 'theme_1',
    name: 'E-Commerce & Online Shopping',
    category: 'Retail & Marketplace',
    icon: 'ShoppingBag',
    description: 'Build a next-gen shopping experience with product filters, live cart calculations, fast checkout flow, and discount engine.',
    notes: 'Evaluate cart state management, checkout UI responsiveness, product quick-views, and search accuracy.'
  },
  {
    id: 'theme_2',
    name: 'Healthcare & Hospital Management',
    category: 'MedTech & Enterprise',
    icon: 'Activity',
    description: 'Develop an intuitive portal for patient appointments, doctor availability rosters, vital sign trackers, and digital medical history.',
    notes: 'Look for accessibility, clean role-based dashboards (doctor vs patient), appointment slot booking, and privacy indicators.'
  },
  {
    id: 'theme_3',
    name: 'Education & E-Learning',
    category: 'EdTech & Gamification',
    icon: 'GraduationCap',
    description: 'Design an engaging interactive learning platform featuring modular courses, interactive quizzes, video cards, and student badges.',
    notes: 'Assess learning progress visualizations, quiz interactivity, course bookmarking, and clear module navigation.'
  },
  {
    id: 'theme_4',
    name: 'Travel & Tourism',
    category: 'Exploration & Booking',
    icon: 'Compass',
    description: 'Create a breathtaking travel discovery and itinerary planning platform with destination spotlights, weather widgets, and package booking.',
    notes: 'Examine visual storytelling, interactive trip day-planner, budget calculator, and destination gallery filters.'
  },
  {
    id: 'theme_5',
    name: 'Food Delivery & Restaurant Management',
    category: 'QuickCommerce & Dining',
    icon: 'UtensilsCrossed',
    description: 'Build a high-energy food ordering interface with categorized menus, customizable dishes, live order status tracker, and table reservation.',
    notes: 'Focus on rapid cart addition, dish customization popups, order status progression, and restaurant rating displays.'
  },
  {
    id: 'theme_6',
    name: 'Smart City & Sustainability',
    category: 'CivicTech & IoT',
    icon: 'Building2',
    description: 'Develop a civic intelligence dashboard monitoring smart energy grids, public transit live tracking, waste management routes, and eco-tips.',
    notes: 'Judge data visualization widgets, real-time alert banners, environmental metric graphs, and citizen issue reporting flow.'
  }
];

// Helper to safely read from localStorage
export function loadFromStorage(key, defaultValue) {
  try {
    const item = localStorage.getItem(key);
    if (item === null || item === undefined) return defaultValue;
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
}

// Helper to safely write to localStorage
export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
}

// Reset entire application back to pristine initial state
export function resetAllStorage() {
  try {
    localStorage.removeItem(STORAGE_KEYS.TEAMS);
    localStorage.removeItem(STORAGE_KEYS.THEMES);
    localStorage.removeItem(STORAGE_KEYS.ASSIGNMENTS);
    localStorage.removeItem(STORAGE_KEYS.DRAW_QUEUE);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}
