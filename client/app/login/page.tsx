"use client";

import { useAccountData } from "@/hooks/useAccountData";
import { MIDDLEWARE_PORT, SITE_ACCESS } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { JSX, useEffect, useState } from "react";

const LoginPage = () => {
	const router = useRouter();

	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [isRegistering, setIsRegistering] = useState<boolean>(false);
	const [formError, setFormError] = useState<string | null>(null);
	const [skipCheck, setSkipCheck] = useState<boolean>(false);

	const { data: userData, loading: userLoading, error: userError } = useAccountData<{ user: any }>("/auth/me");

	useEffect(() => {
		if (userData) {
			router.replace("/dashboard");
		} else if (userError) {
			setSkipCheck(true);
		}
	}, [userData, userError, router]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setFormError(null);

		const endpoint = isRegistering ? "/auth/register" : "/auth/login";

		try {
			const res = await fetch(`http://localhost:${MIDDLEWARE_PORT}${endpoint}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, password }),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Authentication failed");
			}

			const { session } = data.data;
			localStorage.setItem(SITE_ACCESS, session?.access_token || "");
			router.push("/dashboard");
		} catch (err: any) {
			console.error(err);
			setFormError(err.message);
		}
	};

	const toggleMode = () => {
		setIsRegistering(!isRegistering);
		setFormError(null);
	};

	const renderForm = (): JSX.Element => {
		return (
			<>
				<form onSubmit={handleSubmit} className="space-y-4">
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="Email"
						className="text-black w-full p-3 border border-gray-300 rounded"
						required
					/>
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Password"
						className="text-black w-full p-3 border border-gray-300 rounded"
						required
					/>
					{formError && <p className="text-red-500 text-sm">{formError}</p>}
					<button
						type="submit"
						className="w-full bg-black text-white py-3 rounded hover:bg-gray-800 transition"
					>
						{isRegistering ? "Register" : "Login"}
					</button>
				</form>
				<button onClick={toggleMode} className="text-blue-500 hover:underline block mx-auto mt-2">
					{isRegistering ? "Already have an account? Login" : "Don't have an account? Register"}
				</button>
			</>
		);
	};

	const renderLoader = (): JSX.Element => {
		return (
			<div className="min-h-[80px] flex items-center justify-center">
				<p className="text-sm text-black flex items-center justify-center">Checking session...</p>
			</div>
		);
	};

	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="w-full max-w-md p-8 space-y-4 bg-white shadow rounded-lg">
				<h1 className="text-2xl font-bold text-center text-black">User Account</h1>
				{userLoading || !skipCheck ? renderLoader() : renderForm()}
			</div>
		</div>
	);
};

export default LoginPage;
