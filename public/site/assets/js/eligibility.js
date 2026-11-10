(function () {
  "use strict";

  const rules = window.RPEligibilityRules;
  if (!rules) {
    console.error("RPEligibilityRules missing — load eligibility_rules.js first.");
    return;
  }

  const state = {
    step: 1,
    answers: {
      qualification: null,
      stream: null,
      marks: null,
      english: null,
      branch: null,
    },
  };

  const els = {};

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $all(sel, root) {
    return [...(root || document).querySelectorAll(sel)];
  }

  function needsBranch() {
    return rules.BRANCH_REQUIRED_FOR.includes(state.answers.qualification);
  }

  function maxStep() {
    return needsBranch() ? 5 : 4;
  }

  function optionButton(name, value, label, selected) {
    const checked = selected === value ? " is-selected" : "";
    const pressed = selected === value ? "true" : "false";
    return `<button type="button" class="elig-option${checked}" role="radio" aria-checked="${pressed}" data-field="${name}" data-value="${value}">
      <span class="elig-option-check" aria-hidden="true"></span>
      <span class="elig-option-label">${label}</span>
    </button>`;
  }

  function renderStepOptions() {
    const step = state.step;
    const box = els.options;
    const title = els.stepTitle;
    const hint = els.stepHint;
    const a = state.answers;

    if (step === 1) {
      title.textContent = "Highest Educational Qualification";
      hint.textContent = "Choose the highest level you have completed or are currently appearing for.";
      box.innerHTML = Object.values(rules.QUALIFICATIONS)
        .map((q) => optionButton("qualification", q.id, q.label, a.qualification))
        .join("");
    } else if (step === 2) {
      title.textContent = "Stream / Subjects";
      hint.textContent = "Only options relevant to your qualification are shown.";
      const ids = rules.STREAMS_BY_QUALIFICATION[a.qualification] || ["other"];
      box.innerHTML = ids
        .map((id) => optionButton("stream", id, rules.STREAMS[id].label, a.stream))
        .join("");
    } else if (step === 3) {
      title.textContent = "Overall Marks";
      hint.textContent = "Select your overall percentage band — no typing needed.";
      box.innerHTML = Object.values(rules.MARKS)
        .map((m) => optionButton("marks", m.id, m.label, a.marks))
        .join("");
    } else if (step === 4) {
      title.textContent = "English Marks";
      hint.textContent = "If you are unsure, choose Not Applicable / Unknown — we will mark those courses as Potentially Eligible.";
      box.innerHTML = Object.values(rules.ENGLISH)
        .map((e) => optionButton("english", e.id, e.label, a.english))
        .join("");
    } else if (step === 5) {
      title.textContent = "Education Branch";
      hint.textContent = "Required for Diploma / Graduation / Post Graduation pathways.";
      box.innerHTML = Object.values(rules.BRANCHES)
        .map((b) => optionButton("branch", b.id, b.label, a.branch))
        .join("");
    }

    box.setAttribute("role", "radiogroup");
    box.setAttribute("aria-label", title.textContent);
    updateChrome();
  }

  function currentField() {
    return ["", "qualification", "stream", "marks", "english", "branch"][state.step];
  }

  function selectedForStep() {
    return state.answers[currentField()];
  }

  function updateChrome() {
    const total = maxStep();
    const pct = Math.round(((state.step - 1) / total) * 100);
    els.progressFill.style.width = `${Math.max(8, Math.round((state.step / total) * 100))}%`;
    els.progressLabel.textContent = `Step ${state.step} of ${total}`;
    els.progressBar.setAttribute("aria-valuenow", String(state.step));
    els.progressBar.setAttribute("aria-valuemax", String(total));

    $all(".elig-step-dot").forEach((dot) => {
      const n = Number(dot.dataset.step);
      dot.classList.toggle("is-active", n === state.step);
      dot.classList.toggle("is-done", n < state.step);
      dot.hidden = n > total;
    });

    els.backBtn.disabled = state.step <= 1;
    const hasSelection = !!selectedForStep();
    els.nextBtn.disabled = !hasSelection;
    els.nextBtn.textContent = state.step >= total ? "See My Courses" : "Continue";
  }

  function onOptionClick(e) {
    const btn = e.target.closest(".elig-option");
    if (!btn) return;
    const field = btn.dataset.field;
    const value = btn.dataset.value;
    state.answers[field] = value;

    if (field === "qualification") {
      state.answers.stream = null;
      state.answers.branch = null;
      const allowed = rules.STREAMS_BY_QUALIFICATION[value] || [];
      if (allowed.length === 1) state.answers.stream = allowed[0];
    }

    renderStepOptions();
  }

  function goNext() {
    if (!selectedForStep()) {
      els.formError.hidden = false;
      els.formError.textContent = "Please select one option to continue.";
      return;
    }
    els.formError.hidden = true;

    if (state.step >= maxStep()) {
      showResults();
      return;
    }
    state.step += 1;
    // Skip stream re-prompt weirdness — always show step 2
    renderStepOptions();
    els.wizard.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function goBack() {
    if (state.step <= 1) return;
    state.step -= 1;
    els.formError.hidden = true;
    renderStepOptions();
  }

  function statusMeta(status) {
    if (status === "eligible") {
      return { label: "Eligible", className: "is-eligible" };
    }
    if (status === "potential") {
      return { label: "Potentially Eligible", className: "is-potential" };
    }
    return { label: "Not Eligible", className: "is-ineligible" };
  }

  function careerHtml(path) {
    return `<ol class="elig-career-path">${path
      .map(
        (step, i) =>
          `<li><span class="elig-career-role">${step.role}</span><span class="elig-career-type">${
            step.type === "direct" ? "Direct entry / course outcome" : "Later promotion"
          }</span>${i < path.length - 1 ? '<span class="elig-career-arrow" aria-hidden="true">→</span>' : ""}</li>`
      )
      .join("")}</ol>`;
  }

  function courseCard(result, byId) {
    const meta = statusMeta(result.status);
    const alts = (result.alternativeIds || [])
      .map((id) => byId[id])
      .filter(Boolean)
      .map((c) => c.shortName);
    const missing =
      result.missing && result.missing.length
        ? `<div class="elig-missing"><strong>Still needed:</strong><ul>${result.missing
            .map((m) => `<li>${m}</li>`)
            .join("")}</ul></div>`
        : "";
    const reasons =
      result.reasons && result.reasons.length
        ? `<ul class="elig-reasons">${result.reasons.map((r) => `<li>${r}</li>`).join("")}</ul>`
        : "";
    const altBlock =
      alts.length && result.status !== "eligible"
        ? `<p class="elig-alts"><strong>Alternatives:</strong> ${alts.join(", ")}</p>`
        : "";
    const soon = result.comingSoon
      ? `<span class="elig-pill elig-pill-soon">Course page coming soon</span>`
      : "";

    return `<article class="elig-course-card ${meta.className}">
      <div class="elig-course-media">
        <img src="${result.image}" alt="" width="640" height="427" loading="lazy" />
        <span class="elig-status-badge ${meta.className}">${meta.label}</span>
      </div>
      <div class="elig-course-body">
        <p class="elig-cat">${result.category}</p>
        <h3>${result.name}</h3>
        ${soon}
        <p class="elig-desc">${result.description}</p>
        <dl class="elig-meta-grid">
          <div><dt>Duration</dt><dd>${result.duration}</dd></div>
          <div><dt>Required qualification</dt><dd>${result.requiredQualificationLabel}</dd></div>
        </dl>
        <div class="elig-pathway-block">
          <h4>Career pathway</h4>
          ${careerHtml(result.careerPath)}
        </div>
        ${reasons}
        ${missing}
        ${altBlock}
        <div class="elig-card-actions">
          <a class="btn btn-primary" href="${result.href}">Explore Course</a>
        </div>
      </div>
    </article>`;
  }

  function showResults() {
    const report = rules.evaluateProfile(state.answers);
    const byId = Object.fromEntries(report.results.map((r) => [r.id, r]));
    const labels = report.profileLabels;

    els.wizard.hidden = true;
    els.results.hidden = false;

    els.profileSummary.innerHTML = `
      <div class="elig-profile-card">
        <div class="section-head" style="margin-bottom:28px;">
          <span class="eyebrow">Your education profile</span>
          <h2>Based on your selections</h2>
        </div>
        <ul class="elig-profile-list">
          <li><span>Qualification</span><strong>${labels.qualification}</strong></li>
          <li><span>Stream / Subjects</span><strong>${labels.stream}</strong></li>
          <li><span>Overall Marks</span><strong>${labels.marks}</strong></li>
          <li><span>English Marks</span><strong>${labels.english}</strong></li>
          <li><span>Education Branch</span><strong>${needsBranch() ? labels.branch : "Not applicable"}</strong></li>
        </ul>
        <p class="elig-summary-counts">
          <span class="is-eligible">${report.summary.eligible} Eligible</span>
          <span class="is-potential">${report.summary.potential} Potentially Eligible</span>
          <span class="is-ineligible">${report.summary.ineligible} Not Eligible</span>
        </p>
        <button type="button" class="btn btn-outline" id="elig-edit-answers">Change answers</button>
      </div>`;

    const eligible = report.results.filter((r) => r.status === "eligible");
    const potential = report.results.filter((r) => r.status === "potential");
    const ineligible = report.results.filter((r) => r.status === "ineligible");

    els.resultsList.innerHTML = `
      ${
        eligible.length
          ? `<section class="elig-result-group"><h2>Eligible courses</h2><div class="elig-course-grid">${eligible
              .map((r) => courseCard(r, byId))
              .join("")}</div></section>`
          : ""
      }
      ${
        potential.length
          ? `<section class="elig-result-group"><h2>Potentially eligible</h2><p class="elig-group-note">These need verification, missing marks, appearing status, or institute-specific confirmation.</p><div class="elig-course-grid">${potential
              .map((r) => courseCard(r, byId))
              .join("")}</div></section>`
          : ""
      }
      <section class="elig-result-group">
        <details class="elig-ineligible-details" ${ineligible.length && !eligible.length && !potential.length ? "open" : ""}>
          <summary>Not eligible (${ineligible.length})</summary>
          <div class="elig-course-grid" style="margin-top:24px;">${ineligible.map((r) => courseCard(r, byId)).join("")}</div>
        </details>
      </section>
      <p class="elig-disclaimer">${report.disclaimer}</p>
    `;

    $("#elig-edit-answers")?.addEventListener("click", resetToForm);
    els.results.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetToForm() {
    els.results.hidden = true;
    els.wizard.hidden = false;
    state.step = 1;
    renderStepOptions();
    els.wizard.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function restartAll() {
    state.answers = {
      qualification: null,
      stream: null,
      marks: null,
      english: null,
      branch: null,
    };
    state.step = 1;
    els.results.hidden = true;
    els.wizard.hidden = false;
    els.formError.hidden = true;
    renderStepOptions();
    els.wizard.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function init() {
    els.wizard = $("#elig-wizard");
    els.results = $("#elig-results");
    if (!els.wizard || !els.results) return;

    els.options = $("#elig-options");
    els.stepTitle = $("#elig-step-title");
    els.stepHint = $("#elig-step-hint");
    els.progressFill = $("#elig-progress-fill");
    els.progressLabel = $("#elig-progress-label");
    els.progressBar = $("#elig-progress");
    els.backBtn = $("#elig-back");
    els.nextBtn = $("#elig-next");
    els.formError = $("#elig-form-error");
    els.profileSummary = $("#elig-profile-summary");
    els.resultsList = $("#elig-results-list");
    els.restartBtn = $("#elig-restart");

    els.options.addEventListener("click", onOptionClick);
    els.nextBtn.addEventListener("click", goNext);
    els.backBtn.addEventListener("click", goBack);
    els.restartBtn?.addEventListener("click", restartAll);

    renderStepOptions();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
