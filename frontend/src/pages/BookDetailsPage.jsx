import {
	Avatar,
	Badge,
	Box,
	Button,
	Container,
	Divider,
	Flex,
	Grid,
	GridItem,
	Heading,
	HStack,
	Link,
	Progress,
	SimpleGrid,
	Skeleton,
	SkeletonText,
	Stack,
	Text,
	Textarea,
	useDisclosure,
	useToast,
	VStack,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FiAlertCircle, FiCheckCircle, FiEdit2, FiShoppingCart, FiTruck } from "react-icons/fi";
import { Link as RouterLink, useLocation, useParams } from "react-router-dom";
import { request } from "../api/request";
import BookCover from "../components/BookCover";
import BookEditModal from "../components/BookEditModal";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";
import { StarInput, StarRating } from "../components/StarRating";
import StockBadge from "../components/StockBadge";
import WishlistButton from "../components/WishlistButton";
import { useAddToCart } from "../hooks/useAddToCart";
import { useAuthStore, useIsAdmin } from "../store/auth";
import { useCartStore } from "../store/cart";
import { formatDate, formatPrice } from "../utils/format";

// Average, total and a bar per star value
const RatingSummary = ({ book, reviews }) => {
	const counts = useMemo(() => [5, 4, 3, 2, 1].map((star) => [star, reviews.filter((review) => review.rating === star).length]), [reviews]);
	return (
		<VStack align='stretch' spacing={4} layerStyle='card' p={6}>
			<HStack spacing={4}>
				<Text fontSize='5xl' fontWeight='bold' fontFamily='heading' lineHeight='1'>
					{book.numReviews ? book.averageRating.toFixed(1) : "–"}
				</Text>
				<Box>
					<StarRating value={book.averageRating} size='18px' />
					<Text fontSize='sm' color='text.muted' mt={1}>
						{book.numReviews} {book.numReviews === 1 ? "review" : "reviews"}
					</Text>
				</Box>
			</HStack>
			<VStack align='stretch' spacing={2}>
				{counts.map(([star, count]) => (
					<HStack key={star} spacing={3} fontSize='sm'>
						<Text w='12' color='text.muted' whiteSpace='nowrap'>
							{star} star
						</Text>
						<Progress value={reviews.length ? (count / reviews.length) * 100 : 0} flex='1' size='sm' rounded='full' colorScheme='orange' aria-label={`${count} ${star}-star reviews`} />
						<Text w='6' textAlign='right' color='text.muted'>
							{count}
						</Text>
					</HStack>
				))}
			</VStack>
		</VStack>
	);
};

const DetailsSkeleton = () => (
	<Container maxW='container.xl' py={{ base: 6, md: 10 }}>
		<Skeleton h='4' w='48' mb={8} />
		<Grid templateColumns={{ base: "1fr", md: "320px 1fr" }} gap={{ base: 8, md: 12 }}>
			<Skeleton rounded='lg' style={{ aspectRatio: "2 / 3" }} />
			<Box>
				<Skeleton h='10' w='70%' mb={4} />
				<SkeletonText noOfLines={6} spacing={4} />
			</Box>
		</Grid>
	</Container>
);

const BookDetailsPage = () => {
	const { id } = useParams();
	const location = useLocation();
	const user = useAuthStore((state) => state.user);
	const isAdmin = useIsAdmin();
	const addToCart = useAddToCart();
	const inCart = useCartStore((state) => state.items.find((item) => item.bookId === id)?.quantity || 0);
	const toast = useToast();
	const edit = useDisclosure();

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

	const notify = (success, message) => toast({ title: success ? "Success" : "Error", description: message, status: success ? "success" : "error" });

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
			<Container maxW='container.md' py={16}>
				<EmptyState
					icon={FiAlertCircle}
					title="We couldn't find that book"
					description={error}
					action={
						<Button as={RouterLink} to='/'>
							Back to the store
						</Button>
					}
				/>
			</Container>
		);
	}
	if (!book) return <DetailsSkeleton />;

	const soldOut = !book.stock;

	return (
		<Container maxW='container.xl' py={{ base: 6, md: 10 }}>
			<PageHeader
				breadcrumbs={[
					{ label: "Books", to: "/" },
					...(book.category ? [{ label: book.category, to: `/?category=${encodeURIComponent(book.category)}` }] : []),
					{ label: book.title },
				]}
			/>

			<Grid templateColumns={{ base: "1fr", md: "300px 1fr", lg: "340px 1fr" }} gap={{ base: 8, md: 12 }}>
				<GridItem>
					<Box position={{ md: "sticky" }} top={{ md: 24 }} maxW={{ base: "260px", md: "none" }} mx={{ base: "auto", md: 0 }}>
						<BookCover book={book} shadow='xl' />
					</Box>
				</GridItem>

				<GridItem>
					<VStack align='stretch' spacing={6}>
						<Box>
							{book.category && (
								<Text textStyle='eyebrow' mb={2}>
									{book.category}
								</Text>
							)}
							<Heading as='h1' size='2xl' lineHeight='1.1'>
								{book.title}
							</Heading>
							<Text fontSize='lg' color='text.muted' mt={3}>
								by <Text as='span' color='text.default' fontWeight='medium'>{book.author}</Text> · {book.publishYear}
							</Text>
							<HStack mt={3} spacing={3}>
								<StarRating value={book.averageRating} count={book.numReviews} />
								{book.numReviews > 0 && (
									<Link href='#reviews' fontSize='sm'>
										Read reviews
									</Link>
								)}
							</HStack>
						</Box>

						<Box layerStyle='card' p={6}>
							<Flex align='center' justify='space-between' wrap='wrap' gap={4}>
								<Box>
									<Text fontSize='3xl' fontWeight='bold'>
										{formatPrice(book.price)}
									</Text>
									<StockBadge stock={book.stock} mt={1} />
								</Box>
								<HStack spacing={3}>
									{isAdmin && (
										<Button leftIcon={<FiEdit2 />} variant='outline' onClick={edit.onOpen}>
											Edit
										</Button>
									)}
									<WishlistButton book={book} withLabel size='lg' />
									<Button leftIcon={<FiShoppingCart />} size='lg' onClick={() => addToCart(book)} isDisabled={soldOut}>
										{soldOut ? "Sold out" : "Add to cart"}
									</Button>
								</HStack>
							</Flex>
							{inCart > 0 && (
								<HStack mt={4} fontSize='sm' color='green.500' spacing={2}>
									<FiCheckCircle />
									<Text>
										{inCart} in your cart ·{" "}
										<Link as={RouterLink} to='/cart'>
											View cart
										</Link>
									</Text>
								</HStack>
							)}
							<Divider my={4} />
							<HStack fontSize='sm' color='text.muted' spacing={2}>
								<FiTruck />
								<Text>Delivered to your door — pay in cash on delivery.</Text>
							</HStack>
						</Box>

						{book.description && (
							<Box>
								<Heading as='h2' size='md' mb={3}>
									About this book
								</Heading>
								<Text whiteSpace='pre-line' color='text.muted' lineHeight='tall'>
									{book.description}
								</Text>
							</Box>
						)}

						<SimpleGrid columns={{ base: 2, sm: 3 }} spacing={4} fontSize='sm'>
							{[
								["Author", book.author],
								["Published", book.publishYear],
								["Category", book.category || "General"],
							].map(([label, value]) => (
								<Box key={label}>
									<Text color='text.subtle'>{label}</Text>
									<Text fontWeight='medium'>{value}</Text>
								</Box>
							))}
						</SimpleGrid>
					</VStack>
				</GridItem>
			</Grid>

			<Divider my={{ base: 10, md: 14 }} />

			<Box id='reviews' scrollMarginTop='24'>
				<Heading as='h2' size='lg' mb={6}>
					Reviews
				</Heading>
				<Grid templateColumns={{ base: "1fr", lg: "320px 1fr" }} gap={8} alignItems='start'>
					<VStack align='stretch' spacing={6}>
						<RatingSummary book={book} reviews={reviews} />
						{user ? (
							<Box as='form' onSubmit={handleSubmit} layerStyle='card' p={6}>
								<VStack align='stretch' spacing={3}>
									<Text fontWeight='semibold'>{myReview ? "Update your review" : "Write a review"}</Text>
									<StarInput value={form.rating} onChange={(rating) => setForm({ ...form, rating })} />
									<Textarea name='comment' placeholder='What did you think? (optional)' maxLength={1000} rows={4} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
									<Button type='submit' isLoading={isSaving}>
										{myReview ? "Update review" : "Submit review"}
									</Button>
								</VStack>
							</Box>
						) : (
							<Box layerStyle='card' p={6} textAlign='center'>
								<Text color='text.muted' mb={3}>
									Share your thoughts with other readers.
								</Text>
								<Button as={RouterLink} to='/login' state={{ from: location.pathname }} variant='outline' w='full'>
									Log in to write a review
								</Button>
							</Box>
						)}
					</VStack>

					{reviews.length === 0 ? (
						<Box layerStyle='card' p={10} textAlign='center' borderStyle='dashed' shadow='none'>
							<Text color='text.muted'>No reviews yet. Be the first!</Text>
						</Box>
					) : (
						<Stack spacing={4}>
							{reviews.map((review) => (
								<Box key={review._id} layerStyle='card' p={5}>
									<Flex justify='space-between' align='start' gap={4}>
										<HStack spacing={3} align='start'>
											<Avatar size='sm' name={review.user?.name || "Former customer"} />
											<Box>
												<HStack spacing={2} wrap='wrap'>
													<Text fontWeight='semibold'>{review.user?.name || "Former customer"}</Text>
													{review.verifiedPurchase && (
														<Badge colorScheme='green' variant='subtle'>
															Verified purchase
														</Badge>
													)}
												</HStack>
												<HStack spacing={2} mt={1}>
													<StarRating value={review.rating} size='13px' />
													<Text fontSize='xs' color='text.subtle'>
														{formatDate(review.updatedAt)}
													</Text>
												</HStack>
											</Box>
										</HStack>
										{(isAdmin || review.user?._id === user?._id) && (
											<Button size='sm' variant='ghost' colorScheme='red' onClick={() => handleDelete(review._id)}>
												Delete
											</Button>
										)}
									</Flex>
									{review.comment && (
										<Text mt={3} whiteSpace='pre-line' color='text.muted' pl={{ base: 0, sm: 11 }}>
											{review.comment}
										</Text>
									)}
								</Box>
							))}
						</Stack>
					)}
				</Grid>
			</Box>

			{isAdmin && <BookEditModal book={book} isOpen={edit.isOpen} onClose={edit.onClose} onSaved={(saved) => saved && setBook({ ...book, ...saved })} />}
		</Container>
	);
};
export default BookDetailsPage;
