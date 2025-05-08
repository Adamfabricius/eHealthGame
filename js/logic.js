const initialBudget = 100000;
let budget = initialBudget;
const maxSatisfaction = 100;
const minSatisfaction = 0;
let gameOver = false;
let stagedEffects = {};
let delayedEffects = [];
let selectedThisRound = new Set();
let selectedPolicies = [];
let roundNumber = 1;

const stakeholderNames = [
    "Äldre", "Unga", "Vårdpersonal", "Teknikföretag",
    "Integritetsförespråkare", "Sjukhusadministration", "Försäkringsbolag",
    "Digitala utvecklare", "Funktionsrättsorganisationer", "Migranter",
    "Traditionalister", "Fackföreningar"
];

let stakeholders = {};
stakeholderNames.forEach(name => stakeholders[name] = 50);

let people = [];

function generatePeople() {
    people = [
        { name: "Anna", groups: ["Äldre", "Traditionalister"], satisfaction: 50 },
        { name: "Calle", groups: ["Unga", "Teknikföretag", "Digitala utvecklare"], satisfaction: 50 },
        { name: "Sara", groups: ["Äldre", "Vårdpersonal", "Fackföreningar"], satisfaction: 50 },
        { name: "Lukas", groups: ["Migranter", "Försäkringsbolag"], satisfaction: 50 },
        { name: "Maja", groups: ["Unga", "Digitala utvecklare", "Integritetsförespråkare"], satisfaction: 50 },
        { name: "Oskar", groups: ["Sjukhusadministration", "Fackföreningar", "Traditionalister"], satisfaction: 50 },
        { name: "Nina", groups: ["Funktionsrättsorganisationer", "Äldre"], satisfaction: 50 },
        { name: "Ali", groups: ["Migranter", "Teknikföretag", "Försäkringsbolag"], satisfaction: 50 },
        { name: "Elsa", groups: ["Integritetsförespråkare", "Unga"], satisfaction: 50 },
        { name: "Johan", groups: ["Vårdpersonal", "Sjukhusadministration", "Fackföreningar"], satisfaction: 50 }
    ];
}

const policies = [
    {
        key: "bankid",
        name: "Obligatorisk BankID",
        description: "Gör BankID obligatoriskt som ID-handling i alla vårdsammanhang",
        cost: 20000,
        effects: {
            "Äldre": -10,
            "Teknikföretag": +10,
            "Migranter": -10,
            "Unga": +10,
            "Digitala utvecklare": +5,
            "Traditionalister": -10,
            "Integritetsförespråkare": +10,
        },
        delayed: { "Äldre": +5 }
    },
    {
        key: "paper",
        name: "Garantera pappersbaserad vård",
        description: "Pappersalternativ garanteras för patienter som inte vill eller kan använda digital legitimation.",
        cost: 25000,
        effects: {
            "Äldre": +15,
            "Traditionalister": +10,
            "Teknikföretag": -10,
            "Unga": -7,
            "Digitala utvecklare": -5,
            "Migranter": + 10,
            "Integritetsförespråkare": +5
        }
    },
    {
        key: "ehr",
        name: "Nationellt Elektroniskt Journalsystem",
        description: "Alla vårdgivare kopplas till ett gemensamt digitalt journalsystem.",
        cost: 30000,
        effects: {
            "Sjukhusadministration": +15,
            "Integritetsförespråkare": -5,
            "Digitala utvecklare": +10
        }
    },
    {
        key: "subsidy",
        name: "Subventionerade smarttelefoner",
        description: "Personer med låg inkomst erbjuds rabatt på smartphones för att öka digital delaktighet.",
        cost: 40000,
        effects: {
            "Migranter": +10,
            "Försäkringsbolag": -5,
            "Teknikföretag": +10
        }
    },
    {
        key: "language-support",
        name: "Multilingual support-paket",
        description: "Digitala tjänster i vården får stöd för flera språk och kulturer.",
        cost: 40000,
        effects: {
            "Migranter": +15,
            "Unga": +3,
            "Digitala utvecklare": -5,
            "Sjukhusadministration": +5,
            "Traditionalister": -5
        }
    },
    {
        key: "secure",
        name: "Strikta Integritetsstandarder för Digitala Hälsosystem",
        description: "Denna policy säkerställer att alla digitala hälsosystem, inklusive elektroniska journalsystem och telemedicinlösningar, följer de strängaste integritets- och säkerhetsstandarderna.",
        cost: 40000,
        effects: {
            "Integritetsförespråkare": +20,
            "Teknikföretag": -5,
            "Digitala utvecklare": -5,
        }
    },
    {
        key: "telemedicine",
        name: "Telemedicin som standard",
        description: "Digitala vårdmöten blir förstahandsalternativ vid vårdkontakt.",
        cost: 20000,
        effects: {
            "Äldre": -10,
            "Vårdpersonal": -5,
            "Teknikföretag": +10,
            "Unga": +10,
            "Digitala utvecklare": +10
        },
        delayed: { "Fackföreningar": -5, "Äldre": +5 },
        requires: ["bankid"]
    },
    {
        key: "chatbot",
        name: "Gratis AI-chattbotar",
        description: "AI-drivna chattbotar tillhandahåller grundläggande vårdrådgivning dygnet runt.",
        cost: 15000,
        effects: {
            "Teknikföretag": +10,
            "Integritetsförespråkare": -10,
            "Unga": +5,
            "Digitala utvecklare": +5,
        },
        requires: ["bankid", "ehr"]
    },
    {
        key: "prevent",
        name: "Preventiv AI-vård",
        description: "AI används för att upptäcka risker och förhindra sjukdom i ett tidigt skede.",
        cost: 45000,
        effects: {
            "Försäkringsbolag": +15,
            "Fackföreningar": +5,
            "Sjukhusadministration": -5,
            "Traditionalister": -5
        },
        delayed: { "Sjukhusadministration": -5 },
        requires: ["chatbot", "ehr"]
    },
    {
        key: "AItriage",
        name: "AI-assisterad triage",
        description: "AI bedömer vårdbehov och prioritering vid patientkontakt.",
        cost: 30000,
        effects: {
            "Migranter": +15,
            "Unga": +3,
            "Digitala utvecklare": -5,
            "Sjukhusadministration": +5,
            "Traditionalister": +5
        },
        requires: ["chatbot"]
    },
    {
        key: "user-training",
        name: "Obligatorisk användarutbildning",
        description: "Vårdanställda och patienter utbildas i digitala verktyg.",
        cost: 15000,
        effects: {
            "Vårdpersonal": +10,
            "Äldre": +5,
            "Fackföreningar": +5,
            "Unga": -2
        },
        delayed: { "Traditionalister": +5, "Äldre": +5 },
        requires: ["ehr", "chatbot"]
    },
    {
        key: "efficiency-overhaul",
        name: "Effektivitetsoptimering via AI",
        description: "Gör BankID obligatoriskt som ID-handling i alla vårdsammanhang",
        cost: 35000,
        effects: {
            "Sjukhusadministration": +15,
            "Försäkringsbolag": +10,
            "Fackföreningar": -10,
            "Vårdpersonal": -5,
            "Integritetsförespråkare": -5
        },
        requires: ["prevent", "AItriage"]
    },
    {
        key: "Analogassist",
        name: "Analog Assistansprogram",
        description: "Personlig hjälp erbjuds till patienter som inte kan använda digitala tjänster.",
        cost: 35000,
        effects: {
            "Äldre": +15,
            "Vårdpersonal": +10,
            "Digitala utvecklare": -5
        },
        requires: ["paper"]
    },
    {
        key: "interpreter-app",
        name: "Personlig tolk via app",
        description: "App-baserad tillgång till professionella tolkar för patienter.",
        cost: 35000,
        effects: {
            "Migranter": +15,
            "Digitala utvecklare": +5,
            "Integritetsförespråkare": -5
        },
        requires: ["language-support"]
    }, {
        key: "digital-intro",
        name: "Digital introduktion för nyanlända",
        description: "Ett särskilt digitalt introduktionsprogram för att hjälpa nyanlända navigera vården.",
        cost: 25000,
        effects: {
            "Migranter": +10,
            "Unga": -2,
            "Fackföreningar": +2
        },
        requires: ["user-training"]
    },
];

function renderStakeholders() {
    const div = document.getElementById("stakeholders");
    div.innerHTML = ""; // Rensa tidigare innehåll

    // Skapa en wrapper för intressenter
    const wrapper = document.createElement("div");
    wrapper.className = "stakeholder-wrapper";

    // Loopa genom intressentgrupperna och skapa en ny div för varje
    let counter = 0;
    for (const group in stakeholders) {
        const value = stakeholders[group];
        const symbol = getSatisfactionSymbol(value);

        // Skapa en individuell "cell" för varje stakeholder
        const stakeholderDiv = document.createElement("div");
        stakeholderDiv.className = "stakeholder-cell";

        // Lägg till gruppens namn och symbol
        stakeholderDiv.innerHTML = `<strong>${group}:</strong> ${symbol}`;

        // Lägg till cellen till wrappern
        wrapper.appendChild(stakeholderDiv);
        counter++;

        // Varje 3:e intressent ska börja en ny rad
        if (counter % 3 === 0) {
            const lineBreak = document.createElement("div");
            lineBreak.style.clear = "both"; // Tvingar nästa rad att börja på en ny rad
            wrapper.appendChild(lineBreak);
        }
    }

    // Lägg till wrappern till div
    div.appendChild(wrapper);
}


function renderPeople() {
    const div = document.getElementById("people");
    div.innerHTML = "";
    people.forEach(person => {
        const wrapper = document.createElement("div");
        wrapper.className = "tooltip";

        const symbol = getSatisfactionSymbol(person.satisfaction);
        wrapper.innerHTML = `<strong>${person.name}:</strong> ${symbol}&nbsp;&nbsp;`;

        const tooltip = document.createElement("span");
        tooltip.className = "tooltiptext";
        tooltip.innerHTML = `Grupper: ${person.groups.join(", ")}<br>Nöjdhet: ${symbol}`;
        wrapper.appendChild(tooltip);
        div.appendChild(wrapper);
    });
}

function getEffectSymbol(value) {
    switch (true) {
        case (value >= 11):
            return "👍👍👍";
        case (value >= 6):
            return "👍👍";
        case (value > 0):
            return "👍";
        case (value <= -11):
            return "👎👎👎";
        case (value <= -6):
            return "👎👎";
        case (value < 0):
            return "👎";
        default:
            return "-";
    }
}

function getSatisfactionSymbol(value) {
    switch (true) {
        case (value >= 80):
            return "😄";
        case (value >= 60):
            return "😊";
        case (value >= 40):
            return "😐";
        case (value >= 20):
            return "☹️";
        default:
            return "😫";
    }
}

function updatePeopleSatisfaction() {
    for (const person of people) {
        // Kolla om någon av grupperna personen tillhör är nära 0
        for (const g of person.groups) {
            if (stakeholders[g] <= minSatisfaction) {
                alert(`Spelet är över! Du klarade dig i ${roundNumber} rundor, men ${person.name} är alltför missnöjd, eftersom "${g}" är missnöjda.`);
                gameOver = true;
                document.querySelectorAll("button").forEach(btn => {
                    if (btn.id !== "restart-button") {
                        btn.disabled = true;
                    }
                });
                return;
            }
        }

        // Räkna ut personens genomsnittliga nöjdhet
        let total = 0;
        for (const g of person.groups) {
            total += stakeholders[g];
        }
        person.satisfaction = total / person.groups.length;

        // Begränsa inom min/max
        person.satisfaction = Math.min(maxSatisfaction, Math.max(minSatisfaction, person.satisfaction));

        // Om personens egen nöjdhet går under gränsen
        if (person.satisfaction < minSatisfaction + 1) {
            alert(`Spelet är över! Du klarade dig i ${roundNumber}, men ${person.name} är alltför missnöjd.`);
            gameOver = true;
            document.querySelectorAll("button").forEach(btn => {
                if (btn.id !== "restart-button") {
                    btn.disabled = true;
                }
            });
            return;
        }
    }
}


function checkGroupSatisfaction() {
    for (const group in stakeholders) {
        if (stakeholders[group] < minSatisfaction + 1) {
            alert(`Spelet är över! Du klarde dig i ${roundNumber}, men "${group}" är alltför missnöjd.`);
            gameOver = true;
            document.querySelectorAll("button").forEach(btn => {
                if (btn.id !== "restart-button") {
                    btn.disabled = true;
                }
            });

            return true;
        }
    }
    return false;
}

function updateFutureBudgetDisplay() {
    let totalCost = 0;
    for (const key of selectedPolicies) {
        const policy = policies.find(p => p.key === key);
        if (policy) {
            totalCost += policy.cost;
        }
    }

    const projectedBudget = getNextRoundBudget(budget);
    const display = document.getElementById("future-budget-display");
    display.textContent = `Förväntad budget nästa runda: ${projectedBudget.toLocaleString()} kr`;
}



function updateBudgetDisplay() {
    document.getElementById("budget-display").textContent = `Budget kvar: ${budget.toLocaleString()} kr`;
}

function togglePolicy(policyKey) {
    if (gameOver) return;

    const index = selectedPolicies.indexOf(policyKey);
    const button = document.querySelector(`button[data-policy="${policyKey}"]`);
    const policy = policies.find(p => p.key === policyKey); // Hämta policyn

    if (index > -1) {
        // Redan vald – avmarkera
        // Återställ budgeten
        budget += policy.cost;

        // Ta bort effekterna från stagedEffects
        for (const group in policy.effects) {
            stagedEffects[group] -= policy.effects[group];
            if (stagedEffects[group] === 0) {
                delete stagedEffects[group];
            }
        }

        // Ta bort fördröjda effekter
        if (policy.delayed) {
            delayedEffects = delayedEffects.filter(effect => JSON.stringify(effect) !== JSON.stringify(policy.delayed));
        }

        // Uppdatera visualiseringen
        updateBudgetDisplay();
        const affectedPolicies = selectedPolicies.filter(pKey => {
            const dependentPolicy = policies.find(p => p.key === pKey);
            return dependentPolicy.requires && dependentPolicy.requires.includes(policyKey);
        });

        affectedPolicies.forEach(depKey => {
            togglePolicy(depKey); // Avmarkera beroende policy rekursivt
            const depName = policies.find(p => p.key === depKey).name;
            showPolicyMessage(`"${depName}" avmarkeras eftersom ett krav inte längre är valt.`);
        });
        selectedPolicies.splice(index, 1);
        button.classList.remove("selected");
        button.textContent = policies.find(p => p.key === policyKey).name;
    } else {
        // Kontrollera om policyn har krav
        if (Array.isArray(policy.requires)) {
            const unmet = policy.requires.filter(req => !selectedPolicies.includes(req));
            if (unmet.length > 0) {
                alert(`Du måste först välja: ${unmet.map(k => policies.find(p => p.key === k).name).join(", ")}`);
                return;
            }
        }

        // Nytt val
        if (budget < policy.cost) {
            alert("Inte tillräckligt med budget!");
            return;
        }

        // Dra av kostnaden från budgeten
        budget -= policy.cost;

        // Lägg till effekterna i stagedEffects
        for (const group in policy.effects) {
            stagedEffects[group] = (stagedEffects[group] || 0) + policy.effects[group];
        }

        // Lägg till fördröjda effekter om de finns
        if (policy.delayed) {
            delayedEffects.push(policy.delayed);
        }

        // Uppdatera visualiseringen
        selectedPolicies.push(policyKey);
        button.classList.add("selected");
        button.textContent = `✅ ${policy.name}`;
        updateBudgetDisplay();
    }

    // Aktivera policies som nu är upplåsta
    policies.forEach(p => {
        if (p.requires === policyKey) {
            const dependentBtn = document.querySelector(`button[data-policy="${p.key}"]`);
            if (dependentBtn) {
                dependentBtn.disabled = false;
                dependentBtn.title = "";
            }
        }
    });
    updateFutureBudgetDisplay();
}

function getNextRoundBudget(currentBudget) {
    if (currentBudget >= initialBudget) return currentBudget;
    if (currentBudget >= 75000) return currentBudget + 25000;
    if (currentBudget >= 50000) return currentBudget + 15000;
    if (currentBudget >= 25000) return currentBudget + 15000;
    if (currentBudget >= 15000) return currentBudget + 10000;
    return currentBudget + 7500;
}


function nextRoundBudget() {
    switch (true) {
        case (budget >= initialBudget):
            return;
        case (budget >= 75000):
            budget += 25000; return budget;
        case (budget >= 50000):
            budget += 15000; return budget;
        case (budget >= 25000):
            budget += 15000; return budget;
        case (budget >= 15000):
            budget += 10000; return budget;
        default:
            budget += 7500; return budget;
    }
}

function updateRoundDisplay() {
    const display = document.getElementById("round-display");
    display.textContent = `Antal Rundor: ${roundNumber}`;
}




function nextRound() {
    if (gameOver) return;

    // Tillämpa effekterna från de valda policies
    selectedPolicies.forEach(policyKey => {
        const policy = policies.find(p => p.key === policyKey);

        // Tillämpa effekterna på stakeholders (grupper)
        for (const group in policy.effects) {
            stakeholders[group] += policy.effects[group];
            stakeholders[group] = Math.max(minSatisfaction, Math.min(maxSatisfaction, stakeholders[group]));
        }
    });

    // Tillämpa fördröjda effekter
    delayedEffects.forEach(effect => {
        for (const group in effect) {
            stakeholders[group] += effect[group];
            stakeholders[group] = Math.max(minSatisfaction, Math.min(maxSatisfaction, stakeholders[group]));
        }
    });
    delayedEffects = [];

    // Minskad nöjdhet för missnöjda grupper
    for (const group in stakeholders) {
        if (stakeholders[group] < 25) {
            stakeholders[group] -= 5;
            stakeholders[group] = Math.max(minSatisfaction, stakeholders[group]);
        }
    }

    updatePeopleSatisfaction();
    if (gameOver) return;


    renderStakeholders();
    renderPeople();
    roundNumber++;
    updateRoundDisplay();
    nextRoundBudget();
    updatePolicyButtons();
    updateBudgetDisplay();
    updateFutureBudgetDisplay();
}

function restartGame() {
    roundNumber = 1;
    updateRoundDisplay();

    budget = initialBudget;
    gameOver = false;

    stakeholders = {};
    stakeholderNames.forEach(name => stakeholders[name] = 50);

    generatePeople();

    selectedPolicies = [];
    stagedEffects = {};
    delayedEffects = [];
    updatePeopleSatisfaction();
    updateBudgetDisplay();
    updateFutureBudgetDisplay();
    renderStakeholders();
    renderPeople();

    // document.getElementById("actions").innerHTML = "";
    document.querySelectorAll("button").forEach(btn => btn.disabled = false);


    document.querySelectorAll("button[data-policy]").forEach(btn => {
        btn.classList.remove("selected");
        const key = btn.getAttribute("data-policy");
        const policy = policies.find(p => p.key === key);
        btn.textContent = policy.name;
    });

    updatePolicyButtons(); // Viktigt – återställ beroenden korrekt
}

function updatePolicyButtons() {
    policies.forEach(policy => {
        const button = document.querySelector(`button[data-policy="${policy.key}"]`);
        if (!button) return;

        if (selectedPolicies.includes(policy.key)) return;

        if (Array.isArray(policy.requires)) {
            const unmet = policy.requires.filter(req => !selectedPolicies.includes(req));
            if (unmet.length > 0) {
                button.disabled = true;
                button.title = `Kräver först: ${unmet.map(k => policies.find(p => p.key === k).name).join(", ")}`;
            } else {
                button.disabled = false;
                button.title = "";
            }
        } else {
            button.disabled = false;
            button.title = "";
        }
    });
}

function showPolicyMessage(message) {
    const msgDiv = document.getElementById("policy-message");
    msgDiv.textContent = message;
    setTimeout(() => msgDiv.textContent = "", 4000); // Rensa efter 4 sekunder
}


function init() {
    roundNumber = 1;
    updateRoundDisplay();
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
        button.setAttribute("data-policy", policy.key);
        button.onclick = () => togglePolicy(policy.key);

        wrapper.appendChild(button);

        const tooltip = document.createElement("span");
        tooltip.className = "tooltiptext";

        // Tooltip-innehåll med beskrivning överst
        let html = "";

        if (policy.description) {
            html += `<em>${policy.description}</em><br><br>`;
        }

        html += `<strong>Kostnad:</strong> ${policy.cost.toLocaleString()} kr<br><br>`;
        html += "<strong>Omedelbara effekter:</strong><br>";

        for (const group in policy.effects) {
            const value = policy.effects[group];
            const symbol = getEffectSymbol(value);
            html += `${group}: ${symbol}<br>`;
        }

        if (policy.delayed) {
            html += "<br><strong>Fördröjda effekter:</strong><br>";
            for (const group in policy.delayed) {
                const value = policy.delayed[group];
                const symbol = getEffectSymbol(value);
                html += `${group}: ${symbol}<br>`;
            }
        }

        if (Array.isArray(policy.requires)) {
            const unmet = policy.requires.filter(req => !selectedPolicies.includes(req));
            if (unmet.length > 0) {
                button.disabled = true;
                button.title = `Kräver först: ${unmet.map(k => policies.find(p => p.key === k).name).join(", ")}`;
            }
        }

        tooltip.innerHTML = html;
        wrapper.appendChild(tooltip);
        policyButtons.appendChild(wrapper);
        updatePolicyButtons();
        updateFutureBudgetDisplay();
    });
}


window.onload = init;
