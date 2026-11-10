import { readFileSync } from "node:fs";
import vm from "node:vm";
import { describe, expect, it } from "vitest";

function loadRules() {
  const code = readFileSync("public/site/assets/js/eligibility_rules.js", "utf8");
  const sandbox: { RPEligibilityRules?: any; globalThis: any } = { globalThis: {} };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(code, sandbox);
  return sandbox.RPEligibilityRules;
}

const rules = loadRules();
const byId = (report: any, id: string) => report.results.find((r: any) => r.id === id);

describe("eligibility rules database", () => {
  it("exposes versioned course catalogue with separate evaluate hooks", () => {
    expect(rules.version).toBeTruthy();
    expect(rules.COURSES.length).toBeGreaterThanOrEqual(8);
    for (const course of rules.COURSES) {
      expect(typeof course.evaluate).toBe("function");
      expect(course.href).toBeTruthy();
      expect(course.careerPath.length).toBeGreaterThan(0);
    }
  });

  it("marks 12th PCM 60%+ with English 50%+ as eligible for DNS and B.Sc.", () => {
    const report = rules.evaluateProfile({
      qualification: "twelfth_passed",
      stream: "pcm",
      marks: "60_plus",
      english: "50_plus",
    });
    expect(byId(report, "dns").status).toBe("eligible");
    expect(byId(report, "bsc-nautical").status).toBe("eligible");
    expect(byId(report, "btech-marine").status).toBe("eligible");
    expect(byId(report, "gme").status).toBe("ineligible");
    expect(byId(report, "gp-rating").status).toBe("eligible");
  });

  it("does not mark unknown English as eligible for IMU cadet courses", () => {
    const report = rules.evaluateProfile({
      qualification: "twelfth_passed",
      stream: "pcm",
      marks: "60_plus",
      english: "na",
    });
    expect(byId(report, "dns").status).toBe("potential");
    expect(byId(report, "dns").missing.join(" ")).toMatch(/English/i);
  });

  it("rejects commerce 12th for DNS and suggests rating alternatives", () => {
    const report = rules.evaluateProfile({
      qualification: "twelfth_passed",
      stream: "commerce",
      marks: "60_plus",
      english: "50_plus",
    });
    expect(byId(report, "dns").status).toBe("ineligible");
    expect(byId(report, "gp-rating").status).toBe("eligible");
  });

  it("matches GME for mechanical graduates and DME for mechanical diploma", () => {
    const gme = rules.evaluateProfile({
      qualification: "graduation",
      stream: "pcm",
      marks: "60_plus",
      english: "50_plus",
      branch: "mechanical",
    });
    expect(byId(gme, "gme").status).toBe("eligible");
    expect(byId(gme, "dme").status).toBe("ineligible");

    const dme = rules.evaluateProfile({
      qualification: "diploma",
      stream: "mechanical_diploma",
      marks: "60_plus",
      english: "50_plus",
      branch: "mechanical",
    });
    expect(byId(dme, "dme").status).toBe("eligible");
    expect(byId(dme, "gme").status).toBe("ineligible");
  });

  it("matches ETO for electrical diploma / degree only", () => {
    const ok = rules.evaluateProfile({
      qualification: "diploma",
      stream: "electrical_diploma",
      marks: "60_plus",
      english: "50_plus",
      branch: "electrical",
    });
    expect(byId(ok, "eto").status).toBe("eligible");

    const no = rules.evaluateProfile({
      qualification: "diploma",
      stream: "mechanical_diploma",
      marks: "60_plus",
      english: "50_plus",
      branch: "mechanical",
    });
    expect(byId(no, "eto").status).toBe("ineligible");
  });

  it("keeps cruise careers as potential counselling pathways", () => {
    const report = rules.evaluateProfile({
      qualification: "tenth",
      stream: "other",
      marks: "40_49",
      english: "40_49",
    });
    expect(byId(report, "cruise").status).toBe("potential");
    expect(byId(report, "gp-rating").status).toBe("eligible");
    expect(byId(report, "dns").status).toBe("ineligible");
  });
});

describe("find-eligible-courses static page", () => {
  const html = readFileSync("public/site/find-eligible-courses.html", "utf8");

  it("wires rules + UI scripts and WhatsApp counselling CTA", () => {
    expect(html).toContain('href="assets/css/eligibility.css"');
    expect(html).toContain("assets/js/eligibility_rules.js");
    expect(html).toContain("assets/js/eligibility.js");
    expect(html).toContain("Need Help Choosing the Right Course?");
    expect(html).toContain("wa.me/918882755714");
    expect(html).toContain('id="elig-wizard"');
    expect(html).toContain('id="elig-results"');
  });
});
