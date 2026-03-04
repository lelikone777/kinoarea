import { describe, expect, it } from "vitest";
import { getApiErrorMessage } from "./client-error";

describe("getApiErrorMessage", () => {
  it("returns fallback for unknown payload", () => {
    expect(getApiErrorMessage(null, "fallback")).toBe("fallback");
    expect(getApiErrorMessage({}, "fallback")).toBe("fallback");
  });

  it("returns plain string error", () => {
    expect(getApiErrorMessage({ error: "Oops" }, "fallback")).toBe("Oops");
  });

  it("returns first form error from zod-like flatten object", () => {
    const payload = {
      error: {
        formErrors: ["Invalid request"],
        fieldErrors: {},
      },
    };
    expect(getApiErrorMessage(payload, "fallback")).toBe("Invalid request");
  });

  it("returns first field error from zod-like flatten object", () => {
    const payload = {
      error: {
        formErrors: [],
        fieldErrors: {
          email: ["Email invalid"],
          password: ["Password required"],
        },
      },
    };
    expect(getApiErrorMessage(payload, "fallback")).toBe("Email invalid");
  });
});
