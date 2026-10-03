import { Button, Flex, HStack, Input, InputGroup, InputLeftAddon, Select, Text } from "@chakra-ui/react";
import { FiX } from "react-icons/fi";
import { resultSummary } from "../utils/pagination";

const SORT_LABELS = {
	newest: "Newest",
	rating: "Top rated",
	price_asc: "Price: low to high",
	price_desc: "Price: high to low",
	title: "Title A–Z",
	oldest: "Oldest",
};

// Result count, price range, sort and "clear" for the book list.
// `filters` is a plain object; `onChange` receives the updated object.
const BookFilters = ({ filters, onChange, resultCount, pagination, isLoading }) => {
	const set = (field) => (e) => onChange({ ...filters, [field]: e.target.value });
	const hasFilters = Object.entries(filters).some(([key, value]) => value && key !== "page" && !(key === "sort" && value === "newest"));

	return (
		<Flex w='full' align={{ base: "stretch", lg: "center" }} justify='space-between' gap={3} direction={{ base: "column", lg: "row" }}>
			<HStack spacing={3}>
				<Text color='text.muted' fontSize='sm' aria-live='polite'>
					{isLoading ? "Loading books…" : resultSummary(pagination, resultCount)}
				</Text>
				{hasFilters && (
					<Button size='xs' variant='ghost' leftIcon={<FiX />} onClick={() => onChange({})}>
						Clear filters
					</Button>
				)}
			</HStack>
			<Flex gap={3} wrap='wrap'>
				<HStack spacing={2}>
					<InputGroup size='sm' w='32'>
						<InputLeftAddon>D</InputLeftAddon>
						<Input aria-label='Minimum price' placeholder='Min' type='number' min={0} value={filters.minPrice || ""} onChange={set("minPrice")} bg='bg.surface' rounded='md' />
					</InputGroup>
					<Text color='text.subtle'>–</Text>
					<InputGroup size='sm' w='32'>
						<InputLeftAddon>D</InputLeftAddon>
						<Input aria-label='Maximum price' placeholder='Max' type='number' min={0} value={filters.maxPrice || ""} onChange={set("maxPrice")} bg='bg.surface' rounded='md' />
					</InputGroup>
				</HStack>
				<Select aria-label='Sort by' size='sm' w={{ base: "full", sm: "48" }} rounded='md' bg='bg.surface' value={filters.sort || "newest"} onChange={set("sort")}>
					{Object.entries(SORT_LABELS).map(([value, label]) => (
						<option key={value} value={value}>
							Sort: {label}
						</option>
					))}
				</Select>
			</Flex>
		</Flex>
	);
};
export default BookFilters;
