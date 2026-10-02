import { extendTheme } from "@chakra-ui/react";

// Brand palette: a deep "ink" indigo, used for primary actions and highlights
const brand = {
	50: "#EEF0FF",
	100: "#DADFFF",
	200: "#B8C0FE",
	300: "#929DF8",
	400: "#6F79EE",
	500: "#5157DF",
	600: "#4142C4",
	700: "#36349E",
	800: "#2E2D7C",
	900: "#22215A",
};

const theme = extendTheme({
	config: { initialColorMode: "light", useSystemColorMode: false },
	colors: { brand },
	fonts: {
		heading: "'Fraunces Variable', Georgia, serif",
		body: "'Inter Variable', system-ui, -apple-system, 'Segoe UI', sans-serif",
	},
	// Colors that switch between light and dark mode
	semanticTokens: {
		colors: {
			"bg.canvas": { default: "gray.50", _dark: "gray.900" },
			"bg.surface": { default: "white", _dark: "gray.800" },
			"bg.subtle": { default: "gray.100", _dark: "gray.700" },
			"bg.brand": { default: "brand.50", _dark: "rgba(111, 121, 238, 0.12)" },
			"text.default": { default: "gray.800", _dark: "gray.100" },
			"text.muted": { default: "gray.600", _dark: "gray.400" },
			"text.subtle": { default: "gray.500", _dark: "gray.500" },
			"text.brand": { default: "brand.600", _dark: "brand.300" },
			"border.subtle": { default: "gray.200", _dark: "gray.700" },
		},
	},
	styles: {
		global: {
			body: { bg: "bg.canvas", color: "text.default", WebkitFontSmoothing: "antialiased" },
			"::selection": { bg: "brand.100", color: "brand.900" },
		},
	},
	layerStyles: {
		// A white panel with a soft border and shadow
		card: {
			bg: "bg.surface",
			borderWidth: "1px",
			borderColor: "border.subtle",
			rounded: "xl",
			shadow: "sm",
		},
	},
	textStyles: {
		eyebrow: { fontSize: "xs", fontWeight: "semibold", textTransform: "uppercase", letterSpacing: "wider", color: "text.brand" },
	},
	components: {
		Button: {
			baseStyle: { rounded: "lg", fontWeight: "semibold" },
			defaultProps: { colorScheme: "brand" },
		},
		Input: { defaultProps: { focusBorderColor: "brand.400" } },
		Select: { defaultProps: { focusBorderColor: "brand.400" } },
		Textarea: { defaultProps: { focusBorderColor: "brand.400" } },
		NumberInput: { defaultProps: { focusBorderColor: "brand.400" } },
		Heading: { baseStyle: { fontWeight: "600", letterSpacing: "-0.01em" } },
		Badge: { baseStyle: { rounded: "md", px: 2, textTransform: "none", fontWeight: "medium" } },
		Link: { baseStyle: { color: "text.brand" } },
		FormLabel: { baseStyle: { fontSize: "sm", fontWeight: "medium", mb: 1 } },
		Table: { baseStyle: { th: { fontFamily: "body", letterSpacing: "wider" } } },
	},
});

export default theme;
