import {
	Badge,
	Box,
	Button,
	Container,
	Divider,
	Flex,
	Heading,
	HStack,
	Image,
	Spinner,
	Stack,
	Text,
	Textarea,
	useColorModeValue,
	useToast,
	VStack,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { FiShoppingCart } from "react-icons/fi";
import { Link as RouterLink, useLocation, useParams } from "react-router-dom";
import { request } from "../api/request";
import { StarInput, StarRating } from "../components/StarRating";
import { useAuthStore, useIsAdmin } from "../store/auth";
import { useAddToCart } from "../hooks/useAddToCart";
import StockBadge from "../components/StockBadge";
import { formatDate, formatPrice } from "../utils/format";

const BookDetailsPage = () => {
	const { id } = useParams();
	const location = useLocation();
	const user = useAuthStore((state) => state.user);
	const isAdmin = useIsAdmin();
	const addToCart = useAddToCart();
	const toast = useToast();
	const bg = useColorModeValue("white", "gray.800");
	const mutedColor = useColorModeValue("gray.600", "gray.400");

	const [book, setBook] = useState(null);
	const [reviews, setReviews] = useState([]);
	const [error, setError] = useState("");
	const [form, setForm] = useState({ rating: 0, comment: "" });
	const [isSaving, setIsSaving] = useState(false);

	const myReview = reviews.find((review) => review.user?._id === user?._id);

	const load = useCallback(async () => {
		try {
			const [bookRes, reviewsRes] = await Promise.all([request(`/books/${id}`), request(`/books/${id}/reviews`)]);
			setBook(bookRes.data);
			setReviews(reviewsRes.data);
			setError("");
		} catch (err) {
			setError(err.message);
		}
	}, [id]);

	useEffect(() => {
		load();
	}, [load]);

	// Start the form from the user's existing review, if any
	useEffect(() => {
		setForm(myReview ? { rating: myReview.rating, comment: myReview.comment } : { rating: 0, comment: "" });
	}, [myReview?._id]); // eslint-disable-line react-hooks/exhaustive-deps

	const notify = (success, message) =>
		toast({ title: success ? "Success" : "Error", description: message, status: success ? "success" : "error", duration: 3000, isClosable: true });

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!form.rating) return notify(false, "Please choose a star rating.");
		setIsSaving(true);
		try {
			const { message } = await request(`/books/${id}/reviews`, { method: "POST", body: JSON.stringify(form) });
			notify(true, message);
			await load();
		} catch (err) {
			notify(false, err.message);
		}
		setIsSaving(false);
	};

	const handleDelete = async (reviewId) => {
		try {
			const { message } = await request(`/books/${id}/reviews/${reviewId}`, { method: "DELETE" });
			notify(true, message);
			await load();
		} catch (err) {
			notify(false, err.message);
		}
	};

	if (error) {
		return (
			<Container py={12}>
				<Text fontSize='xl' textAlign='center' color='gray.500'>
					{error}
				</Text>
			</Container>
		);
	}
	if (!book) {
		return (
			<Flex justify='center' py={20}>
				<Spinner size='xl' />
			</Flex>
		);
	}

	return (
		<Container maxW='container.lg' py={12}>
			<Stack direction={{ base: "column", md: "row" }} spacing={10} align='start'>
				<Image src={book.image} alt={book.title} w={{ base: "full", md: "sm" }} maxH='md' objectFit='cover' rounded='lg' shadow='lg' />
				<VStack align='start' spacing={4} flex='1'>
					<HStack spacing={2}>
						{book.category && <Badge colorScheme='purple'>{book.category}</Badge>}
						<StockBadge stock={book.stock} />
					</HStack>
					<Heading as='h1' size='xl'>
						{book.title}
					</Heading>
					<Text fontSize='lg' color={mutedColor}>
						by {book.author} · {book.publishYear}
					</Text>
					<StarRating value={book.averageRating} count={book.numReviews} />
					<Text fontSize='3xl' fontWeight='bold'>
						{formatPrice(book.price)}
					</Text>
					{book.description && <Text whiteSpace='pre-line'>{book.description}</Text>}
					<Button leftIcon={<FiShoppingCart />} colorScheme='green' size='lg' onClick={() => addToCart(book)} isDisabled={!book.stock}>
						{book.stock ? "Add to cart" : "Sold out"}
					</Button>
				</VStack>
			</Stack>

			<Divider my={10} />

			<Heading as='h2' size='lg' mb={6}>
				Reviews
			</Heading>

			{user ? (
				<Box as='form' onSubmit={handleSubmit} bg={bg} p={6} rounded='lg' shadow='md' mb={8}>
					<VStack align='stretch' spacing={3}>
						<Text fontWeight='bold'>{myReview ? "Update your review" : "Write a review"}</Text>
						<StarInput value={form.rating} onChange={(rating) => setForm({ ...form, rating })} />
						<Textarea
							name='comment'
							placeholder='What did you think of this book? (optional)'
							maxLength={1000}
							value={form.comment}
							onChange={(e) => setForm({ ...form, comment: e.target.value })}
						/>
						<Button type='submit' colorScheme='blue' alignSelf='start' isLoading={isSaving}>
							{myReview ? "Update review" : "Submit review"}
						</Button>
					</VStack>
				</Box>
			) : (
				<Text mb={8}>
					<Text as={RouterLink} to='/login' state={{ from: location.pathname }} color='blue.500' _hover={{ textDecoration: "underline" }}>
						Log in
					</Text>{" "}
					to write a review.
				</Text>
			)}

			{reviews.length === 0 ? (
				<Text color='gray.500'>No reviews yet. Be the first!</Text>
			) : (
				<VStack align='stretch' spacing={4}>
					{reviews.map((review) => (
						<Box key={review._id} bg={bg} p={5} rounded='lg' shadow='sm'>
							<Flex justify='space-between' align='start' gap={4}>
								<Box>
									<HStack spacing={3} mb={1}>
										<Text fontWeight='bold'>{review.user?.name || "Former customer"}</Text>
										{review.verifiedPurchase && (
											<Badge colorScheme='green' variant='subtle'>
												Verified purchase
											</Badge>
										)}
									</HStack>
									<StarRating value={review.rating} size='14px' />
									<Text fontSize='sm' color={mutedColor} mt={1}>
										{formatDate(review.updatedAt)}
									</Text>
								</Box>
								{(isAdmin || review.user?._id === user?._id) && (
									<Button size='sm' variant='ghost' colorScheme='red' onClick={() => handleDelete(review._id)}>
										Delete
									</Button>
								)}
							</Flex>
							{review.comment && (
								<Text mt={3} whiteSpace='pre-line'>
									{review.comment}
								</Text>
							)}
						</Box>
					))}
				</VStack>
			)}
		</Container>
	);
};
export default BookDetailsPage;
