import { Container, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useBookStore } from "../../Store/book";
import BookCard from "../components/BookCard";

const HomePage = () => {
	const { fetchBooks, books } = useBookStore();

	useEffect(() => {
		fetchBooks();
	}, [fetchBooks]);
	console.log("books", books);

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

				<SimpleGrid
					columns={{
						base: 1,
						md: 2,
						lg: 4,
					}}
					spacing={10}
					w={"haft"}
				>
					{books.map((book) => (
						<BookCard key={book._id} book={book} />
					))}
				</SimpleGrid>

				{books.length === 0 && (
					<Text fontSize='xl' textAlign={"center"} fontWeight='bold' color='gray.500'>
						Ohh no books are found 😢{" "}
						<Link to={"/create"}>
							<Text as='span' color='blue.500' _hover={{ textDecoration: "underline" }}>
								Create a book
							</Text>
						</Link>
					</Text>
				)}
			</VStack>
		</Container>
	);
};
export default HomePage;