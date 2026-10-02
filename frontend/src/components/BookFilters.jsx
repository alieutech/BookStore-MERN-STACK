import { Button, Input, InputGroup, InputLeftElement, Select, SimpleGrid } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useBookStore } from "../store/book";

const SORT_LABELS = {
	newest: "Newest first",
	rating: "Top rated",
	price_asc: "Price: low to high",
	price_desc: "Price: high to low",
	title: "Title A–Z",
	oldest: "Oldest first",
};

// Search box, category, price range and sort controls for the book list.
// `filters` is a plain object; `onChange` receives the updated object.
const BookFilters = ({ filters, onChange }) => {
	const { categories, fetchCategories } = useBookStore();
	// Keep the search text locally and only apply it after the user stops typing
	const [search, setSearch] = useState(filters.q || "");

	useEffect(() => {
		fetchCategories();
	}, [fetchCategories]);

	useEffect(() => {
		setSearch(filters.q || "");
	}, [filters.q]);

	useEffect(() => {
		if (search === (filters.q || "")) return;
		const timer = setTimeout(() => onChange({ ...filters, q: search }), 300);
		return () => clearTimeout(timer);
	}, [search, filters, onChange]);

	const set = (field) => (e) => onChange({ ...filters, [field]: e.target.value });
	const hasFilters = Object.entries(filters).some(([key, value]) => value && !(key === "sort" && value === "newest"));

	return (
		<SimpleGrid columns={{ base: 1, md: 2, lg: 6 }} spacing={3} w='full'>
			<InputGroup gridColumn={{ lg: "span 2" }}>
				<InputLeftElement pointerEvents='none'>
					<FiSearch />
				</InputLeftElement>
				<Input aria-label='Search books' placeholder='Search by title or author' value={search} onChange={(e) => setSearch(e.target.value)} />
			</InputGroup>
			<Select aria-label='Category' placeholder='All categories' value={filters.category || ""} onChange={set("category")}>
				{categories.map((category) => (
					<option key={category} value={category}>
						{category}
					</option>
				))}
			</Select>
			<Input aria-label='Minimum price' placeholder='Min price' type='number' min={0} value={filters.minPrice || ""} onChange={set("minPrice")} />
			<Input aria-label='Maximum price' placeholder='Max price' type='number' min={0} value={filters.maxPrice || ""} onChange={set("maxPrice")} />
			<Select aria-label='Sort by' value={filters.sort || "newest"} onChange={set("sort")}>
				{Object.entries(SORT_LABELS).map(([value, label]) => (
					<option key={value} value={value}>
						{label}
					</option>
				))}
			</Select>
			{hasFilters && (
				<Button variant='link' colorScheme='blue' justifySelf='start' onClick={() => onChange({})}>
					Clear filters
				</Button>
			)}
		</SimpleGrid>
	);
};
export default BookFilters;
