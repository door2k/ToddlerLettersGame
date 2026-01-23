/**
 * Adaptive Learning Engine for ToddlerLettersGame
 *
 * Implements spaced repetition and mastery-based progression:
 * - Starts with just 1-2 digits (hand-holding)
 * - Measures mastery through success rate and streaks
 * - Introduces new digits only when ready
 * - Persists progress across sessions via localStorage
 */

const STORAGE_KEYS = {
  ITEM_STATS: 'toddlerGame_itemStats',
  LEARNER_PROFILE: 'toddlerGame_learnerProfile',
}

// Item status states
export const ItemStatus = {
  NEW: 'new',
  LEARNING: 'learning',
  MASTERED: 'mastered',
  STRUGGLING: 'struggling',
}

// Mastery thresholds
const MASTERY_CRITERIA = {
  MIN_SUCCESS_RATE: 0.8, // 80%
  MIN_CONSECUTIVE_CORRECT: 2,
  MIN_ATTEMPTS: 4,
}

// Struggling threshold
const STRUGGLING_THRESHOLD = 3 // consecutive wrong answers

// All available digits
const ALL_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

// Initial digits to introduce (easiest/most recognizable)
const INITIAL_DIGITS = ['1', '2']

/**
 * Create fresh stats for a single digit
 */
function createItemStats(digit, status = ItemStatus.NEW) {
  return {
    digit,
    timesShown: 0,
    timesCorrect: 0,
    firstTryCorrect: 0,
    consecutiveCorrect: 0,
    consecutiveWrong: 0,
    lastSeen: null,
    status,
  }
}

/**
 * Initialize stats for all digits
 * Initial digits start as 'learning', others as 'new'
 */
export function initializeStats() {
  const stats = {}
  for (const digit of ALL_DIGITS) {
    const isInitial = INITIAL_DIGITS.includes(digit)
    stats[digit] = createItemStats(digit, isInitial ? ItemStatus.LEARNING : ItemStatus.NEW)
  }
  return stats
}

/**
 * Create initial learner profile
 */
export function createLearnerProfile() {
  return {
    totalSessions: 0,
    totalItemsCompleted: 0,
    masteredCount: 0,
    currentLevel: 'digits',
    language: 'en',
    lastSessionDate: null,
    newItemsIntroducedThisSession: 0,
  }
}

/**
 * Load progress from localStorage
 * Returns { itemStats, learnerProfile } or null if no saved data
 */
export function loadProgress() {
  try {
    const statsJson = localStorage.getItem(STORAGE_KEYS.ITEM_STATS)
    const profileJson = localStorage.getItem(STORAGE_KEYS.LEARNER_PROFILE)

    if (!statsJson || !profileJson) {
      return null
    }

    const itemStats = JSON.parse(statsJson)
    const learnerProfile = JSON.parse(profileJson)

    // Validate the data has expected structure
    if (!itemStats || typeof itemStats !== 'object') {
      return null
    }

    // Reset session-specific counters
    learnerProfile.newItemsIntroducedThisSession = 0

    return { itemStats, learnerProfile }
  } catch (e) {
    console.warn('Failed to load progress from localStorage:', e)
    return null
  }
}

/**
 * Save progress to localStorage
 */
export function saveProgress(itemStats, learnerProfile) {
  try {
    localStorage.setItem(STORAGE_KEYS.ITEM_STATS, JSON.stringify(itemStats))
    localStorage.setItem(STORAGE_KEYS.LEARNER_PROFILE, JSON.stringify(learnerProfile))
    return true
  } catch (e) {
    console.warn('Failed to save progress to localStorage:', e)
    return false
  }
}

/**
 * Clear all saved progress
 */
export function clearProgress() {
  try {
    localStorage.removeItem(STORAGE_KEYS.ITEM_STATS)
    localStorage.removeItem(STORAGE_KEYS.LEARNER_PROFILE)
    return true
  } catch (e) {
    console.warn('Failed to clear progress:', e)
    return false
  }
}

/**
 * Calculate success rate for an item
 */
function getSuccessRate(itemStats) {
  if (itemStats.timesShown === 0) return 0
  return itemStats.timesCorrect / itemStats.timesShown
}

/**
 * Evaluate and update item status based on performance
 */
export function evaluateMastery(itemStats) {
  const successRate = getSuccessRate(itemStats)

  // Check for mastery
  if (
    itemStats.timesShown >= MASTERY_CRITERIA.MIN_ATTEMPTS &&
    successRate >= MASTERY_CRITERIA.MIN_SUCCESS_RATE &&
    itemStats.consecutiveCorrect >= MASTERY_CRITERIA.MIN_CONSECUTIVE_CORRECT
  ) {
    return ItemStatus.MASTERED
  }

  // Check for struggling
  if (itemStats.consecutiveWrong >= STRUGGLING_THRESHOLD) {
    return ItemStatus.STRUGGLING
  }

  // If previously mastered but now struggling, demote to learning
  if (itemStats.status === ItemStatus.MASTERED && itemStats.consecutiveWrong >= 2) {
    return ItemStatus.LEARNING
  }

  // If new and has been shown, move to learning
  if (itemStats.status === ItemStatus.NEW && itemStats.timesShown > 0) {
    return ItemStatus.LEARNING
  }

  // Stay in current status if learning
  if (itemStats.status === ItemStatus.LEARNING) {
    return ItemStatus.LEARNING
  }

  return itemStats.status
}

/**
 * Update item stats after an attempt
 * @param {object} itemStats - Current stats for the item
 * @param {boolean} wasCorrect - Whether the answer was correct
 * @param {boolean} wasFirstTry - Whether this was the first attempt for this showing
 * @returns {object} Updated item stats
 */
export function updateItemStats(itemStats, wasCorrect, wasFirstTry) {
  const updated = { ...itemStats }

  updated.timesShown += 1
  updated.lastSeen = Date.now()

  if (wasCorrect) {
    updated.timesCorrect += 1
    updated.consecutiveCorrect += 1
    updated.consecutiveWrong = 0

    if (wasFirstTry) {
      updated.firstTryCorrect += 1
    }
  } else {
    updated.consecutiveWrong += 1
    updated.consecutiveCorrect = 0
  }

  // Evaluate and update status
  updated.status = evaluateMastery(updated)

  return updated
}

/**
 * Calculate due score for item selection
 * Higher score = higher priority for showing
 */
function calculateDueScore(itemStats) {
  const successRate = getSuccessRate(itemStats)

  switch (itemStats.status) {
    case ItemStatus.STRUGGLING:
      return 100 // Highest priority
    case ItemStatus.LEARNING:
      return 50 + (1 - successRate) * 30 // 50-80 range
    case ItemStatus.MASTERED:
      return 10 // Occasional review
    case ItemStatus.NEW:
      return 0 // Only introduced when ready
    default:
      return 0
  }
}

/**
 * Check if ready to introduce a new item
 */
export function shouldIntroduceNew(itemStats, learnerProfile) {
  // Max 1 new item per session
  if (learnerProfile.newItemsIntroducedThisSession >= 1) {
    return false
  }

  // Count items in learning or mastered state
  const activeItems = Object.values(itemStats).filter(
    item => item.status === ItemStatus.LEARNING || item.status === ItemStatus.MASTERED
  )

  // Need at least 3 items in learning/mastered state
  if (activeItems.length < 3) {
    return false
  }

  // Check if there are any new items available
  const newItems = Object.values(itemStats).filter(item => item.status === ItemStatus.NEW)
  if (newItems.length === 0) {
    return false
  }

  // Check if at least one item is mastered (shows learning is happening)
  const masteredItems = Object.values(itemStats).filter(item => item.status === ItemStatus.MASTERED)
  if (masteredItems.length === 0 && activeItems.length < 4) {
    return false
  }

  return true
}

/**
 * Select the next new item to introduce
 * Picks digits that are adjacent to already-known digits
 */
function selectNewItem(itemStats) {
  const newItems = Object.values(itemStats).filter(item => item.status === ItemStatus.NEW)
  if (newItems.length === 0) return null

  // Get known digits
  const knownDigits = Object.values(itemStats)
    .filter(item => item.status !== ItemStatus.NEW)
    .map(item => parseInt(item.digit))

  // Prefer digits adjacent to known ones
  const adjacent = newItems.filter(item => {
    const d = parseInt(item.digit)
    return knownDigits.includes(d - 1) || knownDigits.includes(d + 1)
  })

  if (adjacent.length > 0) {
    // Pick randomly from adjacent
    return adjacent[Math.floor(Math.random() * adjacent.length)]
  }

  // Otherwise pick any new item randomly
  return newItems[Math.floor(Math.random() * newItems.length)]
}

/**
 * Select items for the next session
 * @param {object} itemStats - Current stats for all items
 * @param {object} learnerProfile - Learner profile
 * @param {number} count - Number of items to select (default 10)
 * @returns {string[]} Array of digit strings in order to show
 */
export function selectNextItems(itemStats, learnerProfile, count = 10) {
  const session = []
  const used = new Set()

  // Helper to add item if not already used
  const addItem = (digit) => {
    if (digit && !used.has(digit)) {
      session.push(digit)
      used.add(digit)
      return true
    }
    return false
  }

  // Get items by status
  const masteredItems = Object.values(itemStats)
    .filter(item => item.status === ItemStatus.MASTERED)
    .sort((a, b) => getSuccessRate(b) - getSuccessRate(a))

  const learningItems = Object.values(itemStats)
    .filter(item => item.status === ItemStatus.LEARNING)
    .sort((a, b) => calculateDueScore(b) - calculateDueScore(a))

  const strugglingItems = Object.values(itemStats)
    .filter(item => item.status === ItemStatus.STRUGGLING)
    .sort((a, b) => b.consecutiveWrong - a.consecutiveWrong)

  // Position 1-2: Warm-up with highest mastery items (confidence builders)
  const warmupPool = [...masteredItems, ...learningItems.filter(i => getSuccessRate(i) > 0.6)]
  for (let i = 0; i < 2 && i < warmupPool.length && session.length < count; i++) {
    addItem(warmupPool[i].digit)
  }

  // If not enough warm-up items, use any learning items
  if (session.length < 2) {
    for (const item of learningItems) {
      if (session.length >= 2) break
      addItem(item.digit)
    }
  }

  // Positions 3-6: Learning/struggling items
  // Prioritize struggling items
  for (const item of strugglingItems) {
    if (session.length >= 6) break
    addItem(item.digit)
  }

  // Fill with learning items
  for (const item of learningItems) {
    if (session.length >= 6) break
    addItem(item.digit)
  }

  // Position 4-5: Possible new item introduction
  if (session.length >= 3 && session.length <= 5) {
    if (shouldIntroduceNew(itemStats, learnerProfile)) {
      const newItem = selectNewItem(itemStats)
      if (newItem) {
        addItem(newItem.digit)
        learnerProfile.newItemsIntroducedThisSession += 1
      }
    }
  }

  // Positions 7-9: Mix based on due scores
  const allActive = [...masteredItems, ...learningItems, ...strugglingItems]
    .sort((a, b) => calculateDueScore(b) - calculateDueScore(a))

  for (const item of allActive) {
    if (session.length >= count - 1) break
    addItem(item.digit)
  }

  // Position 10: Easy win (mastered item) if available
  if (session.length < count) {
    const easyWin = masteredItems.find(item => !used.has(item.digit))
    if (easyWin) {
      addItem(easyWin.digit)
    } else {
      // Fall back to highest success rate item
      const highSuccess = allActive
        .filter(item => !used.has(item.digit))
        .sort((a, b) => getSuccessRate(b) - getSuccessRate(a))[0]
      if (highSuccess) {
        addItem(highSuccess.digit)
      }
    }
  }

  // If we still don't have enough items, add any available items
  // This handles cold start where we only have 2 initial items
  const allItems = Object.values(itemStats)
    .filter(item => item.status !== ItemStatus.NEW)
    .sort((a, b) => calculateDueScore(b) - calculateDueScore(a))

  // For cold start, repeat items to fill the session
  let iterations = 0
  while (session.length < count && iterations < count * 2) {
    for (const item of allItems) {
      if (session.length >= count) break
      // Allow repeats after we've used all unique items
      if (used.size === allItems.length || !used.has(item.digit)) {
        session.push(item.digit)
        used.add(item.digit)
      }
    }
    iterations++
    // Reset used set for next round of repeats
    if (session.length < count && used.size === allItems.length) {
      used.clear()
      for (const digit of session) {
        used.add(digit)
      }
    }
  }

  return session
}

/**
 * Get progress summary for UI display
 */
export function getProgressSummary(itemStats) {
  const stats = Object.values(itemStats)

  const mastered = stats.filter(i => i.status === ItemStatus.MASTERED).length
  const learning = stats.filter(i => i.status === ItemStatus.LEARNING).length
  const struggling = stats.filter(i => i.status === ItemStatus.STRUGGLING).length
  const newItems = stats.filter(i => i.status === ItemStatus.NEW).length

  const totalActive = mastered + learning + struggling
  const totalAttempts = stats.reduce((sum, i) => sum + i.timesShown, 0)
  const totalCorrect = stats.reduce((sum, i) => sum + i.timesCorrect, 0)
  const overallSuccessRate = totalAttempts > 0 ? totalCorrect / totalAttempts : 0

  return {
    mastered,
    learning,
    struggling,
    newItems,
    totalActive,
    total: ALL_DIGITS.length,
    overallSuccessRate: Math.round(overallSuccessRate * 100),
  }
}

/**
 * Get the status of a specific item
 */
export function getItemStatus(itemStats, digit) {
  return itemStats[digit]?.status || ItemStatus.NEW
}
