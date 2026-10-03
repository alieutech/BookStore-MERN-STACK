import { Box, Flex, Heading, HStack, IconButton, LinkBox, LinkOverlay, Menu, MenuButton, MenuItem, MenuList, Text, Tooltip, useDisclosure, useToast } from "@chakra-ui/react";
import { FiEdit2, FiMoreVertical, FiShoppingCart, FiTrash2 } from "react-icons/fi";
import { Link as RouterLink } from "react-router-dom";
import { useAddToCart } from "../hooks/useAddToCart";
import { useIsAdmin } from "../store/auth";
import { useBookStore } from "../store/book";
import { formatPrice } from "../utils/format";
import BookCover from "./BookCover";
import BookEditModal from "./BookEditModal";
import ConfirmDialog from "./ConfirmDialog";
import { StarRating } from "./StarRating";
import WishlistButton from "./WishlistButton";
import StockBadge, { LOW_STOCK } from "./StockBadge";

const BookCard = ({ book }) => {
	const isAdmin = useIsAdmin();
	const addToCart = useAddToCart();
	const deleteBook = useBookStore((state) => state.deleteBook);
	const toast = useToast();
	const edit = useDisclosure();
	const confirmDelete = useDisclosure();
	const soldOut = !book.stock;

	const handleDelete = async () => {
		const { success, message } = await deleteBook(book._id);
		toast({ title: success ? "Book deleted" : "Couldn't delete", description: message, status: success ? "success" : "error" });
	};

	return (
		<LinkBox as='article' layerStyle='card' overflow='hidden' display='flex' flexDirection='column' transition='all 0.2s' _hover={{ shadow: "lg", transform: "translateY(-2px)" }} role='group'>
			<Box position='relative' p={3} pb={0}>
				<BookCover book={book} rounded='md' transition='transform 0.3s' _groupHover={{ transform: "scale(1.02)" }} />
				{(soldOut || book.stock <= LOW_STOCK) && <StockBadge stock={book.stock} overlay position='absolute' top={5} left={5} shadow='sm' />}
				{isAdmin && (
					<Box position='absolute' top={5} right={5} zIndex={1}>
						<Menu placement='bottom-end'>
							<MenuButton as={IconButton} aria-label='Book actions' icon={<FiMoreVertical />} size='sm' rounded='full' bg='bg.surface' color='text.default' shadow='md' _hover={{ bg: "bg.subtle" }} />
							<MenuList minW='36'>
								<MenuItem icon={<FiEdit2 />} onClick={edit.onOpen}>
									Edit book
								</MenuItem>
								<MenuItem icon={<FiTrash2 />} color='red.500' onClick={confirmDelete.onOpen}>
									Delete book
								</MenuItem>
							</MenuList>
						</Menu>
					</Box>
				)}
			</Box>

			<Flex direction='column' p={4} pt={3} flex='1' gap={1}>
				{book.category && (
					<Text textStyle='eyebrow' noOfLines={1}>
						{book.category}
					</Text>
				)}
				<Heading as='h3' size='sm' fontSize='md' lineHeight='short' noOfLines={2}>
					<LinkOverlay as={RouterLink} to={`/book/${book._id}`}>
						{book.title}
					</LinkOverlay>
				</Heading>
				<Text fontSize='sm' color='text.muted' noOfLines={1}>
					{book.author}
				</Text>
				<Box mt={1}>
					{book.numReviews ? (
						<StarRating value={book.averageRating} count={book.numReviews} size='13px' />
					) : (
						<Text fontSize='sm' color='text.subtle'>
							No reviews yet
						</Text>
					)}
				</Box>
				<Flex align='center' justify='space-between' mt='auto' pt={3}>
					<Text fontWeight='bold' fontSize='lg'>
						{formatPrice(book.price)}
					</Text>
					<HStack spacing={1}>
						<WishlistButton book={book} />
						<Tooltip label={soldOut ? "Sold out" : "Add to cart"} openDelay={300}>
							<IconButton aria-label={soldOut ? `${book.title} is sold out` : `Add ${book.title} to cart`} icon={<FiShoppingCart />} onClick={() => addToCart(book)} isDisabled={soldOut} rounded='full' position='relative' zIndex={1} />
						</Tooltip>
					</HStack>
				</Flex>
			</Flex>

			{isAdmin && (
				<>
					<BookEditModal book={book} isOpen={edit.isOpen} onClose={edit.onClose} />
					<ConfirmDialog
						isOpen={confirmDelete.isOpen}
						onClose={confirmDelete.onClose}
						onConfirm={handleDelete}
						title='Delete this book?'
						body={`"${book.title}" and its reviews will be removed. Past orders keep their copy of the title and price.`}
					/>
				</>
			)}
		</LinkBox>
	);
};
export default BookCard;
