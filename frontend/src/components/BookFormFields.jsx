import {
	Button,
	FormControl,
	FormHelperText,
	FormLabel,
	Grid,
	GridItem,
	Input,
	InputGroup,
	InputLeftAddon,
	SimpleGrid,
	Text,
	Textarea,
	useToast,
	VStack,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { FiUpload } from "react-icons/fi";
import { request } from "../api/request";
import { useBookStore } from "../store/book";
import BookCover from "./BookCover";

// The fields shared by the "add book" page and the "edit book" dialog, with a live cover preview
const BookFormFields = ({ book, onChange }) => {
	const { categories, fetchCategories } = useBookStore();
	const set = (field) => (e) => onChange({ ...book, [field]: e.target.value });
	const fileInput = useRef(null);
	const [isUploading, setIsUploading] = useState(false);
	const toast = useToast();

	const handleUpload = async (e) => {
		const file = e.target.files?.[0];
		e.target.value = ""; // allow choosing the same file again
		if (!file) return;
		const form = new FormData();
		form.append("image", file);
		setIsUploading(true);
		try {
			const { data } = await request("/uploads", { method: "POST", body: form });
			onChange({ ...book, image: data.url });
		} catch (err) {
			toast({ title: "Upload failed", description: err.message, status: "error", duration: 4000 });
		}
		setIsUploading(false);
	};

	useEffect(() => {
		fetchCategories();
	}, [fetchCategories]);

	return (
		<Grid templateColumns={{ base: "1fr", md: "180px 1fr" }} gap={8} w='full'>
			<GridItem>
				<VStack align='stretch' spacing={3} position={{ md: "sticky" }} top={{ md: 4 }}>
					<BookCover book={{ title: book.title || "Book title", author: book.author, image: book.image }} shadow='md' />
					<Button leftIcon={<FiUpload />} onClick={() => fileInput.current?.click()} isLoading={isUploading} variant='outline' size='sm'>
						Upload cover
					</Button>
					<Text fontSize='xs' color='text.subtle' textAlign='center'>
						JPEG, PNG, GIF or WebP, up to 2 MB
					</Text>
					<input ref={fileInput} type='file' accept='image/jpeg,image/png,image/gif,image/webp' hidden onChange={handleUpload} data-testid='image-file' />
				</VStack>
			</GridItem>

			<GridItem>
				<VStack spacing={5} align='stretch'>
					<FormControl isRequired>
						<FormLabel>Title</FormLabel>
						<Input name='title' value={book.title} onChange={set("title")} placeholder='e.g. Clean Code' />
					</FormControl>
					<FormControl isRequired>
						<FormLabel>Author</FormLabel>
						<Input name='author' value={book.author} onChange={set("author")} placeholder='e.g. Robert C. Martin' />
					</FormControl>
					<SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4}>
						<FormControl isRequired>
							<FormLabel>Price</FormLabel>
							<InputGroup>
								<InputLeftAddon>D</InputLeftAddon>
								<Input name='price' type='number' min={0} step='0.01' value={book.price} onChange={set("price")} placeholder='0.00' />
							</InputGroup>
						</FormControl>
						<FormControl isRequired>
							<FormLabel>Published</FormLabel>
							<Input name='publishYear' type='number' value={book.publishYear} onChange={set("publishYear")} placeholder='Year' />
						</FormControl>
						<FormControl>
							<FormLabel>In stock</FormLabel>
							<Input name='stock' type='number' min={0} value={book.stock ?? ""} onChange={set("stock")} placeholder='0' />
						</FormControl>
					</SimpleGrid>
					<FormControl>
						<FormLabel>Category</FormLabel>
						<Input name='category' list='book-categories' value={book.category || ""} onChange={set("category")} placeholder='e.g. Programming' />
						<datalist id='book-categories'>
							{categories.map((category) => (
								<option key={category} value={category} />
							))}
						</datalist>
					</FormControl>
					<FormControl isRequired>
						<FormLabel>Cover image</FormLabel>
						<Input name='image' value={book.image} onChange={set("image")} placeholder='Paste an image URL, or upload a file' />
						<FormHelperText>Upload a file with the button under the preview, or paste a link.</FormHelperText>
					</FormControl>
					<FormControl>
						<FormLabel>Description</FormLabel>
						<Textarea name='description' rows={5} value={book.description || ""} onChange={set("description")} placeholder='What is this book about?' />
					</FormControl>
				</VStack>
			</GridItem>
		</Grid>
	);
};
export default BookFormFields;
