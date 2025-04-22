function nextRound() {
  if (gameOver) return;

  // Återställ budgeten till startbudgeten
  budget = initialBudget;

  if (delayedEffects.length > 0) {
    const effects = delayedEffects.shift();
    for (const group in effects) {
      stakeholders[group] += effects[group];
      stakeholders[group] = Math.max(minSatisfaction, Math.min(maxSatisfaction, stakeholders[group]));
    }
  }

  activePolicies.forEach(policy => {
    for (const group in policy.effects) {
      stakeholders[group] += policy.effects[group];
      stakeholders[group] = Math.max(minSatisfaction, Math.min(maxSatisfaction, stakeholders[group]));
    }
  });

  update();
}
