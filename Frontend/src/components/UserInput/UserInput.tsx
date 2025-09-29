/**
 * UserInput Component - Interactive input area for user preferences
 * Supports both structured form inputs and natural language text analysis
 */

import React, { useState } from "react";
import styled from "styled-components";
import {
	SearchIcon,
	MoneyIcon,
	ClockIcon,
	GroupIcon,
	ChildIcon,
	AccessibleIcon,
	WalkIcon,
	CarIcon,
	TransitIcon,
} from "../common/Icons";
import { theme } from "../../styles/theme";
import {
	UserInputProps,
	UserPreferences,
	AttractionCategory,
} from "../../types";
import { Card, Button, Flex } from "../../styles/theme";

const InputContainer = styled(Card)`
	height: auto;
	display: flex;
	flex-direction: column;
	gap: ${theme.spacing.lg};
	padding: ${theme.spacing.lg};
	overflow: visible;
	width: 100%;
	max-width: 100%;
	box-sizing: border-box;

	/* Ensure all content is visible and responsive */
	min-height: fit-content;

	/* Responsive padding */
	@media (max-width: ${theme.breakpoints.sm}) {
		padding: ${theme.spacing.md};
		gap: ${theme.spacing.md};
	}
`;

const SectionTitle = styled.h3`
	color: ${theme.colors.textPrimary};
	font-size: ${theme.typography.fontSize.lg};
	font-weight: ${theme.typography.fontWeight.semibold};
	margin-bottom: ${theme.spacing.md};
	display: flex;
	align-items: center;
	gap: ${theme.spacing.sm};

	svg {
		color: ${theme.colors.primary};
	}
`;

const TextInputSection = styled.div`
	background: ${theme.colors.surfaceDark};
	border-radius: ${theme.borderRadius.lg};
	padding: ${theme.spacing.lg};
`;

const TextArea = styled.textarea`
	width: 100%;
	min-height: 120px;
	padding: ${theme.spacing.md};
	border: 2px solid ${theme.colors.surfaceDark};
	border-radius: ${theme.borderRadius.md};
	font-family: ${theme.typography.fontFamily.primary};
	font-size: ${theme.typography.fontSize.base};
	color: ${theme.colors.textPrimary};
	background: ${theme.colors.surface};
	resize: vertical;
	transition: border-color 0.2s ease;

	&:focus {
		outline: none;
		border-color: ${theme.colors.primary};
	}

	&::placeholder {
		color: ${theme.colors.textLight};
	}
`;

const FormGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: ${theme.spacing.lg};
	width: 100%;
	max-width: 100%;

	/* Force single column on small screens */
	@media (max-width: ${theme.breakpoints.sm}) {
		grid-template-columns: 1fr;
		gap: ${theme.spacing.md};
	}

	/* Ensure grid items don't overflow */
	> * {
		min-width: 0;
		max-width: 100%;
	}
`;

const FormGroup = styled.div`
	display: flex;
	flex-direction: column;
	gap: ${theme.spacing.sm};
	width: 100%;
	max-width: 100%;
	min-width: 0;
`;

const Label = styled.label`
	font-weight: ${theme.typography.fontWeight.medium};
	color: ${theme.colors.textPrimary};
	font-size: ${theme.typography.fontSize.sm};
	display: flex;
	align-items: center;
	gap: ${theme.spacing.xs};

	svg {
		color: ${theme.colors.primary};
		font-size: ${theme.typography.fontSize.base};
	}
`;

const Input = styled.input`
	padding: ${theme.spacing.md};
	border: 2px solid ${theme.colors.surfaceDark};
	border-radius: ${theme.borderRadius.md};
	font-size: ${theme.typography.fontSize.base};
	color: ${theme.colors.textPrimary};
	background: ${theme.colors.surface};
	transition: border-color 0.2s ease;
	width: 100%;
	max-width: 100%;
	box-sizing: border-box;

	&:focus {
		outline: none;
		border-color: ${theme.colors.primary};
	}

	@media (max-width: ${theme.breakpoints.sm}) {
		padding: ${theme.spacing.sm};
		font-size: ${theme.typography.fontSize.sm};
	}
`;

const Select = styled.select`
	padding: ${theme.spacing.md};
	border: 2px solid ${theme.colors.surfaceDark};
	border-radius: ${theme.borderRadius.md};
	font-size: ${theme.typography.fontSize.base};
	color: ${theme.colors.textPrimary};
	background: ${theme.colors.surface};
	cursor: pointer;
	transition: border-color 0.2s ease;

	&:focus {
		outline: none;
		border-color: ${theme.colors.primary};
	}
`;

const CheckboxGroup = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
	gap: ${theme.spacing.sm};
	margin-top: ${theme.spacing.sm};
	width: 100%;
	max-width: 100%;

	/* Responsive adjustments */
	@media (max-width: ${theme.breakpoints.sm}) {
		grid-template-columns: 1fr;
		gap: ${theme.spacing.xs};
	}

	/* Ensure grid items don't overflow */
	> * {
		min-width: 0;
		max-width: 100%;
	}
`;

const CheckboxItem = styled.label`
	display: flex;
	align-items: center;
	gap: ${theme.spacing.sm};
	padding: ${theme.spacing.sm};
	border-radius: ${theme.borderRadius.base};
	cursor: pointer;
	transition: background-color 0.2s ease;
	width: 100%;
	max-width: 100%;
	min-width: 0;

	&:hover {
		background: ${theme.colors.surfaceDark};
	}

	input {
		accent-color: ${theme.colors.primary};
		flex-shrink: 0;
	}

	svg {
		flex-shrink: 0;
	}

	/* Allow text to wrap instead of being cut off */
	span {
		flex: 1;
		word-wrap: break-word;
		overflow-wrap: break-word;
		white-space: normal;
	}

	@media (max-width: ${theme.breakpoints.sm}) {
		padding: ${theme.spacing.xs};
		gap: ${theme.spacing.xs};
		font-size: ${theme.typography.fontSize.sm};
	}
`;

const TransportGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
	gap: ${theme.spacing.sm};
	width: 100%;
	max-width: 100%;

	@media (max-width: ${theme.breakpoints.sm}) {
		grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
		gap: ${theme.spacing.xs};
	}

	/* Ensure grid items don't overflow */
	> * {
		min-width: 0;
		max-width: 100%;
	}
`;

const TransportOption = styled.div<{ selected: boolean }>`
	display: flex;
	align-items: center;
	gap: ${theme.spacing.sm};
	padding: ${theme.spacing.md};
	border: 2px solid
		${({ selected }) =>
			selected ? theme.colors.primary : theme.colors.surfaceDark};
	border-radius: ${theme.borderRadius.md};
	cursor: pointer;
	transition: all 0.2s ease;
	background: ${({ selected }) =>
		selected ? `${theme.colors.primary}10` : theme.colors.surface};
	width: 100%;
	max-width: 100%;
	min-width: 0;

	&:hover {
		border-color: ${theme.colors.primary};
	}

	svg {
		font-size: ${theme.typography.fontSize.xl};
		color: ${({ selected }) =>
			selected ? theme.colors.primary : theme.colors.textSecondary};
		flex-shrink: 0;
	}

	span {
		flex: 1;
		word-wrap: break-word;
		overflow-wrap: break-word;
		white-space: normal;
		text-align: center;
	}

	@media (max-width: ${theme.breakpoints.sm}) {
		padding: ${theme.spacing.sm};
		gap: ${theme.spacing.xs};

		svg {
			font-size: ${theme.typography.fontSize.lg};
		}

		span {
			font-size: ${theme.typography.fontSize.sm};
		}
	}
`;

const LoadingSpinner = styled.div`
	width: 20px;
	height: 20px;
	border: 2px solid ${theme.colors.surfaceDark};
	border-top: 2px solid ${theme.colors.primary};
	border-radius: 50%;
	animation: spin 1s linear infinite;
`;

const ConfirmationMessage = styled.div`
	background: ${theme.colors.success}20;
	border: 2px solid ${theme.colors.success};
	border-radius: ${theme.borderRadius.md};
	padding: ${theme.spacing.md};
	margin-top: ${theme.spacing.md};
	color: ${theme.colors.success};
	font-weight: ${theme.typography.fontWeight.semibold};
	display: flex;
	align-items: center;
	gap: ${theme.spacing.sm};
	animation: slideIn 0.3s ease-out;

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
`;

export const UserInput: React.FC<UserInputProps> = ({
	onPreferencesSubmit,
	onTextAnalysis,
	onTripPlan,
	isLoading = false,
}) => {
	const [textInput, setTextInput] = useState("");
	const [preferencesSubmitted, setPreferencesSubmitted] = useState(false);
	const [preferences, setPreferences] = useState<UserPreferences>({
		budget: 1000,
		maxTravelTime: 60,
		preferredActivities: [],
		groupSize: 2,
		hasChildern: false,
		accessibilityNeeds: false,
		transportMode: "mixed",
	});

	const handleTextSubmit = () => {
		if (textInput.trim() && !isLoading) {
			console.log(
				"🚀 User clicked Analyze - submitting request:",
				textInput.trim()
			);
			onTextAnalysis(textInput.trim());
		}
	};

	const handlePreferencesSubmit = () => {
		setPreferencesSubmitted(true);
		onPreferencesSubmit(preferences);
		// Reset the confirmation after 3 seconds
		setTimeout(() => setPreferencesSubmitted(false), 3000);
	};

	const handleTripPlan = () => {
		if (onTripPlan) {
			onTripPlan(preferences);
		}
	};

	const handleActivityChange = (
		category: AttractionCategory,
		checked: boolean
	) => {
		setPreferences((prev) => ({
			...prev,
			preferredActivities: checked
				? [...prev.preferredActivities, category]
				: prev.preferredActivities.filter((cat) => cat !== category),
		}));
	};

	const activityOptions = [
		{ key: AttractionCategory.CULTURAL, label: "文化 Cultural" },
		{ key: AttractionCategory.NATURE, label: "自然 Nature" },
		{ key: AttractionCategory.ENTERTAINMENT, label: "娛樂 Entertainment" },
		{ key: AttractionCategory.SHOPPING, label: "購物 Shopping" },
		{ key: AttractionCategory.FOOD, label: "美食 Food" },
		{ key: AttractionCategory.HISTORICAL, label: "歷史 Historical" },
		{ key: AttractionCategory.MUSEUM, label: "博物館 Museum" },
		{ key: AttractionCategory.NIGHTLIFE, label: "夜生活 Nightlife" },
	];

	const transportOptions = [
		{ key: "walking", icon: <WalkIcon />, label: "Walking" },
		{ key: "driving", icon: <CarIcon />, label: "Driving" },
		{
			key: "public_transport",
			icon: <TransitIcon />,
			label: "Public Transport",
		},
		{ key: "mixed", icon: <TransitIcon />, label: "Mixed" },
	];

	return (
		<InputContainer>
			{/* Natural Language Input Section */}
			<TextInputSection>
				<SectionTitle>
					<SearchIcon />
					Tell us about your perfect Hong Kong trip
				</SectionTitle>
				<TextArea
					value={textInput}
					onChange={(e) => setTextInput(e.target.value)}
					placeholder="Describe your ideal Hong Kong experience... For example: 'I want to visit cultural sites and try local food with a budget of HK$500, traveling with family including elderly parents.'"
					disabled={isLoading}
				/>
				<Flex justify="end" style={{ marginTop: theme.spacing.md }}>
					<Button
						onClick={handleTextSubmit}
						disabled={!textInput.trim() || isLoading}
					>
						{isLoading ? <LoadingSpinner /> : "Analyze My Request"}
					</Button>
				</Flex>
			</TextInputSection>

			{/* Divider */}
			<Flex align="center" gap={theme.spacing.md}>
				<div
					style={{
						flex: 1,
						height: "1px",
						background: theme.colors.surfaceDark,
					}}
				></div>
				<span
					style={{
						color: theme.colors.textSecondary,
						fontSize: theme.typography.fontSize.sm,
					}}
				>
					OR use structured preferences
				</span>
				<div
					style={{
						flex: 1,
						height: "1px",
						background: theme.colors.surfaceDark,
					}}
				></div>
			</Flex>

			{/* Structured Input Section */}
			<div>
				<SectionTitle>Detailed Preferences</SectionTitle>

				<FormGrid>
					<FormGroup>
						<Label>
							<MoneyIcon />
							Budget (HK$)
						</Label>
						<Input
							type="number"
							value={preferences.budget}
							onChange={(e) =>
								setPreferences((prev) => ({
									...prev,
									budget: parseInt(e.target.value) || 0,
								}))
							}
							min="0"
							step="100"
						/>
					</FormGroup>

					<FormGroup>
						<Label>
							<ClockIcon />
							Max Travel Time (minutes)
						</Label>
						<Input
							type="number"
							value={preferences.maxTravelTime}
							onChange={(e) =>
								setPreferences((prev) => ({
									...prev,
									maxTravelTime: parseInt(e.target.value) || 0,
								}))
							}
							min="15"
							step="15"
						/>
					</FormGroup>

					<FormGroup>
						<Label>
							<GroupIcon />
							Group Size
						</Label>
						<Input
							type="number"
							value={preferences.groupSize}
							onChange={(e) =>
								setPreferences((prev) => ({
									...prev,
									groupSize: parseInt(e.target.value) || 1,
								}))
							}
							min="1"
							max="20"
						/>
					</FormGroup>

					<FormGroup>
						<Label>Special Considerations</Label>
						<Flex direction="column" gap={theme.spacing.sm}>
							<CheckboxItem>
								<input
									type="checkbox"
									checked={preferences.hasChildern}
									onChange={(e) =>
										setPreferences((prev) => ({
											...prev,
											hasChildern: e.target.checked,
										}))
									}
								/>
								<ChildIcon />
								<span>Traveling with children</span>
							</CheckboxItem>
							<CheckboxItem>
								<input
									type="checkbox"
									checked={preferences.accessibilityNeeds}
									onChange={(e) =>
										setPreferences((prev) => ({
											...prev,
											accessibilityNeeds: e.target.checked,
										}))
									}
								/>
								<AccessibleIcon />
								<span>Accessibility requirements</span>
							</CheckboxItem>
						</Flex>
					</FormGroup>
				</FormGrid>

				{/* Activity Preferences */}
				<FormGroup style={{ marginTop: theme.spacing.lg }}>
					<Label>Preferred Activities</Label>
					<CheckboxGroup>
						{activityOptions.map((option) => (
							<CheckboxItem key={option.key}>
								<input
									type="checkbox"
									checked={preferences.preferredActivities.includes(option.key)}
									onChange={(e) =>
										handleActivityChange(option.key, e.target.checked)
									}
								/>
								{option.label}
							</CheckboxItem>
						))}
					</CheckboxGroup>
				</FormGroup>

				{/* Transport Mode */}
				<FormGroup style={{ marginTop: theme.spacing.lg }}>
					<Label>Preferred Transport</Label>
					<TransportGrid>
						{transportOptions.map((option) => (
							<TransportOption
								key={option.key}
								selected={preferences.transportMode === option.key}
								onClick={() =>
									setPreferences((prev) => ({
										...prev,
										transportMode: option.key as any,
									}))
								}
							>
								{option.icon}
								<span>{option.label}</span>
							</TransportOption>
						))}
					</TransportGrid>
				</FormGroup>

				<Flex
					justify="end"
					style={{
						marginTop: theme.spacing.xl,
						paddingTop: theme.spacing.md,
						borderTop: `1px solid ${theme.colors.surfaceDark}`,
						backgroundColor: theme.colors.surface,
					}}
				>
					{onTripPlan ? (
						<Button onClick={handleTripPlan} disabled={isLoading} size="lg">
							{isLoading ? <LoadingSpinner /> : "Plan My Trip"}
						</Button>
					) : (
						<Button
							onClick={handlePreferencesSubmit}
							disabled={isLoading}
							size="lg"
						>
							{isLoading ? (
								<LoadingSpinner />
							) : preferencesSubmitted ? (
								"✓ Preferences Applied"
							) : (
								"Analyze My Preferences"
							)}
						</Button>
					)}
				</Flex>

				{preferencesSubmitted && (
					<ConfirmationMessage>
						<span>✅</span>
						Your preferences have been applied! Check the map and attractions
						for personalized recommendations.
					</ConfirmationMessage>
				)}
			</div>
		</InputContainer>
	);
};

export default UserInput;
