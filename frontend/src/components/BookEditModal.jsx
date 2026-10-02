import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useBookStore } from "../store/book";
import BookFormFields from "./BookFormFields";

// Dialog for admins to edit a book. Calls onSaved(updatedBook) after a successful save.
const BookEditModal = ({ book, isOpen, onClose, onSaved }) => {
	const [draft, setDraft] = useState(book);
	const [isSaving, setIsSaving] = useState(false);
	const updateBook = useBookStore((state) => state.updateBook);
	const toast = useToast();

	// Start from the latest data every time the dialog opens
	useEffect(() => {
		if (isOpen) setDraft(book);
	}, [isOpen, book]);

	const handleSave = async () => {
		setIsSaving(true);
		const { success, message, book: saved } = await updateBook(book._id, draft);
		setIsSaving(false);
		toast({ title: success ? "Book updated" : "Couldn't save", description: message, status: success ? "success" : "error" });
		if (success) {
			onSaved?.(saved);
			onClose();
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "3xl" }} scrollBehavior='inside'>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader fontFamily='heading'>Edit book</ModalHeader>
				<ModalCloseButton />
				<ModalBody>
					<BookFormFields book={draft} onChange={setDraft} />
				</ModalBody>
				<ModalFooter gap={3}>
					<Button variant='ghost' colorScheme='gray' onClick={onClose}>
						Cancel
					</Button>
					<Button onClick={handleSave} isLoading={isSaving}>
						Save changes
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};
export default BookEditModal;
