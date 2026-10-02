import { Button, HStack, Image, Input, Textarea, useToast } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { FiUpload } from "react-icons/fi";
import { request } from "../api/request";
import { useBookStore } from "../store/book";

// The inputs shared by the "create book" page and the "edit book" dialog
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
			toast({ title: "Upload failed", description: err.message, status: "error", duration: 4000, isClosable: true });
		}
		setIsUploading(false);
	};

	useEffect(() => {
		fetchCategories();
	}, [fetchCategories]);

	return (
		<>
			<Input placeholder='Book Title' name='title' value={book.title} onChange={set("title")} />
			<Input placeholder='Author' name='author' value={book.author} onChange={set("author")} />
			<Input placeholder='Publish Year' name='publishYear' type='number' value={book.publishYear} onChange={set("publishYear")} />
			<Input placeholder='Price' name='price' type='number' value={book.price} onChange={set("price")} />
			<Input placeholder='Copies in stock' name='stock' type='number' min={0} value={book.stock ?? ""} onChange={set("stock")} />
			<Input placeholder='Category (e.g. Programming)' name='category' list='book-categories' value={book.category || ""} onChange={set("category")} />
			<datalist id='book-categories'>
				{categories.map((category) => (
					<option key={category} value={category} />
				))}
			</datalist>
			<HStack w='full'>
				{book.image && <Image src={book.image} alt='Cover preview' boxSize='10' objectFit='cover' rounded='md' />}
				<Input placeholder='Image URL, or upload a file' name='image' value={book.image} onChange={set("image")} />
				<Button leftIcon={<FiUpload />} onClick={() => fileInput.current?.click()} isLoading={isUploading} flexShrink={0}>
					Upload
				</Button>
				<input ref={fileInput} type='file' accept='image/jpeg,image/png,image/gif,image/webp' hidden onChange={handleUpload} data-testid='image-file' />
			</HStack>
			<Textarea placeholder='Description' name='description' rows={4} value={book.description || ""} onChange={set("description")} />
		</>
	);
};
export default BookFormFields;
