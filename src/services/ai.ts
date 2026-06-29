import type { WeightEntry, FoodEntry, WaterEntry, SleepEntry, ActivityEntry, AIReport, ChatMessage } from '../types';

// --- MOCK PRESETS FOR FOOD IMAGE LOGGING ---
export interface FoodPreset {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

export const FOOD_PRESETS: FoodPreset[] = [
  {
    id: 'p1',
    name: 'Avocado Toast with Poached Eggs',
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=60',
    description: '2 slices of sourdough bread, 1 whole avocado, 2 poached eggs, chili flakes, salt and pepper.',
    calories: 480,
    protein: 22,
    carbs: 38,
    fat: 26,
    fiber: 9,
    sugar: 3,
    sodium: 480
  },
  {
    id: 'p2',
    name: 'Grilled Chicken Caesar Salad',
    imageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=600&auto=format&fit=crop&q=60',
    description: '150g grilled chicken breast, romaine lettuce, parmesan cheese, cherry tomatoes, 1 tbsp Caesar dressing, croutons.',
    calories: 420,
    protein: 38,
    carbs: 12,
    fat: 24,
    fiber: 3,
    sugar: 2,
    sodium: 620
  },
  {
    id: 'p3',
    name: 'Paneer Tikka Bowl',
    imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=60',
    description: '120g grilled paneer, bell peppers, onions, spiced yogurt marinade, served over 100g cooked brown rice.',
    calories: 540,
    protein: 24,
    carbs: 42,
    fat: 28,
    fiber: 5,
    sugar: 4,
    sodium: 550
  },
  {
    id: 'p4',
    name: 'Oatmeal with Berries & Whey',
    imageUrl: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=600&auto=format&fit=crop&q=60',
    description: '50g rolled oats cooked in water, 1 scoop vanilla whey protein, 50g fresh blueberries, 10g chia seeds, dash of honey.',
    calories: 360,
    protein: 30,
    carbs: 45,
    fat: 7,
    fiber: 8,
    sugar: 12,
    sodium: 180
  },
  {
    id: 'p5',
    name: 'Salmon with Quinoa & Broccoli',
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&auto=format&fit=crop&q=60',
    description: '150g baked salmon fillet, 100g cooked quinoa, 100g steamed broccoli, 1 tsp olive oil, lemon juice.',
    calories: 510,
    protein: 36,
    carbs: 34,
    fat: 22,
    fiber: 6,
    sugar: 1.5,
    sodium: 290
  }
];

// --- LOCAL AI HEURISTIC ENGINE ---

// Simple helper to parse text and guess macros
export function parseFoodTextLocal(text: string): Partial<FoodEntry> {
  const t = text.toLowerCase();
  let calories = 250;
  let protein = 10;
  let carbs = 30;
  let fat = 8;
  let fiber = 2;

  // Simple heuristic keyword matching
  if (t.includes('egg') || t.includes('omelet')) {
    const count = (t.match(/egg/g) || []).length || 2;
    calories = count * 75 + 50;
    protein = count * 6 + 4;
    carbs = 2;
    fat = count * 5 + 5;
    fiber = 0;
  } else if (t.includes('chicken') || t.includes('breast')) {
    calories = 350;
    protein = 35;
    carbs = 5;
    fat = 12;
    fiber = 1;
  } else if (t.includes('paneer') || t.includes('cottage cheese')) {
    calories = 380;
    protein = 18;
    carbs = 8;
    fat = 22;
    fiber = 0;
  } else if (t.includes('chapati') || t.includes('roti') || t.includes('bread') || t.includes('nan')) {
    calories = 200;
    protein = 6;
    carbs = 40;
    fat = 3;
    fiber = 4;
  } else if (t.includes('rice')) {
    calories = 250;
    protein = 5;
    carbs = 50;
    fat = 1;
    fiber = 2;
  } else if (t.includes('salad') || t.includes('vegetable') || t.includes('veggie')) {
    calories = 150;
    protein = 4;
    carbs = 15;
    fat = 8;
    fiber = 5;
  } else if (t.includes('shake') || t.includes('protein') || t.includes('whey')) {
    calories = 220;
    protein = 28;
    carbs = 10;
    fat = 3;
    fiber = 1;
  } else if (t.includes('maggi') || t.includes('noodle') || t.includes('ramen')) {
    calories = 400;
    protein = 8;
    carbs = 60;
    fat = 14;
    fiber = 2;
  } else if (t.includes('apple') || t.includes('banana') || t.includes('orange') || t.includes('fruit')) {
    calories = 90;
    protein = 1;
    carbs = 22;
    fat = 0;
    fiber = 3;
  } else if (t.includes('milk') || t.includes('curd') || t.includes('yogurt')) {
    calories = 120;
    protein = 8;
    carbs = 12;
    fat = 4;
    fiber = 0;
  }

  return {
    description: text,
    calories,
    protein,
    carbs,
    fat,
    fiber,
    sugar: Math.round(carbs * 0.1),
    sodium: Math.round(calories * 0.9)
  };
}

// Generates local report based on actual user logs
export function generateLocalReport(
  type: 'daily' | 'weekly' | 'monthly',
  dateStr: string,
  data: {
    weights: WeightEntry[];
    foods: FoodEntry[];
    water: WaterEntry[];
    sleep: SleepEntry[];
    activities: ActivityEntry[];
    goals: { calories: number, protein: number, water: number, sleep: number, steps: number }
  }
): AIReport {
  const date = new Date(dateStr);
  
  // Filter data by timeframe
  let filteredWeights = [...data.weights];
  let filteredFoods = [...data.foods];
  let filteredWater = [...data.water];
  let filteredSleep = [...data.sleep];
  let filteredActivities = [...data.activities];

  const getDaysAgo = (d: Date, numDays: number) => {
    const result = new Date(d);
    result.setDate(result.getDate() - numDays);
    return result;
  };

  if (type === 'daily') {
    const targetDate = dateStr;
    filteredFoods = data.foods.filter(f => f.date === targetDate);
    filteredWater = data.water.filter(w => w.date === targetDate);
    filteredSleep = data.sleep.filter(s => s.date === targetDate);
    filteredActivities = data.activities.filter(a => a.date === targetDate);
  } else if (type === 'weekly') {
    const startOfWeek = getDaysAgo(date, 7);
    const filterFn = (item: { date: string }) => {
      const d = new Date(item.date);
      return d >= startOfWeek && d <= date;
    };
    filteredWeights = data.weights.filter(filterFn);
    filteredFoods = data.foods.filter(filterFn);
    filteredWater = data.water.filter(filterFn);
    filteredSleep = data.sleep.filter(filterFn);
    filteredActivities = data.activities.filter(filterFn);
  } else if (type === 'monthly') {
    const startOfMonth = getDaysAgo(date, 30);
    const filterFn = (item: { date: string }) => {
      const d = new Date(item.date);
      return d >= startOfMonth && d <= date;
    };
    filteredWeights = data.weights.filter(filterFn);
    filteredFoods = data.foods.filter(filterFn);
    filteredWater = data.water.filter(filterFn);
    filteredSleep = data.sleep.filter(filterFn);
    filteredActivities = data.activities.filter(filterFn);
  }

  // --- STATS CALCULATIONS ---
  // Calories
  const totalCalories = filteredFoods.reduce((sum, f) => sum + f.calories, 0);
  const avgCalories = type === 'daily' ? totalCalories : Math.round(totalCalories / (type === 'weekly' ? 7 : 30)) || 0;

  // Protein
  const totalProtein = filteredFoods.reduce((sum, f) => sum + f.protein, 0);
  const avgProtein = type === 'daily' ? totalProtein : Math.round(totalProtein / (type === 'weekly' ? 7 : 30)) || 0;

  // Water
  const totalWater = filteredWater.reduce((sum, w) => sum + w.amount, 0);
  const avgWater = type === 'daily' ? totalWater : Math.round(totalWater / (type === 'weekly' ? 7 : 30)) || 0;

  // Sleep
  const totalSleep = filteredSleep.reduce((sum, s) => sum + s.duration, 0);
  const avgSleep = filteredSleep.length ? Math.round((totalSleep / filteredSleep.length) * 10) / 10 : 0;

  // Steps & Exercise
  const totalSteps = filteredActivities.reduce((sum, a) => sum + (a.steps || 0), 0);
  const avgSteps = type === 'daily' ? totalSteps : Math.round(totalSteps / (type === 'weekly' ? 7 : 30)) || 0;

  // Weight Change
  let weightChange = 0;
  if (filteredWeights.length >= 2) {
    const sorted = [...filteredWeights].sort((a, b) => a.date.localeCompare(b.date));
    weightChange = Math.round((sorted[sorted.length - 1].weight - sorted[0].weight) * 10) / 10;
  } else if (data.weights.length > 0) {
    // Fallback to absolute change from starting weight
    const sorted = [...data.weights].sort((a, b) => a.date.localeCompare(b.date));
    weightChange = Math.round((sorted[sorted.length - 1].weight - 100) * 10) / 10;
  }

  // --- HEALTH SCORE & HEURISTICS ---
  let score = 80; // Baseline
  const positives: string[] = [];
  const mistakes: string[] = [];
  const recommendations: string[] = [];
  const habitsDetected: string[] = [];

  // Calorie Assessment
  if (avgCalories > 0) {
    const calDiff = avgCalories - data.goals.calories;
    if (calDiff <= 0 && calDiff >= -500) {
      positives.push(type === 'daily' ? "Maintained a perfect calorie deficit for weight loss." : "Consistent calorie deficit maintained throughout the period.");
      score += 5;
    } else if (calDiff < -500) {
      positives.push("Calorie intake was very low, creating a steep deficit.");
      recommendations.push("Ensure you eat enough to sustain energy levels; overly aggressive deficits can slow metabolism.");
    } else {
      mistakes.push(`Calorie intake (${avgCalories} kcal) exceeded your target goal of ${data.goals.calories} kcal.`);
      recommendations.push("Plan your meals in advance to stay within your calorie budget.");
      score -= 8;
    }
  } else {
    mistakes.push("No meals logged. Consistency is key!");
    score -= 10;
  }

  // Protein Assessment
  if (avgProtein > 0) {
    if (avgProtein >= data.goals.protein) {
      positives.push(`Met your daily protein target of ${data.goals.protein}g (Achieved: ${avgProtein}g). Excellent for retaining muscle!`);
      score += 5;
    } else {
      const deficit = data.goals.protein - avgProtein;
      mistakes.push(`Protein intake (${avgProtein}g) was ${deficit}g short of your ${data.goals.protein}g goal.`);
      recommendations.push("Incorporate high-protein sources like egg whites, chicken breast, paneer, tofu, or whey protein.");
      score -= Math.min(10, Math.round(deficit / 5));
    }
  }

  // Water Assessment
  if (avgWater > 0) {
    if (avgWater >= data.goals.water) {
      positives.push("Well hydrated! Reached your water intake goal.");
      score += 4;
    } else {
      mistakes.push(`Water intake (${(avgWater / 1000).toFixed(1)}L) was below your ${(data.goals.water / 1000).toFixed(1)}L goal.`);
      recommendations.push("Keep a 1-liter bottle at your desk and aim to finish 3 of them daily.");
      score -= 4;
    }
  }

  // Sleep Assessment
  if (avgSleep > 0) {
    if (avgSleep >= data.goals.sleep) {
      positives.push(`Sleep duration was excellent, averaging ${avgSleep} hours.`);
      score += 3;
    } else {
      mistakes.push(`Sleep averaged ${avgSleep} hours, which is below your target of ${data.goals.sleep} hours.`);
      recommendations.push("Establish a winding-down routine and avoid screens 30 minutes before bed.");
      score -= 3;
    }
  }

  // Steps Assessment
  if (avgSteps > 0) {
    if (avgSteps >= data.goals.steps) {
      positives.push(`Active day! Averaged ${avgSteps.toLocaleString()} steps.`);
      score += 3;
    } else {
      mistakes.push(`Daily steps (${avgSteps.toLocaleString()}) fell short of your ${data.goals.steps.toLocaleString()} target.`);
      recommendations.push("Take a 15-minute walk after lunch and dinner to easily accumulate steps.");
      score -= 3;
    }
  }

  // --- HABIT DETECTION (For Weekly and Monthly Reports) ---
  if (type !== 'daily' && data.foods.length > 3) {
    // 1. Weekend Overeating
    const weekendMeals = data.foods.filter(f => {
      const d = new Date(f.date).getDay();
      return d === 0 || d === 6; // Sunday or Saturday
    });
    const weekdayMeals = data.foods.filter(f => {
      const d = new Date(f.date).getDay();
      return d !== 0 && d !== 6;
    });

    if (weekendMeals.length > 0 && weekdayMeals.length > 0) {
      const avgWeekendCal = weekendMeals.reduce((sum, f) => sum + f.calories, 0) / (weekendMeals.length / 3 || 1);
      const avgWeekdayCal = weekdayMeals.reduce((sum, f) => sum + f.calories, 0) / (weekdayMeals.length / 4 || 1);
      if (avgWeekendCal > avgWeekdayCal * 1.25) {
        habitsDetected.push("Weekend Calorie Spike: Your calorie intake is significantly higher on Saturdays and Sundays compared to weekdays.");
        recommendations.push("Try incorporating a moderate 'treat meal' rather than an entire cheat day on weekends.");
      }
    }

    // 2. Skipping Breakfast
    const breakfastLogs = data.foods.filter(f => f.mealType === 'breakfast');
    const totalDaysLogged = new Set(data.foods.map(f => f.date)).size;
    if (breakfastLogs.length < totalDaysLogged * 0.5) {
      habitsDetected.push("Breakfast Skipping: You skip breakfast on more than 50% of the logged days.");
      recommendations.push("If skipping breakfast helps you maintain a calorie deficit (intermittent fasting), ensure your lunch is highly nutritious and rich in protein.");
    }

    // 3. Lack of Vegetables
    const veggieKeywords = ['salad', 'broccoli', 'spinach', 'vegetable', 'veggie', 'cucumber', 'tomato', 'cabbage', 'cauliflower', 'gourd'];
    const hasVeggies = data.foods.some(f => veggieKeywords.some(keyword => f.description.toLowerCase().includes(keyword)));
    if (!hasVeggies) {
      habitsDetected.push("Low Micronutrient Intake: Your logs show very little to no vegetable intake.");
      recommendations.push("Add a portion of steamed vegetables or a green salad to your lunch and dinner.");
    }

    // 4. Sugary Drinks / Liquid Calories
    const liquidCalKeywords = ['coke', 'pepsi', 'soda', 'juice', 'shake', 'cold drink', 'beer', 'sprite', 'fanta', 'sweet tea', 'coffee with sugar'];
    const liquidCalLogs = data.foods.filter(f => liquidCalKeywords.some(keyword => f.description.toLowerCase().includes(keyword)));
    if (liquidCalLogs.length >= 3) {
      habitsDetected.push("Liquid Calories: Frequent logging of sugary drinks or high-calorie beverages.");
      recommendations.push("Replace soda and juices with water, sparkling water, or unsweetened green tea.");
    }

    // 5. Workday Dehydration
    const weekdayWater = data.water.filter(w => {
      const d = new Date(w.date).getDay();
      return d >= 1 && d <= 5;
    });
    const weekendWater = data.water.filter(w => {
      const d = new Date(w.date).getDay();
      return d === 0 || d === 6;
    });
    if (weekdayWater.length > 0 && weekendWater.length > 0) {
      const avgWeekdayWater = weekdayWater.reduce((sum, w) => sum + w.amount, 0) / 5;
      const avgWeekendWater = weekendWater.reduce((sum, w) => sum + w.amount, 0) / 2;
      if (avgWeekdayWater < avgWeekendWater * 0.75) {
        habitsDetected.push("Workday Dehydration: Your water intake drops by more than 25% on weekdays.");
        recommendations.push("Set a repeating alarm on your phone or work computer to drink water every 2 hours during work.");
      }
    }
  }

  // Clamp score
  score = Math.max(10, Math.min(100, score));

  // Build Markdown summary
  let title = '';
  let summary = '';
  if (type === 'daily') {
    title = `Daily Health Report - ${dateStr}`;
    summary = `Today's Health Score is **${score}/100**. ${
      score >= 85 ? "Fantastic job! You've crushed most of your goals today and maintained great consistency." :
      score >= 70 ? "Good effort today. You made solid choices, but there is room for improvement in some areas." :
      "A challenging day. Tomorrow is a fresh opportunity to get back on track with your nutrition and activity."
    }`;
  } else if (type === 'weekly') {
    title = `Weekly Performance Audit (Ending ${dateStr})`;
    summary = `This week, your average Health Score was **${score}/100**. You lost **${Math.abs(weightChange)}kg** this week. ${
      weightChange < 0 ? "You are on a steady downward trajectory toward your 80kg goal! Keep up the calorie deficit." :
      weightChange > 0 ? "Your weight fluctuated upwards slightly. Focus on tracking weekend liquid calories and sodium." :
      "Your weight remained stable. Look closely at hidden calories in oils or dressings to break the plateau."
    }`;
  } else {
    title = `Monthly Health Analysis - ${date.toLocaleString('default', { month: 'long', year: 'numeric' })}`;
    summary = `Over the past 30 days, your consistency score was **${score}%**. You have achieved a net weight change of **${weightChange}kg** (Current Weight: ${data.weights[0]?.weight || 100}kg). ${
      weightChange <= -2 ? "Outstanding monthly progress. You are losing weight at a healthy, sustainable rate." :
      "Your progress is starting to shape up. Let's tighten up your daily protein and step goals for next month."
    }`;
  }

  return {
    id: `${type}_${dateStr}`,
    type,
    date: dateStr,
    title,
    score,
    summary,
    positives: positives.slice(0, 4),
    mistakes: mistakes.slice(0, 4),
    recommendations: recommendations.slice(0, 4),
    habitsDetected: habitsDetected.length ? habitsDetected : undefined,
    statsSummary: {
      weightChange,
      avgCalories,
      avgProtein,
      avgWater,
      avgSleep,
      avgSteps,
      consistencyScore: score
    }
  };
}

// Local chatbot response logic
export function generateLocalChatResponse(message: string, _history: ChatMessage[], logs: any): string {
  const m = message.toLowerCase();
  
  // 1. Check for protein
  if (m.includes('protein')) {
    const today = new Date().toISOString().split('T')[0];
    const todayFoods = logs.foods.filter((f: any) => f.date === today);
    const totalProtein = todayFoods.reduce((sum: number, f: any) => sum + f.protein, 0);
    const goal = logs.profile?.dailyGoals?.protein || 140;
    
    return `You have consumed **${totalProtein}g** of protein today out of your **${goal}g** target. 
    
${totalProtein >= goal ? "🎉 You've hit your protein goal! Great job!" : `You still need **${goal - totalProtein}g** to reach your target. You can get this from:
- A scoop of whey protein (~25g)
- 150g grilled chicken breast (~35g)
- 150g paneer or tofu (~22g)
- 4 large egg whites (~16g)`}`;
  }

  // 2. Check for maggi
  if (m.includes('maggi') || m.includes('noodles')) {
    return `Can you eat Maggi? **Yes, but with caveats.**

A single pack of Maggi contains roughly:
- **Calories**: ~380-400 kcal
- **Protein**: ~8g (very low)
- **Carbs**: ~60g (high, simple carbs)
- **Fat**: ~13-15g (mostly saturated fats)
- **Sodium**: ~1000mg+ (nearly 50% of your daily limit, causing water retention!)

**Recommendation for Weight Loss:**
If you really crave it, fit it into your 2,000 calorie budget, but **upgrade it**:
1. Add **100g of paneer** or **2 boiled eggs** to boost the protein.
2. Toss in **veggies** (peas, carrots, capsicum) to add fiber.
3. Use only **half the tastemaker packet** to reduce sodium bloat.`;
  }

  // 3. Suggest dinner
  if (m.includes('suggest') && (m.includes('dinner') || m.includes('lunch') || m.includes('meal'))) {
    return `Here are three delicious weight-loss friendly options under **500 calories** with high protein:

1. **Grilled Paneer/Chicken Stir-fry (Approx. 420 kcal | 30g Protein)**
   - 120g Paneer or Chicken breast sautéed in 1 tsp olive oil.
   - 1.5 cups of mixed bell peppers, broccoli, and onions.
   - Season with garlic, soy sauce, and black pepper.

2. **High-Protein Egg Scramble (Approx. 380 kcal | 28g Protein)**
   - 2 whole eggs + 3 egg whites scrambled with spinach, tomatoes, and mushrooms.
   - 1 slice of toasted whole wheat sourdough bread.

3. **Soya Chunk & Quinoa Pulao (Approx. 460 kcal | 25g Protein)**
   - 50g soya chunks (boiled) cooked with 50g quinoa.
   - Spiced with cumin, turmeric, and garam masala, mixed with carrots and peas.
   - Serve with 100g of low-fat curd (yogurt).`;
  }

  // 4. Weight plateau / why weight not decreasing
  if (m.includes('weight') && (m.includes('not decreasing') || m.includes('plateau') || m.includes('stuck') || m.includes('why'))) {
    const weights = [...logs.weights].sort((a: any, b: any) => a.date.localeCompare(b.date));
    const startW = weights[0]?.weight || 100;
    const currentW = weights[weights.length - 1]?.weight || 100;
    const totalLost = startW - currentW;

    return `Weight loss plateaus are completely normal! You have already lost **${totalLost.toFixed(1)}kg** (from ${startW}kg to ${currentW}kg). 

Here are the top reasons your weight might have stalled this week:
1. **Water Retention (Sodium & Carbs)**: If you ate a high-sodium meal (like Maggi or restaurant food) recently, your body holds onto water. This is temporary fat loss is still happening!
2. **Hidden Calories**: Are you tracking cooking oils, butter, salad dressings, and liquid calories (juice, sweet tea)? These can easily add 300-500 uncounted calories.
3. **NEAT is Down**: As you lose weight, your body subconsciously moves less to conserve energy. Keep your daily steps above **10,000** to combat this.
4. **Metabolic Adaptation**: Since you weigh less now than when you started, your body requires slightly fewer calories. We may need to adjust your budget down to 1,900 kcal or increase your activity.

**Action Plan:** Focus on hitting your **protein** and **step** goals consistently for the next 5 days, and the scale will budge!`;
  }

  // 5. What should I eat tomorrow
  if (m.includes('tomorrow') && (m.includes('eat') || m.includes('plan') || m.includes('suggest'))) {
    return `Here is a structured **2,000 Calorie / 140g Protein** meal plan for tomorrow:

* **🍳 Breakfast (8:30 AM) - 450 kcal | 30g Protein**
  - Oatmeal: 45g oats, 1 scoop whey protein, 50g blueberries, 10g almonds.
  
* **🥗 Lunch (1:30 PM) - 600 kcal | 42g Protein**
  - Grilled Chicken Breast (150g) OR Grilled Paneer (120g).
  - 1 cup cooked brown rice or 2 small chapatis.
  - 1 bowl of cucumber-tomato salad + 100g curd.

* **🍎 Evening Snack (5:30 PM) - 250 kcal | 15g Protein**
  - 1 medium apple + 15g peanut butter OR 2 boiled eggs.

* **🍲 Dinner (8:30 PM) - 500 kcal | 35g Protein**
  - Sautéed Tofu or Fish (150g) with stir-fried broccoli, carrots, and mushrooms.
  - 1 cup cooked quinoa or 1 chapati.

* **💧 Hydration**: Drink at least 3.5 liters of water spaced throughout the day!`;
  }

  // Default fallback response
  return `Hello! As your AI Health Coach, I'm tracking your progress toward your **80kg** target weight.

I can help you with:
- Analyzing your **daily protein** or **calorie intake**
- Giving advice on specific foods (like Maggi, alcohol, or cheat meals)
- Creating custom **high-protein meal plans**
- Explaining weight fluctuations and plateaus

What is on your mind today?`;
}


// --- REAL LLM API SERVICE ---

export const aiService = {
  // 1. Analyze Food Text or Image
  async analyzeFood(
    input: { text?: string; imageUrl?: string },
    settings: { aiMode: 'local' | 'api'; openaiApiKey?: string; geminiApiKey?: string }
  ): Promise<Partial<FoodEntry>> {
    if (settings.aiMode === 'local' || (!settings.openaiApiKey && !settings.geminiApiKey)) {
      if (input.imageUrl) {
        // If image is uploaded in local mode, we match it to one of our presets or return a random health estimate
        const preset = FOOD_PRESETS.find(p => input.imageUrl?.includes(p.imageUrl)) || FOOD_PRESETS[0];
        return {
          description: preset.name,
          imageUrl: input.imageUrl,
          calories: preset.calories,
          protein: preset.protein,
          carbs: preset.carbs,
          fat: preset.fat,
          fiber: preset.fiber,
          sugar: preset.sugar,
          sodium: preset.sodium
        };
      }
      return parseFoodTextLocal(input.text || '');
    }

    // Call Real LLM API
    const systemPrompt = `You are an expert nutritionist. Analyze the food described or shown.
Provide your response ONLY as a JSON object matching this TypeScript structure:
{
  "description": "Short name of the meal",
  "calories": 450,
  "protein": 25,
  "carbs": 40,
  "fat": 15,
  "fiber": 5,
  "sugar": 4,
  "sodium": 350
}
Ensure all values are numbers. Do not include any markdown formatting besides the JSON.`;

    const userPrompt = input.text 
      ? `Analyze this food intake: "${input.text}"` 
      : `Analyze the food in this image.`;

    try {
      if (settings.geminiApiKey) {
        // Call Gemini 2.5 Flash
        let contents: any[] = [];
        if (input.imageUrl) {
          // Remove the data URL prefix to get raw base64
          const base64Data = input.imageUrl.split(',')[1];
          const mimeType = input.imageUrl.split(';')[0].split(':')[1];
          contents = [{
            parts: [
              { text: `${systemPrompt}\n\n${userPrompt}` },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Data
                }
              }
            ]
          }];
        } else {
          contents = [{
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
          }];
        }

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${settings.geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents })
          }
        );

        if (!response.ok) throw new Error(`Gemini API error: ${response.statusText}`);
        const result = await response.json();
        const responseText = result.candidates[0].content.parts[0].text;
        // Clean JSON formatting if LLM wrapped it in markdown code blocks
        const cleanedText = responseText.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanedText);
      } else if (settings.openaiApiKey) {
        // Call OpenAI GPT-4o-mini
        const messages: any[] = [
          { role: 'system', content: systemPrompt }
        ];

        if (input.imageUrl) {
          messages.push({
            role: 'user',
            content: [
              { type: 'text', text: userPrompt },
              { type: 'image_url', image_url: { url: input.imageUrl } }
            ]
          });
        } else {
          messages.push({ role: 'user', content: userPrompt });
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.openaiApiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages,
            response_format: { type: 'json_object' }
          })
        });

        if (!response.ok) throw new Error(`OpenAI API error: ${response.statusText}`);
        const result = await response.json();
        const responseText = result.choices[0].message.content;
        return JSON.parse(responseText.trim());
      }
    } catch (err) {
      console.error("Real AI food analysis failed, falling back to local:", err);
    }

    return parseFoodTextLocal(input.text || 'Unknown Food');
  },

  // 2. Generate Daily/Weekly/Monthly AI Reports
  async generateReport(
    type: 'daily' | 'weekly' | 'monthly',
    dateStr: string,
    data: {
      weights: WeightEntry[];
      foods: FoodEntry[];
      water: WaterEntry[];
      sleep: SleepEntry[];
      activities: ActivityEntry[];
      goals: { calories: number, protein: number, water: number, sleep: number, steps: number }
    },
    settings: { aiMode: 'local' | 'api'; openaiApiKey?: string; geminiApiKey?: string }
  ): Promise<AIReport> {
    // Return local report if in local mode or keys are missing
    if (settings.aiMode === 'local' || (!settings.openaiApiKey && !settings.geminiApiKey)) {
      return generateLocalReport(type, dateStr, data);
    }

    const systemPrompt = `You are an elite health coach and data analyst. You are analyzing a user's health logs to help them lose weight from 100kg to 80kg.
Analyze their data (Weight, Food, Water, Sleep, Activity) and goals.
Provide your response ONLY as a JSON object matching this structure:
{
  "id": "unique_report_id",
  "type": "${type}",
  "date": "${dateStr}",
  "title": "Report Title",
  "score": 85,
  "summary": "Detailed overall summary of performance and progress",
  "positives": ["Positive habit 1", "Positive habit 2"],
  "mistakes": ["Mistake or area of concern 1", "Mistake 2"],
  "recommendations": ["Actionable recommendation 1", "Recommendation 2"],
  "habitsDetected": ["Pattern detected 1", "Pattern 2"],
  "statsSummary": {
    "weightChange": -0.8,
    "avgCalories": 1950,
    "avgProtein": 135,
    "avgWater": 2800,
    "avgSleep": 7.2,
    "avgSteps": 9500,
    "consistencyScore": 85
  }
}
Keep recommendations highly actionable, practical, and tailored to weight loss.`;

    const userPrompt = `Here are my logs and goals for the period ending on ${dateStr}.
Goals: ${JSON.stringify(data.goals)}
Weights: ${JSON.stringify(data.weights.slice(0, 30))}
Food Logs: ${JSON.stringify(data.foods.slice(0, 50))}
Water Logs: ${JSON.stringify(data.water.slice(0, 50))}
Sleep Logs: ${JSON.stringify(data.sleep.slice(0, 30))}
Activity Logs: ${JSON.stringify(data.activities.slice(0, 30))}`;

    try {
      let responseText = '';
      if (settings.geminiApiKey) {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${settings.geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
              }]
            })
          }
        );
        if (!response.ok) throw new Error(`Gemini API error: ${response.statusText}`);
        const result = await response.json();
        responseText = result.candidates[0].content.parts[0].text;
      } else if (settings.openaiApiKey) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.openaiApiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            response_format: { type: 'json_object' }
          })
        });
        if (!response.ok) throw new Error(`OpenAI API error: ${response.statusText}`);
        const result = await response.json();
        responseText = result.choices[0].message.content;
      }

      const cleanedText = responseText.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (err) {
      console.error("Real AI report generation failed, falling back to local:", err);
      return generateLocalReport(type, dateStr, data);
    }
  },

  // 3. AI Chat Coach Response
  async getChatCoachResponse(
    message: string,
    history: ChatMessage[],
    logs: {
      profile: any;
      weights: WeightEntry[];
      foods: FoodEntry[];
      water: WaterEntry[];
      sleep: SleepEntry[];
      activities: ActivityEntry[];
    },
    settings: { aiMode: 'local' | 'api'; openaiApiKey?: string; geminiApiKey?: string }
  ): Promise<string> {
    if (settings.aiMode === 'local' || (!settings.openaiApiKey && !settings.geminiApiKey)) {
      return generateLocalChatResponse(message, history, logs);
    }

    const systemPrompt = `You are a supportive, knowledgeable, and empathetic AI Health Coach. Your goal is to help the user lose weight from 100kg to 80kg.
You have access to their profile and their logged history. Use this data to answer their questions accurately.
If they ask about their intake today or this week, refer directly to the logs provided.
Keep your responses relatively concise, formatted in clean Markdown, and highly encouraging. Use emojis occasionally.

User Profile: ${JSON.stringify(logs.profile)}
Recent Weights (kg): ${JSON.stringify(logs.weights.slice(0, 10))}
Recent Foods (last 3 days): ${JSON.stringify(logs.foods.slice(0, 15))}
Recent Water (last 3 days): ${JSON.stringify(logs.water.slice(0, 15))}
Recent Sleep (last 3 days): ${JSON.stringify(logs.sleep.slice(0, 5))}
Recent Activities (last 3 days): ${JSON.stringify(logs.activities.slice(0, 10))}`;

    const formattedMessages = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));
    
    formattedMessages.push({ role: 'user', content: message });

    try {
      if (settings.geminiApiKey) {
        // Convert chat history to Gemini format
        const contents = [
          { role: 'user', parts: [{ text: systemPrompt }] },
          ...history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
          })),
          { role: 'user', parts: [{ text: message }] }
        ];

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${settings.geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents })
          }
        );
        if (!response.ok) throw new Error(`Gemini API error: ${response.statusText}`);
        const result = await response.json();
        return result.candidates[0].content.parts[0].text;
      } else if (settings.openaiApiKey) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.openaiApiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              ...formattedMessages
            ]
          })
        });
        if (!response.ok) throw new Error(`OpenAI API error: ${response.statusText}`);
        const result = await response.json();
        return result.choices[0].message.content;
      }
    } catch (err) {
      console.error("Real AI chat failed, falling back to local:", err);
    }

    return generateLocalChatResponse(message, history, logs);
  }
};
