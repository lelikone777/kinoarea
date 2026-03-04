import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  findUniqueMock,
  verifyPasswordMock,
  createSessionTokenMock,
  setSessionCookieMock,
} = vi.hoisted(() => ({
  findUniqueMock: vi.fn(),
  verifyPasswordMock: vi.fn(),
  createSessionTokenMock: vi.fn(),
  setSessionCookieMock: vi.fn(),
}));

vi.mock("@/app/lib/db", () => ({
  db: {
    user: {
      findUnique: findUniqueMock,
    },
  },
}));

vi.mock("@/app/lib/auth/password", () => ({
  verifyPassword: verifyPasswordMock,
}));

vi.mock("@/app/lib/auth/session", () => ({
  createSessionToken: createSessionTokenMock,
  setSessionCookie: setSessionCookieMock,
}));

import { POST } from "./route";

function postRequest(body: unknown) {
  return new Request("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createSessionTokenMock.mockResolvedValue("token");
    setSessionCookieMock.mockResolvedValue(undefined);
  });

  it("returns 400 for invalid payload", async () => {
    const response = await POST(postRequest({ email: "bad", password: "" }));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBeDefined();
    expect(findUniqueMock).not.toHaveBeenCalled();
  });

  it("returns 401 when user does not exist", async () => {
    findUniqueMock.mockResolvedValue(null);

    const response = await POST(
      postRequest({
        email: "missing@example.com",
        password: "Password123",
      }),
    );

    expect(response.status).toBe(401);
    expect(verifyPasswordMock).not.toHaveBeenCalled();
  });

  it("returns 401 when password is invalid", async () => {
    findUniqueMock.mockResolvedValue({
      id: "u1",
      email: "user@example.com",
      nickname: "user",
      passwordHash: "hash",
    });
    verifyPasswordMock.mockResolvedValue(false);

    const response = await POST(
      postRequest({
        email: "user@example.com",
        password: "WrongPassword",
      }),
    );

    expect(response.status).toBe(401);
    expect(setSessionCookieMock).not.toHaveBeenCalled();
  });

  it("logs user in and sets session on success", async () => {
    findUniqueMock.mockResolvedValue({
      id: "u1",
      email: "user@example.com",
      nickname: "user",
      passwordHash: "hash",
    });
    verifyPasswordMock.mockResolvedValue(true);

    const response = await POST(
      postRequest({
        email: "user@example.com",
        password: "Password123",
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.user).toEqual({
      id: "u1",
      email: "user@example.com",
      nickname: "user",
    });
    expect(createSessionTokenMock).toHaveBeenCalledWith({
      userId: "u1",
      email: "user@example.com",
      nickname: "user",
    });
    expect(setSessionCookieMock).toHaveBeenCalledWith("token");
  });

  it("returns 500 on unexpected error", async () => {
    findUniqueMock.mockRejectedValue(new Error("db down"));

    const response = await POST(
      postRequest({
        email: "user@example.com",
        password: "Password123",
      }),
    );

    expect(response.status).toBe(500);
  });
});
