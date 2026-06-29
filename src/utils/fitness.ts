export function calculateDailyGoals(
  weight: number,
  height: number,
  age: number,
  _targetWeight: number
) {
  // BMR (Mifflin-St Jeor for Men)
  const bmr = 10 * weight + 6.25 * height - 5 * age + 5;

  // TDEE (assuming light/moderate activity: 1.375 multiplier)
  const tdee = bmr * 1.375;

  // Calorie Goal: 500 kcal deficit for weight loss, clamped [1500, 2800]
  let calories = Math.round(tdee - 500);
  calories = Math.max(1500, Math.min(2800, calories));

  // Protein Goal: 1.8g per kg of current weight, clamped [100, 180]
  let protein = Math.round(weight * 1.8);
  protein = Math.max(100, Math.min(180, protein));

  // Water Goal: 35ml per kg of current weight, clamped [2500, 4000]
  let water = Math.round(weight * 35);
  water = Math.round(water / 100) * 100; // Round to nearest 100ml
  water = Math.max(2500, Math.min(4000, water));

  return {
    calories,
    protein,
    water,
    sleep: 8, // Standard
    steps: 10000 // Standard
  };
}
