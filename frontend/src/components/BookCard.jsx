import { MdDelete, MdEdit } from 'react-icons/md';

import {
	Box,
	Button,
	Heading,
	HStack,
	IconButton,
	Image,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Text,
	useColorModeValue,
	useDisclosure,
	useToast,
	VStack,
} from "@chakra-ui/react";
import { useBookStore } from "../../Store/book";
import { useState } from "react";

const BookCard = ({ book }) => {
	const [updatedBook, setUpdatedBook] = useState(book);

	const textColor = useColorModeValue("gray.600", "gray.200");
	const bg = useColorModeValue("white", "gray.800");

	const { deleteBook, updateBook } = useBookStore();
	const toast = useToast();
	const { isOpen, onOpen, onClose } = useDisclosure();

	const handleDeleteBook = async (id) => {
		const { success, message } = await deleteBook(id);
		if (!success) {
			toast({
				title: "Error",
				description: message,
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		} else {
			toast({
				title: "Success",
				description: message,
				status: "success",
				duration: 3000,
				isClosable: true,
			});
		}
	};

	const handleUpdateBook = async (id, updatedBook) => {
		const { success, message } = await updateBook(id, updatedBook);
		onClose();
		if (!success) {
			toast({
				title: "Error",
				description: message,
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		} else {
			toast({
				title: "Success",
				description: "Book updated successfully",
				status: "success",
				duration: 3000,
				isClosable: true,
			});
		}
	};

	return (
		<Box
			shadow='lg'
			rounded='lg'
			overflow='hidden'
			transition='all 0.3s'
			_hover={{ transform: "translateY(-5px)", shadow: "xl" }}
			bg={bg}
		>
			<Image src={book.image} alt={book.title} h={48} w='full' objectFit='cover' />

			<Box p={4}>
				<Heading as='h3' size='md' mb={2}>
					{book.title}
				</Heading>
				<Text fontWeight='bold' fontSize='xl' color={textColor} mb={4}>
					{book.author}
				</Text>
				<Text fontWeight='bold' fontSize='xl' color={textColor} mb={4}>
				Publish_Year:  {book.publishYear}
				</Text>

				{/* <Text fontWeight='bold' fontSize='xl' color={textColor} mb={4}>
					D{book.price}
				</Text> */}

				<HStack spacing={2}>
					<IconButton icon={<MdEdit />} onClick={onOpen} colorScheme='blue' />
					<IconButton
						icon={<MdDelete />}
						onClick={() => handleDeleteBook(book._id)}
						colorScheme='red'
					/>
				</HStack>
			</Box>

			<Modal isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />

				<ModalContent>
					<ModalHeader>Update Book</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<VStack spacing={4}>
							<Input
								placeholder='Book Title'
								name='title'
								value={updatedBook.title}
								onChange={(e) => setUpdatedBook({ ...updatedBook, title: e.target.value })}
							/>
							<Input
								placeholder='Author'
								name='author'
								value={updatedBook.author}
								onChange={(e) => setUpdatedBook({ ...updatedBook, author: e.target.value })}
							/>
							<Input
								placeholder='Publish Year'
								name='publishYear'
								type='number'
								value={updatedBook.price}
								onChange={(e) => setUpdatedBook({ ...updatedBook, publishYear: e.target.value })}
							/>
							{/* <Input
								placeholder='Price'
								name='price'
								type='number'
								value={updatedBook.price}
								onChange={(e) => setUpdatedBook({ ...updatedBook, price: e.target.value })}
							/> */}
							<Input
								placeholder='Image URL'
								name='image'
								value={updatedBook.image}
								onChange={(e) => setUpdatedBook({ ...updatedBook, image: e.target.value })}
							/>
						</VStack>
					</ModalBody>

					<ModalFooter>
						<Button
							colorScheme='blue'
							mr={3}
							onClick={() => handleUpdateBook(book._id, updatedBook)}
						>
							Update
						</Button>
						<Button variant='ghost' onClick={onClose}>
							Cancel
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</Box>
	);
};
export default BookCard;