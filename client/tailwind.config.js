module.exports = {
	content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
	theme: {
		extend: {},
	},
	plugins: [require("tailwindcss-font-inter")()],
	safelist: ["bg-pink-100", "bg-yellow-100", "bg-cyan-100", "bg-green-100"],
};
