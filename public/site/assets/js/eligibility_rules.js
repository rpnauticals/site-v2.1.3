/**
 * RP Nauticals — Course eligibility rules database
 * ---------------------------------------------------------------------------
 * Edit this file to update academic matching without touching UI code.
 *
 * Source notes (academic-only; age/medical/eyesight are intentionally omitted):
 * - GP Rating OS/Wiper/Fitter course pages: education "10th Pass (Minimum)".
 * - GME / DME brochures & course pages: Mechanical diploma/degree pathways.
 * - ETO course page / brochure: B.Tech or Diploma in Electrical / Electronics / E&C.
 * - DNS / B.Sc. / B.Tech Marine: IMU-CET PCM pathway; site FAQs state 12th PCM and
 *   typical aggregate around 50–60% (institute-dependent). English commonly ≥50%
 *   for IMU cadet programmes — treated conservatively with potential/eligible bands.
 * - Cruise careers: no dedicated course page; counselling pathway only.
 *
 * Status meanings:
 * - eligible   → all checked academic requirements met for this matcher
 * - potential  → missing info, appearing status, or institute-variable band
 * - ineligible → a mandatory academic requirement clearly fails
 *
 * Never treat unknown English / incomplete branch as eligible.
 */
(function (global) {
  "use strict";

  const MARKS = {
    below_40: { id: "below_40", label: "Below 40%", min: 0, max: 39 },
    "40_49": { id: "40_49", label: "40–49%", min: 40, max: 49 },
    "50_59": { id: "50_59", label: "50–59%", min: 50, max: 59 },
    "60_plus": { id: "60_plus", label: "60% or above", min: 60, max: 100 },
  };

  const ENGLISH = {
    below_40: { id: "below_40", label: "Below 40%", min: 0, max: 39 },
    "40_49": { id: "40_49", label: "40–49%", min: 40, max: 49 },
    "50_plus": { id: "50_plus", label: "50% or above", min: 50, max: 100 },
    na: { id: "na", label: "Not Applicable / Unknown", unknown: true },
  };

  const QUALIFICATIONS = {
    tenth: { id: "tenth", label: "10th Passed", rank: 1 },
    twelfth_passed: { id: "twelfth_passed", label: "12th Passed", rank: 3 },
    twelfth_appearing: { id: "twelfth_appearing", label: "12th Appearing", rank: 2 },
    diploma: { id: "diploma", label: "Diploma", rank: 4 },
    graduation: { id: "graduation", label: "Graduation", rank: 5 },
    post_graduation: { id: "post_graduation", label: "Post Graduation", rank: 6 },
  };

  const STREAMS = {
    pcm: { id: "pcm", label: "PCM" },
    pcb: { id: "pcb", label: "PCB" },
    commerce: { id: "commerce", label: "Commerce" },
    arts: { id: "arts", label: "Arts" },
    mechanical_diploma: { id: "mechanical_diploma", label: "Mechanical Diploma" },
    electrical_diploma: { id: "electrical_diploma", label: "Electrical / Electronics Diploma" },
    other: { id: "other", label: "Other" },
  };

  const BRANCHES = {
    mechanical: { id: "mechanical", label: "Mechanical Engineering" },
    electrical: { id: "electrical", label: "Electrical Engineering" },
    electronics: { id: "electronics", label: "Electronics Engineering" },
    marine: { id: "marine", label: "Marine Engineering" },
    other: { id: "other", label: "Other" },
  };

  /** Streams shown for each qualification (step 2). */
  const STREAMS_BY_QUALIFICATION = {
    tenth: ["other"],
    twelfth_passed: ["pcm", "pcb", "commerce", "arts", "other"],
    twelfth_appearing: ["pcm", "pcb", "commerce", "arts", "other"],
    diploma: ["mechanical_diploma", "electrical_diploma", "other"],
    graduation: ["pcm", "pcb", "commerce", "arts", "other"],
    post_graduation: ["pcm", "pcb", "commerce", "arts", "other"],
  };

  /** Branch step (step 5) only for diploma / graduation / PG. */
  const BRANCH_REQUIRED_FOR = ["diploma", "graduation", "post_graduation"];

  const COURSES = [
    {
      id: "dns",
      name: "DNS – Diploma in Nautical Science",
      shortName: "DNS",
      category: "Deck Department",
      department: "deck",
      duration: "1 year pre-sea + sea time toward 2nd Mate CoC",
      requiredQualificationLabel: "12th Passed with PCM (IMU-CET pathway)",
      description:
        "A 1-year pre-sea diploma for deck officers — admission, documentation and placement support toward your deck career.",
      image: "assets/images/placeholders/cadets.jpg",
      href: "courses/dns.html",
      careerPath: [
        { role: "Deck Cadet", type: "direct" },
        { role: "Deck Officer (3rd / 2nd Mate)", type: "promotion" },
        { role: "Chief Officer", type: "promotion" },
        { role: "Captain", type: "promotion" },
      ],
      alternatives: ["bsc-nautical", "gp-rating"],
      sources: ["Site FAQs (12th PCM / typical 50–60%)", "DNS course page & brochure (programme overview)"],
      evaluate(profile, helpers) {
        return helpers.evaluateImuCadet(profile, {
          courseLabel: "DNS",
          englishMin: 50,
          aggregateEligibleMin: 60,
          aggregatePotentialMin: 50,
        });
      },
    },
    {
      id: "bsc-nautical",
      name: "B.Sc. Nautical Science",
      shortName: "B.Sc. Nautical Science",
      category: "Deck Department",
      department: "deck",
      duration: "3 years + statutory sea time",
      requiredQualificationLabel: "12th Passed with PCM (IMU-CET pathway)",
      description:
        "A 3-year honours degree with statutory sea time and deck officer progression toward Captain.",
      image: "assets/images/placeholders/navigation.jpg",
      href: "courses/bsc-nautical-science.html",
      careerPath: [
        { role: "Deck Cadet", type: "direct" },
        { role: "Deck Officer (3rd / 2nd Mate)", type: "promotion" },
        { role: "Chief Officer", type: "promotion" },
        { role: "Captain", type: "promotion" },
      ],
      alternatives: ["dns", "gp-rating"],
      sources: ["Site FAQs (12th PCM / typical 50–60%)", "B.Sc. course page & brochure"],
      evaluate(profile, helpers) {
        return helpers.evaluateImuCadet(profile, {
          courseLabel: "B.Sc. Nautical Science",
          englishMin: 50,
          aggregateEligibleMin: 60,
          aggregatePotentialMin: 50,
        });
      },
    },
    {
      id: "btech-marine",
      name: "B.Tech Marine Engineering",
      shortName: "B.Tech Marine Engineering",
      category: "Engine Department",
      department: "engine",
      duration: "4 years (including sea training — institute specific)",
      requiredQualificationLabel: "12th Passed with PCM (IMU-CET pathway)",
      description:
        "Engine-side officer degree pathway through IMU-CET. Detailed course page coming soon — counselling is available now.",
      image: "assets/images/placeholders/marine-engineering.jpg",
      href: "courses.html",
      comingSoon: true,
      careerPath: [
        { role: "Engine Cadet / Trainee", type: "direct" },
        { role: "Marine Engineer (Junior Engineer / 3rd Engineer)", type: "promotion" },
        { role: "Second Engineer", type: "promotion" },
        { role: "Chief Engineer", type: "promotion" },
      ],
      alternatives: ["gme", "dme", "gp-rating"],
      sources: ["Site FAQs (PCM for engine officer courses)", "Courses listing (coming soon)"],
      evaluate(profile, helpers) {
        return helpers.evaluateImuCadet(profile, {
          courseLabel: "B.Tech Marine Engineering",
          englishMin: 50,
          aggregateEligibleMin: 60,
          aggregatePotentialMin: 50,
        });
      },
    },
    {
      id: "gme",
      name: "GME – Graduate Marine Engineering",
      shortName: "GME",
      category: "Engine Department",
      department: "engine",
      duration: "1 year",
      requiredQualificationLabel: "B.Tech / B.E. in Mechanical Engineering",
      description:
        "1-year Graduate Marine Engineering after Mechanical Engineering — sea training, MEO Class IV and growth to Chief Engineer.",
      image: "assets/images/courses/gme-cover.jpg",
      href: "courses/gme.html",
      careerPath: [
        { role: "Engine Cadet / Trainee", type: "direct" },
        { role: "3rd Engineer", type: "promotion" },
        { role: "2nd Engineer", type: "promotion" },
        { role: "Chief Engineer", type: "promotion" },
      ],
      alternatives: ["dme", "btech-marine"],
      sources: ["GME course page & brochure"],
      evaluate(profile, helpers) {
        const missing = [];
        const reasons = [];
        const { qualification, branch, marks } = profile;

        if (!helpers.isAtLeast(qualification, "graduation")) {
          return helpers.result("ineligible", [
            "GME requires B.Tech / B.E. in Mechanical Engineering (graduation or higher).",
          ], missing);
        }

        if (!branch) {
          missing.push("Education branch (Mechanical Engineering required)");
          return helpers.result("potential", [
            "Confirm your graduation branch is Mechanical Engineering.",
          ], missing);
        }

        if (branch !== "mechanical") {
          return helpers.result("ineligible", [
            "GME is listed for Mechanical Engineering graduates. Your selected branch does not match.",
          ], missing);
        }

        reasons.push("Graduation / PG with Mechanical Engineering matches the GME pathway.");

        if (!marks) {
          missing.push("Overall marks");
          return helpers.result("potential", reasons.concat(["Overall percentage still needed for institute-wise screening."]), missing);
        }

        if (helpers.marksMin(marks) < 40) {
          return helpers.result("ineligible", [
            "Overall marks below 40% do not meet typical institute academic screening.",
          ], missing);
        }

        if (helpers.marksMin(marks) < 50) {
          return helpers.result("potential", reasons.concat([
            "Some institutes apply higher aggregate cut-offs — verify with counselling.",
          ]), missing);
        }

        if (helpers.englishUnknown(profile.english) || helpers.englishMin(profile.english) < 50) {
          if (helpers.englishUnknown(profile.english)) {
            missing.push("English marks");
            return helpers.result("potential", reasons.concat([
              "English marks not confirmed — institutes may still check Class 10/12 English.",
            ]), missing);
          }
          if (helpers.englishMin(profile.english) < 40) {
            return helpers.result("ineligible", [
              "English marks below 40% typically fail maritime institute screening.",
            ], missing);
          }
          return helpers.result("potential", reasons.concat([
            "English is between 40–49% — final acceptance depends on institute norms.",
          ]), missing);
        }

        return helpers.result("eligible", reasons, missing);
      },
    },
    {
      id: "dme",
      name: "DME – Diploma in Marine Engineering",
      shortName: "DME",
      category: "Engine Department",
      department: "engine",
      duration: "3 years",
      requiredQualificationLabel: "Diploma in Mechanical Engineering",
      description:
        "3-year Diploma in Marine Engineering after Mechanical Diploma — sea experience, MEO Class IV and growth to Chief Engineer.",
      image: "assets/images/courses/dme-cover.jpg",
      href: "courses/dme.html",
      careerPath: [
        { role: "Engine Cadet / Trainee", type: "direct" },
        { role: "3rd Engineer", type: "promotion" },
        { role: "2nd Engineer", type: "promotion" },
        { role: "Chief Engineer", type: "promotion" },
      ],
      alternatives: ["gme", "gp-rating"],
      sources: ["DME course page & brochure"],
      evaluate(profile, helpers) {
        const missing = [];
        const reasons = [];
        const { qualification, stream, branch, marks } = profile;

        const isDiplomaTrack =
          qualification === "diploma" &&
          (stream === "mechanical_diploma" || branch === "mechanical");

        if (qualification !== "diploma") {
          if (helpers.isAtLeast(qualification, "graduation") && branch === "mechanical") {
            return helpers.result("ineligible", [
              "DME is the diploma pathway. Mechanical graduates typically follow GME instead.",
            ], missing, ["gme"]);
          }
          return helpers.result("ineligible", [
            "DME requires a Diploma in Mechanical Engineering first.",
          ], missing);
        }

        if (stream !== "mechanical_diploma" && branch !== "mechanical") {
          if (!stream && !branch) {
            missing.push("Stream / branch (Mechanical Diploma required)");
            return helpers.result("potential", [
              "Confirm your diploma is in Mechanical Engineering.",
            ], missing);
          }
          return helpers.result("ineligible", [
            "DME requires Mechanical Diploma / Mechanical Engineering branch.",
          ], missing);
        }

        reasons.push("Mechanical Diploma pathway matches DME entry.");

        if (!marks) {
          missing.push("Overall marks");
          return helpers.result("potential", reasons.concat(["Overall percentage still needed for institute-wise screening."]), missing);
        }
        if (helpers.marksMin(marks) < 40) {
          return helpers.result("ineligible", [
            "Overall marks below 40% do not meet typical institute academic screening.",
          ], missing);
        }
        if (helpers.marksMin(marks) < 50) {
          return helpers.result("potential", reasons.concat([
            "Some institutes apply higher aggregate cut-offs — verify with counselling.",
          ]), missing);
        }

        if (helpers.englishUnknown(profile.english)) {
          missing.push("English marks");
          return helpers.result("potential", reasons.concat([
            "English marks not confirmed — institutes may still check Class 10/12 English.",
          ]), missing);
        }
        if (helpers.englishMin(profile.english) < 40) {
          return helpers.result("ineligible", [
            "English marks below 40% typically fail maritime institute screening.",
          ], missing);
        }
        if (helpers.englishMin(profile.english) < 50) {
          return helpers.result("potential", reasons.concat([
            "English is between 40–49% — final acceptance depends on institute norms.",
          ]), missing);
        }

        if (!isDiplomaTrack) {
          return helpers.result("potential", reasons, missing);
        }
        return helpers.result("eligible", reasons, missing);
      },
    },
    {
      id: "gp-rating",
      name: "GP Rating",
      shortName: "GP Rating",
      category: "Rating Department",
      department: "rating",
      duration: "6 months pre-sea (OS / Wiper / Fitter pathways)",
      requiredQualificationLabel: "10th Pass (minimum)",
      description:
        "General Purpose Rating pathways — Ordinary Seaman, Wiper or Fitter — with STCW and placement assistance.",
      image: "assets/images/placeholders/deck-operations.jpg",
      href: "courses/gp-rating.html",
      careerPath: [
        { role: "Trainee OS / Wiper / Fitter", type: "direct" },
        { role: "Ordinary Seaman / Wiper / Fitter", type: "direct" },
        { role: "Able Seaman / Oiler (with experience)", type: "promotion" },
        { role: "Bosun / higher ranks (with experience)", type: "promotion" },
      ],
      alternatives: ["dns", "cruise"],
      sources: ["GP Rating course pages (10th Pass Minimum)"],
      evaluate(profile, helpers) {
        const missing = [];
        const reasons = [];

        if (!helpers.isAtLeast(profile.qualification, "tenth")) {
          return helpers.result("ineligible", [
            "GP Rating requires at least 10th Pass.",
          ], missing);
        }

        reasons.push("Education meets the published 10th Pass (minimum) requirement.");

        if (!profile.marks) {
          missing.push("Overall marks");
          return helpers.result("potential", reasons.concat([
            "Overall marks not selected — some companies still screen percentages.",
          ]), missing);
        }

        if (helpers.marksMin(profile.marks) < 40) {
          return helpers.result("potential", reasons.concat([
            "Overall marks are below 40%. Company / institute screening may still apply.",
          ]), missing);
        }

        if (helpers.englishUnknown(profile.english)) {
          missing.push("English marks");
          return helpers.result("potential", reasons.concat([
            "English marks unknown — shipping companies often check English separately.",
          ]), missing);
        }

        if (helpers.englishMin(profile.english) < 40) {
          return helpers.result("potential", reasons.concat([
            "English below 40% may fail company language screening even if course entry is open.",
          ]), missing);
        }

        return helpers.result("eligible", reasons, missing);
      },
    },
    {
      id: "eto",
      name: "ETO – Electro Technical Officer",
      shortName: "ETO",
      category: "Electrical Department",
      department: "electrical",
      duration: "4 months residential + onboard trainee sea service",
      requiredQualificationLabel: "B.Tech / Diploma in Electrical, Electronics or E&C",
      description:
        "DG Shipping approved ETO course for Electrical / Electronics diploma or degree holders.",
      image: "assets/images/placeholders/marine-engineering.jpg",
      href: "courses/eto.html",
      careerPath: [
        { role: "ETO Trainee", type: "direct" },
        { role: "Electro Technical Officer", type: "promotion" },
      ],
      alternatives: ["gme", "gp-rating"],
      sources: ["ETO course page & brochure"],
      evaluate(profile, helpers) {
        const missing = [];
        const reasons = [];
        const { qualification, stream, branch } = profile;

        const diplomaElectrical =
          qualification === "diploma" &&
          (stream === "electrical_diploma" ||
            branch === "electrical" ||
            branch === "electronics");

        const degreeElectrical =
          helpers.isAtLeast(qualification, "graduation") &&
          (branch === "electrical" || branch === "electronics");

        if (!(helpers.isAtLeast(qualification, "diploma"))) {
          return helpers.result("ineligible", [
            "ETO requires a Diploma or B.Tech / B.E. in Electrical, Electronics or related branches.",
          ], missing);
        }

        if (qualification === "diploma" && !stream && !branch) {
          missing.push("Stream / branch (Electrical or Electronics)");
          return helpers.result("potential", [
            "Confirm your diploma branch is Electrical, Electronics or E&C.",
          ], missing);
        }

        if (helpers.isAtLeast(qualification, "graduation") && !branch) {
          missing.push("Education branch (Electrical / Electronics)");
          return helpers.result("potential", [
            "Confirm your degree branch is Electrical, Electronics or E&C.",
          ], missing);
        }

        if (!diplomaElectrical && !degreeElectrical) {
          if (branch === "marine") {
            return helpers.result("potential", [
              "Marine Engineering is adjacent — confirm DGS-related branch acceptance with counselling.",
            ], missing);
          }
          return helpers.result("ineligible", [
            "Selected stream/branch does not match Electrical, Electronics or E&C entry paths.",
          ], missing);
        }

        reasons.push("Qualification and branch match an published ETO entry pathway.");

        if (!profile.marks) {
          missing.push("Overall marks");
          return helpers.result("potential", reasons.concat([
            "Overall percentage still needed for college / entrance screening.",
          ]), missing);
        }
        if (helpers.marksMin(profile.marks) < 40) {
          return helpers.result("ineligible", [
            "Overall marks below 40% do not meet typical institute academic screening.",
          ], missing);
        }
        if (helpers.marksMin(profile.marks) < 50) {
          return helpers.result("potential", reasons.concat([
            "Some approved colleges apply higher aggregate cut-offs.",
          ]), missing);
        }

        if (helpers.englishUnknown(profile.english)) {
          missing.push("English marks");
          return helpers.result("potential", reasons.concat([
            "English marks not confirmed.",
          ]), missing);
        }
        if (helpers.englishMin(profile.english) < 40) {
          return helpers.result("ineligible", [
            "English marks below 40% typically fail maritime institute screening.",
          ], missing);
        }
        if (helpers.englishMin(profile.english) < 50) {
          return helpers.result("potential", reasons.concat([
            "English is between 40–49% — verify college language norms.",
          ]), missing);
        }

        return helpers.result("eligible", reasons, missing);
      },
    },
    {
      id: "cruise",
      name: "Cruise Ship Careers",
      shortName: "Cruise Ship Careers",
      category: "Cruise Ship Careers",
      department: "cruise",
      duration: "Pathway-specific hospitality / professional training",
      requiredQualificationLabel: "Varies by role — counselling required",
      description:
        "Cruise hiring is often separate from cargo/tanker cadet routes and may need hospitality or role-specific training. RP Nauticals can guide the right pathway.",
      image: "assets/images/placeholders/ship-life.jpg",
      href: "contact.html",
      careerPath: [
        { role: "Cruise trainee / entry role (role-specific)", type: "direct" },
        { role: "Shipboard professional roles (hospitality / support)", type: "promotion" },
      ],
      alternatives: ["gp-rating"],
      sources: ["Site FAQs (cruise hiring often separate; hospitality-related training)"],
      evaluate(profile, helpers) {
        const missing = [
          "Role-specific training / hospitality requirements",
          "Company-wise entry criteria",
        ];
        if (!helpers.isAtLeast(profile.qualification, "tenth")) {
          return helpers.result("ineligible", [
            "At least 10th Pass is typically needed before cruise pathway counselling.",
          ], missing);
        }
        return helpers.result(
          "potential",
          [
            "Cruise pathways are role-specific and not auto-cleared from academic selections alone.",
            "Book counselling to match hospitality / professional cruise options.",
          ],
          missing
        );
      },
    },
  ];

  const helpers = {
    marksMin(id) {
      return (MARKS[id] && MARKS[id].min) || 0;
    },
    englishMin(id) {
      if (!id || ENGLISH[id]?.unknown) return null;
      return ENGLISH[id].min;
    },
    englishUnknown(id) {
      return !id || !!ENGLISH[id]?.unknown;
    },
    isAtLeast(qualId, minId) {
      const a = QUALIFICATIONS[qualId]?.rank || 0;
      const b = QUALIFICATIONS[minId]?.rank || 0;
      return a >= b;
    },
    result(status, reasons, missing, forceAlternatives) {
      return {
        status,
        reasons: reasons || [],
        missing: missing || [],
        forceAlternatives: forceAlternatives || null,
      };
    },
    evaluateImuCadet(profile, opts) {
      const missing = [];
      const reasons = [];
      const { qualification, stream, marks, english } = profile;

      if (qualification === "tenth") {
        return this.result("ineligible", [
          `${opts.courseLabel} is an IMU-CET cadet pathway after 12th with PCM — 10th alone is not sufficient.`,
        ], missing, ["gp-rating"]);
      }

      if (qualification === "diploma" || this.isAtLeast(qualification, "graduation")) {
        // Lateral / alternate routes exist in industry, but this matcher only clears the published 12th PCM IMU path.
        if (stream === "pcm") {
          reasons.push("Higher qualification with PCM background — confirm IMU / institute lateral rules with counselling.");
          return this.result("potential", reasons, ["IMU / institute lateral-entry confirmation"]);
        }
        return this.result("ineligible", [
          `${opts.courseLabel} matcher clears the standard 12th PCM + IMU-CET pathway. Your current track points to other courses (GME / DME / ETO / GP).`,
        ], missing);
      }

      if (qualification === "twelfth_appearing") {
        if (stream !== "pcm") {
          if (!stream) {
            missing.push("Stream (PCM required)");
            return this.result("potential", [
              "Select PCM if you are appearing in Physics, Chemistry and Mathematics.",
            ], missing);
          }
          return this.result("ineligible", [
            `${opts.courseLabel} requires PCM in Class 12.`,
          ], missing, ["gp-rating"]);
        }
        missing.push("Final 12th marksheet (currently appearing)");
        reasons.push("12th appearing with PCM can prepare for IMU-CET, but final eligibility needs passed marksheet.");
        if (this.englishUnknown(english)) missing.push("English marks");
        if (!marks) missing.push("Expected / current overall marks");
        return this.result("potential", reasons, missing);
      }

      if (qualification !== "twelfth_passed") {
        return this.result("potential", [
          "Confirm Class 12 PCM completion for IMU-CET cadet programmes.",
        ], ["Class 12 PCM confirmation"]);
      }

      if (stream !== "pcm") {
        if (!stream) {
          missing.push("Stream (PCM required)");
          return this.result("potential", ["PCM stream is required for this cadet pathway."], missing);
        }
        return this.result("ineligible", [
          `${opts.courseLabel} requires Physics, Chemistry and Mathematics (PCM).`,
        ], missing, ["gp-rating"]);
      }

      reasons.push("12th Passed with PCM matches the standard IMU-CET academic stream.");

      if (!marks) {
        missing.push("Overall marks");
        return this.result("potential", reasons.concat(["Overall percentage is required to judge aggregate bands."]), missing);
      }

      const agg = this.marksMin(marks);
      if (agg < opts.aggregatePotentialMin) {
        return this.result("ineligible", [
          `Overall marks are below the typical ${opts.aggregatePotentialMin}% band referenced for IMU cadet programmes on this site.`,
        ], missing, ["gp-rating"]);
      }

      if (this.englishUnknown(english)) {
        missing.push("English marks");
        return this.result("potential", reasons.concat([
          "English marks are required — IMU cadet programmes commonly expect adequate English.",
        ]), missing);
      }

      const eng = this.englishMin(english);
      if (eng < 40) {
        return this.result("ineligible", [
          "English marks below 40% typically fail maritime cadet screening.",
        ], missing, ["gp-rating"]);
      }

      if (eng < opts.englishMin) {
        return this.result("potential", reasons.concat([
          `English is below ${opts.englishMin}% — verify the current IMU / institute English rule.`,
        ]), missing);
      }

      if (agg < opts.aggregateEligibleMin) {
        return this.result("potential", reasons.concat([
          `Overall marks are in the ${opts.aggregatePotentialMin}–${opts.aggregateEligibleMin - 1}% band. Site FAQs note institute variation around 50–60%.`,
        ]), missing);
      }

      return this.result("eligible", reasons.concat([
        `Overall marks meet the ≥${opts.aggregateEligibleMin}% guidance band used by this matcher.`,
        `English meets the ≥${opts.englishMin}% guidance band used by this matcher.`,
      ]), missing);
    },
  };

  function normalizeProfile(input) {
    return {
      qualification: input.qualification || null,
      stream: input.stream || null,
      marks: input.marks || null,
      english: input.english || null,
      branch: input.branch || null,
    };
  }

  function evaluateProfile(rawProfile) {
    const profile = normalizeProfile(rawProfile);
    const results = COURSES.map((course) => {
      const outcome = course.evaluate(profile, helpers);
      const altIds = outcome.forceAlternatives || course.alternatives || [];
      return {
        id: course.id,
        name: course.name,
        shortName: course.shortName,
        category: course.category,
        department: course.department,
        duration: course.duration,
        requiredQualificationLabel: course.requiredQualificationLabel,
        description: course.description,
        image: course.image,
        href: course.href,
        comingSoon: !!course.comingSoon,
        careerPath: course.careerPath,
        sources: course.sources,
        status: outcome.status,
        reasons: outcome.reasons,
        missing: outcome.missing,
        alternativeIds: altIds,
      };
    });

    const order = { eligible: 0, potential: 1, ineligible: 2 };
    results.sort((a, b) => order[a.status] - order[b.status] || a.name.localeCompare(b.name));

    return {
      profile,
      profileLabels: labelProfile(profile),
      results,
      summary: {
        eligible: results.filter((r) => r.status === "eligible").length,
        potential: results.filter((r) => r.status === "potential").length,
        ineligible: results.filter((r) => r.status === "ineligible").length,
      },
      disclaimer:
        "Academic guidance only based on selections and published RP Nauticals course information. Final admission depends on current DG Shipping / IMU / institute notifications, medical fitness, age criteria and company requirements. This tool never guarantees admission.",
    };
  }

  function labelProfile(profile) {
    return {
      qualification: QUALIFICATIONS[profile.qualification]?.label || "—",
      stream: STREAMS[profile.stream]?.label || "—",
      marks: MARKS[profile.marks]?.label || "—",
      english: ENGLISH[profile.english]?.label || "—",
      branch: BRANCHES[profile.branch]?.label || "—",
    };
  }

  const API = {
    version: "1.0.0",
    MARKS,
    ENGLISH,
    QUALIFICATIONS,
    STREAMS,
    BRANCHES,
    STREAMS_BY_QUALIFICATION,
    BRANCH_REQUIRED_FOR,
    COURSES,
    helpers,
    evaluateProfile,
    labelProfile,
  };

  global.RPEligibilityRules = API;
})(typeof window !== "undefined" ? window : globalThis);
