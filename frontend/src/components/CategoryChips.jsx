import { Button, Wrap, WrapItem } from "@chakra-ui/react";
import { useEffect } from "react";
import { useBookStore } from "../store/book";

// "All" plus one chip per category; the selected one is filled
const CategoryChips = ({ value, onChange }) => {
	const { categories, fetchCategories } = useBookStore();

	useEffect(() => {
		fetchCategories();
	}, [fetchCategories]);

	const chip = (label, category) => {
		const isActive = (value || "") === category;
		return (
			<WrapItem key={label}>
				<Button size='sm' rounded='full' variant={isActive ? "solid" : "outline"} colorScheme={isActive ? "brand" : "gray"} bg={isActive ? undefined : "bg.surface"} onClick={() => onChange(category)} aria-pressed={isActive}>
					{label}
				</Button>
			</WrapItem>
		);
	};

	return (
		<Wrap spacing={2} role='group' aria-label='Categories'>
			{chip("All books", "")}
			{categories.map((category) => chip(category, category))}
		</Wrap>
	);
};
export default CategoryChips;
