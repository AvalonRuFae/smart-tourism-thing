/**
 * DragBar Component - Unified drag bar styling for UI improvements
 * Implements rectangular design with subtle hover states without size transformations
 * Requirements: 3.1, 3.2, 3.4
 */

import React from "react";
import styled from "styled-components";
import { theme } from "../../styles/theme";

interface DragBarProps {
	direction?: "horizontal" | "vertical";
	isDragging?: boolean;
	onMouseDown?: (e: React.MouseEvent) => void;
	className?: string;
	"data-testid"?: string;
}

const DragBarStyled = styled.div.withConfig({
	shouldForwardProp: (prop) => !["direction", "isDragging"].includes(prop),
})<{
	direction: "horizontal" | "vertical";
	isDragging?: boolean;
}>`
	background: ${(props) =>
		props.isDragging ? theme.colors.primary : theme.colors.surfaceDark};
	border-radius: ${theme.borderRadius.none}; /* Always rectangular */
	cursor: ${(props) =>
		props.direction === "horizontal" ? "col-resize" : "row-resize"};
	position: relative;
	transition: background-color 0.2s ease, opacity 0.2s ease;
	user-select: none;
	display: flex;
	align-items: center;
	justify-content: center;

	/* Size based on direction */
	${(props) =>
		props.direction === "horizontal"
			? `
    width: 20px;
    min-height: 100%;
  `
			: `
    height: 20px;
    min-width: 100%;
    margin: 2px 0;
  `}

	&:hover {
		background: ${theme.colors.textLight};
		opacity: 0.8;
		/* NO transform, scale, or size changes */
	}

	&:active {
		background: ${theme.colors.primary};
		opacity: 0.6;
	}

	&::before {
		content: ${(props) =>
			props.direction === "horizontal" ? '"⋮⋮"' : '"═══"'};
		color: ${(props) =>
			props.isDragging ? "white" : theme.colors.textSecondary};
		font-size: ${(props) =>
			props.direction === "horizontal" ? "18px" : "14px"};
		font-weight: bold;
		letter-spacing: ${(props) =>
			props.direction === "horizontal" ? "2px" : "4px"};
		transition: color 0.2s ease;
	}

	&:hover::before {
		color: ${theme.colors.textSecondary};
	}

	&:active::before {
		color: white;
	}

	/* Add some padding area for easier clicking - reduced to prevent overlap */
	&::after {
		content: "";
		position: absolute;
		${(props) =>
			props.direction === "horizontal"
				? `
      top: -5px;
      left: -3px;
      right: -3px;
      bottom: -5px;
      cursor: col-resize;
    `
				: `
      top: -3px;
      left: -8px;
      right: -8px;
      bottom: -3px;
      cursor: row-resize;
    `}
	}

	@media (max-width: ${theme.breakpoints.lg}) {
		display: none;
	}
`;

/**
 * DragBar Component
 *
 * @param direction - 'horizontal' for vertical resizing, 'vertical' for horizontal resizing
 * @param isDragging - Whether the drag bar is currently being dragged
 * @param onMouseDown - Mouse down event handler for drag functionality
 * @param className - Additional CSS classes
 */
export const DragBar: React.FC<DragBarProps> = ({
	direction = "horizontal",
	isDragging = false,
	onMouseDown,
	className,
	"data-testid": dataTestId,
}) => {
	return (
		<DragBarStyled
			direction={direction}
			isDragging={isDragging}
			onMouseDown={onMouseDown}
			className={className}
			data-testid={dataTestId}
		/>
	);
};

export default DragBar;
