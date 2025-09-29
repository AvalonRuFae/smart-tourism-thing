/**
 * Global Styles and Theme Configuration
 * Professional styling for Hong Kong Tourism App
 */

import styled, { createGlobalStyle } from "styled-components";

// Theme Configuration
export const theme = {
	colors: {
		// Primary Colors - Hong Kong inspired
		primary: "#D32F2F", // Hong Kong Red
		primaryLight: "#FF6659",
		primaryDark: "#9A0007",

		// Secondary Colors
		secondary: "#1976D2", // Ocean Blue
		secondaryLight: "#63A4FF",
		secondaryDark: "#004BA0",

		// Neutral Colors
		background: "#FAFAFA",
		surface: "#FFFFFF",
		surfaceDark: "#F5F5F5",

		// Text Colors
		textPrimary: "#212121",
		textSecondary: "#757575",
		textLight: "#BDBDBD",

		// Status Colors
		success: "#4CAF50",
		warning: "#FF9800",
		error: "#F44336",
		info: "#2196F3",

		// Map and UI Colors
		mapAccent: "#4CAF50",
		traffic: {
			low: "#4CAF50",
			medium: "#FF9800",
			high: "#FF5722",
			severe: "#F44336",
		},
	},

	typography: {
		fontFamily: {
			primary:
				"'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
			heading:
				"'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
			mono: "'JetBrains Mono', 'Consolas', monospace",
		},

		fontSize: {
			xs: "0.75rem", // 12px
			sm: "0.875rem", // 14px
			base: "1rem", // 16px
			lg: "1.125rem", // 18px
			xl: "1.25rem", // 20px
			"2xl": "1.5rem", // 24px
			"3xl": "1.875rem", // 30px
			"4xl": "2.25rem", // 36px
		},

		fontWeight: {
			light: 300,
			normal: 400,
			medium: 500,
			semibold: 600,
			bold: 700,
		},

		lineHeight: {
			tight: 1.25,
			normal: 1.5,
			relaxed: 1.75,
		},
	},

	spacing: {
		xs: "0.25rem", // 4px
		sm: "0.5rem", // 8px
		md: "1rem", // 16px
		lg: "1.5rem", // 24px
		xl: "2rem", // 32px
		"2xl": "3rem", // 48px
		"3xl": "4rem", // 64px
		"4xl": "6rem", // 96px
	},

	breakpoints: {
		sm: "640px",
		md: "768px",
		lg: "1024px",
		xl: "1280px",
		"2xl": "1536px",
	},

	shadows: {
		sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
		base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
		md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
		lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
		xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
	},

	borderRadius: {
		// Unified border radius system for UI improvements
		none: "0", // No border radius for internal components
		outer: "0.5rem", // Border radius for outer corners of unified layouts
		inner: "0", // Border radius for internal sections (same as none for clarity)

		// Existing border radius values (maintained for backward compatibility)
		sm: "0.125rem", // 2px
		base: "0.25rem", // 4px
		md: "0.375rem", // 6px
		lg: "0.5rem", // 8px
		xl: "0.75rem", // 12px
		"2xl": "1rem", // 16px
		full: "9999px",
	},

	zIndex: {
		dropdown: 1000,
		sticky: 1020,
		fixed: 1030,
		modalBackdrop: 1040,
		modal: 1050,
		popover: 1060,
		tooltip: 1070,
	},
};

// Global Styles
export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    font-family: ${theme.typography.fontFamily.primary};
    font-size: ${theme.typography.fontSize.base};
    line-height: ${theme.typography.lineHeight.normal};
    color: ${theme.colors.textPrimary};
    background-color: ${theme.colors.background};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${theme.typography.fontFamily.heading};
    font-weight: ${theme.typography.fontWeight.semibold};
    line-height: ${theme.typography.lineHeight.tight};
    margin-bottom: ${theme.spacing.md};
  }

  h1 {
    font-size: ${theme.typography.fontSize["4xl"]};
  }

  h2 {
    font-size: ${theme.typography.fontSize["3xl"]};
  }

  h3 {
    font-size: ${theme.typography.fontSize["2xl"]};
  }

  h4 {
    font-size: ${theme.typography.fontSize.xl};
  }

  h5 {
    font-size: ${theme.typography.fontSize.lg};
  }

  h6 {
    font-size: ${theme.typography.fontSize.base};
  }

  p {
    margin-bottom: ${theme.spacing.md};
  }

  a {
    color: ${theme.colors.primary};
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: ${theme.colors.primaryDark};
      text-decoration: underline;
    }
  }

  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    outline: none;
    transition: all 0.2s ease;
  }

  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
    outline: none;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Prevent horizontal overflow globally */
  html, body {
    overflow-x: hidden;
    max-width: 100%;
  }

  /* Ensure all elements respect container bounds */
  * {
    max-width: 100%;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  /* Scrollbar Styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${theme.colors.surfaceDark};
    border-radius: ${theme.borderRadius.base};
  }

  ::-webkit-scrollbar-thumb {
    background: ${theme.colors.textLight};
    border-radius: ${theme.borderRadius.base};

    &:hover {
      background: ${theme.colors.textSecondary};
    }
  }

  /* Loading Animation */
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      transform: translateY(10px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }

  .animate-fadeIn {
    animation: fadeIn 0.3s ease-in-out;
  }

  .animate-slideUp {
    animation: slideUp 0.3s ease-out;
  }
`;

// Common Styled Components
export const Container = styled.div`
	width: 100%;
	max-width: 1280px;
	margin: 0 auto;
	padding: 0 ${theme.spacing.md};

	@media (min-width: ${theme.breakpoints.sm}) {
		padding: 0 ${theme.spacing.lg};
	}

	@media (min-width: ${theme.breakpoints.lg}) {
		padding: 0 ${theme.spacing.xl};
	}
`;

export const Card = styled.div`
	background: ${theme.colors.surface};
	border-radius: ${theme.borderRadius.lg};
	box-shadow: ${theme.shadows.base};
	padding: ${theme.spacing.lg};
	transition: box-shadow 0.2s ease;

	&:hover {
		box-shadow: ${theme.shadows.md};
	}
`;

export const Button = styled.button<{
	variant?: "primary" | "secondary" | "outline" | "ghost";
	size?: "sm" | "md" | "lg";
	fullWidth?: boolean;
}>`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: ${theme.spacing.sm};
	font-weight: ${theme.typography.fontWeight.medium};
	border-radius: ${theme.borderRadius.md};
	transition: all 0.2s ease;
	text-decoration: none;

	${({ size = "md" }) => {
		switch (size) {
			case "sm":
				return `
          padding: ${theme.spacing.sm} ${theme.spacing.md};
          font-size: ${theme.typography.fontSize.sm};
        `;
			case "lg":
				return `
          padding: ${theme.spacing.md} ${theme.spacing.xl};
          font-size: ${theme.typography.fontSize.lg};
        `;
			default:
				return `
          padding: ${theme.spacing.md} ${theme.spacing.lg};
          font-size: ${theme.typography.fontSize.base};
        `;
		}
	}}

	${({ variant = "primary" }) => {
		switch (variant) {
			case "secondary":
				return `
          background: ${theme.colors.secondary};
          color: white;
          
          &:hover:not(:disabled) {
            background: ${theme.colors.secondaryDark};
          }
        `;
			case "outline":
				return `
          background: transparent;
          color: ${theme.colors.primary};
          border: 2px solid ${theme.colors.primary};
          
          &:hover:not(:disabled) {
            background: ${theme.colors.primary};
            color: white;
          }
        `;
			case "ghost":
				return `
          background: transparent;
          color: ${theme.colors.primary};
          
          &:hover:not(:disabled) {
            background: ${theme.colors.surfaceDark};
          }
        `;
			default:
				return `
          background: ${theme.colors.primary};
          color: white;
          
          &:hover:not(:disabled) {
            background: ${theme.colors.primaryDark};
          }
        `;
		}
	}}

  ${({ fullWidth }) => fullWidth && "width: 100%;"}

  &:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	&:focus-visible {
		outline: 2px solid ${theme.colors.primary};
		outline-offset: 2px;
	}
`;

export const Grid = styled.div<{
	cols?: number;
	gap?: string;
	responsive?: boolean;
}>`
	display: grid;
	gap: ${({ gap }) => gap || theme.spacing.lg};

	${({ cols = 2, responsive = true }) => {
		if (responsive) {
			return `
        grid-template-columns: 1fr;
        
        @media (min-width: ${theme.breakpoints.md}) {
          grid-template-columns: repeat(${cols}, 1fr);
        }
      `;
		}
		return `grid-template-columns: repeat(${cols}, 1fr);`;
	}}
`;

export const Flex = styled.div<{
	direction?: "row" | "column";
	align?: "start" | "center" | "end" | "stretch";
	justify?: "start" | "center" | "end" | "between" | "around";
	gap?: string;
	wrap?: boolean;
}>`
	display: flex;
	flex-direction: ${({ direction = "row" }) => direction};
	align-items: ${({ align = "center" }) => {
		switch (align) {
			case "start":
				return "flex-start";
			case "end":
				return "flex-end";
			default:
				return align;
		}
	}};
	justify-content: ${({ justify = "start" }) => {
		switch (justify) {
			case "start":
				return "flex-start";
			case "end":
				return "flex-end";
			case "between":
				return "space-between";
			case "around":
				return "space-around";
			default:
				return justify;
		}
	}};
	gap: ${({ gap }) => gap || "0"};
	${({ wrap }) => wrap && "flex-wrap: wrap;"}
`;

// Layout Overflow Prevention Components
export const ResizableContainer = styled.div`
	display: flex;
	min-height: 0;
	overflow: visible;
	flex: 1;
	width: 100%;
	max-width: 100%;
	box-sizing: border-box;

	/* Ensure proper flex constraints for resizable layouts */
	&.horizontal {
		flex-direction: row;
		flex-wrap: wrap;

		@media (max-width: ${theme.breakpoints.md}) {
			flex-direction: column;
		}
	}

	&.vertical {
		flex-direction: column;
	}
`;

export const FlexibleContent = styled.div.withConfig({
	shouldForwardProp: (prop) =>
		!["minWidth", "maxWidth", "minHeight", "maxHeight"].includes(prop),
})<{
	minWidth?: string;
	maxWidth?: string;
	minHeight?: string;
	maxHeight?: string;
}>`
	flex: 1 1 auto;
	min-width: ${({ minWidth }) => minWidth || "0"};
	max-width: ${({ maxWidth }) => maxWidth || "100%"};
	min-height: ${({ minHeight }) => minHeight || "0"};
	max-height: ${({ maxHeight }) => maxHeight || "none"};
	overflow: visible;
	width: 100%;
	box-sizing: border-box;

	/* Ensure content reflows properly during resizing */
	display: flex;
	flex-direction: column;

	/* Prevent content from being clipped or obscured */
	&.scrollable {
		overflow-y: auto;
		overflow-x: hidden;
		max-height: ${({ maxHeight }) => maxHeight || "70vh"};
	}

	&.no-shrink {
		flex-shrink: 0;
	}

	/* Force content to wrap and not overflow */
	word-wrap: break-word;
	overflow-wrap: break-word;

	/* Ensure all child elements respect container bounds */
	> * {
		max-width: 100%;
		box-sizing: border-box;
	}
`;
