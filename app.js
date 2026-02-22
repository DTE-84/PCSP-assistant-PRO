// ─────────────────────────────────────────────
//  PCSP Assistant Pro | Marion County DMH
//  app.js v2.0 — All application logic
// ─────────────────────────────────────────────

const APP_NAME    = "PCSP Assistant Pro";
const APP_VERSION = "2.0";
const DRAFT_LIMIT = 20;
const DRAFT_EXPIRY_DAYS = 30;  // PHI drafts auto-expire after 30 days
const SESSION_TIMEOUT_MINS = 30; // HIPAA workstation idle timeout warning

// ── Goal Templates by Domain ──
const data = {
  Safety: [
    "demonstrate 2 ways to exit the home during a drill",
    "identify 'safe strangers' in the Hannibal community",
    "exit the home and meet staff at the designated 'Safety Spot'",
    "demonstrate the ability to call 911 and provide their home address",
    "utilize a 'Safety Tool' (e.g., cell phone) to reach support",
    "independently identify 2 exits in any community building",
  ],
  Daily: [
    "identify 3 local businesses of interest for future employment",
    "participate in their annual PCSP meeting and express 1 choice",
    "review their monthly ledger with staff assistance",
    "practice 3 interview questions with staff",
    "lead at least one section of their PCSP meeting",
  ],
  Community: [
    "initiate 1 conversation with a peer during a community outing",
    "navigate to 2 locations in Hannibal (e.g., Library, Admiral Coontz Center)",
    "use OATS transit to attend a local social event",
    "participate in 1 volunteer activity at a Marion County park",
  ],
  Health: [
    "choose a healthy snack option with 1 verbal prompt",
    "participate in 20 minutes of physical activity (e.g., Riverview Park)",
    "identify the name and purpose of their morning medications",
    "assist in the preparation of one healthy meal per week",
  ],
};

// ── Local Resources ──
const resources = [
  { name: "Mark Twain Behavior Health",  info: "Crisis: (800) 356-5395",    contact: "Hannibal Office" },
  { name: "Douglass Community Services", info: "Food/Utility Assistance",    contact: "(573) 221-3892"  },
  { name: "OATS Transit",                info: "Transportation Marion Co.",  contact: "(800) 269-6287"  },
  { name: "NECAC Marion County",         info: "Housing & Support",          contact: "(573) 221-7166"  },
];

// ── All form field IDs (used for save/restore) ──
const FORM_FIELDS = [
  // Section 1 — Demographics
  "clientName","clientNickname","clientDOB","dmhID","coordinator",
  "officeType","officeLocation","maritalStatus","voterStatus","religion","religionOther",
  "nativeLanguage","otherLanguages","commMethod",
  "insurance","spenddownAmount","privateInsuranceProvider","dentalInsurance","dentalOther",
  "residencyType","residenceNotes",
  "schoolName","educationStatus",
  "employmentStatus","employmentJob",
  "lastAssessment","lastLOC","rasSisScore",
  // Section 2 — Communication
  "commPrimaryLanguage","commUsesSignLang","commSignLangType","commSignLangTypeOther",
  "commMethodOther","commMethodNotes",
  "commEvalNeeded","commEvalWhyNot","commEvalBarriers","commChartAttached",
  // Section 3 — Likes & Dislikes
  "likesActivities","likesFoods","likesPlaces","likesOther",
  "dislikesActivities","dislikesFoods","dislikesOther",
  // Section 4 — Important People (dynamic — captured separately)
  // Section 5 — Vision
  "aspirations","prevGoals","supportNeeded","strengths","maasTools",
  "ritualsRoutines","religiousSupports","staffPreference","otherSupport",
  "learningStyleNotes","culturalDifferences","waterTemp",
  // Section 6 — Health
  "diagnosis","personalOutcomes","hrstStatus","telehealth","medHistory",
  "pcpName","specialists","preventionDiet",
  "medicationDetails","psychotropicProtocol","selfAdmin",
  "healthRisks","evacPlan","dnrStatus","riskLevel","supervisionLevel",
  "behavioralStatus","oshaPrecaution","allergies",
  // Section 7 — Legal & Rights
  "limitedGuardianshipDetails","rightsBrochure","consents",
  "serviceSatisfaction","conflictInfo",
  "dpInvitation","dpDescription","dpLessIntrusive","dpHistorical",
  "dpTeaching","dpLiftingCriteria","dpMonitoring",
  // Section 8 — Admin
  "contributors","participation","scFrequency","payeeInfo","burialInfo",
  // Section 9 — Outcomes
  "domain","verb","frequency","goalTemplate",
  // Misc
  "ethnicityOther",
  // Section 8 additions
  "planEffectiveDate","planReviewDate","waiverType",
];

// ─────────────────────────────────────────────
//  HTML ESCAPE — prevent injection via user input in innerHTML
// ─────────────────────────────────────────────
function esc(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ─────────────────────────────────────────────
//  UNSAVED CHANGES GUARD
// ─────────────────────────────────────────────
let _hasUnsavedChanges = false;
let _autoSaveTimer     = null;

function markDirty() {
  _hasUnsavedChanges = true;
}

window.addEventListener("beforeunload", (e) => {
  if (_hasUnsavedChanges) {
    e.preventDefault();
    e.returnValue = "";
  }
});

// ─────────────────────────────────────────────
//  THEME — Apply before first paint (no flash)
// ─────────────────────────────────────────────
(function applyThemeImmediately() {
  const saved = localStorage.getItem("pcsp_theme") || "light";
  document.documentElement.setAttribute("data-theme", saved);
})();

function toggleTheme() {
  const current  = document.documentElement.getAttribute("data-theme");
  const newTheme = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("pcsp_theme", newTheme);
}

// ─────────────────────────────────────────────
//  DUE PROCESS TOGGLE
// ─────────────────────────────────────────────
function toggleDueProcess(cb) {
  document.getElementById("dueProcessFields").style.display = cb.checked ? "none" : "";
  updateUI();
}

// ─────────────────────────────────────────────
//  MULTI-SELECT (Learning Styles / Legal Roles / Health Params)
// ─────────────────────────────────────────────
function toggleMultiSelect(containerId) {
  const container = document.getElementById(containerId);
  container.classList.toggle("active");
  const closeHandler = (e) => {
    if (!container.contains(e.target)) {
      container.classList.remove("active");
      document.removeEventListener("click", closeHandler);
    }
  };
  setTimeout(() => document.addEventListener("click", closeHandler), 10);
}

function _syncMultiSelect(containerId, tagsId, placeholder, onChange) {
  const checkboxes = document.querySelectorAll(`#${containerId} input[type=checkbox]`);
  const tagContainer = document.getElementById(tagsId);
  const selected = [];
  checkboxes.forEach((cb) => { if (cb.checked) selected.push(cb.value); });
  tagContainer.innerHTML = selected.length
    ? selected.map((s) => `<span class="selected-tag">${s}</span>`).join("")
    : `<span class="placeholder">${placeholder}</span>`;
  return selected;
}

function updateLearningStyles() {
  _syncMultiSelect("learningStyleContainer", "learningStyleTags", "Select Learning Styles...");
  updateUI();
}
function getLearningStylesSelected() {
  const cbs = document.querySelectorAll("#learningStyleContainer input[type=checkbox]");
  const sel = []; cbs.forEach((cb) => { if (cb.checked) sel.push(cb.value); });
  return sel.length ? sel.join(", ") : "Not specified";
}

function updateLegalRoles() {
  _syncMultiSelect("legalRolesContainer", "legalRolesTags", "Select Authority Roles...");
  updateUI();
}
function getLegalRolesSelected() {
  const cbs = document.querySelectorAll("#legalRolesContainer input[type=checkbox]");
  const sel = []; cbs.forEach((cb) => { if (cb.checked) sel.push(cb.value); });
  return sel.length ? sel.join(", ") : "Not specified";
}

function updateHealthParams() {
  _syncMultiSelect("healthParamsContainer", "healthParamsTags", "Select Parameters...");
  updateUI();
}
function getHealthParamsSelected() {
  const cbs = document.querySelectorAll("#healthParamsContainer input[type=checkbox]");
  const sel = []; cbs.forEach((cb) => { if (cb.checked) sel.push(cb.value); });
  return sel.length ? sel.join(", ") : "Not specified";
}

// ─────────────────────────────────────────────
//  COMMUNICATION SECTION HELPERS
// ─────────────────────────────────────────────
function toggleSignLangType() {
  const val = document.getElementById("commUsesSignLang").value;
  document.getElementById("signLangTypeGroup").style.display = val === "Yes" ? "" : "none";
  if (val !== "Yes") document.getElementById("signLangTypeOtherGroup").style.display = "none";
}
function toggleSignLangTypeOther() {
  const val = document.getElementById("commSignLangType").value;
  document.getElementById("signLangTypeOtherGroup").style.display = val === "Other" ? "" : "none";
}
function toggleCommEvalFields() {
  const val = document.getElementById("commEvalNeeded").value;
  document.getElementById("commEvalWhyNotGroup").style.display =
    val === "No — Not Needed" ? "" : "none";
  document.getElementById("commEvalBarriersGroup").style.display =
    (val === "Yes — Evaluation(s) Needed" || val === "No — Not Needed") ? "" : "none";
}
function toggleCommMethodOther(cb) {
  document.getElementById("commMethodOtherGroup").style.display = cb.checked ? "" : "none";
  updateUI();
}
function toggleCommChartNA(cb) {
  const btn      = document.getElementById("addCommRowBtn");
  const attached = document.getElementById("commChartAttached");
  if (cb.checked) {
    if (commChartRows.length > 0) {
      if (confirm("Checking N/A will clear all existing chart entries. Continue?")) {
        commChartRows = [];
        renderCommChart();
      } else {
        cb.checked = false;
        return;
      }
    }
    btn.disabled = true;
    attached.disabled = true;
    attached.value = "";
  } else {
    btn.disabled = false;
    attached.disabled = false;
  }
  updateUI();
}
function toggleNAField(fieldId, cbId) {
  const cb = document.getElementById(cbId);
  const field = document.getElementById(fieldId);
  if (cb.checked) { field.value = "N/A"; field.disabled = true; }
  else            { field.value = "";    field.disabled = false; }
  updateUI();
}

// ── Communication Chart (dynamic rows) ──
let commChartRows = [];

function addCommChartRow() {
  commChartRows.push({ situation: "", meaning: "", response: "" });
  renderCommChart();
}
function removeCommChartRow(i) {
  commChartRows.splice(i, 1);
  renderCommChart();
  updateUI();
}
function updateCommRow(i, field, value) {
  commChartRows[i][field] = value;
  updateUI();
}
function renderCommChart() {
  const container = document.getElementById("commChartContainer");
  if (!commChartRows.length) {
    container.innerHTML = `<p style="font-size:12px;color:var(--text-label);margin:8px 0 12px;">No communication entries added. Click below to add one.</p>`;
    return;
  }
  container.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:8px;margin-bottom:8px;">
      <div style="font-size:11px;font-weight:700;color:var(--text-label);text-transform:uppercase;padding:0 4px;">When / Situation</div>
      <div style="font-size:11px;font-weight:700;color:var(--text-label);text-transform:uppercase;padding:0 4px;">What It Means</div>
      <div style="font-size:11px;font-weight:700;color:var(--text-label);text-transform:uppercase;padding:0 4px;">How Staff Should Respond</div>
      <div></div>
    </div>
    ${commChartRows.map((row, i) => `
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:8px;margin-bottom:8px;align-items:start;">
        <textarea style="min-height:60px;" placeholder="e.g. Pulls on sleeve" oninput="updateCommRow(${i},'situation',this.value)">${row.situation}</textarea>
        <textarea style="min-height:60px;" placeholder="e.g. Needs to use restroom" oninput="updateCommRow(${i},'meaning',this.value)">${row.meaning}</textarea>
        <textarea style="min-height:60px;" placeholder="e.g. Immediately escort to restroom" oninput="updateCommRow(${i},'response',this.value)">${row.response}</textarea>
        <button class="remove-rep-btn" onclick="removeCommChartRow(${i})" title="Remove row" style="margin-top:6px;">✕</button>
      </div>
    `).join("")}
  `;
}

function getCommMethodsSelected() {
  const boxes = document.querySelectorAll("#commMethodGrid input[type=checkbox]");
  const selected = [];
  boxes.forEach((cb) => {
    if (cb.checked) {
      if (cb.value === "Other Communication Method") {
        const other = document.getElementById("commMethodOther")?.value.trim();
        selected.push(other ? `Other (${other})` : "Other");
      } else {
        selected.push(cb.value);
      }
    }
  });
  return selected.length ? selected.join(", ") : "Not specified";
}

function getCommChartNarrative() {
  if (!commChartRows.length) return "  No communication chart entries on file.";
  return commChartRows.map((row, i) =>
    `  Entry ${i + 1}: "${row.situation || "N/A"}" → Meaning: "${row.meaning || "N/A"}" → Staff Response: "${row.response || "N/A"}"`
  ).join("\n");
}

// ─────────────────────────────────────────────
//  IMPORTANT PEOPLE — Dynamic multi-entry
// ─────────────────────────────────────────────
let importantPeople = [];

function addImportantPerson() {
  importantPeople.push({ name: "", relationship: "", activities: [{ what: "", frequency: "" }] });
  renderImportantPeople();
  updateUI();
}
function removeImportantPerson(i) {
  importantPeople.splice(i, 1);
  renderImportantPeople();
  updateUI();
}
function addPersonActivity(personIdx) {
  importantPeople[personIdx].activities.push({ what: "", frequency: "" });
  renderImportantPeople();
}
function removePersonActivity(personIdx, actIdx) {
  importantPeople[personIdx].activities.splice(actIdx, 1);
  renderImportantPeople();
  updateUI();
}
function updatePerson(personIdx, field, value) {
  importantPeople[personIdx][field] = value;
  const headers = document.querySelectorAll(".person-header-title");
  const p = importantPeople[personIdx];
  if (headers[personIdx]) {
    headers[personIdx].textContent =
      `Person #${personIdx + 1}${p.name ? " — " + p.name : ""}${p.relationship ? " (" + p.relationship + ")" : ""}`;
  }
  updateUI();
}
function updatePersonActivity(personIdx, actIdx, field, value) {
  importantPeople[personIdx].activities[actIdx][field] = value;
  updateUI();
}
function renderImportantPeople() {
  const container = document.getElementById("importantPeopleContainer");
  if (!importantPeople.length) {
    container.innerHTML = `<p style="font-size:12px;color:var(--text-label);margin:8px 0 12px;">No people added yet. Click below to add someone important to this individual.</p>`;
    return;
  }
  container.innerHTML = importantPeople.map((person, i) => `
    <div class="legal-rep-card" style="margin-bottom:16px;">
      <div class="rep-header">
        <span class="rep-title person-header-title">Person #${i + 1}${person.name ? " \u2014 " + esc(person.name) : ""}${person.relationship ? " (" + esc(person.relationship) + ")" : ""}</span>
        <button class="remove-rep-btn" onclick="removeImportantPerson(${i})" title="Remove">&#10005;</button>
      </div>
      <div class="form-grid" style="margin-bottom:12px;">
        <div class="field-group">
          <label>Name</label>
          <input type="text" value="${esc(person.name)}" placeholder="e.g. Mary Smith" oninput="updatePerson(${i},'name',this.value)" />
        </div>
        <div class="field-group half">
          <label>Relationship to Individual</label>
          <input type="text" value="${esc(person.relationship)}" placeholder="e.g. Mother, Brother, Friend, Staff" oninput="updatePerson(${i},'relationship',this.value)" />
        </div>
      </div>
      <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:var(--gold);margin-bottom:8px;">Activities Together</div>
      <div style="display:grid;grid-template-columns:1fr 200px auto;gap:8px;margin-bottom:6px;">
        <div style="font-size:11px;font-weight:700;color:var(--text-label);text-transform:uppercase;">What They Like to Do Together</div>
        <div style="font-size:11px;font-weight:700;color:var(--text-label);text-transform:uppercase;">How Often</div>
        <div></div>
      </div>
      ${person.activities.map((act, j) => `
        <div style="display:grid;grid-template-columns:1fr 200px auto;gap:8px;margin-bottom:8px;align-items:center;">
          <input type="text" value="${esc(act.what)}" placeholder="e.g. Going to church, watching movies, fishing..." oninput="updatePersonActivity(${i},${j},'what',this.value)" />
          <input type="text" value="${esc(act.frequency)}" placeholder="e.g. Weekly, Monthly, Daily" oninput="updatePersonActivity(${i},${j},'frequency',this.value)" />
          <button class="remove-rep-btn" onclick="removePersonActivity(${i},${j})" title="Remove activity"
            ${person.activities.length === 1 ? 'style="opacity:0.3;pointer-events:none;"' : ""}>&#10005;</button>
        </div>
      `).join("")}
      <button class="btn btn-outline" type="button" onclick="addPersonActivity(${i})"
        style="font-size:12px;padding:6px 14px;margin-top:4px;">+ Add Another Activity</button>
    </div>
  `).join("");
}

function getImportantPeopleNarrative() {
  if (!importantPeople.length) return "  No important people documented at this time.";
  return importantPeople.map((p, i) => {
    const name = p.name || `[Person ${i + 1}]`;
    const rel  = p.relationship || "Relationship not specified";
    const acts = p.activities.filter((a) => a.what)
      .map((a) => `${a.what}${a.frequency ? " (" + a.frequency + ")" : ""}`).join("; ");
    return `  ${name} (${rel}): ${acts || "No activities listed"}`;
  }).join("\n");
}


// ─────────────────────────────────────────────
//  MEASURABLE OUTCOMES — Multi-goal system
// ─────────────────────────────────────────────
let goalsData = [];

const GOAL_TEMPLATES = {
  Safety: [
    "demonstrate 2 ways to exit the home during a drill",
    "identify 'safe strangers' in the Hannibal community",
    "exit the home and meet staff at the designated 'Safety Spot'",
    "demonstrate the ability to call 911 and provide their home address",
    "utilize a 'Safety Tool' (e.g., cell phone) to reach support",
    "independently identify 2 exits in any community building",
  ],
  Daily: [
    "identify 3 local businesses of interest for future employment",
    "participate in their annual PCSP meeting and express 1 choice",
    "review their monthly ledger with staff assistance",
    "practice 3 interview questions with staff",
    "lead at least one section of their PCSP meeting",
  ],
  Community: [
    "initiate 1 conversation with a peer during a community outing",
    "navigate to 2 locations in Hannibal (e.g., Library, Admiral Coontz Center)",
    "use OATS transit to attend a local social event",
    "participate in 1 volunteer activity at a Marion County park",
  ],
  Health: [
    "choose a healthy snack option with 1 verbal prompt",
    "participate in 20 minutes of physical activity (e.g., Riverview Park)",
    "identify the name and purpose of their morning medications",
    "assist in the preparation of one healthy meal per week",
  ],
};

const VERB_OPTIONS = [
  { value: "instructional support to learn how to",  label: "Instructional (Teaching)"      },
  { value: "maintenance support to continue to",     label: "Maintenance (Sharpness)"       },
  { value: "physical and direct support to",         label: "Physical/Direct (Hands-on)"    },
  { value: "modeling and demonstration to",          label: "Model (Show/Tell)"             },
  { value: "verbal prompts and cues to",             label: "Prompt (Reminders)"            },
];

function addGoal() {
  goalsData.push({
    domain:       "",
    verb:         "instructional support to learn how to",
    goalTemplate: "",
    frequency:    "",
    provider:     "",
    startDate:    "",
    endDate:      "",
  });
  renderGoals();
  updateUI();
}

function removeGoal(i) {
  goalsData.splice(i, 1);
  renderGoals();
  updateUI();
}

function updateGoalField(i, field, value) {
  goalsData[i][field] = value;
  if (field === "domain") {
    goalsData[i].goalTemplate = "";
    renderGoals(); // re-render to refresh template options
  }
  updateUI();
}

function renderGoals() {
  const container = document.getElementById("goalsContainer");
  if (!goalsData.length) {
    container.innerHTML = `<p style="font-size:12px;color:var(--text-label);margin:8px 0 12px;">No outcome goals added yet. Click below to add one.</p>`;
    return;
  }
  container.innerHTML = goalsData.map((goal, i) => {
    const domainOpts = ["","Safety","Daily","Community","Health"].map((d) =>
      `<option value="${d}" ${goal.domain === d ? "selected" : ""}>${d || "-- Select Domain --"}</option>`
    ).join("");

    const verbOpts = VERB_OPTIONS.map((v) =>
      `<option value="${esc(v.value)}" ${goal.verb === v.value ? "selected" : ""}>${esc(v.label)}</option>`
    ).join("");

    const templates = goal.domain && GOAL_TEMPLATES[goal.domain]
      ? GOAL_TEMPLATES[goal.domain].map((t) =>
          `<option value="${esc(t)}" ${goal.goalTemplate === t ? "selected" : ""}>${esc(t)}</option>`
        ).join("")
      : `<option value="">-- Select Domain First --</option>`;

    return `
    <div class="legal-rep-card" style="margin-bottom:16px;">
      <div class="rep-header">
        <span class="rep-title">Goal #${i + 1}${goal.domain ? " — " + esc(goal.domain) : ""}</span>
        <button class="remove-rep-btn" onclick="removeGoal(${i})" title="Remove goal">✕</button>
      </div>
      <div class="form-grid">
        <div class="field-group">
          <label>Outcome Domain</label>
          <select onchange="updateGoalField(${i},'domain',this.value)">${domainOpts}</select>
        </div>
        <div class="field-group">
          <label>Support Method</label>
          <select onchange="updateGoalField(${i},'verb',this.value)">${verbOpts}</select>
        </div>
        <div class="field-group full">
          <label>Goal Starter (Clinical Building Blocks)</label>
          <select onchange="updateGoalField(${i},'goalTemplate',this.value)">${templates}</select>
        </div>
        <div class="field-group">
          <label>Frequency</label>
          <input type="text" value="${esc(goal.frequency)}" placeholder="e.g. 3x weekly"
            oninput="updateGoalField(${i},'frequency',this.value)" />
        </div>
        <div class="field-group">
          <label>Responsible Provider / Staff</label>
          <input type="text" value="${esc(goal.provider)}" placeholder="e.g. MCSDD, Mark Twain BH"
            oninput="updateGoalField(${i},'provider',this.value)" />
        </div>
        <div class="field-group">
          <label>Goal Start Date</label>
          <input type="date" value="${esc(goal.startDate)}"
            oninput="updateGoalField(${i},'startDate',this.value)" />
        </div>
        <div class="field-group">
          <label>Goal End / Review Date</label>
          <input type="date" value="${esc(goal.endDate)}"
            oninput="updateGoalField(${i},'endDate',this.value)" />
        </div>
      </div>
    </div>`;
  }).join("");
}

function getGoalsNarrative() {
  if (!goalsData.length) return "  No measurable outcome goals documented.";
  return goalsData.map((g, i) => {
    if (!g.domain) return `  Goal #${i + 1}: [Domain not selected]`;
    const template = g.goalTemplate || "[goal not selected]";
    const freq     = g.frequency   || "[frequency not set]";
    const provider = g.provider    || "Provider TBD";
    const dates    = g.startDate   ? ` | Start: ${g.startDate}${g.endDate ? " → End: " + g.endDate : ""}` : "";
    return `  Goal #${i + 1} (${g.domain}): The individual will receive ${g.verb} ${template}.
    Frequency: ${freq} | Provider: ${provider}${dates}
    Monitoring: SC Quarterly & Provider Monthly.`;
  }).join("\n");
}

// ─────────────────────────────────────────────
//  LEGAL REPRESENTATIVES — Dynamic multi-entry
// ─────────────────────────────────────────────
let legalReps = [];

function renderLegalReps() {
  const container = document.getElementById("legalRepsContainer");
  if (!legalReps.length) {
    container.innerHTML = `<p style="font-size:12px;color:var(--text-label);margin:8px 0 12px;">No legal representatives added. Click below to add one.</p>`;
    return;
  }
  container.innerHTML = legalReps.map((rep, i) => `
    <div class="legal-rep-card">
      <div class="rep-header">
        <span class="rep-title">Representative #${i + 1}${rep.name ? " — " + esc(rep.name) : ""}</span>
        <button class="remove-rep-btn" onclick="removeLegalRep(${i})" title="Remove">✕</button>
      </div>
      <div class="form-grid">
        <div class="field-group">
          <label>Full Name</label>
          <input type="text" value="${esc(rep.name)}" placeholder="Jane Doe" oninput="updateRep(${i},'name',this.value)" />
        </div>
        <div class="field-group">
          <label>Relationship to Individual</label>
          <input type="text" value="${esc(rep.relationship)}" placeholder="e.g. Mother, Brother, Court Appointee" oninput="updateRep(${i},'relationship',this.value)" />
        </div>
        <div class="field-group">
          <label>Type of Legal Authority</label>
          <select onchange="updateRep(${i},'legalType',this.value)">
            ${["Full Guardianship","Limited Guardianship","Conservatorship","Power of Attorney (POA)",
               "Healthcare POA","Custodian","Legal / Physical Custody","Representative Payee",
               "Natural / Informal Support"].map((opt) =>
              `<option value="${opt}" ${rep.legalType === opt ? "selected" : ""}>${opt === "Natural / Informal Support" ? opt + " (No Legal Authority)" : opt}</option>`
            ).join("")}
          </select>
        </div>
        <div class="field-group">
          <label>Lives with Individual?</label>
          <select onchange="updateRep(${i},'livesWith',this.value)">
            <option value="Yes" ${rep.livesWith === "Yes" ? "selected" : ""}>Yes — Same residence</option>
            <option value="No — Different residence" ${rep.livesWith === "No — Different residence" ? "selected" : ""}>No — Different residence</option>
          </select>
        </div>
        <div class="field-group">
          <label>Phone Number</label>
          <input type="text" value="${rep.phone || ""}" placeholder="(573) 555-0100" oninput="updateRep(${i},'phone',this.value)" />
        </div>
        <div class="field-group half">
          <label>Address (if different residence)</label>
          <input type="text" value="${rep.address || ""}" placeholder="123 Main St, Hannibal MO 63401" oninput="updateRep(${i},'address',this.value)" />
        </div>
      </div>
    </div>
  `).join("");
}

function addLegalRep() {
  legalReps.push({ name: "", relationship: "", legalType: "Full Guardianship", livesWith: "Yes", phone: "", address: "" });
  renderLegalReps();
  updateUI();
}
function removeLegalRep(i) {
  legalReps.splice(i, 1);
  renderLegalReps();
  updateUI();
}
function updateRep(i, field, value) {
  legalReps[i][field] = value;
  // Scope to legalRepsContainer to avoid colliding with importantPeople .rep-title elements
  const container = document.getElementById("legalRepsContainer");
  if (container) {
    const titles = container.querySelectorAll(".rep-title");
    if (titles[i]) titles[i].textContent = `Representative #${i + 1}${legalReps[i].name ? " — " + legalReps[i].name : ""}`;
  }
  updateUI();
}
function getLegalRepsNarrative() {
  if (!legalReps.length) return "  None on file.";
  return legalReps.map((rep, i) =>
    `  Rep #${i + 1}: ${rep.name || "[Name not provided]"} | ${rep.legalType} | Relationship: ${rep.relationship || "N/A"} | Lives with individual: ${rep.livesWith} | Phone: ${rep.phone || "N/A"}${rep.address && rep.livesWith !== "Yes" ? " | Address: " + rep.address : ""}`
  ).join("\n");
}
function captureLegalReps()   { return JSON.parse(JSON.stringify(legalReps)); }
function restoreLegalReps(d)  { legalReps = Array.isArray(d) ? d : []; renderLegalReps(); }

// ─────────────────────────────────────────────
//  AUTO-SAVE (debounced, 4-second delay)
// ─────────────────────────────────────────────
function scheduleAutoSave() {
  markDirty();
  clearTimeout(_autoSaveTimer);
  _autoSaveTimer = setTimeout(() => {
    try {
      const snap = { _autoSave: true, timestamp: Date.now(), formData: captureFormData() };
      localStorage.setItem("pcsp_autosave", JSON.stringify(snap));
      showAutoSaveIndicator();
    } catch (e) { /* storage full — silently skip */ }
  }, 4000);
}

function showAutoSaveIndicator() {
  const el = document.getElementById("autoSaveIndicator");
  if (!el) return;
  el.textContent = "✓ Auto-saved " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  el.style.opacity = "1";
  clearTimeout(el._fadeTimer);
  el._fadeTimer = setTimeout(() => { el.style.opacity = "0"; }, 3000);
}

function checkAutoSaveRestore() {
  // Delay prompt until DOM is fully rendered and interactive
  setTimeout(() => _checkAutoSaveRestoreInner(), 600);
}

function _checkAutoSaveRestoreInner() {
  const raw = localStorage.getItem("pcsp_autosave");
  if (!raw) return;
  try {
    const snap = JSON.parse(raw);
    const age  = Date.now() - (snap.timestamp || 0);
    if (age < 48 * 60 * 60 * 1000 && snap.formData) { // within 48 hours
      const mins = Math.round(age / 60000);
      const label = mins < 2 ? "just now" : `${mins} minute${mins !== 1 ? "s" : ""} ago`;
      if (confirm(`📋 An auto-saved session was found (saved ${label}).\n\nWould you like to restore it?`)) {
        restoreFormData(snap.formData);
        showToast("✅ Auto-saved session restored.", "success", 4000);
        _hasUnsavedChanges = false;
      }
    }
  } catch (e) { /* corrupt — ignore */ }
}


// ─────────────────────────────────────────────
//  SESSION IDLE TIMEOUT (HIPAA workstation policy)
// ─────────────────────────────────────────────
let _idleTimer = null;
let _idleWarningShown = false;

function resetIdleTimer() {
  clearTimeout(_idleTimer);
  _idleWarningShown = false;
  _idleTimer = setTimeout(() => {
    if (_idleWarningShown) return;
    _idleWarningShown = true;
    const stay = confirm(
      `⏱ HIPAA Workstation Policy\n\nYou have been inactive for ${SESSION_TIMEOUT_MINS} minutes.\n\nClick OK to remain in this session, or Cancel to clear the workspace now.`
    );
    if (!stay) {
      localStorage.removeItem("pcsp_autosave");
      _hasUnsavedChanges = false;
      location.reload();
    } else {
      resetIdleTimer();
    }
  }, SESSION_TIMEOUT_MINS * 60 * 1000);
}

function initIdleTimeout() {
  ["mousemove","keydown","mousedown","touchstart","scroll"].forEach((evt) => {
    document.addEventListener(evt, resetIdleTimer, { passive: true });
  });
  resetIdleTimer();
}

// ─────────────────────────────────────────────
//  DRAG-AND-DROP .pcsp file onto the window
// ─────────────────────────────────────────────
function initDragDrop() {
  const workspace = document.querySelector(".main-workspace");
  workspace.addEventListener("dragover", (e) => {
    e.preventDefault();
    workspace.classList.add("drag-over");
  });
  workspace.addEventListener("dragleave", () => workspace.classList.remove("drag-over"));
  workspace.addEventListener("drop", (e) => {
    e.preventDefault();
    workspace.classList.remove("drag-over");
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".pcsp") || file.name.endsWith(".json"))) {
      loadFileObject(file);
    } else {
      showToast("❌ Please drop a valid .pcsp file.", "error");
    }
  });
}

// ─────────────────────────────────────────────
//  SIDEBAR TOGGLE
// ─────────────────────────────────────────────
function toggleSidebar() {
  const container = document.getElementById("appContainer");
  if (window.innerWidth <= 1024) {
    document.body.classList.toggle("sidebar-active");
  } else {
    container.classList.toggle("sidebar-collapsed");
  }
}

// ─────────────────────────────────────────────
//  RENDER RESOURCE CARDS
// ─────────────────────────────────────────────
function renderResources() {
  document.getElementById("resourceList").innerHTML = resources.map((res) => `
    <div class="resource-card" onclick="injectResource('${res.name}')">
      <span class="resource-name">${res.name}</span>
      <span class="resource-info">${res.info} | ${res.contact}</span>
    </div>
  `).join("");
}

// loadTemplates() — legacy stub, goals now handled by renderGoals()
function loadTemplates() { updateUI(); }

// ─────────────────────────────────────────────
//  TOGGLE HELPERS (Religion, Ethnicity, Insurance, Dental)
// ─────────────────────────────────────────────
function toggleReligionOther() {
  const val = document.getElementById("religion").value;
  document.getElementById("religionOtherGroup").style.display = val === "Other" ? "" : "none";
  updateUI();
}
function toggleEthnicityOther(cb) {
  document.getElementById("ethnicityOtherGroup").style.display = cb.checked ? "" : "none";
  updateUI();
}
function toggleInsuranceFields() {
  const val = document.getElementById("insurance").value;
  document.getElementById("spenddownGroup").style.display       = val === "Medicaid — Spend Down" ? "" : "none";
  document.getElementById("privateInsuranceGroup").style.display = val === "Private Insurance"    ? "" : "none";
  updateUI();
}
function toggleDentalOther() {
  const val = document.getElementById("dentalInsurance").value;
  document.getElementById("dentalOtherGroup").style.display = val === "Other" ? "" : "none";
  updateUI();
}

// ─────────────────────────────────────────────
//  ETHNICITY HELPER
// ─────────────────────────────────────────────
function getEthnicities() {
  const boxes = document.querySelectorAll("#ethnicityGrid input[type=checkbox]");
  const selected = [];
  boxes.forEach((cb) => {
    if (cb.checked) {
      if (cb.value === "Other Ethnicity") {
        const other = document.getElementById("ethnicityOther").value.trim();
        selected.push(other ? `Other (${other})` : "Other");
      } else {
        selected.push(cb.value);
      }
    }
  });
  return selected.length ? selected.join(", ") : "Not Reported";
}

// ─────────────────────────────────────────────
//  SECTION COMPLETION INDICATORS
// ─────────────────────────────────────────────
const SECTION_FIELDS = {
  "sec-demographics":    ["clientName","clientDOB","dmhID"],
  "sec-communication":   ["commPrimaryLanguage","commMethodNotes"],
  "sec-likes":           ["likesActivities","dislikesActivities"],
  "sec-important-people":[], // dynamic — check importantPeople array
  "sec-vision":          ["aspirations","strengths"],
  "sec-health":          ["diagnosis","medicationDetails","pcpName"],
  "sec-legal":           ["rightsBrochure","consents","serviceSatisfaction"],
  "sec-admin":           ["contributors","participation"],
  "sec-outcomes":        ["domain","frequency"],
};

function updateSectionIndicators() {
  Object.entries(SECTION_FIELDS).forEach(([secId, fields]) => {
    const sec = document.getElementById(secId);
    if (!sec) return;
    let filled;
    if (secId === "sec-important-people") {
      filled = importantPeople.length > 0;
    } else {
      filled = fields.some((id) => {
        const el = document.getElementById(id);
        return el && el.value && el.value.trim() !== "";
      });
    }
    let dot = sec.querySelector(".section-dot");
    if (!dot) {
      dot = document.createElement("span");
      dot.className = "section-dot";
      const title = sec.querySelector(".section-title");
      if (title) title.appendChild(dot);
    }
    dot.style.background    = filled ? "var(--success)" : "var(--border)";
    dot.title               = filled ? "Section has data" : "Section is empty";
  });
}

// ─────────────────────────────────────────────
//  MAIN UI UPDATE (narrative + header + indicators)
// ─────────────────────────────────────────────
function updateUI() {
  scheduleAutoSave();

  const isPrivacyOn = document.getElementById("privacyToggle").checked;
  const getVal = (id) => { const el = document.getElementById(id); return el ? el.value : ""; };

  const name  = getVal("clientName");
  const nick  = getVal("clientNickname");
  const dob   = getVal("clientDOB");
  const dmhID = getVal("dmhID");

  // Sticky header
  document.getElementById("headerName").textContent =
    name ? (nick ? `${name} ("${nick}")` : name) : "No Individual Selected";
  document.getElementById("headerDOB").textContent =
    dob  ? new Date(dob + "T00:00:00").toLocaleDateString() : "—";
  document.getElementById("headerDMH").textContent = dmhID || "—";

  // Privacy masking
  const displayName = isPrivacyOn ? "[INDIVIDUAL]"    : (name ? (nick ? `${name} ("${nick}")` : name) : "[NAME]");
  const displayDOB  = isPrivacyOn ? "[MM/DD/YYYY]"    : (dob  ? new Date(dob + "T00:00:00").toLocaleDateString() : "N/A");
  const displayDMH  = isPrivacyOn ? "[XXXXXXX]"       : (dmhID || "N/A");

  // ── Build narrative ──────────────────────────────────────
  let t = "";
  const line  = (s) => { t += s + "\n"; };
  const rule  = (ch = "─", n = 67) => line(ch.repeat(n));
  const head  = (s) => { line(s); rule(); line(""); };
  const field = (label, val, fallback = "N/A") => line(`${label}: ${val || fallback}`);

  line("MISSOURI PERSON CENTERED SERVICE PLAN (PCSP)");
  line("Marion County — Division of Developmental Disabilities");
  rule("═");
  line(`Generated: ${new Date().toLocaleString()}  |  Version: ${APP_VERSION}`);
  line(`CONFIDENTIAL — HIPAA Protected Health Information (45 CFR Parts 160 & 164)`);
  line("");

  // ── Section 1 ──
  head("1. DEMOGRAPHICS / CONTRIBUTORS / LEGAL DEMOGRAPHICS");
  line("IDENTITY");
  field("Name",         displayName);
  field("DOB",          displayDOB);
  field("DMH ID",       displayDMH);
  field("TCM Agency",   getVal("coordinator"));
  field("Office",       getVal("officeType") ? `${getVal("officeType")} — ${getVal("officeLocation") || "Location N/A"}` : "N/A");
  field("Marital",      getVal("maritalStatus"));
  field("Voter Status", getVal("voterStatus"));
  const religionVal = getVal("religion") === "Other"
    ? `Other — ${getVal("religionOther") || "not specified"}`
    : getVal("religion") || "N/A";
  field("Religion",    religionVal);
  field("Ethnicity / Race", getEthnicities());
  line("");

  line("COMMUNICATION & LANGUAGE");
  field("Native Language",   getVal("nativeLanguage"));
  field("Additional Languages", getVal("otherLanguages") || "None");
  field("Primary Comm. Method", getVal("commMethod"));
  line("");

  line("INSURANCE & BENEFITS");
  let ins = getVal("insurance") || "N/A";
  if (getVal("insurance") === "Medicaid — Spend Down" && getVal("spenddownAmount"))
    ins += ` (Spend Down: ${getVal("spenddownAmount")})`;
  if (getVal("insurance") === "Private Insurance" && getVal("privateInsuranceProvider"))
    ins += ` — Provider: ${getVal("privateInsuranceProvider")}`;
  field("Medical", ins);
  const dentalStr = getVal("dentalInsurance") === "Other"
    ? `Other — ${getVal("dentalOther") || "not specified"}`
    : getVal("dentalInsurance") || "N/A";
  field("Dental", dentalStr);
  line("");

  line("RESIDENCY");
  field("Setting", getVal("residencyType"));
  if (getVal("residenceNotes")) field("Location Notes", getVal("residenceNotes"));
  line("");

  line("LEGAL REPRESENTATIVES / GUARDIANS / CUSTODIANS");
  line(getLegalRepsNarrative());
  line("");

  line("EDUCATION");
  field("School",           getVal("schoolName"));
  field("Education Status", getVal("educationStatus"));
  line("");

  line("EMPLOYMENT");
  let emp = getVal("employmentStatus") || "N/A";
  if (getVal("employmentJob")) emp += ` — ${getVal("employmentJob")}`;
  field("Status", emp);
  line("");

  line("SYSTEM INTEGRATION DATES");
  field("Last Assessment", getVal("lastAssessment") || "N/A");
  field("Last LOC",        getVal("lastLOC")        || "N/A");
  field("RAS/SIS Score",   getVal("rasSisScore")    || "N/A");
  line("");

  // ── Section 2 ──
  head("2. COMMUNICATION — WHAT WE NEED TO KNOW TO SUPPORT THE INDIVIDUAL");
  const usesSign = getVal("commUsesSignLang");
  let signStr = "No";
  if (usesSign === "Yes") {
    const sType  = getVal("commSignLangType");
    const sOther = getVal("commSignLangTypeOther");
    signStr = "Yes — " + (sType === "Other" ? sOther || "Other" : sType);
  } else if (usesSign === "N/A") signStr = "N/A";
  field("Primary Language",   getVal("commPrimaryLanguage"));
  field("Uses Sign Language",  signStr);
  field("Communication Method(s)", getCommMethodsSelected());
  if (getVal("commMethodNotes")) field("Communication Notes", getVal("commMethodNotes"));
  field("Evaluation Needed",  getVal("commEvalNeeded"));
  if (getVal("commEvalWhyNot"))   field("Reason (No Eval)",          getVal("commEvalWhyNot"));
  if (getVal("commEvalBarriers")) field("Communication Barriers",    getVal("commEvalBarriers"));

  t += "Communication Chart: ";
  if (document.getElementById("commChartNA").checked) {
    t += "Not Applicable\n";
  } else {
    const attached = getVal("commChartAttached");
    if (attached) t += `(See Attached: ${attached})\n`;
    else t += "\n";
    t += getCommChartNarrative() + "\n";
  }
  line("");

  // ── Section 3 ──
  head("3. PREFERENCES, LIKES & SPECIAL INTERESTS / DISLIKES");
  line("LIKES:");
  field("Activities / Hobbies",  getVal("likesActivities"));
  field("Favorite Foods",        getVal("likesFoods"));
  field("Favorite Places",       getVal("likesPlaces"));
  if (getVal("likesOther")) field("Other Likes", getVal("likesOther"));
  line("");
  line("DISLIKES:");
  field("Activities / Situations", getVal("dislikesActivities"));
  field("Foods Disliked",          getVal("dislikesFoods"));
  if (getVal("dislikesOther")) field("Other Dislikes", getVal("dislikesOther"));
  line("");

  // ── Section 4 ──
  head("4. IMPORTANT PEOPLE IN THIS INDIVIDUAL'S LIFE");
  line(getImportantPeopleNarrative());
  line("");

  // ── Section 5 ──
  head("5. VISION FOR A GOOD LIFE");
  field("Hopes, Dreams & Aspirations",    getVal("aspirations"));
  field("Former Goals & Progress",        getVal("prevGoals"));
  field("Support Strategies",             getVal("supportNeeded"));
  field("Personal Strengths / Assets",    getVal("strengths"));
  if (getVal("maasTools")) field("Assessment Limitations (MAAS/Vineland/MOCABI)", getVal("maasTools"));
  field("Rituals & Routines",             getVal("ritualsRoutines") || "Not specified");
  field("Religious Supports",             getVal("religiousSupports") || "None identified");
  if (getVal("staffPreference"))    field("Staff Preferences",                 getVal("staffPreference"));
  if (getVal("otherSupport"))       field("Supports (School/Work/Home)",        getVal("otherSupport"));
  field("Learning Style",                 getLearningStylesSelected());
  if (getVal("learningStyleNotes")) field("Learning Notes",                    getVal("learningStyleNotes"));
  if (getVal("culturalDifferences")) field("Cultural Differences",             getVal("culturalDifferences"));
  field("Water Temp Regulation",          getVal("waterTemp"));
  line("");

  // ── Section 6 ──
  head("6. HEALTH, SAFETY & RISK PLANNING");
  line("MEDICAL PROFILE");
  field("Primary / Secondary Diagnosis",  getVal("diagnosis"));
  field("Personal Outcomes",              getVal("personalOutcomes"));
  field("HRST Status",                    getVal("hrstStatus"));
  field("Telehealth",                     getVal("telehealth"));
  if (getVal("medHistory")) field("Medical History / Traumatic Stressors", getVal("medHistory"));
  line("");
  line("PREVENTION & PROVIDERS");
  field("Primary Care Physician (PCP)",   getVal("pcpName"));
  if (getVal("specialists"))    field("Specialists",          getVal("specialists"));
  if (getVal("preventionDiet")) field("Prevention / Screenings", getVal("preventionDiet"));
  line("");
  line("MEDICATIONS & HEALTH PROTOCOLS");
  field("Current Medications",            getVal("medicationDetails"));
  if (getVal("psychotropicProtocol")) field("PRN Psychotropic Protocol", getVal("psychotropicProtocol"));
  field("Self-Administration Status",     getVal("selfAdmin"));
  field("Health Parameters Tracked",      getHealthParamsSelected());
  line("");
  line("KNOWN RISKS & EMERGENCY PLANNING");
  field("Identified Health Risks",        getVal("healthRisks"));
  field("Evacuation / 911 Plan",          getVal("evacPlan"));
  field("DNR / CPR Status",              getVal("dnrStatus"));
  field("Supervision Level",              getVal("supervisionLevel"));
  field("Provider Risk Level",            getVal("riskLevel"));
  field("Behavioral Support",             getVal("behavioralStatus"));
  field("Staff Precaution (OSHA 3148)",   getVal("oshaPrecaution"));
  if (getVal("allergies")) field("Allergies / Sensitivities", getVal("allergies"));
  line("");

  // ── Section 7 ──
  head("7. LEGAL, RIGHTS & SATISFACTION");
  field("Legal Authority",                getLegalRolesSelected());
  if (getVal("limitedGuardianshipDetails")) field("Authority Details", getVal("limitedGuardianshipDetails"));
  field("Rights Brochure Addressed",      getVal("rightsBrochure"));
  field("Consents on File",               getVal("consents"));
  field("Service Satisfaction",           getVal("serviceSatisfaction"));
  field("Conflict of Interest Info",      getVal("conflictInfo"));
  line("");
  t += "Rights Limitations & Due Process: ";
  if (document.getElementById("dueProcessNA").checked) {
    t += "None active.\n";
  } else {
    t += "\n";
    field("  Meeting Invitation",           getVal("dpInvitation"));
    field("  Description of Limitation",    getVal("dpDescription"));
    field("  Less Intrusive Methods Tried", getVal("dpLessIntrusive"));
    field("  Historical Pattern",           getVal("dpHistorical"));
    field("  Teaching & Support Goals",     getVal("dpTeaching"));
    field("  Measurable Lifting Criteria",  getVal("dpLiftingCriteria"));
    field("  Monitoring & Data Collection", getVal("dpMonitoring"));
  }
  line("⚠ To file an anonymous complaint, contact the Office of Constituent Services: 1-800-364-9687");
  line("");

  // ── Section 8 ──
  head("8. CONTRIBUTORS & ADMINISTRATION");
  field("Waiver Type",        getVal("waiverType"));
  field("Plan Effective Date", getVal("planEffectiveDate") || "Not set");
  field("Annual Review Date",  getVal("planReviewDate")    || "Not set");
  field("Plan Contributors",  getVal("contributors"));
  field("Participation",      getVal("participation"));
  field("SC Visit Frequency", getVal("scFrequency"));
  field("Payee / Spending",   getVal("payeeInfo"));
  if (getVal("burialInfo")) field("Burial Info (Placement)", getVal("burialInfo"));
  line("");

  // ── Section 9 ──
  head("9. MEASURABLE OUTCOMES");
  line(getGoalsNarrative());

  document.getElementById("narrativeDisplay").innerText = t;
  updateSectionIndicators();
}

// ─────────────────────────────────────────────
//  INJECT RESOURCE INTO PREVIEW
// ─────────────────────────────────────────────
function injectResource(res) {
  const display = document.getElementById("narrativeDisplay");
  display.innerText += `\n\n[RESOURCE INJECTION]: Collaboration with ${res} integrated.`;
  if (window.innerWidth <= 1024) toggleSidebar();
}

// ─────────────────────────────────────────────
//  RESET / NEW PLAN
// ─────────────────────────────────────────────
function resetForm() {
  if (confirm("Start a new plan? This clears the current workspace.\n\nTip: Save a draft or export a .pcsp file first if you want to keep your current work.")) {
    localStorage.removeItem("pcsp_autosave");
    _hasUnsavedChanges = false;
    location.reload();
  }
}

// ─────────────────────────────────────────────
//  TOAST NOTIFICATION
// ─────────────────────────────────────────────
function showToast(message, type = "info", duration = 3500) {
  const toast     = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), duration);
}

// ─────────────────────────────────────────────
//  COPY TO CLIPBOARD
// ─────────────────────────────────────────────
function copyToClipboard() {
  navigator.clipboard
    .writeText(document.getElementById("narrativeDisplay").innerText)
    .then(() => showToast("✅ Full PCSP Summary copied to clipboard!", "success"))
    .catch(() => showToast("❌ Copy failed. Try again.", "error"));
}

// ─────────────────────────────────────────────
//  PRINT / SAVE PDF
// ─────────────────────────────────────────────
function printPlan() {
  const privacyOn = document.getElementById("privacyToggle").checked;
  if (privacyOn) {
    if (!confirm(
      "⚠️ HIPAA Privacy Mode is ON.\n\nThe printed document will show masked placeholder values ([INDIVIDUAL], [MM/DD/YYYY], etc.).\n\nTurn off Privacy Mode before printing if you want real PHI to appear on the document.\n\nContinue printing with masked values?"
    )) return;
  }
  window.print();
}

// ─────────────────────────────────────────────
//  FILE EXPORT — Save .pcsp file to disk
// ─────────────────────────────────────────────
function exportPCSP() {
  const formData = captureFormData();
  const name     = document.getElementById("clientName").value || "Draft";
  const payload  = {
    app:       APP_NAME,
    version:   APP_VERSION,
    exportedAt: new Date().toISOString(),
    clientName: name,
    confidentiality: "HIPAA Protected Health Information — handle per 45 CFR Parts 160 & 164",
    formData,
    narrative: document.getElementById("narrativeDisplay").innerText,
  };

  const blob     = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const safeDate = new Date().toISOString().slice(0, 10);
  const safeName = name.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);
  const fileName = `PCSP_${safeName}_${safeDate}.pcsp`;

  const a = document.createElement("a");
  a.href  = URL.createObjectURL(blob);
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);

  _hasUnsavedChanges = false;
  showToast(`✅ Exported "${fileName}" — store this file securely per HIPAA policy.`, "success", 5000);
}

// ─────────────────────────────────────────────
//  FILE IMPORT — Open a .pcsp file & auto-fill
// ─────────────────────────────────────────────
function importPCSP(event) {
  const file = event.target.files[0];
  if (!file) return;
  loadFileObject(file, () => { event.target.value = ""; });
}

function loadFileObject(file, onDone) {
  if (!file.name.endsWith(".pcsp") && !file.name.endsWith(".json")) {
    showToast("❌ Invalid file type. Please select a .pcsp file.", "error");
    onDone && onDone();
    return;
  }
  const reader  = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.app || data.app !== APP_NAME) {
        showToast("❌ This file was not created by PCSP Assistant Pro.", "error");
        onDone && onDone();
        return;
      }
      if (!data.formData) {
        showToast("❌ File is missing form data. Cannot restore.", "error");
        onDone && onDone();
        return;
      }
      const label       = data.clientName || "this individual";
      const exportedDate = data.exportedAt ? new Date(data.exportedAt).toLocaleString() : "unknown date";
      const version     = data.version || "1.0";

      if (confirm(`📂 Open plan for "${label}"?\n\nExported: ${exportedDate}\nFile version: ${version}\n\nThis will replace your current workspace. Continue?`)) {
        restoreFormData(data.formData);
        _hasUnsavedChanges = false;
        showToast(`✅ Plan for "${label}" loaded successfully.`, "success", 5000);
      }
    } catch (err) {
      showToast("❌ Failed to read file. It may be corrupt or not a valid .pcsp file.", "error", 5000);
      console.error("PCSP import error:", err);
    }
    onDone && onDone();
  };
  reader.onerror = function () {
    showToast("❌ Could not read file. Please try again.", "error");
    onDone && onDone();
  };
  reader.readAsText(file);
}

// ─────────────────────────────────────────────
//  CAPTURE ALL FORM FIELD VALUES
// ─────────────────────────────────────────────
function captureFormData() {
  const fd = {};
  FORM_FIELDS.forEach((id) => { const el = document.getElementById(id); if (el) fd[id] = el.value; });

  // Checkboxes — serialise as value arrays
  fd._ethnicityChecked = _getCheckedValues("#ethnicityGrid input[type=checkbox]");
  fd._commMethods      = _getCheckedValues("#commMethodGrid input[type=checkbox]");
  fd._learningStyles   = _getCheckedValues("#learningStyleContainer input[type=checkbox]");
  fd._legalRoles       = _getCheckedValues("#legalRolesContainer input[type=checkbox]");
  fd._healthParams     = _getCheckedValues("#healthParamsContainer input[type=checkbox]");

  // Dynamic entries
  fd._legalReps       = captureLegalReps();
  fd._commChartRows   = JSON.parse(JSON.stringify(commChartRows));
  fd._importantPeople = JSON.parse(JSON.stringify(importantPeople));

  // Goals
  fd._goalsData = JSON.parse(JSON.stringify(goalsData));

  // Toggle states
  fd._commChartNA  = document.getElementById("commChartNA").checked;
  fd._dueProcessNA = document.getElementById("dueProcessNA").checked;
  fd._privacyOn    = document.getElementById("privacyToggle").checked;
  fd._commPrimaryLanguageNA = document.getElementById("commPrimaryLanguageNA")?.checked || false;

  return fd;
}

function _getCheckedValues(selector) {
  return Array.from(document.querySelectorAll(selector)).filter((cb) => cb.checked).map((cb) => cb.value);
}

// ─────────────────────────────────────────────
//  RESTORE ALL FORM FIELD VALUES
// ─────────────────────────────────────────────
function restoreFormData(fd) {
  FORM_FIELDS.forEach((id) => {
    const el = document.getElementById(id);
    if (el && fd[id] !== undefined) el.value = fd[id];
  });

  // Checkboxes
  _restoreChecked("#ethnicityGrid input[type=checkbox]",         fd._ethnicityChecked);
  _restoreChecked("#commMethodGrid input[type=checkbox]",        fd._commMethods);
  _restoreChecked("#learningStyleContainer input[type=checkbox]", fd._learningStyles);
  _restoreChecked("#legalRolesContainer input[type=checkbox]",   fd._legalRoles);
  _restoreChecked("#healthParamsContainer input[type=checkbox]", fd._healthParams);

  // Post-restore sync for tag displays
  updateLearningStyles();
  updateLegalRoles();
  updateHealthParams();

  // Dynamic entries
  if (fd._legalReps)       restoreLegalReps(fd._legalReps);
  if (Array.isArray(fd._commChartRows))   { commChartRows   = fd._commChartRows;   renderCommChart(); }
  if (Array.isArray(fd._importantPeople)) { importantPeople = fd._importantPeople; renderImportantPeople(); }
  if (Array.isArray(fd._goalsData))       { goalsData = fd._goalsData; renderGoals(); }

  // Conditional field visibility
  const otherEthChecked = (fd._ethnicityChecked || []).includes("Other Ethnicity");
  document.getElementById("ethnicityOtherGroup").style.display = otherEthChecked ? "" : "none";

  const otherCommChecked = (fd._commMethods || []).includes("Other Communication Method");
  document.getElementById("commMethodOtherGroup").style.display = otherCommChecked ? "" : "none";

  // Toggle states
  const naCb   = document.getElementById("commChartNA");
  const dpNaCb = document.getElementById("dueProcessNA");
  const ptCb   = document.getElementById("privacyToggle");
  const pLangNA = document.getElementById("commPrimaryLanguageNA");
  if (naCb)    { naCb.checked    = !!fd._commChartNA;  toggleCommChartNA(naCb); }
  if (dpNaCb)  { dpNaCb.checked  = !!fd._dueProcessNA; toggleDueProcess(dpNaCb); }
  if (ptCb && fd._privacyOn !== undefined) ptCb.checked = !!fd._privacyOn;
  if (pLangNA) { pLangNA.checked = !!fd._commPrimaryLanguageNA; toggleNAField("commPrimaryLanguage","commPrimaryLanguageNA"); }

  // Re-run all conditional toggles
  toggleReligionOther();
  toggleInsuranceFields();
  toggleDentalOther();
  toggleSignLangType();
  toggleCommEvalFields();
  loadTemplates();
  updateUI();
}

function _restoreChecked(selector, values) {
  if (!Array.isArray(values)) return;
  document.querySelectorAll(selector).forEach((cb) => { cb.checked = values.includes(cb.value); });
}

// ─────────────────────────────────────────────
//  SAVE DRAFT TO LOCALSTORAGE
// ─────────────────────────────────────────────
function purgeExpiredDrafts() {
  const cutoff = Date.now() - (DRAFT_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  let drafts = JSON.parse(localStorage.getItem("pcsp_drafts") || "[]");
  const before = drafts.length;
  drafts = drafts.filter((d) => d.id > cutoff);
  if (drafts.length < before) {
    localStorage.setItem("pcsp_drafts", JSON.stringify(drafts));
    console.info(`PCSP: Purged ${before - drafts.length} expired draft(s) per HIPAA retention policy.`);
  }
  return drafts;
}

function saveToHistory() {
  const drafts = purgeExpiredDrafts();
  const name   = document.getElementById("clientName").value || "Unnamed Draft";
  drafts.unshift({
    id:       Date.now(),
    date:     new Date().toLocaleDateString(),
    title:    name,
    formData: captureFormData(),
    text:     document.getElementById("narrativeDisplay").innerText,
  });
  localStorage.setItem("pcsp_drafts", JSON.stringify(drafts.slice(0, DRAFT_LIMIT)));
  _hasUnsavedChanges = false;
  renderHistory();
  showToast(`✅ Draft saved for "${name}". Reload anytime from Saved Drafts.`, "success", 4000);
}

// ─────────────────────────────────────────────
//  RENDER SAVED DRAFTS LIST
// ─────────────────────────────────────────────
function renderHistory() {
  const drafts = purgeExpiredDrafts();
  const expiryMs = DRAFT_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  document.getElementById("historyList").innerHTML = drafts.length
    ? drafts.map((item) => {
        const daysLeft = Math.ceil((item.id + expiryMs - Date.now()) / 86400000);
        const expiryNote = daysLeft <= 7 ? ` <span style="color:var(--danger);font-size:10px;">Expires in ${daysLeft}d</span>` : "";
        return `
        <div class="history-item" style="display:flex; justify-content:space-between; align-items:center;">
          <div onclick="viewDraft(${item.id})" style="cursor:pointer; flex-grow:1;">
            <span class="history-title">${esc(item.title)}</span>
            <span class="history-date">${item.date}${expiryNote}</span>
          </div>
          <button onclick="exportDraftAsPCSP(${item.id})" title="Export this draft as .pcsp"
            style="background:transparent;border:none;color:var(--gold);cursor:pointer;padding:5px;font-size:14px;">⬇</button>
          <button onclick="deleteDraft(${item.id})" title="Delete Draft"
            style="background:transparent;border:none;color:var(--danger);cursor:pointer;padding:5px;font-size:16px;">✕</button>
        </div>`;
      }).join("")
    : `<p style="font-size:12px;color:var(--text-label);padding:10px;">No saved drafts yet. Fill out the form and click 💾 Save Draft.<br><small style="opacity:0.7">Drafts auto-expire after ${DRAFT_EXPIRY_DAYS} days per HIPAA policy.</small></p>`;
}

function viewDraft(id) {
  const drafts = JSON.parse(localStorage.getItem("pcsp_drafts") || "[]");
  const draft  = drafts.find((d) => d.id === id);
  if (!draft) return;
  if (confirm(`Load draft for "${draft.title}"?\n\nThis will restore all form fields. Your current work will be overwritten.`)) {
    if (draft.formData) restoreFormData(draft.formData);
    else document.getElementById("narrativeDisplay").innerText = draft.text;
    _hasUnsavedChanges = false;
  }
}

function deleteDraft(id) {
  if (confirm("Permanently delete this draft?")) {
    let drafts = JSON.parse(localStorage.getItem("pcsp_drafts") || "[]");
    drafts = drafts.filter((item) => item.id !== id);
    localStorage.setItem("pcsp_drafts", JSON.stringify(drafts));
    renderHistory();
  }
}

// Export a saved draft directly as .pcsp without loading it
function exportDraftAsPCSP(id) {
  const drafts = JSON.parse(localStorage.getItem("pcsp_drafts") || "[]");
  const draft  = drafts.find((d) => d.id === id);
  if (!draft || !draft.formData) { showToast("❌ Draft data not found.", "error"); return; }
  const payload = {
    app:        APP_NAME,
    version:    APP_VERSION,
    exportedAt: new Date().toISOString(),
    clientName: draft.title,
    confidentiality: "HIPAA Protected Health Information — handle per 45 CFR Parts 160 & 164",
    formData:   draft.formData,
    narrative:  draft.text || "",
  };
  const blob     = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const safeDate = new Date(draft.id).toISOString().slice(0, 10);
  const safeName = draft.title.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);
  const a        = document.createElement("a");
  a.href         = URL.createObjectURL(blob);
  a.download     = `PCSP_${safeName}_${safeDate}.pcsp`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
  showToast(`✅ Draft exported as .pcsp file.`, "success");
}

// ─────────────────────────────────────────────
//  BOOT
// ─────────────────────────────────────────────
function init() {
  renderResources();
  renderHistory();
  purgeExpiredDrafts();
  renderLegalReps();
  renderCommChart();
  renderImportantPeople();
  renderGoals();
  toggleCommEvalFields();
  initDragDrop();
  initIdleTimeout();
  checkAutoSaveRestore();
  updateUI();
}

init();
