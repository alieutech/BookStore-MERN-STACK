import { MdDelete, MdEdit } from 'react-icons/md';

import {
	Badge,
	Box,
	Button,
	Heading,
	HStack,
	IconButton,
	Image,
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
import { useBookStore } from "../store/book";
import BookFormFields from "./BookFormFields";
import { useIsAdmin } from "../store/auth";
import { useCartStore } from "../store/cart";
import { formatPrice } from "../utils/format";
import { FiShoppingCart } from "react-icons/fi";
import { useState } from "react";

const BookCard = ({ book }) => {
	const [updatedBook, setUpdatedBook] = useState(book);

	const textColor = useColorModeValue("gray.600", "gray.200");
	const bg = useColorModeValue("white", "gray.800");

	const { deleteBook, updateBook } = useBookStore();
	const isAdmin = useIsAdmin();
	const addToCart = useCartStore((state) => state.addItem);
	const toast = useToast();
	const { isOpen, onOpen, onClose } = useDisclosure();

	const handleAddToCart = () => {
		addToCart(book._id);
		toast({
			title: "Added to cart",
			description: `"${book.title}" is in your cart.`,
			status: "success",
			duration: 2000,
			isClosable: true,
		});
	};

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
		if (!success) {
			toast({
				title: "Error",
				description: message,
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		} else {
			onClose();
			toast({
				title: "Success",
				description: message,
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
				{book.category && (
					<Badge colorScheme='purple' mb={2}>
						{book.category}
					</Badge>
				)}
				<Heading as='h3' size='md' mb={2}>
					{book.title}
				</Heading>
				<Text fontWeight='bold' fontSize='xl' color={textColor} mb={4}>
					{book.author}
				</Text>
				<Text fontWeight='bold' fontSize='xl' color={textColor} mb={4}>
				Publish_Year:  {book.publishYear}
				</Text>

				<Text fontWeight='bold' fontSize='xl' color={textColor} mb={4}>
					{formatPrice(book.price)}
				</Text>

				<HStack spacing={2}>
					<Button leftIcon={<FiShoppingCart />} colorScheme='green' onClick={handleAddToCart} flex='1'>
						Add to cart
					</Button>
				{isAdmin && (
				<>
					<IconButton
						aria-label='Edit book'
						icon={<MdEdit />}
						onClick={() => {
							setUpdatedBook(book);
							onOpen();
						}}
						colorScheme='blue'
					/>
					<IconButton
						aria-label='Delete book'
						icon={<MdDelete />}
						onClick={() => handleDeleteBook(book._id)}
						colorScheme='red'
					/>
				</>
				)}
				</HStack>
			</Box>

			<Modal isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />

				<ModalContent>
					<ModalHeader>Update Book</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<VStack spacing={4}>
							<BookFormFields book={updatedBook} onChange={setUpdatedBook} />
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