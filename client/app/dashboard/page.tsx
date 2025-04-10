import VibesDashboard from "@/components/VibesDashboard";

export default function DashboardPage() {
	return (
		<div className="min-h-screen p-6">
			<h1 className="text-6xl font-bold mb-6">Your Stats.</h1>
			<VibesDashboard />
		</div>
	);
}
