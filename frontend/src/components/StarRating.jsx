import { HStack, IconButton, Text } from "@chakra-ui/react";
import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";

const STARS = [1, 2, 3, 4, 5];

// Read-only stars for a rating such as 4.5, with an optional review count
export const StarRating = ({ value = 0, count, size = "16px" }) => (
	<HStack spacing={1} color='orange.400' aria-label={`Rated ${value} out of 5`}>
		{STARS.map((star) => {
			const Icon = value >= star ? FaStar : value >= star - 0.5 ? FaStarHalfAlt : FaRegStar;
			return <Icon key={star} size={size} />;
		})}
		{count !== undefined && (
			<Text fontSize='sm' color='text.muted' ml={1}>
				{count > 0 ? `${value.toFixed(1)} (${count})` : "No reviews yet"}
			</Text>
		)}
	</HStack>
);

// Clickable stars for choosing a rating from 1 to 5
export const StarInput = ({ value, onChange }) => (
	<HStack spacing={0} role='radiogroup' aria-label='Your rating'>
		{STARS.map((star) => (
			<IconButton
				key={star}
				role='radio'
				aria-checked={value === star}
				aria-label={`${star} star${star > 1 ? "s" : ""}`}
				icon={value >= star ? <FaStar /> : <FaRegStar />}
				color='orange.400'
				variant='ghost'
				fontSize='24px'
				onClick={() => onChange(star)}
			/>
		))}
	</HStack>
);
