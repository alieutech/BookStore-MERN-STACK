import { Button, HStack, IconButton, Text } from "@chakra-ui/react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { pageItems } from "../utils/pagination";

// Previous / numbered pages / next
const Pagination = ({ page, totalPages, onChange }) => {
	if (totalPages <= 1) return null;
	return (
		<HStack as='nav' aria-label='Pagination' spacing={1} justify='center' wrap='wrap'>
			<IconButton aria-label='Previous page' icon={<FiChevronLeft />} size='sm' variant='outline' colorScheme='gray' bg='bg.surface' isDisabled={page <= 1} onClick={() => onChange(page - 1)} />
			{pageItems(page, totalPages).map((item, i) =>
				item === "…" ? (
					<Text key={`gap-${i}`} px={2} color='text.subtle' aria-hidden='true'>
						…
					</Text>
				) : (
					<Button
						key={item}
						size='sm'
						minW='9'
						variant={item === page ? "solid" : "outline"}
						colorScheme={item === page ? "brand" : "gray"}
						bg={item === page ? undefined : "bg.surface"}
						aria-label={`Page ${item}`}
						aria-current={item === page ? "page" : undefined}
						onClick={() => onChange(item)}
					>
						{item}
					</Button>
				)
			)}
			<IconButton aria-label='Next page' icon={<FiChevronRight />} size='sm' variant='outline' colorScheme='gray' bg='bg.surface' isDisabled={page >= totalPages} onClick={() => onChange(page + 1)} />
		</HStack>
	);
};
export default Pagination;
