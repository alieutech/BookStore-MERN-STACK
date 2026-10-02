import { Container, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useBookStore } from "../store/book";
import BookCard from "../components/BookCard";
import BookFilters from "../components/BookFilters";
import { useIsAdmin } from "../store/auth";

const HomePage = () => {
	const { fetchBooks, books } = useBookStore();
	const isAdmin = useIsAdmin();

	// Filters live in the URL (e.g. /?q=code&sort=price_asc) so they survive reloads and can be shared
	const [searchParams, setSearchParams] = useSearchParams();
	const filters = useMemo(() => Object.fromEntries(searchParams), [searchParams]);
	const hasFilters = Object.keys(filters).length > 0;

	const setFilters = useCallback(
		(next) => setSearchParams(Object.fromEntries(Object.entries(next).filter(([, value]) => value)), { replace: true }),
		[setSearchParams]
	);

	useEffect(() => {
		fetchBooks(filters);
	}, [fetchBooks, filters]);

	return (
		<Container maxW='container.xl' py={12}>
			<VStack spacing={8}>
				<Text
					fontSize={"30"}
					fontWeight={"bold"}
					bgGradient={"linear(to-r, cyan.400, blue.500)"}
					bgClip={"text"}
					textAlign={"center"}
				>
					The Greatest programmer geniuses 📚
				</Text>

				<BookFilters filters={filters} onChange={setFilters} />

				<SimpleGrid
					columns={{
						base: 1,
						md: 2,
						lg: 4,
					}}
					spacing={10}
					w={"full"}
				>
					{books.map((book) => (
						<BookCard key={book._id} book={book} />
					))}
				</SimpleGrid>

				{books.length === 0 && hasFilters && (
					<Text fontSize='xl' textAlign={"center"} fontWeight='bold' color='gray.500'>
						No books match your search.
					</Text>
				)}

				{books.length === 0 && !hasFilters && (
					<Text fontSize='xl' textAlign={"center"} fontWeight='bold' color='gray.500'>
						Ohh no books are found 😢{" "}
						{isAdmin && (
							<Link to={"/create"}>
								<Text as='span' color='blue.500' _hover={{ textDecoration: "underline" }}>
									Create a book
								</Text>
							</Link>
						)}
					</Text>
				)}
			</VStack>
		</Container>
	);
};
export default HomePage;