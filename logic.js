function nextRound() {
  if (gameOver) return;

  // Återställ budgeten till startbudgeten
  budget = initialBudget;  // Här återställs budgeten till 100 000 varje gång

  if (delayedEffects.length > 0) {
    const effects = delayedEffects.shift(); // Applicera fördröjda effekter från föregående runda
    for (const group in effects) {
      stakeholders[group] += effects[group];
      stakeholders[group] = Math.max(minSatisfaction, Math.min(maxSatisfaction, stakeholders[group])); // Säkerställ att värdena inte går utanför gränserna
    }
  }

  // Applicera effekter från aktiva policies
  activePolicies.forEach(policy => {
    for (const group in policy.effects) {
      stakeholders[group] += policy.effects[group];
      stakeholders[group] = Math.max(minSatisfaction, Math.min(maxSatisfaction, stakeholders[group])); // Säkerställ att värdena inte går utanför gränserna
    }
  });

  // Uppdatera spelet efter alla effekter
  update();
}
