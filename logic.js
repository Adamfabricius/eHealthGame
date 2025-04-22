const initialBudget = 100000;
let budget = initialBudget;
const incomePerRound = 30000;
const maxSatisfaction = 100;
const minSatisfaction = 0;
let gameOver = false;
let stagedEffects = {};
let delayedEffects = [];
let activePolicies = [];
let usedPolicyKeys = [];

const stakeholderNames = [
  "Patienter", "Äldre", "Unga", "Vårdpersonal", "Teknikföretag",
  "Integritetsförespråkare", "Sjukhusadministration", "Försäkringsbolag",
  "Digitala utvecklare", "Funktionsrättsorganisationer", "Migranter",
  "Traditionalister", "Fackföreningar"
];

let stakeholders = {};
stakeholderNames.forEach(name => stakeholders[name] = 50);

let people = [];

function generatePeople() {
  people = [
    { name: "Anna", groups: ["Patienter", "Äldre", "Traditionalister"], satisfaction: 50 },
    { name: "Erik", groups: ["Unga", "Teknikföretag", "Digitala utvecklare"], satisfaction: 50 },
    { name: "Sara", groups: ["Äldre", "Vårdpersonal", "Fackföreningar"], satisfaction: 50 },
    { name: "Lukas", groups: ["Patienter", "Migranter", "Försäkringsbolag"], satisfaction: 50 },
    { name: "Maja", groups: ["Unga", "Digitala utvecklare", "Integritetsförespråkare"], satisfaction: 50 },
    { name: "Oskar", groups: ["Sjukhusadministration", "Fackföreningar", "Traditionalister"], satisfaction: 50 },
    { name: "Nina", groups: ["Patienter", "Funktionsrättsorganisationer", "Äldre"], satisfaction: 50 },
    { name: "Ali", groups: ["Migranter", "Teknikföretag", "Försäkringsbolag"], satisfaction: 50 },
    { name: "Elsa", groups: ["Integritetsförespråkare", "Unga", "Patienter"], satisfaction: 50 },
    { name: "Johan", groups: ["Vårdpersonal", "Sjukhusadministration", "Fackföreningar"], satisfaction: 50 }
  ];
}

const policies = [
  {
    key: "bankid",
    name: "Obligatorisk BankID",
    cost: 20000,
    effects: { "Patienter": -5, "Äldre": -15, "Teknikföretag": +10, "Migranter": -10, "Unga": +10 },
    delayed: { "Integritetsförespråkare": -5 }
  },
  {
    key: "chatbot",
    name: "Gratis AI-chattbotar",
    cost: 15000,
    effects: { "Patienter": +5, "Äldre": -5, "Teknikföretag": +10, "Integritetsförespråkare": -10, "Unga": +7 },
    delayed: { "Vårdpersonal": -5 }
  },
  {
    key: "paper",
    name: "Garantera pappersbaserad vård",
    cost: 25000,
    effects: { "Äldre": +20, "Traditionalister": +10, "Teknikföretag": -10, "Unga": -5 }
  },
  {
    key: "ehr",
    name: "Nationellt Elektroniskt Journalsystem",
    cost: 30000,
    effects: { "Sjukhusadministration": +15, "Integritetsförespråkare": -10, "Digitala utvecklare": +10 }
  },
  {
    key: "telemedicine",
    name: "Telemedicin som standard",
    cost: 20000,
    effects: { "Patienter": +5, "Äldre": -10, "Vårdpersonal": -5, "Teknikföretag": +10, "Unga": +10 },
    delayed: { "Fackföreningar": -5 }
  },
  {
    key: "subsidy",
    name: "Subventionerade smarttelefoner",
    cost: 40000,
    effects: { "Patienter": +10, "Migranter": +10, "Försäkringsbolag": -5 }
  }
];

function renderStakeholders() {
  const div = document.getElementById("stakeholders");
  div.innerHTML = "";
  for (const group in stakeholders) {
    const value = stakeholders[group];
    const p = document.createElement("p");
    p.innerHTML = `<strong>${group}:</strong> ${value}`;
    div.appendChild(p);
  }
}

function renderPeople() {
  const div = document.getElementById("people");
  div.innerHTML = "";
  people.forEach(person => {
    const wrapper = document.createElement("div");
    wrapper.className = "tooltip";
    wrapper.innerHTML = `<strong>${person.name}:</strong> ${Math.round(person.satisfaction)}&nbsp;&nbsp;`;

    const tooltip = document.createElement("span");
    tooltip.className = "tooltiptext";
    tooltip.innerHTML =
      `Grupper: ${person.groups.join(", ")}<br>Nöjdhet: ${Math.round(person.satisfaction)}`;
    wrapper.appendChild(tooltip);
    div.appendChild(wrapper);
  });
}

function updatePeopleSatisfaction() {
  for (const person of people) {
    let total = 0;
    for (const g of person.groups) {
      total += stakeholders[g];
    }
    person.satisfaction = total / person.groups.length;

    if (person.satisfaction < 25) {
      person.satisfaction -= 3;
    }

    if (person.satisfaction <= minSatisfaction) {
      alert(`Spelet är över! ${person.name} är alltför missnöjd.`);
      gameOver = true;
      document.querySelectorAll("button").forEach(btn => btn.disabled = true);
    }

    person.satisfaction = Math.min(maxSatisfaction, Math.max(minSatisfaction, person.satisfaction));
  }
}

function updateBudgetDisplay() {
  document.getElementById("budget-display").textContent = `Budget kvar: ${budget.toLocaleString()} kr`;
}

function applyPolicy(policyKey) {
  if (gameOver) return;
  if (usedPolicyKeys.includes(policyKey)) return;

  const policy = policies.find(p => p.key === policyKey);

  if (budget < policy.cost) {
    alert("Inte tillräckligt med budget!");
    return;
  }

  budget -= policy.cost;
  activePolicies.push(policy);
  usedPolicyKeys.push(policyKey);

  for (const group in policy.effects) {
    stagedEffects[group] = (stagedEffects[group] || 0) + policy.effects[group];
  }

  if (policy.delayed) {
    delayedEffects.push(policy.delayed);
  }

  document.querySelector(`#btn-${policy.key}`).disabled = true;

  const li = document.createElement("li");
  li.textContent = policy.name;
  document.getElementById("actions").appendChild(li);

  update();
}

function update() {
  for (const group in stagedEffects) {
    stakeholders[group] += stagedEffects[group];
    stakeholders[group] = Math.max(minSatisfaction, Math.min(maxSatisfaction, stakeholders[group]));
  }
  stagedEffects = {};

  renderStakeholders();
  updatePeopleSatisfaction();
  renderPeople();
  updateBudgetDisplay();
}

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

function restartGame() {
  budget = initialBudget;
  gameOver = false;
  document.querySelectorAll("button").forEach(btn => btn.disabled = false);
  stakeholders = {};
  stakeholderNames.forEach(name => stakeholders[name] = 50);
  stagedEffects = {};
  delayedEffects = [];
  activePolicies = [];
  usedPolicyKeys = [];
  generatePeople();
  renderPolicies();
  update();
  document.getElementById("actions").innerHTML = "";
}

function renderPolicies() {
  const div = document.getElementById("policy-buttons");
  div.innerHTML = "";
  policies.forEach(policy => {
    const btn = document.createElement("button");
    btn.textContent = `${policy.name} (${policy.cost.toLocaleString()} kr)`;
    btn.id = `btn-${policy.key}`;
    btn.onclick = () => applyPolicy(policy.key);
    if (usedPolicyKeys.includes(policy.key)) btn.disabled = true;
    div.appendChild(btn);
  });
}

window.onload = () => {
  generatePeople();
  renderPolicies();
  restartGame();
};
