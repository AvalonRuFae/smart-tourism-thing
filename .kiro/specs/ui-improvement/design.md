# Design Document

## Overview

This design focuses on implementing targeted UI improvements to address visual fragmentation and layout issues in the Hong Kong Tourism Trip Planning application. The changes will create a more unified interface by adjusting border radius styling and fixing content overlap problems during interface resizing.

## Architecture

### Current Component Structure

The application uses styled-components with the following main layout components:

- `PageContainer`: Main wrapper with background and padding
- `TripMapContainer`: Map display area with rounded corners
- `AttractionSlider`: Details panel with rounded corners
- `TransportCard`: Transport information with rounded corners
- Various smaller components with individual border radius styling

### Design Approach

The solution will modify the existing styled-components to create visual unity while maintaining the current component architecture. No structural changes to React components are needed - only CSS styling adjustments.

## Components and Interfaces

### 1. Unified Border Radius System

**Current Issue**: Each component has individual `border-radius` styling creating visual fragmentation.

**Solution**: Implement a contextual border radius system where:

- Only the outermost container corners are rounded
- Adjacent components have no internal border radius
- Drag bars and dividers remain rectangular

**Implementation Strategy**:

```typescript
// New border radius variants in theme
borderRadius: {
  none: '0',
  outer: '0.5rem',    // Only for outer corners
  inner: '0',         // For internal components
  // ... existing values remain for other UI elements
}
```

### 2. Layout Container Restructuring

**Current Issue**: Individual components float independently causing visual separation.

**Solution**: Create a unified content container that groups related sections:

```typescript
const UnifiedContentContainer = styled.div`
	background: ${theme.colors.surface};
	border-radius: ${theme.borderRadius.outer};
	box-shadow: ${theme.shadows.md};
	overflow: hidden;
	display: flex;
	flex-direction: column;
`;

const ContentSection = styled.div<{ position: "top" | "middle" | "bottom" }>`
	background: ${theme.colors.surface};
	border-radius: 0; // No individual rounding
	${({ position }) =>
		position !== "bottom" &&
		`
    border-bottom: 1px solid ${theme.colors.surfaceDark};
  `}
`;
```

### 3. Drag Bar Styling

**Current Issue**: Drag bars may have rounded corners and enlargement on hover.

**Solution**: Implement subtle, non-transforming hover states:

```typescript
const DragBar = styled.div`
	background: ${theme.colors.surfaceDark};
	border-radius: 0; // Always rectangular
	cursor: col-resize;
	transition: background-color 0.2s ease, opacity 0.2s ease;

	&:hover {
		background: ${theme.colors.textLight};
		opacity: 0.8;
		// NO transform, scale, or size changes
	}

	&:active {
		background: ${theme.colors.primary};
		opacity: 0.6;
	}
`;
```

## Data Models

No changes to existing data models are required. The improvements are purely visual/CSS modifications.

## Error Handling

### Layout Overflow Prevention

**Issue**: Content gets covered during resizing operations.

**Solution**: Implement CSS-based overflow protection:

```typescript
const ResizableContainer = styled.div`
	display: flex;
	min-height: 0; // Allows flex items to shrink below content size
	overflow: hidden;
`;

const FlexibleContent = styled.div`
	flex: 1;
	min-width: 0; // Prevents flex item from overflowing
	overflow: auto;
`;
```

### Responsive Breakpoints

Add responsive behavior to prevent layout issues:

```typescript
const ResponsiveLayout = styled.div`
	display: grid;
	grid-template-columns: 1fr 300px;
	gap: 0;

	@media (max-width: ${theme.breakpoints.md}) {
		grid-template-columns: 1fr;
		grid-template-rows: 300px 1fr;
	}
`;
```

## Testing Strategy

### Visual Regression Testing

1. **Border Radius Consistency**: Verify only outer corners are rounded
2. **Component Unity**: Ensure adjacent components appear seamless
3. **Drag Bar Behavior**: Confirm no size changes on hover
4. **Content Visibility**: Test resizing doesn't hide content

### Responsive Testing

1. **Layout Flexibility**: Test various screen sizes and orientations
2. **Content Reflow**: Verify content adapts without overlap
3. **Minimum Sizes**: Ensure components maintain usability at minimum sizes
4. **Maximum Sizes**: Test layout stability at maximum dimensions

### Interaction Testing

1. **Drag Functionality**: Verify drag bars work smoothly without visual glitches
2. **Hover States**: Confirm subtle feedback without size changes
3. **Transition Smoothness**: Test all CSS transitions are smooth and appropriate
4. **Focus States**: Ensure keyboard navigation remains clear

## Implementation Plan

### Phase 1: Border Radius Unification

- Update theme with new border radius system
- Modify main container components to use unified styling
- Remove individual component border radius where appropriate

### Phase 2: Layout Container Restructuring

- Create unified content container wrapper
- Adjust component hierarchy for visual unity
- Implement proper sectioning with subtle dividers

### Phase 3: Drag Bar Improvements

- Update drag bar styling to remove rounded corners
- Implement non-transforming hover states
- Add appropriate cursor and transition effects

### Phase 4: Overflow Prevention

- Add CSS overflow protection to resizable containers
- Implement proper flex/grid constraints
- Test and adjust minimum/maximum size constraints

## Technical Considerations

### Performance Impact

- Changes are CSS-only, no performance impact expected
- Existing animations and transitions remain unchanged
- No additional JavaScript logic required

### Browser Compatibility

- All CSS properties used have excellent browser support
- Flexbox and Grid layouts are well-supported
- CSS transitions work across all modern browsers

### Maintenance

- Changes follow existing styled-components patterns
- Theme-based approach maintains consistency
- No breaking changes to existing component APIs
