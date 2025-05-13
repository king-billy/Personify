/// <reference types="vitest/globals" />

import { useAccountData as _ua } from "@/hooks/useAccountData";
import { useSpotifyData as _us } from "@/hooks/useSpotifyData";
import { MIDDLEWARE_PORT, SITE_ACCESS } from "@/lib/constants";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import router from "next-router-mock";
import { vi, type Mock } from "vitest";

vi.mock("@/components/HeaderComponent", () => ({ default: () => <div data-testid="header" /> }));
vi.mock("@/components/ViewAllFeedbackButton", () => ({
	default: () => <button data-testid="view-all" />,
}));

vi.mock("@/hooks/useAccountData", () => ({ useAccountData: vi.fn() }));
vi.mock("@/hooks/useSpotifyData", () => ({ useSpotifyData: vi.fn() }));
const mockUseAccountData = _ua as unknown as Mock;
const mockUseSpotifyData = _us as unknown as Mock;

import FeedbackPage from "@/app/feedback/page";

const user = { user: { email: "user@example.com" } };
const spotifyProfile = { display_name: "SpotifyUser" };

const getForm = () => screen.getByRole("textbox").closest("form") as HTMLFormElement;

describe("FeedbackPage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorage.clear();
		router.setCurrentUrl("/feedback");
		mockUseAccountData.mockReturnValue({ data: user, loading: false, error: null });
		mockUseSpotifyData.mockReturnValue({ data: spotifyProfile, loading: false, error: null });
	});

	it("redirects to / when account hook returns an error", async () => {
		mockUseAccountData.mockReturnValue({ data: null, loading: false, error: new Error("bad") });
		const replaceSpy = vi.spyOn(router, "replace");

		render(<FeedbackPage />);
		await waitFor(() => expect(replaceSpy).toHaveBeenCalledWith("/"));
	});

	it("shows Spotify display name when available, else falls back to email", () => {
		render(<FeedbackPage />);
		expect(screen.getByRole("heading", { name: /spotifyuser/i })).toBeInTheDocument();

		mockUseSpotifyData.mockReturnValue({ data: null, loading: false, error: null });
		render(<FeedbackPage />);
		expect(screen.getByRole("heading", { name: /user@example\.com/i })).toBeInTheDocument();
	});

	it("blocks submission when textarea is empty", async () => {
		const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({} as any);

		render(<FeedbackPage />);
		fireEvent.submit(getForm());

		expect(await screen.findByText(/feedback cannot be empty/i)).toBeInTheDocument();
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it("shows auth error when SITE_ACCESS token is missing", async () => {
		const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({} as any);

		render(<FeedbackPage />);
		fireEvent.change(screen.getByRole("textbox"), { target: { value: "Great app!" } });
		fireEvent.submit(getForm());

		expect(await screen.findByText(/user is not authenticated/i)).toBeInTheDocument();
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it("POSTs feedback and navigates on success", async () => {
		localStorage.setItem(SITE_ACCESS, "jwt‑token");
		const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce(
			new Response(JSON.stringify({ ok: true }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			}),
		);
		const pushSpy = vi.spyOn(router, "push");

		render(<FeedbackPage />);
		fireEvent.change(screen.getByRole("textbox"), { target: { value: "Awesome work!" } });
		fireEvent.submit(getForm());

		await waitFor(() => {
			expect(fetchSpy).toHaveBeenCalledWith(`http://localhost:${MIDDLEWARE_PORT}/feedback`, expect.any(Object));
			expect(pushSpy).toHaveBeenCalledWith("/feedbacks");
			expect(screen.getByRole("textbox")).toHaveValue("");
		});
	});
});
