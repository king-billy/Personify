"use client";

import { useAccountData } from "@/hooks/useAccountData";
import { useSpotifyData } from "@/hooks/useSpotifyData";
import { SITE_ACCESS, SPOTIFY_ACCESS } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IconType } from "react-icons";
import { BiLogOutCircle } from "react-icons/bi";
import { FaUser } from "react-icons/fa";

interface MenuItem {
	label: string;
	icon: IconType;
	action: () => void;
	color?: string;
}

interface ProfileMenuInterface {}

const ProfileMenu: React.FC<ProfileMenuInterface> = (props) => {
	const {} = props;

	const router = useRouter();

	const { data: userData, loading: userLoading, error: userError } = useAccountData<{ user: any }>("/auth/me");

	const {
		data: spotifyUserData,
		error: spotifyFetchError,
		loading: spotifyLoading,
	} = useSpotifyData<any>(`/me/profile`);

	const [isOpen, setIsOpen] = useState<boolean>(false);

	const buttonRef = useRef<HTMLButtonElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const toggleMenu = () => {
		setIsOpen((prev) => {
			return !prev;
		});
	};

	const handleLogout = () => {
		if (SITE_ACCESS in localStorage) localStorage.removeItem(SITE_ACCESS);

		if (SPOTIFY_ACCESS in localStorage) localStorage.removeItem(SPOTIFY_ACCESS);

		router.push("/");
	};

	const handleEditProfile = () => {
		alert("Will implement soon!");
		setIsOpen(false);
	};

	// Close menu if clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Node;
			if (
				buttonRef.current &&
				dropdownRef.current &&
				!buttonRef.current.contains(target) &&
				!dropdownRef.current.contains(target)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const menuItems: MenuItem[] = [
		{
			label: "Edit Profile",
			icon: FaUser,
			action: handleEditProfile,
		},
		{
			label: "Logout",
			icon: BiLogOutCircle,
			action: handleLogout,
			color: "text-red-600",
		},
	];

	return (
		<>
			<button
				ref={buttonRef}
				onClick={toggleMenu}
				className="w-max h-12 text-white flex items-center justify-center focus:outline-none"
			>
				<div className="flex items-center justify-center gap-3">
					<div
						className={`max-h-50 aspect-square flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-90 transition-scale ${spotifyUserData ? "rounded-full" : "rounded-sm"}`}
						style={{
							scale: isOpen ? 1.1 : 1,
						}}
					>
						{spotifyUserData ? (
							<img src={spotifyUserData.images[1].url} width={50} height={50} />
						) : (
							<FaUser />
						)}
					</div>
					<span className={`text-sm font-bold cursor-pointer hover:underline ${isOpen ? "underline" : ""}`}>
						{spotifyUserData?.display_name ?? userData?.user.email}
					</span>
				</div>
			</button>
			{isOpen && (
				<div
					ref={dropdownRef}
					className={`absolute top-18 right-6 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 overflow-hidden`}
				>
					{menuItems.map((item, index) => {
						return (
							<button
								key={index}
								onClick={item.action}
								className={`w-full text-left px-4 py-2 ${
									item.color || "text-black"
								} flex items-center justify-start gap-2 hover:bg-gray-100 hover:cursor-pointer`}
								style={{
									cursor: "pointer",
								}}
							>
								<span>
									<item.icon />
								</span>
								<span>{item.label}</span>
							</button>
						);
					})}
				</div>
			)}
		</>
	);
};

export default ProfileMenu;
