/// <reference types="vitest/globals" />

import { useAccountData as _ua } from "@/hooks/useAccountData";
import { MIDDLEWARE_PORT, SITE_ACCESS } from "@/lib/constants";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import router from "next-router-mock";
import { vi, type Mock } from "vitest";

vi.mock("@/hooks/useAccountData", () => ({ useAccountData: vi.fn() }));
const mockUseAccountData = _ua as unknown as Mock;

import LoginPage from "@/app/login/page";

const user = { user: { email: "me@example.com" } };

describe("LoginPage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorage.clear();
		router.setCurrentUrl("/login");
		mockUseAccountData.mockReturnValue({
			data: null,
			loading: false,
			error: new Error("no session"),
		});
	});

	it("redirects to /dashboard when a session already exists", async () => {
		mockUseAccountData.mockReturnValue({
			data: user,
			loading: false,
			error: null,
		});
		const replaceSpy = vi.spyOn(router, "replace");

		render(<LoginPage />);
		await waitFor(() => expect(replaceSpy).toHaveBeenCalledWith("/dashboard"));
	});

	it("shows loader until “auth/me” returns an error", () => {
		mockUseAccountData.mockReturnValue({
			data: null,
			loading: true,
			error: null,
		});
		render(<LoginPage />);
		expect(screen.getByText(/checking session/i)).toBeInTheDocument();
	});

	it("renders the form after auth check fails", () => {
		render(<LoginPage />);
		expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
	});

	it("toggles between Login and Register modes", () => {
		render(<LoginPage />);

		const toggle = screen.getByRole("button", {
			name: /don't have an account\? register/i,
		});
		fireEvent.click(toggle);

		expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
		expect(
			screen.getByRole("button", {
				name: /already have an account\? login/i,
			}),
		).toBeInTheDocument();
	});

	it("submits login and stores the token on success", async () => {
		const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce(
			new Response(
				JSON.stringify({
					data: { session: { access_token: "tok123" } },
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } },
			),
		);
		const pushSpy = vi.spyOn(router, "push");

		render(<LoginPage />);
		fireEvent.change(screen.getByPlaceholderText(/email/i), {
			target: { value: "me@example.com" },
		});
		fireEvent.change(screen.getByPlaceholderText(/password/i), {
			target: { value: "secret" },
		});
		fireEvent.submit(screen.getByRole("button", { name: /login/i }).closest("form")!);

		await waitFor(() => {
			expect(fetchSpy).toHaveBeenCalledWith(
				`http://localhost:${MIDDLEWARE_PORT}/auth/login`,
				expect.objectContaining({
					method: "POST",
				}),
			);
			expect(localStorage.getItem(SITE_ACCESS)).toBe("tok123");
			expect(pushSpy).toHaveBeenCalledWith("/dashboard");
		});
	});

	it("shows error text when the backend rejects login", async () => {
		vi.spyOn(global, "fetch").mockResolvedValueOnce(
			new Response(JSON.stringify({ error: "invalid creds" }), {
				status: 401,
				headers: { "Content-Type": "application/json" },
			}),
		);

		render(<LoginPage />);
		fireEvent.change(screen.getByPlaceholderText(/email/i), {
			target: { value: "wrong@ex.com" },
		});
		fireEvent.change(screen.getByPlaceholderText(/password/i), {
			target: { value: "bad" },
		});
		fireEvent.submit(screen.getByRole("button", { name: /login/i }).closest("form")!);

		expect(await screen.findByText(/invalid creds/i)).toBeInTheDocument();
	});
});
