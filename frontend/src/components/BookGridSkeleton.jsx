import { Box, SimpleGrid, Skeleton, SkeletonText } from "@chakra-ui/react";
import { BOOK_GRID_COLUMNS } from "../utils/layout";

// Placeholder cards while books load
const BookGridSkeleton = ({ count = 10 }) => (
	<SimpleGrid columns={BOOK_GRID_COLUMNS} spacing={{ base: 4, md: 6 }} w='full' aria-hidden='true'>
		{Array.from({ length: count }, (_, i) => (
			<Box key={i} layerStyle='card' p={3}>
				<Skeleton rounded='md' style={{ aspectRatio: "2 / 3" }} />
				<SkeletonText mt={4} noOfLines={3} spacing={3} skeletonHeight={3} />
			</Box>
		))}
	</SimpleGrid>
);
export default BookGridSkeleton;
