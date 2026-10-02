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
import { StarRating } from "./StarRating";
import { Link as RouterLink } from "react-router-dom";
import { useIsAdmin } from "../store/auth";
import { useAddToCart } from "../hooks/useAddToCart";
import StockBadge from "./StockBadge";
import { formatPrice } from "../utils/format";
import { FiShoppingCart } from "react-icons/fi";
import { useState } from "react";

const BookCard = ({ book }) => {
	const [updatedBook, setUpdatedBook] = useState(book);

	const textColor = useColorModeValue("gray.600", "gray.200");
	const bg = useColorModeValue("white", "gray.800");

	const { deleteBook, updateBook } = useBookStore();
	const isAdmin = useIsAdmin();
	const addToCart = useAddToCart();
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
			<RouterLink to={`/book/${book._id}`}>
				<Image src={book.image} alt={book.title} h={48} w='full' objectFit='cover' />
			</RouterLink>

			<Box p={4}>
				<HStack mb={2} spacing={2}>
					{book.category && <Badge colorScheme='purple'>{book.category}</Badge>}
					<StockBadge stock={book.stock} />
				</HStack>
				<Heading as='h3' size='md' mb={2}>
					<RouterLink to={`/book/${book._id}`}>{book.title}</RouterLink>
				</Heading>
				<Box mb={2}>
					<StarRating value={book.averageRating || 0} count={book.numReviews || 0} size='14px' />
				</Box>
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
					<Button leftIcon={<FiShoppingCart />} colorScheme='green' onClick={() => addToCart(book)} flex='1' isDisabled={!book.stock}>
						{book.stock ? "Add to cart" : "Sold out"}
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