import type { UserProfile, WeightEntry, FoodEntry, WaterEntry, SleepEntry, ActivityEntry, HealthRecord, AIReport, ChatMessage } from '../types';

export function getMockData() {
  const profile: UserProfile = {
    name: 'Shagun',
    age: 28,
    height: 180, // cm
    startWeight: 100, // kg
    targetWeight: 80, // kg
    dailyGoals: {
      calories: 2000,
      protein: 140,
      water: 3000,
      sleep: 8,
      steps: 10000
    }
  };

  const weights: WeightEntry[] = [];
  const foods: FoodEntry[] = [];
  const water: WaterEntry[] = [];
  const sleep: SleepEntry[] = [];
  const activities: ActivityEntry[] = [];
  const records: HealthRecord[] = [];
  const reports: AIReport[] = [];
  const messages: ChatMessage[] = [];

  const today = new Date();

  // Helper to format date
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  // Generate 14 days of data
  for (let i = 14; i >= 0; i--) {
    const currentDate = new Date();
    currentDate.setDate(today.getDate() - i);
    const dateStr = formatDate(currentDate);
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday, 1 = Monday

    // 1. Weight: steady decline from 100.5 to 98.2
    // Some minor fluctuations
    const baseWeight = 100.5 - (14 - i) * 0.16;
    const fluctuation = Math.sin(i) * 0.3;
    weights.push({
      id: `w_mock_${i}`,
      date: dateStr,
      weight: Math.round((baseWeight + fluctuation) * 10) / 10,
      waist: Math.round((98 - (14 - i) * 0.1) * 10) / 10,
      notes: i === 14 ? 'Starting my weight loss journey!' : i === 7 ? 'Feeling lighter today.' : undefined
    });

    // 2. Food Logs
    // Monday (dayOfWeek = 1): Skip breakfast
    if (dayOfWeek !== 1) {
      foods.push({
        id: `f_mock_${i}_1`,
        date: dateStr,
        mealType: 'breakfast',
        description: 'Oatmeal with whey protein and banana',
        calories: 420,
        protein: 32,
        carbs: 55,
        fat: 8,
        fiber: 7
      });
    }

    // Saturday (dayOfWeek = 6): Cheat day! High calories, low protein
    if (dayOfWeek === 6) {
      foods.push({
        id: `f_mock_${i}_2`,
        date: dateStr,
        mealType: 'lunch',
        description: '3 slices of pepperoni pizza and garlic bread',
        calories: 950,
        protein: 28,
        carbs: 110,
        fat: 45,
        fiber: 3
      });
      foods.push({
        id: `f_mock_${i}_3`,
        date: dateStr,
        mealType: 'snack',
        description: 'Coca-Cola (500ml) and potato chips',
        calories: 380,
        protein: 1,
        carbs: 65,
        fat: 14,
        fiber: 1
      });
      foods.push({
        id: `f_mock_${i}_4`,
        date: dateStr,
        mealType: 'dinner',
        description: 'Double cheeseburger and french fries',
        calories: 880,
        protein: 34,
        carbs: 85,
        fat: 42,
        fiber: 4
      });
    } else {
      // Standard healthy days
      foods.push({
        id: `f_mock_${i}_2`,
        date: dateStr,
        mealType: 'lunch',
        description: 'Grilled chicken breast with brown rice and broccoli',
        calories: 550,
        protein: 45,
        carbs: 45,
        fat: 10,
        fiber: 6
      });
      
      // Wednesday: eat Maggi as snack
      if (dayOfWeek === 3) {
        foods.push({
          id: `f_mock_${i}_3`,
          date: dateStr,
          mealType: 'snack',
          description: 'Maggi noodles with 1 boiled egg',
          calories: 460,
          protein: 14,
          carbs: 62,
          fat: 16,
          fiber: 2
        });
      } else {
        foods.push({
          id: `f_mock_${i}_3`,
          date: dateStr,
          mealType: 'snack',
          description: 'Greek yogurt with almonds',
          calories: 180,
          protein: 15,
          carbs: 12,
          fat: 8,
          fiber: 2
        });
      }

      foods.push({
        id: `f_mock_${i}_4`,
        date: dateStr,
        mealType: 'dinner',
        description: 'Baked salmon with quinoa and asparagus',
        calories: 520,
        protein: 38,
        carbs: 38,
        fat: 20,
        fiber: 5
      });
    }

    // 3. Water Intake: drops on weekdays (1-5) compared to weekends (0, 6)
    const waterAmount = (dayOfWeek >= 1 && dayOfWeek <= 5) ? 2000 : 3500;
    // Add multiple water logs per day
    const logCounts = waterAmount / 500;
    for (let w = 0; w < logCounts; w++) {
      water.push({
        id: `h2o_mock_${i}_${w}`,
        date: dateStr,
        amount: 500,
        timestamp: `${8 + w * 2}:00`
      });
    }

    // 4. Sleep
    // Some late nights on Friday (5) and Saturday (6)
    const isWeekendSleep = dayOfWeek === 6 || dayOfWeek === 0;
    sleep.push({
      id: `s_mock_${i}`,
      date: dateStr,
      startTime: isWeekendSleep ? '01:15' : '23:30',
      endTime: isWeekendSleep ? '09:30' : '07:15',
      duration: isWeekendSleep ? 8.25 : 7.75,
      quality: isWeekendSleep ? 4 : 5
    });

    // 5. Activity: steps and workouts
    const isActiveDay = dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 6; // Tue, Thu, Sat
    activities.push({
      id: `a_mock_${i}_steps`,
      date: dateStr,
      type: 'walking',
      name: 'Daily Steps',
      duration: 80,
      steps: isWeekendSleep ? 5500 : isActiveDay ? 12200 : 9200,
      caloriesBurned: isWeekendSleep ? 180 : isActiveDay ? 400 : 300
    });

    if (isActiveDay) {
      activities.push({
        id: `a_mock_${i}_workout`,
        date: dateStr,
        type: 'workout',
        name: dayOfWeek === 6 ? '5km Outdoor Run' : 'Weight Strength Training',
        duration: dayOfWeek === 6 ? 30 : 55,
        steps: dayOfWeek === 6 ? 4500 : 0,
        caloriesBurned: dayOfWeek === 6 ? 350 : 280
      });
    }
  }

  // 6. Health Records: 2 entries, showing blood tests
  const recordDate1 = new Date();
  recordDate1.setDate(today.getDate() - 14);
  records.push({
    id: 'hr_mock_1',
    date: formatDate(recordDate1),
    bloodPressureSystolic: 132,
    bloodPressureDiastolic: 84,
    bloodSugar: 105,
    vitaminD: 22,
    vitaminB12: 185,
    cholesterol: 215,
    hbA1c: 5.9
  });

  const recordDate2 = new Date();
  recordDate2.setDate(today.getDate() - 1);
  records.push({
    id: 'hr_mock_2',
    date: formatDate(recordDate2),
    bloodPressureSystolic: 124,
    bloodPressureDiastolic: 80,
    bloodSugar: 98,
    vitaminD: 28, // improved
    vitaminB12: 240, // improved
    cholesterol: 202, // improved
    hbA1c: 5.7 // improved
  });

  // 7. Pre-generated AI Reports
  // One weekly report from last Sunday
  const lastSunday = new Date();
  lastSunday.setDate(today.getDate() - (today.getDay() === 0 ? 7 : today.getDay()));
  const lastSundayStr = formatDate(lastSunday);
  
  reports.push({
    id: `weekly_${lastSundayStr}`,
    type: 'weekly',
    date: lastSundayStr,
    title: `Weekly Performance Audit (Ending ${lastSundayStr})`,
    score: 82,
    summary: `Excellent weekly progress! You maintained a consistent calorie deficit and lost **1.1kg** over this 7-day period. Your protein intake was high on gym days, but dropped slightly on rest days. Water intake remains a key area for improvement during work hours.`,
    positives: [
      'Maintained calorie deficit on 6 out of 7 days.',
      'Averaged 10,800 steps per day, exceeding your goal.',
      'Logged all meals consistently, keeping tracking time under 2 minutes.'
    ],
    mistakes: [
      'Calorie intake spiked significantly on Saturday (cheat day reached 2,800 kcal).',
      'Water intake averaged only 2.0L on Monday through Friday.',
      'Protein intake fell short by 25g on Wednesday.'
    ],
    recommendations: [
      'Try limiting weekend high-calorie items to a single meal instead of a full day.',
      'Keep a 1-liter bottle at your desk and set a reminder to drink 3 of them during working hours.',
      'Add 100g of low-fat curd or a scoop of whey protein on Wednesday afternoons to hit your protein target.'
    ],
    habitsDetected: [
      'Weekend Calorie Spike: Calorie intake is 45% higher on Saturdays.',
      'Workday Dehydration: Water intake is 35% lower on weekdays compared to weekends.'
    ],
    statsSummary: {
      weightChange: -1.1,
      avgCalories: 2080,
      avgProtein: 128,
      avgWater: 2420,
      avgSleep: 7.6,
      avgSteps: 10800,
      consistencyScore: 82
    }
  });

  // 8. Chat Messages: brief intro
  messages.push({
    id: 'msg_mock_1',
    role: 'assistant',
    content: `Hi Shagun! 👋 I am your AI Health Coach. I have analyzed your starting weight of **100kg** and your target of **80kg**. 

I will monitor your daily logs, identify your behavioral habits, and guide you with weekly audits. Feel free to ask me anything—like meal ideas, how to hit your protein goal, or how to manage cravings!`,
    timestamp: new Date(today.getTime() - 1000 * 60 * 60 * 24).toISOString()
  });

  messages.push({
    id: 'msg_mock_2',
    role: 'user',
    content: 'Thanks! How much weight should I aim to lose per week?',
    timestamp: new Date(today.getTime() - 1000 * 60 * 60 * 23.9).toISOString()
  });

  messages.push({
    id: 'msg_mock_3',
    role: 'assistant',
    content: `For a sustainable and healthy weight loss from 100kg to 80kg, you should aim for **0.5kg to 1kg per week**. 

This requires a daily calorie deficit of roughly **500 to 750 calories**. I have set your daily budget to **2,000 kcal** with **140g of protein** to preserve muscle mass while losing fat. We'll track your weekly averages rather than daily weight fluctuations, as water weight can jump around! 

Ready to crush this? 💪`,
    timestamp: new Date(today.getTime() - 1000 * 60 * 60 * 23.8).toISOString()
  });

  return {
    profile,
    weights,
    foods,
    water,
    sleep,
    activities,
    records,
    reports,
    messages
  };
}
