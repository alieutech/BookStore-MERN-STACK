import { Input, Textarea } from "@chakra-ui/react";
import { useEffect } from "react";
import { useBookStore } from "../store/book";

export const EMPTY_BOOK = { title: "", author: "", publishYear: "", price: "", image: "", category: "", description: "" };

// The inputs shared by the "create book" page and the "edit book" dialog
const BookFormFields = ({ book, onChange }) => {
	const { categories, fetchCategories } = useBookStore();
	const set = (field) => (e) => onChange({ ...book, [field]: e.target.value });

	useEffect(() => {
		fetchCategories();
	}, [fetchCategories]);

	return (
		<>
			<Input placeholder='Book Title' name='title' value={book.title} onChange={set("title")} />
			<Input placeholder='Author' name='author' value={book.author} onChange={set("author")} />
			<Input placeholder='Publish Year' name='publishYear' type='number' value={book.publishYear} onChange={set("publishYear")} />
			<Input placeholder='Price' name='price' type='number' value={book.price} onChange={set("price")} />
			<Input placeholder='Category (e.g. Programming)' name='category' list='book-categories' value={book.category || ""} onChange={set("category")} />
			<datalist id='book-categories'>
				{categories.map((category) => (
					<option key={category} value={category} />
				))}
			</datalist>
			<Input placeholder='Image URL' name='image' type='url' value={book.image} onChange={set("image")} />
			<Textarea placeholder='Description' name='description' rows={4} value={book.description || ""} onChange={set("description")} />
		</>
	);
};
export default BookFormFields;
