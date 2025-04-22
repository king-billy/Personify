import LandingPage from "@/components/LandingPage";
import VibesDashboard from "@/components/VibesDashboard";

export default function DashboardPage() {
	return (
		<div>
			<div className="min-h-screen pb-20">
				<LandingPage />
			</div>
			<div className="min-h-screen p-6">
				<h1 className="text-6xl font-bold mb-6">Your Stats.</h1>
				<VibesDashboard />
			</div>
		</div>
	);
}
