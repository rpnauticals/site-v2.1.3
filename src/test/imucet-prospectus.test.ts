import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const html = readFileSync("public/site/courses/imucet.html", "utf8");
const document = new DOMParser().parseFromString(html, "text/html");

describe("IMU-CET prospectus course rules", () => {
  for (const [subject, count] of [["Physics", 50], ["Chemistry", 20], ["Mathematics", 50], ["English", 40], ["Aptitude & GK", 40]] as const) {
    it(`${subject} has ${count} questions and marks, and 3 weekly classes`, () => {
      const row = document.querySelector(`[data-subject="${subject}"]`);
      expect(Number(row?.querySelector("[data-questions]")?.getAttribute("data-questions"))).toBe(count);
      expect(Number(row?.querySelector("[data-marks]")?.getAttribute("data-marks"))).toBe(count);
      expect(Number(row?.querySelector("[data-weekly-classes]")?.getAttribute("data-weekly-classes"))).toBe(3);
    });
  }
  it("schedules 15 classes per week and totals 200 questions", () => {
    expect([...document.querySelectorAll("[data-weekly-classes]")].reduce((n, e) => n + Number(e.getAttribute("data-weekly-classes")), 0)).toBe(15);
    expect([...document.querySelectorAll("[data-questions]")].reduce((n, e) => n + Number(e.getAttribute("data-questions")), 0)).toBe(200);
  });
  for (const [id, perSubject, coaching, addon] of [["01",1999,7999,0],["02",999,4499,0],["03",0,7999,9999],["04",0,7999,7999],["05",0,4499,7999],["06",0,0,7999]] as const) {
    it(`package ${id} uses the exact prospectus fees`, () => {
      const row = document.querySelector(`[data-package="${id}"]`);
      expect(row).not.toBeNull();
      expect(Number(row?.querySelector("[data-subject-fee]")?.getAttribute("data-subject-fee") ?? 0)).toBe(perSubject);
      expect(Number(row?.querySelector("[data-coaching-fee]")?.getAttribute("data-coaching-fee") ?? 0)).toBe(coaching);
      expect(Number(row?.querySelector("[data-addon-fee]")?.getAttribute("data-addon-fee") ?? 0)).toBe(addon);
    });
  }
  it("has six sequential career stages ending in admission", () => {
    expect([...document.querySelectorAll("[data-stage]")].map(e => Number(e.getAttribute("data-stage")))).toEqual([1,2,3,4,5,6]);
    expect(document.querySelector('[data-stage="6"] h3')?.textContent).toBe("Admission");
  });
});