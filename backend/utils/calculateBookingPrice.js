const PLAN_MULTIPLIERS = {
  'Full Day': 1,
  'Lunch & Dinner': 0.85,
  'Lunch Only': 0.5,
  'Dinner Only': 0.5,
};

const DURATION_DISCOUNTS = {
  1: 0,      // no discount
  3: 0.05,   // 5% off
  6: 0.10,   // 10% off
};

const calculateBookingPrice = (mess, planType, durationMonths) => {
  const baseMonthly = mess.pricing.baseFee * PLAN_MULTIPLIERS[planType];
  const rawPlanCost = Math.round(baseMonthly * durationMonths);

  const discountRate = DURATION_DISCOUNTS[durationMonths];
  const discountApplied = Math.round(rawPlanCost * discountRate);

  const planCost = rawPlanCost;
  const deposit = mess.pricing.deposit;
  const registrationFee = mess.pricing.registrationFee;

  const totalPayable = planCost - discountApplied + deposit + registrationFee;

  return {
    planCost,
    discountApplied,
    deposit,
    registrationFee,
    totalPayable,
  };
};

module.exports = calculateBookingPrice;