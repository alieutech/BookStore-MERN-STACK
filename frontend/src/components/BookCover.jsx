import { AspectRatio, Box, Flex, Image, Text } from "@chakra-ui/react";
import { useState } from "react";

// Soft gradients for books without a working cover image, picked from the title
const FALLBACKS = [
	["#4142C4", "#929DF8"],
	["#0F766E", "#5EEAD4"],
	["#9D174D", "#F9A8D4"],
	["#B45309", "#FCD34D"],
	["#1E40AF", "#93C5FD"],
	["#6D28D9", "#C4B5FD"],
];
// djb2 string hash, so similar titles still get different colors
const pickFallback = (title = "") => {
	const hash = [...title].reduce((h, char) => ((h * 33) ^ char.charCodeAt(0)) >>> 0, 5381);
	return FALLBACKS[hash % FALLBACKS.length];
};

// A book cover in a 2:3 frame. Shows a styled placeholder if the image is missing or fails to load.
// `compact` is for small thumbnails: the placeholder shows just the first letter.
const BookCover = ({ book, rounded = "lg", compact = false, ...props }) => {
	const [failedSrc, setFailedSrc] = useState(null);
	const showImage = book.image && failedSrc !== book.image;
	const [from, to] = pickFallback(book.title);

	return (
		<AspectRatio ratio={2 / 3} w='full' rounded={rounded} overflow='hidden' bg='bg.subtle' {...props}>
			{showImage ? (
				<Image src={book.image} alt={`Cover of ${book.title}`} objectFit='cover' onError={() => setFailedSrc(book.image)} loading='lazy' />
			) : (
				<Box bgGradient={`linear(to-br, ${from}, ${to})`} aria-label={`Cover of ${book.title}`} role='img'>
					{/* AspectRatio centers its child, so the layout lives in this inner box */}
					{compact ? (
						<Flex w='full' h='full' align='center' justify='center' color='white' fontFamily='heading' fontWeight='700' fontSize='lg'>
							{(book.title || "?").trim()[0].toUpperCase()}
						</Flex>
					) : (
					<Flex direction='column' justify='space-between' align='flex-start' w='full' h='full' p={{ base: 3, md: 4 }} color='white'>
						<Box w='8' h='1' bg='whiteAlpha.700' rounded='full' />
						<Box>
							<Text fontFamily='heading' fontWeight='600' fontSize={{ base: "md", md: "xl" }} lineHeight='short' noOfLines={4}>
								{book.title}
							</Text>
							{book.author && (
								<Text fontSize='sm' opacity={0.85} mt={2} noOfLines={1}>
									{book.author}
								</Text>
							)}
						</Box>
					</Flex>
					)}
				</Box>
			)}
		</AspectRatio>
	);
};
export default BookCover;
