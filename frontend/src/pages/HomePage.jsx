import { Box, Button, Container, Flex, Heading, HStack, SimpleGrid, Stack, Text, VStack } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo } from "react";
import { FiArrowRight, FiBookOpen, FiSearch, FiStar } from "react-icons/fi";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import BookCard from "../components/BookCard";
import BookCover from "../components/BookCover";
import BookFilters from "../components/BookFilters";
import BookGridSkeleton from "../components/BookGridSkeleton";
import { BOOK_GRID_COLUMNS } from "../utils/layout";
import CategoryChips from "../components/CategoryChips";
import EmptyState from "../components/EmptyState";
import { useIsAdmin } from "../store/auth";
import { useBookStore } from "../store/book";

// Welcome banner shown on the unfiltered home page, with a fan of featured covers
const Hero = ({ featured }) => (
	<Box position='relative' overflow='hidden' rounded='2xl' bgGradient='linear(to-br, brand.700, brand.500)' color='white' px={{ base: 6, md: 12 }} py={{ base: 10, md: 14 }} mb={10}>
		<Box position='absolute' right='-20' top='-20' w='72' h='72' rounded='full' bg='whiteAlpha.100' />
		<Box position='absolute' right='40' bottom='-24' w='56' h='56' rounded='full' bg='whiteAlpha.100' />
		<Flex align='center' justify='space-between' gap={10} position='relative'>
			<VStack align='flex-start' spacing={5} maxW='xl'>
				<Text fontSize='sm' fontWeight='semibold' letterSpacing='wider' textTransform='uppercase' color='brand.100'>
					Welcome to BookStore
				</Text>
				<Heading as='h1' size={{ base: "xl", md: "2xl" }} lineHeight='1.15'>
					Find your next great read
				</Heading>
				<Text fontSize={{ base: "md", md: "lg" }} color='brand.50'>
					Browse our catalog, read honest reviews from other readers, and get your books delivered — pay in cash when they arrive.
				</Text>
				<HStack spacing={3} pt={2}>
					<Button as='a' href='#catalog' bg='white' color='brand.700' _hover={{ bg: "brand.50" }} rightIcon={<FiArrowRight />}>
						Browse books
					</Button>
					<Button as={RouterLink} to='/?sort=rating#catalog' variant='outline' color='white' borderColor='whiteAlpha.600' _hover={{ bg: "whiteAlpha.200" }} leftIcon={<FiStar />}>
						Top rated
					</Button>
				</HStack>
			</VStack>
			{featured.length > 0 && (
				<Box display={{ base: "none", lg: "block" }} position='relative' w='300px' h='260px' flexShrink={0}>
					{featured.slice(0, 3).map((book, i) => (
						<Box key={book._id} position='absolute' w='150px' left={`${i * 70}px`} top={`${[30, 0, 30][i]}px`} transform={`rotate(${[-8, 0, 8][i]}deg)`} zIndex={i === 1 ? 2 : 1} shadow='2xl' rounded='md'>
							<BookCover book={book} rounded='md' />
						</Box>
					))}
				</Box>
			)}
		</Flex>
	</Box>
);

const HomePage = () => {
	const { fetchBooks, books, isLoading } = useBookStore();
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

	const featured = useMemo(() => books.filter((book) => book.image).slice(0, 3), [books]);
	const title = filters.q ? `Results for “${filters.q}”` : filters.category || "All books";

	return (
		<Container maxW='container.xl' py={{ base: 6, md: 10 }}>
			{!hasFilters && <Hero featured={featured.length ? featured : books.slice(0, 3)} />}

			<Stack spacing={6} id='catalog' scrollMarginTop='24'>
				<Heading as='h2' size='lg'>
					{title}
				</Heading>
				<CategoryChips value={filters.category} onChange={(category) => setFilters({ ...filters, category })} />
				<BookFilters filters={filters} onChange={setFilters} resultCount={books.length} isLoading={isLoading} />

				{isLoading && books.length === 0 ? (
					<BookGridSkeleton />
				) : books.length > 0 ? (
					<SimpleGrid columns={BOOK_GRID_COLUMNS} spacing={{ base: 4, md: 6 }} opacity={isLoading ? 0.6 : 1} transition='opacity 0.2s'>
						{books.map((book) => (
							<BookCard key={book._id} book={book} />
						))}
					</SimpleGrid>
				) : hasFilters ? (
					<EmptyState
						icon={FiSearch}
						title='No books match your search'
						description='Try a different word, another category, or a wider price range.'
						action={
							<Button variant='outline' onClick={() => setFilters({})}>
								Clear filters
							</Button>
						}
					/>
				) : (
					<EmptyState
						icon={FiBookOpen}
						title='The shelves are empty'
						description={isAdmin ? "Add your first book to open the store." : "New books are on their way. Check back soon!"}
						action={
							isAdmin && (
								<Button as={RouterLink} to='/create'>
									Add a book
								</Button>
							)
						}
					/>
				)}
			</Stack>
		</Container>
	);
};
export default HomePage;
