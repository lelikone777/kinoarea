import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  findFirstMock,
  createMock,
  hashPasswordMock,
  createSessionTokenMock,
  setSessionCookieMock,
} = vi.hoisted(() => ({
  findFirstMock: vi.fn(),
  createMock: vi.fn(),
  hashPasswordMock: vi.fn(),
  createSessionTokenMock: vi.fn(),
  setSessionCookieMock: vi.fn(),
}));

vi.mock("@/app/lib/db", () => ({
  db: {
    user: {
      findFirst: findFirstMock,
      create: createMock,
    },
  },
}));

vi.mock("@/app/lib/auth/password", () => ({
  hashPassword: hashPasswordMock,
}));

vi.mock("@/app/lib/auth/session", () => ({
  createSessionToken: createSessionTokenMock,
  setSessionCookie: setSessionCookieMock,
}));

import { POST } from "./route";

function postRequest(body: unknown) {
  return new Request("http://localhost/api/auth/register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hashPasswordMock.mockResolvedValue("hashed-password");
    createSessionTokenMock.mockResolvedValue("token");
    setSessionCookieMock.mockResolvedValue(undefined);
  });

  it("returns 400 for invalid payload", async () => {
    const response = await POST(postRequest({ email: "bad", nickname: "ab", password: "123", confirmPassword: "321" }));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBeDefined();
    expect(findFirstMock).not.toHaveBeenCalled();
  });

  it("returns 409 when email already exists", async () => {
    findFirstMock.mockResolvedValue({
      id: "u1",
      email: "test@example.com",
      nickname: "tester",
    });

    const response = await POST(
      postRequest({
        email: "test@example.com",
        nickname: "new_nickname",
        password: "Password123",
        confirmPassword: "Password123",
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.error).toBeTypeOf("string");
    expect(createMock).not.toHaveBeenCalled();
  });

  it("returns 409 when nickname already exists", async () => {
    findFirstMock.mockResolvedValue({
      id: "u1",
      email: "other@example.com",
      nickname: "taken_name",
    });

    const response = await POST(
      postRequest({
        email: "new@example.com",
        nickname: "taken_name",
        password: "Password123",
        confirmPassword: "Password123",
      }),
    );

    expect(response.status).toBe(409);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("creates user and sets session on success", async () => {
    findFirstMock.mockResolvedValue(null);
    createMock.mockResolvedValue({
      id: "u1",
      email: "new@example.com",
      nickname: "new_user",
    });

    const response = await POST(
      postRequest({
        email: "new@example.com",
        nickname: "new_user",
        password: "Password123",
        confirmPassword: "Password123",
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.user).toEqual({
      id: "u1",
      email: "new@example.com",
      nickname: "new_user",
    });
    expect(hashPasswordMock).toHaveBeenCalledWith("Password123");
    expect(createSessionTokenMock).toHaveBeenCalledWith({
      userId: "u1",
      email: "new@example.com",
      nickname: "new_user",
    });
    expect(setSessionCookieMock).toHaveBeenCalledWith("token");
  });

  it("returns 500 on unexpected error", async () => {
    findFirstMock.mockRejectedValue(new Error("db down"));

    const response = await POST(
      postRequest({
        email: "new@example.com",
        nickname: "new_user",
        password: "Password123",
        confirmPassword: "Password123",
      }),
    );

    expect(response.status).toBe(500);
  });
});
