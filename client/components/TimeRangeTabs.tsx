export type TimeRangeType = "daily" | "week" | "month" | "year";

interface TimeRangeTabsProps {
	value: TimeRangeType;
	onChange: (value: TimeRangeType) => void;
}

const RANGES: TimeRangeType[] = ["daily", "week", "month", "year"] as const;

const TimeRangeTabs: React.FC<TimeRangeTabsProps> = (props) => {
	const { value, onChange } = props;

	return (
		<div className="flex gap-2 mb-4 align-center justify-flexStart mb-5">
			{RANGES.map((range) => (
				<button
					key={range}
					onClick={() => onChange(range)}
					className={`font-bold px-4 py-2 rounded-full border text-sm transition cursor-pointer ${
						value === range
							? "bg-pink-100 text-black border-pink-100"
							: "bg-transparent border-neutral-600 text-neutral-400 hover:border-neutral-200"
					}`}
				>
					{range.charAt(0).toUpperCase() + range.slice(1)}
				</button>
			))}
		</div>
	);
};

export default TimeRangeTabs;
