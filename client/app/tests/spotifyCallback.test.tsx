/// <reference types="vitest/globals" />

import { SPOTIFY_ACCESS } from "@/lib/constants";
import { render, waitFor } from "@testing-library/react";
import router from "next-router-mock";
import { vi } from "vitest";

import CallbackPage from "@/app/spotify-auth/callback/page";

describe("Spotify OAuth Callback Page", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorage.clear();
	});

	const setHref = (href: string) =>
		Object.defineProperty(window, "location", {
			writable: true,
			value: new URL(href),
		});

	it("stores token & expiry and redirects to /dashboard when query parameters exist", async () => {
		const replaceSpy = vi.spyOn(router, "replace");
		setHref("http://localhost/spotify-auth/callback?access_token=foo123&expires_in=3600");

		render(<CallbackPage />);

		await waitFor(() => {
			expect(replaceSpy).toHaveBeenCalledWith("/dashboard");

			const stored = JSON.parse(localStorage.getItem(SPOTIFY_ACCESS) as string);
			expect(stored.bearer).toBe("foo123");
			expect(new Date(stored.expiration).getTime()).toBeGreaterThan(Date.now());
		});
	});

	it("logs an error and does not redirect when parameters are missing", async () => {
		const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const replaceSpy = vi.spyOn(router, "replace");
		setHref("http://localhost/spotify-auth/callback");

		render(<CallbackPage />);

		await waitFor(() => {
			expect(errSpy).toHaveBeenCalledWith("Error fetching spotify data.");
			expect(replaceSpy).not.toHaveBeenCalled();
			expect(localStorage.getItem(SPOTIFY_ACCESS)).toBeNull();
		});
	});
});
