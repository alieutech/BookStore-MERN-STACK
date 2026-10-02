import { Button, Container, Flex, useToast } from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BookFormFields from "../components/BookFormFields";
import PageHeader from "../components/PageHeader";
import { EMPTY_BOOK, useBookStore } from "../store/book";

const CreatePage = () => {
	const [newBook, setNewBook] = useState(EMPTY_BOOK);
	const [isSaving, setIsSaving] = useState(false);
	const createBook = useBookStore((state) => state.createBook);
	const toast = useToast();
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSaving(true);
		const { success, message } = await createBook(newBook);
		setIsSaving(false);
		if (!success) {
			toast({ title: "Couldn't add the book", description: message, status: "error" });
			return;
		}
		toast({ title: "Book added successfully!", description: `"${newBook.title}" is now in the store.`, status: "success" });
		setNewBook(EMPTY_BOOK);
	};

	return (
		<Container maxW='container.lg' py={{ base: 6, md: 10 }}>
			<PageHeader title='Add a book' subtitle='New books appear in the store as soon as you save them.' breadcrumbs={[{ label: "Dashboard", to: "/admin" }, { label: "Add a book" }]} />
			<form onSubmit={handleSubmit}>
				<Flex direction='column' layerStyle='card' p={{ base: 5, md: 8 }} gap={8}>
					<BookFormFields book={newBook} onChange={setNewBook} />
					<Flex justify='flex-end' gap={3} borderTopWidth='1px' borderColor='border.subtle' pt={6}>
						<Button variant='ghost' colorScheme='gray' onClick={() => navigate(-1)}>
							Cancel
						</Button>
						<Button type='submit' isLoading={isSaving}>
							Add Book
						</Button>
					</Flex>
				</Flex>
			</form>
		</Container>
	);
};
export default CreatePage;
