"use client";

import FeedbackButton from "@/components/FeedbackButton";
import ProfileMenu from "@/components/ProfileMenu";

const HeaderComponent: React.FC = () => {
	return (
		<div className="w-screen pt-6">
			<div className="px-6 md:px-6">
				<div className="max-w-7xl mx-auto">
					<div className="flex items-center justify-end gap-5">
						<FeedbackButton />
						<div className="h-[20px] border-l border-solid border-gray" />
						<ProfileMenu />
					</div>
				</div>
			</div>
		</div>
	);
};

export default HeaderComponent;
