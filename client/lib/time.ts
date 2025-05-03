export const formatRelativeTime = (date: Date): string => {
	const now = new Date();
	const diff = (now.getTime() - date.getTime()) / 1000; // seconds

	const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

	if (diff < 60) return rtf.format(-Math.floor(diff), "second");
	if (diff < 3600) return rtf.format(-Math.floor(diff / 60), "minute");
	if (diff < 86400) return rtf.format(-Math.floor(diff / 3600), "hour");
	if (diff < 2592000) return rtf.format(-Math.floor(diff / 86400), "day");
	if (diff < 31104000) return rtf.format(-Math.floor(diff / 2592000), "month");

	return rtf.format(-Math.floor(diff / 31104000), "year");
};
