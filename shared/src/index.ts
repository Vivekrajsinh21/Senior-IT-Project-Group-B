export * from "./schemas/api/AiServiceSettings.api.zod.ts";
export * from "./schemas/api/CustomCategories.api.zod.ts";
export * from "./schemas/api/CustomMeasurements.api.zod.ts";
export * from "./schemas/api/CheckInMeasurements.api.zod.ts";
export * from "./schemas/api/DailyGoals.api.zod.ts";
export * from "./schemas/api/DailySummary.api.zod.ts";
export * from "./schemas/api/ExerciseEntries.api.zod.ts";
export * from "./schemas/api/Exercises.api.zod.ts";
export * from "./schemas/api/FoodEntries.api.zod.ts";
export * from "./schemas/api/Pagination.api.zod.ts";
export * from "./schemas/api/SleepScience.api.zod.ts";
export * from "./schemas/database/Account.zod.ts";
export * from "./schemas/database/AdminActivityLogs.zod.ts";
export * from "./schemas/database/AiServiceSettings.zod.ts";
export * from "./schemas/database/ApiKey.zod.ts";
export * from "./schemas/database/BackupSettings.zod.ts";
export * from "./schemas/database/CheckInMeasurements.zod.ts";
export * from "./schemas/database/CustomCategories.zod.ts";
export * from "./schemas/database/CustomMeasurements.zod.ts";
export * from "./schemas/database/DailySleepNeed.zod.ts";
export * from "./schemas/database/DayClassificationCache.zod.ts";
export * from "./schemas/database/ExerciseEntries.zod.ts";
export * from "./schemas/database/ExerciseEntryActivityDetails.zod.ts";
export * from "./schemas/database/ExerciseEntrySets.zod.ts";
export * from "./schemas/database/ExercisePresetEntries.zod.ts";
export * from "./schemas/database/Exercises.zod.ts";
export * from "./schemas/database/ExternalDataProviders.zod.ts";
export * from "./schemas/database/ExternalProviderTypes.zod.ts";
export * from "./schemas/database/FamilyAccess.zod.ts";
export * from "./schemas/database/FastingLogs.zod.ts";
export * from "./schemas/database/FoodEntries.zod.ts";
export * from "./schemas/database/FoodEntryMeals.zod.ts";
export * from "./schemas/database/Foods.zod.ts";
export * from "./schemas/database/FoodVariants.zod.ts";
export * from "./schemas/database/GlobalSettings.zod.ts";
export * from "./schemas/database/GoalPresets.zod.ts";
export * from "./schemas/database/MealFoods.zod.ts";
export * from "./schemas/database/MealPlans.zod.ts";
export * from "./schemas/database/MealPlanTemplateAssignments.zod.ts";
export * from "./schemas/database/MealPlanTemplates.zod.ts";
export * from "./schemas/database/Meals.zod.ts";
export * from "./schemas/database/MealTypes.zod.ts";
export * from "./schemas/database/MoodEntries.zod.ts";
export * from "./schemas/database/OidcProviders.zod.ts";
export * from "./schemas/database/OnboardingData.zod.ts";
export * from "./schemas/database/OnboardingStatus.zod.ts";
export * from "./schemas/database/Passkey.zod.ts";
export * from "./schemas/database/Profiles.zod.ts";
export * from "./schemas/database/Session.zod.ts";
export * from "./schemas/database/SleepEntries.zod.ts";
export * from "./schemas/database/SleepEntryStages.zod.ts";
export * from "./schemas/database/SleepNeedCalculations.zod.ts";
export * from "./schemas/database/SparkyChatHistory.zod.ts";
export * from "./schemas/database/SsoProvider.zod.ts";
export * from "./schemas/database/TwoFactor.zod.ts";
export * from "./schemas/database/UserCustomNutrients.zod.ts";
export * from "./schemas/database/UserGoals.zod.ts";
export * from "./schemas/database/UserIgnoredUpdates.zod.ts";
export * from "./schemas/database/UserMealVisibilities.zod.ts";
export * from "./schemas/database/UserNutrientDisplayPreferences.zod.ts";
export * from "./schemas/database/UserOidcLinks.zod.ts";
export * from "./schemas/database/UserPreferences.zod.ts";
export * from "./schemas/database/Users.zod.ts";
export * from "./schemas/database/UserWaterContainers.zod.ts";
export * from "./schemas/database/User.zod.ts";
export * from "./schemas/database/Verification.zod.ts";
export * from "./schemas/database/VMctqAnalysis.zod.ts";
export * from "./schemas/database/VMctqStats.zod.ts";
export * from "./schemas/database/WaterIntake.zod.ts";
export * from "./schemas/database/WeeklyGoalPlans.zod.ts";
export * from "./schemas/database/WorkoutPlanAssignmentSets.zod.ts";
export * from "./schemas/database/WorkoutPlanTemplateAssignments.zod.ts";
export * from "./schemas/database/WorkoutPlanTemplates.zod.ts";
export * from "./schemas/database/WorkoutPresetExerciseSets.zod.ts";
export * from "./schemas/database/WorkoutPresetExercises.zod.ts";
export * from "./schemas/database/WorkoutPresets.zod.ts";
export * from "./constants/measurements.ts";
export * from "./constants/calorieConstants.ts";
export * from "./utils/timezone.ts";
export * from "./utils/calorieCalculations.ts";
export function calculateAge(dateOfBirth?: string | Date | null, timezone?: string): number | null {
  if (!dateOfBirth) return null;
  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return null;

  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

export const CONFIDENCE_TONES = {
  low: 'low',
  medium: 'medium',
  high: 'high',
} as const;

export const OVERALL_CONFIDENCE_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
} as const;

export function shouldOfferAiConversion(fromUnit?: string | null, toUnit?: string | null): boolean {
  if (!fromUnit || !toUnit) return false;
  return fromUnit.trim().toLowerCase() !== toUnit.trim().toLowerCase();
}

export function getConversionFactor(fromUnit?: string | null, toUnit?: string | null): number | null {
  if (!fromUnit || !toUnit) return null;

  const from = fromUnit.trim().toLowerCase();
  const to = toUnit.trim().toLowerCase();

  if (from === to) return 1;

  const conversions: Record<string, number> = {
    'g:kg': 0.001,
    'kg:g': 1000,
    'g:oz': 0.03527396,
    'oz:g': 28.3495,
    'ml:l': 0.001,
    'l:ml': 1000,
    'tbsp:tsp': 3,
    'tsp:tbsp': 1 / 3,
    'tbsp:ml': 14.7868,
    'ml:tbsp': 1 / 14.7868,
    'tsp:ml': 4.92892,
    'ml:tsp': 1 / 4.92892,
  };

  return conversions[`${from}:${to}`] ?? null;
}
