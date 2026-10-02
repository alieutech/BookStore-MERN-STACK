import { Box, Button, Container, Heading, useColorModeValue, useToast, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { EMPTY_BOOK, useBookStore } from "../store/book";
import BookFormFields from "../components/BookFormFields";

const CreatePage = () => {
	const [newBook, setNewBook] = useState(EMPTY_BOOK);
	const toast = useToast();

	const { createBook } = useBookStore();

	const handleAddBook = async () => {
		const { success, message } = await createBook(newBook);
		if (!success) {
			toast({
				title: "Error",
				description: message,
				status: "error",
				isClosable: true,
			});
			return;
		} else {
			toast({
                title: "Book added successfully!",
                description: `The book "${newBook.title}" has been added.`,
                status: "success",
                duration: 3000,
                isClosable: true,
              });
		}
		setNewBook(EMPTY_BOOK);
	};

	return (
		<Container maxW={"container.sm"} py={12}>
			<VStack spacing={8}>
				<Heading as={"h1"} size={"2xl"} textAlign={"center"} mb={8}>
					Create New Book
				</Heading>

				<Box w={"full"} bg={useColorModeValue("white", "gray.800")} p={6} rounded={"lg"} shadow={"md"}>
					<VStack spacing={4}>
						<BookFormFields book={newBook} onChange={setNewBook} />

						<Button colorScheme='blue' onClick={handleAddBook} w='full'>
							Add Book
						</Button>
					</VStack>
				</Box>
			</VStack>
		</Container>
	);
};
export default CreatePage;