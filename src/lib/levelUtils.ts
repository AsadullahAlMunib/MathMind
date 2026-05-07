/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Level calculation logic:
 * Level 1 to 2: 500 points (Incremental: 500)
 * Subsequent levels increase the requirement by 20% (1.2x)
 */

export const calculateLevelInfo = (totalPoints: number) => {
  let level = 1;
  let pointsForNext = 500;
  let currentLevelBase = 0;
  let nextLevelBase = 500;

  // Geometric progression for level requirements
  while (totalPoints >= nextLevelBase) {
    currentLevelBase = nextLevelBase;
    level++;
    // Requirement for current level to next level
    pointsForNext = Math.round(pointsForNext * 1.2);
    nextLevelBase += pointsForNext;
  }

  const pointsInCurrentLevel = totalPoints - currentLevelBase;
  const pointsNeededThisLevel = nextLevelBase - currentLevelBase;
  const progress = (pointsInCurrentLevel / pointsNeededThisLevel) * 100;
  const pointsToNextLevel = nextLevelBase - totalPoints;

  return {
    level,
    progress,
    pointsToNextLevel,
    currentLevelBase,
    nextLevelBase,
    pointsInCurrentLevel,
    pointsNeededThisLevel
  };
};

/**
 * Gets the total points required to reach a specific level starting from 1
 */
export const getPointsForLevel = (targetLevel: number) => {
  if (targetLevel <= 1) return 0;
  let total = 0;
  let increment = 500;
  for (let i = 1; i < targetLevel; i++) {
    total += increment;
    increment = Math.round(increment * 1.2);
  }
  return total;
};
