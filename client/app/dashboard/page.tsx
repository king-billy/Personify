import LandingPage from "@/components/LandingPage";
import VibesDashboard from "@/components/VibesDashboard";

export default function DashboardPage() {
	return (
		<div>
			<div className="min-h-screen pb-60">
				<LandingPage />
			</div>
			<div id="dashboard" className="min-h-screen p-6">
				<div className="max-w-7xl mx-auto">
					<h1 className="text-6xl font-bold mb-6">Your Stats.</h1>
					<VibesDashboard />
				</div>
			</div>
		</div>
	);
}
