import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaArrowLeftLong } from "react-icons/fa6";

const ViewAllFeedbackButton: React.FC = () => {
	const router = useRouter();

	return (
		<div className="w-full flex items-center justify-start gap-2">
			<span
				className="cursor-pointer"
				onClick={() => {
					router.push("/feedbacks");
				}}
			>
				<FaArrowLeftLong />
			</span>
			<h3 className="text-white hover:underline">
				<Link href={`/feedbacks`}>View all Feedbacks</Link>
			</h3>
		</div>
	);
};

export default ViewAllFeedbackButton;
