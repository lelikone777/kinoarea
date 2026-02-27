import { describe, expect, it, beforeEach } from "vitest";
import { __resetDemoStoreForTests, createReservation, getTakenSeatIds } from "./demoStore";

beforeEach(() => {
  __resetDemoStoreForTests();
});

describe("demoStore", () => {
  it("seeds taken seats for a screening", () => {
    const taken = getTakenSeatIds("s1");
    expect(Array.isArray(taken)).toBe(true);
    expect(taken.length).toBeGreaterThan(0);
    expect(taken).toContain("E6");
  });

  it("rejects unknown screening", () => {
    const result = createReservation({ screeningId: "missing", seatIds: ["A1"] });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/Сеанс не найден/i);
    }
  });

  it("rejects empty selection", () => {
    const result = createReservation({ screeningId: "s1", seatIds: [] });
    expect(result.ok).toBe(false);
  });

  it("computes total with premium rows", () => {
    // s1 uses hall h1 with premium rows E/F/G and prices 420/650.
    const result = createReservation({ screeningId: "s1", seatIds: ["A3", "E8"] });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.reservation.seatIds).toEqual(["A3", "E8"]);
      expect(result.reservation.totalRub).toBe(420 + 650);
      expect(result.reservation.reservationId).toMatch(/^r_/);
    }
  });

  it("returns conflict when reserving already taken seat", () => {
    const first = createReservation({ screeningId: "s1", seatIds: ["A4"] });
    expect(first.ok).toBe(true);

    const second = createReservation({ screeningId: "s1", seatIds: ["A4"] });
    expect(second.ok).toBe(false);
    if (!second.ok) {
      expect(second.status).toBe(409);
      expect(second.error).toMatch(/уже заняты/i);
    }
  });
});

