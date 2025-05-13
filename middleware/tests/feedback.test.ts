import request from "supertest";
import app from "../src/server";

vi.mock("../src/supabase", () => {
  const fn = () => vi.fn();

  return {
    supabase: {
      auth: {
        getUser: vi.fn(),
      },
      from: vi.fn(),
    },
  };
});

import { vi, type Mock } from "vitest";
import { supabase } from "../src/supabase";

const supabaseMock = vi.mocked(supabase, true);

const getUserMock = supabaseMock.auth.getUser as unknown as Mock;
const fromMock = supabaseMock.from as unknown as Mock;

global.fetch = vi.fn();
const AUTH_HEADER = { Authorization: "Bearer validToken" };

describe("Feedback Routes", () => {
  it("POST /feedback without auth returns 401", async () => {
    const res = await request(app).post("/feedback").send({ content: "Hi" });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toMatch(/missing authorization/i);
  });

  it("POST /feedback missing content returns 400", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "u1" } },
      error: null,
    });

    const res = await request(app).post("/feedback").set(AUTH_HEADER).send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/content is required/i);
  });

  it("POST /feedback with valid payload creates feedback (201)", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "u1" } },
      error: null,
    });

    const mockInsertChain = {
      single: vi.fn().mockResolvedValue({
        data: { id: "fb1", user_id: "u1", content: "Hello" },
        error: null,
      }),
    };
    fromMock.mockReturnValue({
      insert: vi.fn().mockReturnValue(mockInsertChain),
    });

    const res = await request(app)
      .post("/feedback")
      .set(AUTH_HEADER)
      .send({ content: "Hello" });

    expect(res.statusCode).toBe(201);
    expect(res.body.feedback).toMatchObject({ id: "fb1", content: "Hello" });
  });

  it("GET /feedback/:id for non‑existent id returns 404", async () => {
    fromMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    });

    const res = await request(app).get("/feedback/does-not-exist");
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  it("DELETE /feedback/:id by non‑owner returns 403", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "intruder" } },
      error: null,
    });

    fromMock.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "fb1", user_id: "owner" },
            error: null,
          }),
        }),
      }),
    });

    const res = await request(app).delete("/feedback/fb1").set(AUTH_HEADER);
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/cannot delete/i);
  });

  it("POST /feedback/:id/upvote increments upvotes", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "u1" } },
      error: null,
    });

    const firstQuery = {
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi
            .fn()
            .mockResolvedValue({ data: { upvotes: 1 }, error: null }),
        })),
      })),
    };

    const secondQuery = {
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: { id: "fb1", upvotes: 2 },
              error: null,
            }),
          })),
        })),
      })),
    };

    fromMock.mockReset();
    fromMock.mockReturnValueOnce(firstQuery).mockReturnValueOnce(secondQuery);

    const res = await request(app)
      .post("/feedback/fb1/upvote")
      .set(AUTH_HEADER);
    expect(res.statusCode).toBe(200);
    expect(res.body.feedback.upvotes).toBe(2);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});
