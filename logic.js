const initialBudget = 100000;
let budget = initialBudget;
const maxSatisfaction = 100;
const minSatisfaction = 0;
let gameOver = false;
let stagedEffects = {};
let delayedEffects = [];

const stakeholderNames = [
  "Patienter", "Äldre", "Unga", "Vårdpersonal", "Teknikföretag",
  "Integritetsförespråkare", "Sjukhusadministration", "Försäkringsbolag",
  "Digitala utvecklare", "Funktionsrättsorganisationer", "Migranter",
  "Traditionalister", "Fackföreningar"
];

let stakeholders = {};
stakeholderNames.forEach(name => stakeholders[name] = 50);

const firstNames = ["Anna", "Erik", "Sara", "Lukas", "Maja", "Oskar", "Nina", "Ali", "Elsa", "Johan"];

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
  const policy = policies.find(p => p.key === policyKey);

  if (budget < policy.cost) {
    alert("Inte tillräckligt med budget!");
    return;
  }

  budget -= policy.cost;

  for (const group in policy.effects) {
    stagedEffects[group] = (stagedEffects[group] || 0) + policy.effects[group];
  }

  if (policy.delayed) {
    delayedEffects.push(policy.delayed);
  }

  const li = document.createElement("li");
  li.textContent = policy.name;
  document.getElementById("actions").appendChild(li);

  updateBudgetDisplay();
}

function nextRound() {
  if (gameOver) return;

  for (const group in stagedEffects) {
    stakeholders[group] += stagedEffects[group];
    stakeholders[group] = Math.max(minSatisfaction, Math.min(maxSatisfaction, stakeholders[group]));

    // Kontrollera förlust om en grupps nöjdhet är 0 eller mindre
    if (stakeholders[group] <= minSatisfaction+1) {
      alert(`Spelet är över! Gruppen "${group}" är alltför missnöjd.`);
      gameOver = true;
      document.querySelectorAll("button").forEach(btn => btn.disabled = true);
      return;
    }
  }
  stagedEffects = {};

  // Tillämpa fördröjda effekter
  delayedEffects.forEach(effect => {
    for (const group in effect) {
      stakeholders[group] += effect[group];
      stakeholders[group] = Math.max(minSatisfaction, Math.min(maxSatisfaction, stakeholders[group]));

      if (stakeholders[group] <= minSatisfaction+1) {
        alert(`Spelet är över! Gruppen "${group}" är alltför missnöjd.`);
        gameOver = true;
        document.querySelectorAll("button").forEach(btn => btn.disabled = true);
        return;
      }
    }
  });
  delayedEffects = [];

  updatePeopleSatisfaction();
  renderStakeholders();
  renderPeople();

  budget = initialBudget;
  updateBudgetDisplay();
}

function restartGame() {
  budget = initialBudget;
  gameOver = false;
  stakeholders = {};
  stakeholderNames.forEach(name => stakeholders[name] = 50);
  generatePeople();
  stagedEffects = {};
  delayedEffects = [];

  document.getElementById("actions").innerHTML = "";
  document.querySelectorAll("button").forEach(btn => btn.disabled = false);

  updatePeopleSatisfaction();
  updateBudgetDisplay();
  renderStakeholders();
  renderPeople();
}

function init() {
  generatePeople();
  updatePeopleSatisfaction();
  updateBudgetDisplay();
  renderStakeholders();
  renderPeople();

  const policyButtons = document.getElementById("policy-buttons");
  policyButtons.innerHTML = "";

  policies.forEach(policy => {
    const wrapper = document.createElement("div");
    wrapper.className = "tooltip";

    const button = document.createElement("button");
    button.textContent = policy.name;
    button.onclick = () => applyPolicy(policy.key);
    wrapper.appendChild(button);

    const tooltip = document.createElement("span");
    tooltip.className = "tooltiptext";

    let html = `<strong>Kostnad:</strong> ${policy.cost.toLocaleString()} kr<br><br>`;
    html += `<strong>Omedelbara effekter:</strong><br>`;
    for (const group in policy.effects) {
      const value = policy.effects[group];
      const color = value > 0 ? "lightgreen" : "salmon";
      html += `<span style="color:${color}">${group}: ${value > 0 ? "+" : ""}${value}</span><br>`;
    }

    if (policy.delayed) {
      html += `<br><strong>Fördröjda effekter:</strong><br>`;
      for (const group in policy.delayed) {
        const value = policy.delayed[group];
        const color = value > 0 ? "lightgreen" : "salmon";
        html += `<span style="color:${color}">${group}: ${value > 0 ? "+" : ""}${value}</span><br>`;
      }
    }

    tooltip.innerHTML = html;
    wrapper.appendChild(tooltip);
    policyButtons.appendChild(wrapper);
  });
}

window.onload = init;
