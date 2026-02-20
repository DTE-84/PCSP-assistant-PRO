// ─────────────────────────────────────────────
//  PCSP Assistant Pro | Marion County DMH
//  app.js — All application logic
// ─────────────────────────────────────────────

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
  {
    name: "Mark Twain Behavioral Health",
    info: "Crisis: (800) 356-5395",
    contact: "Hannibal Office",
  },
  {
    name: "Douglass Community Services",
    info: "Food/Utility Assistance",
    contact: "573-221-3892",
  },
  {
    name: "OATS Transit",
    info: "Transportation Marion Co.",
    contact: "800-269-6287",
  },
  {
    name: "NECAC Marion County",
    info: "Housing & Support",
    contact: "573-221-7166",
  },
];

// ── All form field IDs (used for save/restore) ──
const FORM_FIELDS = [
  "clientName",
  "clientNickname",
  "clientDOB",
  "dmhID",
  "coordinator",
  "officeType",
  "officeLocation",
  "maritalStatus",
  "voterStatus",
  "religion",
  "religionOther",
  "nativeLanguage",
  "otherLanguages",
  "commMethod",
  "insurance",
  "spenddownAmount",
  "privateInsuranceProvider",
  "dentalInsurance",
  "dentalOther",
  "residencyType",
  "schoolName",
  "educationStatus",
  "employmentStatus",
  "employmentJob",
  "ispDate",
  "moediDate",
  "cimorDate",
  "lastAssessment",
  "lastLOC",
  "rasSisScore",
  "aspirations",
  "prevGoals",
  "strengths",
  "techHelpers",
  "relationships",
  "communityResources",
  "learningStyleNotes",
  "diagnosis",
  "personalOutcomes",
  "hrstStatus",
  "telehealth",
  "medHistory",
  "pcpName",
  "specialists",
  "preventionDiet",
  "medicationDetails",
  "psychotropicProtocol",
  "selfAdmin",
  "healthRisks",
  "dnrStatus",
  "riskLevel",
  "supervisionLevel",
  "behavioralStatus",
  "oshaPrecaution",
  "evacPlan",
  "limitedGuardianshipDetails",
  "rightsBrochure",
  "consents",
  "serviceSatisfaction",
  "conflictInfo",
  "contributors",
  "participation",
  "scFrequency",
  "payeeInfo",
  "burialInfo",
  "domain",
  "verb",
  "frequency",
  "goalTemplate",
  "ethnicityOther",
  // Communication Section
  "commPrimaryLanguage",
  "commUsesSignLang",
  "commSignLangType",
  "commSignLangTypeOther",
  "commMethodOther",
  "commMethodNotes",
  "commEvalNeeded",
  "commEvalWhyNot",
  "commEvalBarriers",
  "commChartAttached",
  // Likes & Dislikes
  "likesActivities",
  "likesFoods",
  "likesPlaces",
  "likesOther",
  "dislikesActivities",
  "dislikesFoods",
  "dislikesOther",
  "religiousSupports",
  "learningStyleNotes",
  "supportSection",
  "culturalDifferences",
];

// ── Custom Multi-Select logic ──
function toggleMultiSelect(containerId) {
  const container = document.getElementById(containerId);
  container.classList.toggle("active");

  // Close when clicking outside
  const closeHandler = (e) => {
    if (!container.contains(e.target)) {
      container.classList.remove("active");
      document.removeEventListener("click", closeHandler);
    }
  };
  setTimeout(() => {
    document.addEventListener("click", closeHandler);
  }, 10);
}

function updateLearningStyles() {
  const container = document.getElementById("learningStyleContainer");
  const checkboxes = container.querySelectorAll("input[type=checkbox]");
  const tagContainer = document.getElementById("learningStyleTags");
  const selected = [];

  checkboxes.forEach((cb) => {
    if (cb.checked) selected.push(cb.value);
  });

  if (selected.length === 0) {
    tagContainer.innerHTML = '<span class="placeholder">Select Learning Styles...</span>';
  } else {
    tagContainer.innerHTML = selected
      .map((s) => `<span class="selected-tag">${s}</span>`)
      .join("");
  }
  updateUI();
}

function getLearningStylesSelected() {
  const checkboxes = document.querySelectorAll(
    "#learningStyleContainer input[type=checkbox]",
  );
  const selected = [];
  checkboxes.forEach((cb) => {
    if (cb.checked) selected.push(cb.value);
  });
  return selected.length ? selected.join(", ") : "Not specified";
}

function updateLegalRoles() {
  const container = document.getElementById("legalRolesContainer");
  const checkboxes = container.querySelectorAll("input[type=checkbox]");
  const tagContainer = document.getElementById("legalRolesTags");
  const selected = [];

  checkboxes.forEach((cb) => {
    if (cb.checked) selected.push(cb.value);
  });

  if (selected.length === 0) {
    tagContainer.innerHTML = '<span class="placeholder">Select Authority Roles...</span>';
  } else {
    tagContainer.innerHTML = selected
      .map((s) => `<span class="selected-tag">${s}</span>`)
      .join("");
  }
  updateUI();
}

function getLegalRolesSelected() {
  const checkboxes = document.querySelectorAll(
    "#legalRolesContainer input[type=checkbox]",
  );
  const selected = [];
  checkboxes.forEach((cb) => {
    if (cb.checked) selected.push(cb.value);
  });
  return selected.length ? selected.join(", ") : "Not specified";
}

function updateHealthParams() {
  const container = document.getElementById("healthParamsContainer");
  const checkboxes = container.querySelectorAll("input[type=checkbox]");
  const tagContainer = document.getElementById("healthParamsTags");
  const selected = [];

  checkboxes.forEach((cb) => {
    if (cb.checked) selected.push(cb.value);
  });

  if (selected.length === 0) {
    tagContainer.innerHTML = '<span class="placeholder">Select Parameters...</span>';
  } else {
    tagContainer.innerHTML = selected
      .map((s) => `<span class="selected-tag">${s}</span>`)
      .join("");
  }
  updateUI();
}

function getHealthParamsSelected() {
  const checkboxes = document.querySelectorAll(
    "#healthParamsContainer input[type=checkbox]",
  );
  const selected = [];
  checkboxes.forEach((cb) => {
    if (cb.checked) selected.push(cb.value);
  });
  return selected.length ? selected.join(", ") : "Not specified";
}

// ─────────────────────────────────────────────
//  COMMUNICATION SECTION helpers
// ─────────────────────────────────────────────
function toggleSignLangType() {
  const val = document.getElementById("commUsesSignLang").value;
  document.getElementById("signLangTypeGroup").style.display =
    val === "Yes" ? "" : "none";
  if (val !== "Yes")
    document.getElementById("signLangTypeOtherGroup").style.display = "none";
}
function toggleSignLangTypeOther() {
  const val = document.getElementById("commSignLangType").value;
  document.getElementById("signLangTypeOtherGroup").style.display =
    val === "Other" ? "" : "none";
}
function toggleCommEvalFields() {
  const val = document.getElementById("commEvalNeeded").value;
  document.getElementById("commEvalWhyNotGroup").style.display =
    val === "No — Not Needed" ? "" : "none";
  document.getElementById("commEvalBarriersGroup").style.display =
    val === "Yes — Evaluation(s) Needed" || val === "No — Not Needed"
      ? ""
      : "none";
}
function toggleCommMethodOther(cb) {
  document.getElementById("commMethodOtherGroup").style.display = cb.checked
    ? ""
    : "none";
  updateUI();
}

function toggleCommChartNA(cb) {
  const btn = document.getElementById("addCommRowBtn");
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
  if (cb.checked) {
    field.value = "N/A";
    field.disabled = true;
  } else {
    field.value = "";
    field.disabled = false;
  }
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
    container.innerHTML = `<p style="font-size:12px;color:#999;margin:8px 0 12px;">No communication entries added. Click below to add one.</p>`;
    return;
  }
  container.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:8px;margin-bottom:8px;">
      <div style="font-size:11px;font-weight:700;color:#666;text-transform:uppercase;padding:0 4px;">When / Situation</div>
      <div style="font-size:11px;font-weight:700;color:#666;text-transform:uppercase;padding:0 4px;">What It Means</div>
      <div style="font-size:11px;font-weight:700;color:#666;text-transform:uppercase;padding:0 4px;">How Staff Should Respond</div>
      <div></div>
    </div>
    ${commChartRows
      .map(
        (row, i) => `
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:8px;margin-bottom:8px;align-items:start;">
        <textarea style="min-height:60px;" placeholder="e.g. Pulls on sleeve" oninput="updateCommRow(${i},'situation',this.value)">${row.situation}</textarea>
        <textarea style="min-height:60px;" placeholder="e.g. Needs to use restroom" oninput="updateCommRow(${i},'meaning',this.value)">${row.meaning}</textarea>
        <textarea style="min-height:60px;" placeholder="e.g. Immediately escort to restroom" oninput="updateCommRow(${i},'response',this.value)">${row.response}</textarea>
        <button class="remove-rep-btn" onclick="removeCommChartRow(${i})" title="Remove row" style="margin-top:6px;">✕</button>
      </div>
    `,
      )
      .join("")}
  `;
}

function getCommMethodsSelected() {
  const boxes = document.querySelectorAll(
    "#commMethodGrid input[type=checkbox]",
  );
  const selected = [];
  boxes.forEach((cb) => {
    if (cb.checked) {
      if (cb.value === "Other Communication Method") {
        const other = document.getElementById("commMethodOther")
          ? document.getElementById("commMethodOther").value.trim()
          : "";
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
  return commChartRows
    .map(
      (row, i) =>
        `  Entry ${i + 1}: "${row.situation || "N/A"}" -> Meaning: "${row.meaning || "N/A"}" -> Staff Response: "${row.response || "N/A"}"`,
    )
    .join("\n");
}

// ─────────────────────────────────────────────
//  IMPORTANT PEOPLE — Dynamic multi-entry
// ─────────────────────────────────────────────
let importantPeople = [];

function addImportantPerson() {
  importantPeople.push({
    name: "",
    relationship: "",
    activities: [{ what: "", frequency: "" }],
  });
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
  if (headers[personIdx]) {
    const p = importantPeople[personIdx];
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
    container.innerHTML = `<p style="font-size:12px;color:#999;margin:8px 0 12px;">No people added yet. Click below to add someone important to this individual.</p>`;
    return;
  }
  container.innerHTML = importantPeople
    .map(
      (person, i) => `
    <div class="legal-rep-card" style="margin-bottom:16px;">
      <div class="rep-header">
        <span class="rep-title person-header-title">Person #${i + 1}${person.name ? " \u2014 " + person.name : ""}${person.relationship ? " (" + person.relationship + ")" : ""}</span>
        <button class="remove-rep-btn" onclick="removeImportantPerson(${i})" title="Remove">&#10005;</button>
      </div>
      <div class="form-grid" style="margin-bottom:12px;">
        <div class="field-group">
          <label>Name</label>
          <input type="text" value="${person.name}" placeholder="e.g. Mary Smith"
            oninput="updatePerson(${i},'name',this.value)" />
        </div>
        <div class="field-group half">
          <label>Relationship to Individual</label>
          <input type="text" value="${person.relationship}" placeholder="e.g. Mother, Brother, Friend, Staff"
            oninput="updatePerson(${i},'relationship',this.value)" />
        </div>
      </div>
      <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:var(--gold);margin-bottom:8px;">Activities Together</div>
      <div style="display:grid;grid-template-columns:1fr 200px auto;gap:8px;margin-bottom:6px;">
        <div style="font-size:11px;font-weight:700;color:#666;text-transform:uppercase;">What They Like to Do Together</div>
        <div style="font-size:11px;font-weight:700;color:#666;text-transform:uppercase;">How Often</div>
        <div></div>
      </div>
      ${person.activities
        .map(
          (act, j) => `
        <div style="display:grid;grid-template-columns:1fr 200px auto;gap:8px;margin-bottom:8px;align-items:center;">
          <input type="text" value="${act.what}" placeholder="e.g. Going to church, watching movies, fishing..."
            oninput="updatePersonActivity(${i},${j},'what',this.value)" />
          <input type="text" value="${act.frequency}" placeholder="e.g. Weekly, Monthly, Daily"
            oninput="updatePersonActivity(${i},${j},'frequency',this.value)" />
          <button class="remove-rep-btn" onclick="removePersonActivity(${i},${j})" title="Remove activity"
            ${person.activities.length === 1 ? 'style="opacity:0.3;pointer-events:none;"' : ""}>&#10005;</button>
        </div>
      `,
        )
        .join("")}
      <button class="btn btn-outline" type="button" onclick="addPersonActivity(${i})"
        style="font-size:12px;padding:6px 14px;margin-top:4px;">+ Add Another Activity</button>
    </div>
  `,
    )
    .join("");
}

function getImportantPeopleNarrative() {
  if (!importantPeople.length)
    return "No important people documented at this time.";
  return importantPeople
    .map((p, i) => {
      const name = p.name || `[Person ${i + 1}]`;
      const rel = p.relationship || "Relationship not specified";
      const acts = p.activities
        .filter((a) => a.what)
        .map((a) => `${a.what}${a.frequency ? " (" + a.frequency + ")" : ""}`)
        .join("; ");
      return `  ${name} (${rel}): ${acts || "No activities listed"}`;
    })
    .join("\n");
}

// ── Initialise App ──
function init() {
  renderResources();
  renderHistory();
  loadTemplates();
  renderLegalReps();
  renderCommChart();
  renderImportantPeople();
  toggleCommEvalFields();
}

// ── Religion "Other" toggle ──
function toggleReligionOther() {
  const val = document.getElementById("religion").value;
  document.getElementById("religionOtherGroup").style.display =
    val === "Other" ? "" : "none";
  updateUI();
}

// ── Ethnicity "Other" toggle ──
function toggleEthnicityOther(cb) {
  document.getElementById("ethnicityOtherGroup").style.display = cb.checked
    ? ""
    : "none";
  updateUI();
}

// ── Insurance conditional fields ──
function toggleInsuranceFields() {
  const val = document.getElementById("insurance").value;
  document.getElementById("spenddownGroup").style.display =
    val === "Medicaid — Spend Down" ? "" : "none";
  document.getElementById("privateInsuranceGroup").style.display =
    val === "Private Insurance" ? "" : "none";
  updateUI();
}

// ── Dental "Other" toggle ──
function toggleDentalOther() {
  const val = document.getElementById("dentalInsurance").value;
  document.getElementById("dentalOtherGroup").style.display =
    val === "Other" ? "" : "none";
  updateUI();
}

// ── Get selected ethnicities ──
function getEthnicities() {
  const boxes = document.querySelectorAll(
    "#ethnicityGrid input[type=checkbox]",
  );
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
//  LEGAL REPRESENTATIVES — Dynamic multi-entry
// ─────────────────────────────────────────────
let legalReps = [];

function renderLegalReps() {
  const container = document.getElementById("legalRepsContainer");
  if (!legalReps.length) {
    container.innerHTML = `<p style="font-size:12px;color:#999;margin:8px 0 12px;">No legal representatives added. Click below to add one.</p>`;
    return;
  }
  container.innerHTML = legalReps
    .map(
      (rep, i) => `
    <div class="legal-rep-card">
      <div class="rep-header">
        <span class="rep-title">Representative #${i + 1}${rep.name ? " — " + rep.name : ""}</span>
        <button class="remove-rep-btn" onclick="removeLegalRep(${i})" title="Remove">✕</button>
      </div>
      <div class="form-grid">
        <div class="field-group">
          <label>Full Name</label>
          <input type="text" value="${rep.name || ""}" placeholder="Jane Doe"
            oninput="updateRep(${i},'name',this.value)" />
        </div>
        <div class="field-group">
          <label>Relationship to Individual</label>
          <input type="text" value="${rep.relationship || ""}" placeholder="e.g. Mother, Brother, Court Appointee"
            oninput="updateRep(${i},'relationship',this.value)" />
        </div>
        <div class="field-group">
          <label>Type of Legal Authority</label>
          <select onchange="updateRep(${i},'legalType',this.value)">
            <option value="Full Guardianship" ${rep.legalType === "Full Guardianship" ? "selected" : ""}>Full Guardianship</option>
            <option value="Limited Guardianship" ${rep.legalType === "Limited Guardianship" ? "selected" : ""}>Limited Guardianship</option>
            <option value="Conservatorship" ${rep.legalType === "Conservatorship" ? "selected" : ""}>Conservatorship</option>
            <option value="Power of Attorney (POA)" ${rep.legalType === "Power of Attorney (POA)" ? "selected" : ""}>Power of Attorney (POA)</option>
            <option value="Healthcare POA" ${rep.legalType === "Healthcare POA" ? "selected" : ""}>Healthcare POA</option>
            <option value="Custodian" ${rep.legalType === "Custodian" ? "selected" : ""}>Custodian</option>
            <option value="Legal / Physical Custody" ${rep.legalType === "Legal / Physical Custody" ? "selected" : ""}>Legal / Physical Custody</option>
            <option value="Representative Payee" ${rep.legalType === "Representative Payee" ? "selected" : ""}>Representative Payee</option>
            <option value="Natural / Informal Support" ${rep.legalType === "Natural / Informal Support" ? "selected" : ""}>Natural / Informal Support (No Legal Authority)</option>
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
          <input type="text" value="${rep.phone || ""}" placeholder="(573) 555-0100"
            oninput="updateRep(${i},'phone',this.value)" />
        </div>
        <div class="field-group half">
          <label>Address (if different residence)</label>
          <input type="text" value="${rep.address || ""}" placeholder="123 Main St, Hannibal MO 63401"
            oninput="updateRep(${i},'address',this.value)" />
        </div>
      </div>
    </div>
  `,
    )
    .join("");
}

function addLegalRep() {
  legalReps.push({
    name: "",
    relationship: "",
    legalType: "Full Guardianship",
    livesWith: "Yes",
    phone: "",
    address: "",
  });
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
  // Re-render header title only, not full re-render (avoid losing focus)
  const titles = document.querySelectorAll(".rep-title");
  if (titles[i]) {
    titles[i].textContent =
      `Representative #${i + 1}${legalReps[i].name ? " — " + legalReps[i].name : ""}`;
  }
  updateUI();
}

function getLegalRepsNarrative() {
  if (!legalReps.length) return "None on file.";
  return legalReps
    .map(
      (rep, i) =>
        `  Rep #${i + 1}: ${rep.name || "[Name not provided]"} | ${rep.legalType} | Relationship: ${rep.relationship || "N/A"} | Lives with individual: ${rep.livesWith} | Phone: ${rep.phone || "N/A"}${rep.address && rep.livesWith !== "Yes" ? " | Address: " + rep.address : ""}`,
    )
    .join("\n");
}

// Save / restore legalReps with form data
function captureLegalReps() {
  return JSON.parse(JSON.stringify(legalReps));
}
function restoreLegalReps(data) {
  legalReps = Array.isArray(data) ? data : [];
  renderLegalReps();
}

// ── Sidebar Toggle ──
function toggleSidebar() {
  const container = document.getElementById("appContainer");
  if (window.innerWidth <= 1024) {
    document.body.classList.toggle("sidebar-active");
  } else {
    container.classList.toggle("sidebar-collapsed");
  }
}

// ── Render Resource Cards ──
function renderResources() {
  document.getElementById("resourceList").innerHTML = resources
    .map(
      (res) => `
      <div class="resource-card" onclick="injectResource('${res.name}')">
        <span class="resource-name">${res.name}</span>
        <span class="resource-info">${res.info} | ${res.contact}</span>
      </div>
    `,
    )
    .join("");
}

// ── Load Goal Templates ──
function loadTemplates() {
  const d = document.getElementById("domain").value;
  const selector = document.getElementById("goalTemplate");
  selector.innerHTML = d
    ? data[d].map((item) => `<option value="${item}">${item}</option>`).join("")
    : "<option>-- Select Domain First --</option>";
  updateUI();
}

// ── Update Individual Header & Narrative Preview ──
function updateUI() {
  const isPrivacyOn = document.getElementById("privacyToggle").checked;
  const getVal = (id) => document.getElementById(id).value;

  const name = getVal("clientName") || "";
  const nickname = getVal("clientNickname") || "";
  const dob = getVal("clientDOB") || "";
  const dmhID = getVal("dmhID") || "";

  // Update sticky header
  const displayHeaderName = name
    ? nickname
      ? `${name} ("${nickname}")`
      : name
    : "No Individual Selected";
  document.getElementById("headerName").textContent = displayHeaderName;
  document.getElementById("headerDOB").textContent = dob
    ? new Date(dob + "T00:00:00").toLocaleDateString()
    : "—";
  document.getElementById("headerDMH").textContent = dmhID || "—";

  // Privacy masking for the preview
  const displayName = isPrivacyOn
    ? "[INDIVIDUAL]"
    : name
      ? nickname
        ? `${name} ("${nickname}")`
        : name
      : "[NAME]";
  const displayDOB = isPrivacyOn
    ? "[MM/DD/YYYY]"
    : dob
      ? new Date(dob + "T00:00:00").toLocaleDateString()
      : "N/A";
  const displayDMH = isPrivacyOn ? "[XXXXXXX]" : dmhID || "N/A";

  // Build narrative text
  let text = `MISSOURI PERSON CENTERED SERVICE PLAN (PCSP) SUMMARY\n`;
  text += `=====================================================\n\n`;

  text += `1. DEMOGRAPHICS / CONTRIBUTORS INFORMATION / LEGAL DEMOGRAPHICS\n`;
  text += `─────────────────────────────────────────────────────────────────\n\n`;

  text += `IDENTITY\n`;
  text += `Name: ${displayName} | DOB: ${displayDOB} | DMH ID: ${displayDMH}\n`;
  text += `TCM Agency: ${getVal("coordinator") || "N/A"} | Office Type: ${getVal("officeType") || "N/A"} (${getVal("officeLocation") || "Location not specified"})\n`;
  text += `Marital Status: ${getVal("maritalStatus") || "N/A"} | Voter Status: ${getVal("voterStatus") || "N/A"}\n`;
  const religionVal =
    getVal("religion") === "Other"
      ? `Other — ${getVal("religionOther") || "not specified"}`
      : getVal("religion") || "N/A";
  text += `Religion: ${religionVal}\n`;
  text += `Ethnicity / Race: ${getEthnicities()}\n\n`;

  text += `COMMUNICATION & LANGUAGE\n`;
  text += `Native Language: ${getVal("nativeLanguage") || "N/A"} | Additional Languages: ${getVal("otherLanguages") || "None"}\n`;
  text += `Primary Communication Method: ${getVal("commMethod") || "N/A"}\n\n`;

  text += `INSURANCE & BENEFITS\n`;
  let insuranceStr = getVal("insurance") || "N/A";
  if (
    getVal("insurance") === "Medicaid — Spend Down" &&
    getVal("spenddownAmount")
  )
    insuranceStr += ` (Spend Down: ${getVal("spenddownAmount")})`;
  if (
    getVal("insurance") === "Private Insurance" &&
    getVal("privateInsuranceProvider")
  )
    insuranceStr += ` — Provider: ${getVal("privateInsuranceProvider")}`;
  text += `Medical: ${insuranceStr}\n`;
  const dentalStr =
    getVal("dentalInsurance") === "Other"
      ? `Other — ${getVal("dentalOther") || "not specified"}`
      : getVal("dentalInsurance") || "N/A";
  text += `Dental: ${dentalStr}\n\n`;

  text += `RESIDENCY\n`;
  text += `Setting: ${getVal("residencyType") || "N/A"}\n`;
  if (getVal("residenceNotes"))
    text += `Location Notes: ${getVal("residenceNotes")}\n`;
  text += `\n`;

  text += `LEGAL REPRESENTATIVES / GUARDIANS / CUSTODIANS\n`;
  text += getLegalRepsNarrative() + `\n\n`;

  text += `EDUCATION\n`;
  text += `School: ${getVal("schoolName") || "N/A"} | Status: ${getVal("educationStatus") || "N/A"}`;
  text += `\n\n`;

  text += `EMPLOYMENT\n`;
  text += `Status: ${getVal("employmentStatus") || "N/A"}`;
  if (getVal("employmentJob")) text += ` — ${getVal("employmentJob")}`;
  text += `\n\n`;

  text += `SYSTEM INTEGRATION\n`;
  text += `Implementation Date: ${getVal("ispDate") || "N/A"} | Coordinator: ${getVal("coordinator") || "N/A"}\n`;
  text += `System Updates: MOEDIWEB (${getVal("moediDate") || "N/A"}), CIMOR (${getVal("cimorDate") || "N/A"})\n`;
  text += `Assessments: Last Eval (${getVal("lastAssessment") || "N/A"}), Last LOC (${getVal("lastLOC") || "N/A"}), RAS/SIS Score (${getVal("rasSisScore") || "N/A"})\n\n`;

  text += `2. COMMUNICATION — WHAT WE NEED TO KNOW TO SUPPORT THE INDIVIDUAL\n`;
  text += `───────────────────────────────────────────────────────────────────\n\n`;
  const primLang = document.getElementById("commPrimaryLanguage")
    ? document.getElementById("commPrimaryLanguage").value || "N/A"
    : "N/A";
  const usesSign = document.getElementById("commUsesSignLang")
    ? document.getElementById("commUsesSignLang").value
    : "No";
  let signLangStr = "No";
  if (usesSign === "Yes") {
    const signType = document.getElementById("commSignLangType")
      ? document.getElementById("commSignLangType").value
      : "";
    const signOther = document.getElementById("commSignLangTypeOther")
      ? document.getElementById("commSignLangTypeOther").value
      : "";
    signLangStr =
      "Yes — " + (signType === "Other" ? signOther || "Other" : signType);
  } else if (usesSign === "N/A") {
    signLangStr = "N/A";
  }
  text += `Primary Language: ${primLang} | Uses Sign Language: ${signLangStr}\n`;
  text += `Communication Method(s): ${getCommMethodsSelected()}\n`;
  const commNotes = document.getElementById("commMethodNotes")
    ? document.getElementById("commMethodNotes").value
    : "";
  if (commNotes) text += `Communication Notes: ${commNotes}\n`;
  const evalNeeded = document.getElementById("commEvalNeeded")
    ? document.getElementById("commEvalNeeded").value
    : "N/A";
  text += `Evaluation Needed: ${evalNeeded}\n`;
  const whyNot = document.getElementById("commEvalWhyNot")
    ? document.getElementById("commEvalWhyNot").value
    : "";
  const barriers = document.getElementById("commEvalBarriers")
    ? document.getElementById("commEvalBarriers").value
    : "";
  if (whyNot) text += `Reason (No Eval): ${whyNot}\n`;
  if (barriers) text += `Communication Barriers: ${barriers}\n`;
  
  text += `Communication Chart: `;
  if (document.getElementById("commChartNA").checked) {
    text += `Not Applicable\n`;
  } else {
    const attached = getVal("commChartAttached");
    if (attached) text += `(See Attached: ${attached})\n`;
    else text += `\n`;
    text += getCommChartNarrative() + `\n`;
  }
  text += `\n`;

  text += `3. LIKES & DISLIKES\n`;
  text += `───────────────────────────────────────────────────────────────────\n\n`;
  const likesActivities = document.getElementById("likesActivities")
    ? document.getElementById("likesActivities").value
    : "";
  const likesFoods = document.getElementById("likesFoods")
    ? document.getElementById("likesFoods").value
    : "";
  const likesPlaces = document.getElementById("likesPlaces")
    ? document.getElementById("likesPlaces").value
    : "";
  const likesOther = document.getElementById("likesOther")
    ? document.getElementById("likesOther").value
    : "";
  text += `LIKES:\nActivities/Hobbies: ${likesActivities || "N/A"}\n`;
  text += `Favorite Foods: ${likesFoods || "N/A"}\n`;
  text += `Favorite Places: ${likesPlaces || "N/A"}\n`;
  if (likesOther) text += `Other Likes: ${likesOther}\n`;
  const dislikesActivities = document.getElementById("dislikesActivities")
    ? document.getElementById("dislikesActivities").value
    : "";
  const dislikesFoods = document.getElementById("dislikesFoods")
    ? document.getElementById("dislikesFoods").value
    : "";
  const dislikesOther = document.getElementById("dislikesOther")
    ? document.getElementById("dislikesOther").value
    : "";
  text += `\nDISLIKES:\nActivities/Situations: ${dislikesActivities || "N/A"}\n`;
  text += `Foods Disliked: ${dislikesFoods || "N/A"}\n`;
  if (dislikesOther) text += `Other Dislikes: ${dislikesOther}\n`;
  text += `\n`;

  text += `4. IMPORTANT PEOPLE IN THIS INDIVIDUAL'S LIFE\n`;
  text += `───────────────────────────────────────────────────────────────────\n\n`;
  text += getImportantPeopleNarrative() + `\n\n`;

  text += `5. VISION FOR A GOOD LIFE\n`;
  text += `Personal Aspirations: ${getVal("aspirations") || "See personal vision statement."}\n`;
  text += `Previous Goals Progress: ${getVal("prevGoals") || "N/A"}\n`;
  text += `Strengths/Assets: ${getVal("strengths") || "N/A"}\n`;
  text += `Technology/Support: Tech (${getVal("techHelpers") || "None"}), Relationships (${getVal("relationships") || "None"})\n`;
  text += `Community Resources: ${getVal("communityResources") || "N/A"}\n`;
  text += `Learning Style: ${getLearningStylesSelected()}\n`;
  if (getVal("learningStyleNotes")) text += `Learning Notes: ${getVal("learningStyleNotes")}\n`;
  text += `\n`;

  text += `6. HEALTH, SAFETY & RISK\n`;
  text += `Diagnosis: ${getVal("diagnosis") || "N/A"}\n`;
  text += `Personal Outcomes: ${getVal("personalOutcomes") || "N/A"}\n`;
  text += `HRST Status: ${getVal("hrstStatus")} | Telehealth: ${getVal("telehealth")}\n`;
  if (getVal("medHistory")) text += `Medical History/Stressors: ${getVal("medHistory")}\n`;
  text += `PCP: ${getVal("pcpName") || "N/A"} | Specialists: ${getVal("specialists") || "None listed"}\n`;
  if (getVal("preventionDiet")) text += `Prevention/Screenings: ${getVal("preventionDiet")}\n`;
  text += `Medications: ${getVal("medicationDetails") || "N/A"}\n`;
  if (getVal("psychotropicProtocol")) text += `PRN Psychotropic Protocol: ${getVal("psychotropicProtocol")}\n`;
  text += `Self-Admin Status: ${getVal("selfAdmin")} | Parameters Tracked: ${getHealthParamsSelected()}\n`;
  text += `Health Risks: ${getVal("healthRisks") || "N/A"}\n`;
  text += `DNR/CPR Status: ${getVal("dnrStatus")} | Supervision: ${getVal("supervisionLevel")}\n`;
  text += `Risk Level: ${getVal("riskLevel")} | Behavioral: ${getVal("behavioralStatus")}\n`;
  text += `OSHA: ${getVal("oshaPrecaution")} | Evacuation: ${getVal("evacPlan") || "N/A"}\n`;
  if (getVal("allergies")) text += `Allergies/Sensitivities: ${getVal("allergies")}\n`;
  text += `\n`;

  text += `7. LEGAL, RIGHTS & SATISFACTION\n`;
  text += `Authority: ${getLegalRolesSelected()}\n`;
  const legalDetails = getVal("limitedGuardianshipDetails");
  if (legalDetails) text += `Authority Details: ${legalDetails}\n`;
  text += `Rights Brochure: ${getVal("rightsBrochure")} | Consents: ${getVal("consents")}\n`;
  text += `Service Satisfaction: ${getVal("serviceSatisfaction") || "N/A"}\n`;
  text += `Conflict of Interest Info: ${getVal("conflictInfo")}\n`;
  text += `Note: To file an anonymous complaint, contact the Office of Constituent Services at 1-800-364-9687.\n\n`;

  text += `8. CONTRIBUTORS & ADMINISTRATION\n`;
  text += `Contributors: ${getVal("contributors") || "N/A"}\n`;
  text += `Participation: ${getVal("participation") || "N/A"}\n`;
  text += `SC Monitoring: ${getVal("scFrequency") || "N/A"}\n`;
  text += `Payee/Spending: ${getVal("payeeInfo") || "N/A"} | Burial: ${getVal("burialInfo") || "N/A"}\n\n`;

  text += `9. MEASURABLE OUTCOMES\n`;
  if (getVal("domain")) {
    text += `The individual will receive ${getVal("verb")} ${getVal("goalTemplate")}.\n`;
    text += `Frequency: ${getVal("frequency") || "[FREQUENCY]"} | Monitoring: SC Quarterly & Provider Monthly.`;
  } else {
    text += `(Outcome narrative pending domain selection)`;
  }

  document.getElementById("narrativeDisplay").innerText = text;
}

// ── Inject Resource into Preview ──
function injectResource(res) {
  const display = document.getElementById("narrativeDisplay");
  display.innerText += `\n\n[RESOURCE INJECTION]: Collaboration with ${res} integrated.`;
  if (window.innerWidth <= 1024) toggleSidebar();
}

// ── Reset / New Plan ──
function resetForm() {
  if (confirm("Start a new plan? This clears the current workspace.")) {
    location.reload();
  }
}

// ── Toast Notification ──
function showToast(message, type = "info", duration = 3500) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}

// ── Copy to Clipboard ──
function copyToClipboard() {
  navigator.clipboard
    .writeText(document.getElementById("narrativeDisplay").innerText)
    .then(() =>
      showToast("✅ Full PCSP Summary copied to clipboard!", "success"),
    )
    .catch(() => showToast("❌ Copy failed. Try again.", "error"));
}

// ── Print / Save PDF ──
function printPlan() {
  // Ensure privacy mode is OFF so real data prints (with confirmation)
  const privacyOn = document.getElementById("privacyToggle").checked;
  if (privacyOn) {
    if (
      !confirm(
        "⚠️ HIPAA Privacy Mode is ON — the printed document will show masked placeholder values.\n\nTurn off Privacy Mode before printing if you want real data to appear.\n\nContinue printing anyway?",
      )
    ) {
      return;
    }
  }
  window.print();
}

// ─────────────────────────────────────────────
//  FILE EXPORT — Save .pcsp file to disk
// ─────────────────────────────────────────────
function exportPCSP() {
  const formData = captureFormData();
  const name = document.getElementById("clientName").value || "Draft";
  const exportObj = {
    app: "PCSP Assistant Pro",
    version: "1.0",
    exportedAt: new Date().toISOString(),
    clientName: name,
    formData: formData,
    narrative: document.getElementById("narrativeDisplay").innerText,
  };

  const blob = new Blob([JSON.stringify(exportObj, null, 2)], {
    type: "application/json",
  });

  // Build a safe filename: "PCSP_JohnDoe_2025-06-01.pcsp"
  const safeDate = new Date().toISOString().slice(0, 10);
  const safeName = name.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);
  const fileName = `PCSP_${safeName}_${safeDate}.pcsp`;

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);

  showToast(
    `✅ Exported "${fileName}" — share or store this file securely.`,
    "success",
    5000,
  );
}

// ─────────────────────────────────────────────
//  FILE IMPORT — Open a .pcsp file & auto-fill
// ─────────────────────────────────────────────
function importPCSP(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Validate extension
  if (!file.name.endsWith(".pcsp") && !file.name.endsWith(".json")) {
    showToast("❌ Invalid file type. Please select a .pcsp file.", "error");
    event.target.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);

      // Basic integrity check
      if (!data.app || data.app !== "PCSP Assistant Pro") {
        showToast(
          "❌ This file was not created by PCSP Assistant Pro.",
          "error",
        );
        return;
      }
      if (!data.formData) {
        showToast("❌ File is missing form data. Cannot restore.", "error");
        return;
      }

      const clientLabel = data.clientName || "this individual";
      const exportedDate = data.exportedAt
        ? new Date(data.exportedAt).toLocaleString()
        : "unknown date";

      if (
        confirm(
          `📂 Open plan for "${clientLabel}"?\n\nExported: ${exportedDate}\n\nThis will replace your current workspace. Continue?`,
        )
      ) {
        restoreFormData(data.formData);
        showToast(
          `✅ Plan for "${clientLabel}" loaded successfully.`,
          "success",
          5000,
        );
      }
    } catch (err) {
      showToast(
        "❌ Failed to read file. It may be corrupt or not a valid .pcsp file.",
        "error",
        5000,
      );
      console.error("PCSP import error:", err);
    }
    // Reset file input so the same file can be re-opened if needed
    event.target.value = "";
  };
  reader.onerror = function () {
    showToast("❌ Could not read file. Please try again.", "error");
    event.target.value = "";
  };
  reader.readAsText(file);
}

// ── Capture All Form Field Values ──
function captureFormData() {
  const formData = {};
  FORM_FIELDS.forEach((id) => {
    const el = document.getElementById(id);
    if (el) formData[id] = el.value;
  });
  // Capture ethnicity checkboxes
  const boxes = document.querySelectorAll(
    "#ethnicityGrid input[type=checkbox]",
  );
  formData._ethnicityChecked = Array.from(boxes)
    .filter((cb) => cb.checked)
    .map((cb) => cb.value);
  // Capture legal reps
  formData._legalReps = captureLegalReps();
  // Capture communication method checkboxes
  const commBoxes = document.querySelectorAll(
    "#commMethodGrid input[type=checkbox]",
  );
  formData._commMethods = Array.from(commBoxes)
    .filter((cb) => cb.checked)
    .map((cb) => cb.value);
  // Capture learning styles
  const lsBoxes = document.querySelectorAll(
    "#learningStyleContainer input[type=checkbox]",
  );
  formData._learningStyles = Array.from(lsBoxes)
    .filter((cb) => cb.checked)
    .map((cb) => cb.value);
  // Capture legal roles
  const lrBoxes = document.querySelectorAll(
    "#legalRolesContainer input[type=checkbox]",
  );
  formData._legalRoles = Array.from(lrBoxes)
    .filter((cb) => cb.checked)
    .map((cb) => cb.value);
  // Capture health params
  const hpBoxes = document.querySelectorAll(
    "#healthParamsContainer input[type=checkbox]",
  );
  formData._healthParams = Array.from(hpBoxes)
    .filter((cb) => cb.checked)
    .map((cb) => cb.value);
  // Capture comm chart rows and important people
  formData._commChartRows = JSON.parse(JSON.stringify(commChartRows));
  formData._importantPeople = JSON.parse(JSON.stringify(importantPeople));
  formData._commChartNA = document.getElementById("commChartNA").checked;
  return formData;
}

// ── Restore All Form Field Values from Saved Data ──
function restoreFormData(formData) {
  FORM_FIELDS.forEach((id) => {
    const el = document.getElementById(id);
    if (el && formData[id] !== undefined) {
      el.value = formData[id];
    }
  });
  // Restore ethnicity checkboxes
  if (Array.isArray(formData._ethnicityChecked)) {
    const boxes = document.querySelectorAll(
      "#ethnicityGrid input[type=checkbox]",
    );
    boxes.forEach((cb) => {
      cb.checked = formData._ethnicityChecked.includes(cb.value);
    });
    const otherChecked = formData._ethnicityChecked.includes("Other Ethnicity");
    document.getElementById("ethnicityOtherGroup").style.display = otherChecked
      ? ""
      : "none";
  }
  // Restore legal reps
  if (formData._legalReps) restoreLegalReps(formData._legalReps);
  // Restore communication method checkboxes
  if (Array.isArray(formData._commMethods)) {
    const commBoxes = document.querySelectorAll(
      "#commMethodGrid input[type=checkbox]",
    );
    commBoxes.forEach((cb) => {
      cb.checked = formData._commMethods.includes(cb.value);
    });
    const otherCb = Array.from(commBoxes).find(
      (cb) => cb.value === "Other Communication Method",
    );
    if (otherCb)
      document.getElementById("commMethodOtherGroup").style.display =
        otherCb.checked ? "" : "none";
  }
  // Restore learning styles checkboxes
  if (Array.isArray(formData._learningStyles)) {
    const lsBoxes = document.querySelectorAll(
      "#learningStyleContainer input[type=checkbox]",
    );
    lsBoxes.forEach((cb) => {
      cb.checked = formData._learningStyles.includes(cb.value);
    });
    updateLearningStyles();
  }
  // Restore legal roles checkboxes
  if (Array.isArray(formData._legalRoles)) {
    const lrBoxes = document.querySelectorAll(
      "#legalRolesContainer input[type=checkbox]",
    );
    lrBoxes.forEach((cb) => {
      cb.checked = formData._legalRoles.includes(cb.value);
    });
    updateLegalRoles();
  }
  // Restore health params checkboxes
  if (Array.isArray(formData._healthParams)) {
    const hpBoxes = document.querySelectorAll(
      "#healthParamsContainer input[type=checkbox]",
    );
    hpBoxes.forEach((cb) => {
      cb.checked = formData._healthParams.includes(cb.value);
    });
    updateHealthParams();
  }
  // Restore comm chart and important people
  if (Array.isArray(formData._commChartRows)) {
    commChartRows = formData._commChartRows;
    renderCommChart();
  }
  if (Array.isArray(formData._importantPeople)) {
    importantPeople = formData._importantPeople;
    renderImportantPeople();
  }
  // Restore comm chart N/A state
  const naCb = document.getElementById("commChartNA");
  if (naCb) {
    naCb.checked = !!formData._commChartNA;
    toggleCommChartNA(naCb);
  }
  // Re-run toggles so conditional fields show/hide correctly
  toggleReligionOther();
  toggleInsuranceFields();
  toggleDentalOther();
  toggleSignLangType();
  toggleCommEvalFields();
  loadTemplates();
  updateUI();
}

// ── Save Draft to localStorage ──
function saveToHistory() {
  const history = JSON.parse(localStorage.getItem("pcsp_drafts") || "[]");
  const name = document.getElementById("clientName").value || "Unnamed Draft";
  history.unshift({
    id: Date.now(),
    date: new Date().toLocaleDateString(),
    title: name,
    formData: captureFormData(),
    text: document.getElementById("narrativeDisplay").innerText,
  });
  localStorage.setItem("pcsp_drafts", JSON.stringify(history.slice(0, 10)));
  renderHistory();
  showToast(
    `✅ Draft saved for "${name}". Reload anytime from Saved Drafts.`,
    "success",
    4000,
  );
}

// ── Render Saved Drafts List ──
function renderHistory() {
  const history = JSON.parse(localStorage.getItem("pcsp_drafts") || "[]");
  document.getElementById("historyList").innerHTML = history.length
    ? history
        .map(
          (item) => `
        <div class="history-item" style="display:flex; justify-content:space-between; align-items:center;">
          <div onclick="viewDraft(${item.id})" style="cursor:pointer; flex-grow:1;">
            <span class="history-title">${item.title}</span>
            <span class="history-date">${item.date}</span>
          </div>
          <button onclick="deleteDraft(${item.id})"
            style="background:transparent; border:none; color:var(--danger); cursor:pointer; padding:5px; font-size:16px;"
            title="Delete Draft">✕</button>
        </div>
      `,
        )
        .join("")
    : `<p style="font-size:12px; color:#999; padding:10px;">No saved drafts yet. Fill out the form and click 💾 Save Draft.</p>`;
}

// ── Load a Saved Draft ──
function viewDraft(id) {
  const history = JSON.parse(localStorage.getItem("pcsp_drafts") || "[]");
  const draft = history.find((d) => d.id === id);
  if (draft) {
    if (
      confirm(
        `Load draft for "${draft.title}"?\n\nThis will restore all form fields. Your current work will be overwritten.`,
      )
    ) {
      if (draft.formData) {
        restoreFormData(draft.formData);
      } else {
        document.getElementById("narrativeDisplay").innerText = draft.text;
      }
    }
  }
}

// ── Delete a Saved Draft ──
function deleteDraft(id) {
  if (confirm("Permanently delete this draft?")) {
    let history = JSON.parse(localStorage.getItem("pcsp_drafts") || "[]");
    history = history.filter((item) => item.id !== id);
    localStorage.setItem("pcsp_drafts", JSON.stringify(history));
    renderHistory();
  }
}

// ── Boot ──
init();
