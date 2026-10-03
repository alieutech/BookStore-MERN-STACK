import { Button, Container, SimpleGrid } from "@chakra-ui/react";
import { useEffect } from "react";
import { FiHeart } from "react-icons/fi";
import { Link as RouterLink } from "react-router-dom";
import BookCard from "../components/BookCard";
import BookGridSkeleton from "../components/BookGridSkeleton";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";
import { useWishlistStore } from "../store/wishlist";
import { BOOK_GRID_COLUMNS } from "../utils/layout";

const WishlistPage = () => {
	const { books, isLoading, hasLoaded, load } = useWishlistStore();

	// Always show the latest prices and stock
	useEffect(() => {
		load();
	}, [load]);

	return (
		<Container maxW='container.xl' py={{ base: 6, md: 10 }}>
			<PageHeader title='Wishlist' subtitle={books.length ? `${books.length} ${books.length === 1 ? "book" : "books"} saved for later` : "Books you save for later appear here."} />
			{isLoading && !hasLoaded ? (
				<BookGridSkeleton count={5} />
			) : books.length === 0 ? (
				<EmptyState
					icon={FiHeart}
					title='Your wishlist is empty'
					description='Tap the heart on any book to save it for later.'
					action={
						<Button as={RouterLink} to='/'>
							Browse books
						</Button>
					}
				/>
			) : (
				<SimpleGrid columns={BOOK_GRID_COLUMNS} spacing={{ base: 4, md: 6 }}>
					{books.map((book) => (
						<BookCard key={book._id} book={book} />
					))}
				</SimpleGrid>
			)}
		</Container>
	);
};
export default WishlistPage;
