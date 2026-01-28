/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ["class"],
	content: [
		'./src/**/*.{js,ts,jsx,tsx,mdx}',
	],
	// Safelist classes used by Hemingway editor highlights (applied dynamically via ProseMirror decorations)
	safelist: [
		'bg-blue-200',
		'dark:bg-blue-900/50',
		'bg-yellow-200',
		'dark:bg-yellow-900/50',
		'bg-red-200',
		'dark:bg-red-900/50',
		'bg-purple-200',
		'dark:bg-purple-900/50',
		'border-b-2',
		'border-green-500',
		'cursor-help',
		'transition-colors',
		'duration-200',
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ['var(--font-sans)'],
				serif: ['var(--font-serif)'],
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				celebration: {
					DEFAULT: 'hsl(var(--celebration))',
					foreground: 'hsl(var(--celebration-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			}
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		require("@tailwindcss/typography"),
	],
}

