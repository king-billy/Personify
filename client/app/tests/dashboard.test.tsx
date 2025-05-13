/// <reference types="vitest/globals" />

import { useAccountData as _ua } from "@/hooks/useAccountData";
import { SPOTIFY_ACCESS } from "@/lib/constants";
import { render, screen, waitFor } from "@testing-library/react";
import router from "next-router-mock";
import { vi, type Mock } from "vitest";

vi.mock("@/components/HeaderComponent", () => ({
	default: () => <div data-testid="header" />,
}));
vi.mock("@/components/LandingPage", () => ({
	default: ({ isSpotifyConnected }: { isSpotifyConnected: boolean }) => (
		<div data-testid="landing">{String(isSpotifyConnected)}</div>
	),
}));
vi.mock("@/components/VibesDashboard", () => ({
	default: () => <div data-testid="vibes" />,
}));

vi.mock("@/hooks/useAccountData", () => ({
	useAccountData: vi.fn(),
}));
const mockUseAccountData = _ua as unknown as Mock;

import DashboardPage from "@/app/dashboard/page";

const futureISO = (mins = 60) => new Date(Date.now() + mins * 60_000).toISOString();
const pastISO = () => new Date(Date.now() - 60_000).toISOString();

describe("DashboardPage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorage.clear();
		router.setCurrentUrl("/");
	});

	it("redirects to / when the account hook returns an error", async () => {
		mockUseAccountData.mockReturnValue({ data: null, loading: false, error: new Error("bad") });
		const replaceSpy = vi.spyOn(router, "replace");

		render(<DashboardPage />);
		await waitFor(() => expect(replaceSpy).toHaveBeenCalledWith("/"));
	});

	it("renders landing page only when Spotify token is missing/expired", async () => {
		mockUseAccountData.mockReturnValue({ data: { user: {} }, loading: false, error: null });
		localStorage.setItem(SPOTIFY_ACCESS, JSON.stringify({ expiration: pastISO(), bearer: "x" }));

		render(<DashboardPage />);

		await waitFor(() => expect(screen.getByTestId("landing")).toHaveTextContent("false"));
		expect(screen.queryByTestId("vibes")).not.toBeInTheDocument();
	});

	it("renders full dashboard when a valid Spotify token exists", async () => {
		mockUseAccountData.mockReturnValue({ data: { user: {} }, loading: false, error: null });
		localStorage.setItem(SPOTIFY_ACCESS, JSON.stringify({ expiration: futureISO(), bearer: "x" }));

		render(<DashboardPage />);

		await waitFor(() => {
			expect(screen.getByTestId("landing")).toHaveTextContent("true");
			expect(screen.getByRole("heading", { name: /your stats/i })).toBeInTheDocument();
			expect(screen.getByTestId("vibes")).toBeInTheDocument();
		});
	});
});
