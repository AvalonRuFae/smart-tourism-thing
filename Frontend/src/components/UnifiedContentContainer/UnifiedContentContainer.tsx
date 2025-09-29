/**
 * Unified Content Container Component
 * Creates visual unity by wrapping related sections with unified border radius styling
 */

import React from "react";
import styled from "styled-components";
import { theme } from "../../styles/theme";

// Types
interface UnifiedContentContainerProps {
	children: React.ReactNode;
	className?: string;
}

interface ContentSectionProps {
	children: React.ReactNode;
	position?: "top" | "middle" | "bottom";
	className?: string;
}

// Styled Components
const StyledUnifiedContentContainer = styled.div`
	background: ${theme.colors.surface};
	border-radius: ${theme.borderRadius.outer};
	box-shadow: ${theme.shadows.md};
	overflow: hidden;
	display: flex;
	flex-direction: column;
`;

const StyledContentSection = styled.div<{
	position?: "top" | "middle" | "bottom";
}>`
	background: ${theme.colors.surface};
	border-radius: ${theme.borderRadius.inner}; // No individual rounding
	${({ position }) =>
		position !== "bottom" &&
		`
    border-bottom: 1px solid ${theme.colors.surfaceDark};
  `}
`;

// Components
export const UnifiedContentContainer: React.FC<
	UnifiedContentContainerProps
> = ({ children, className }) => {
	return (
		<StyledUnifiedContentContainer className={className}>
			{children}
		</StyledUnifiedContentContainer>
	);
};

export const ContentSection: React.FC<ContentSectionProps> = ({
	children,
	position,
	className,
}) => {
	return (
		<StyledContentSection position={position} className={className}>
			{children}
		</StyledContentSection>
	);
};

export default UnifiedContentContainer;
