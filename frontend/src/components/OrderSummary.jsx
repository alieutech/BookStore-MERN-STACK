import { Box, Divider, Flex, Heading, Text, VStack } from "@chakra-ui/react";
import { formatPrice } from "../utils/format";

// Price breakdown panel used by the cart and checkout pages
const OrderSummary = ({ itemCount, total, children, title = "Order summary" }) => (
	<Box layerStyle='card' p={6} position={{ lg: "sticky" }} top={{ lg: 24 }}>
		<Heading as='h2' size='md' mb={5}>
			{title}
		</Heading>
		<VStack align='stretch' spacing={3} fontSize='sm'>
			<Flex justify='space-between'>
				<Text color='text.muted'>
					Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
				</Text>
				<Text>{formatPrice(total)}</Text>
			</Flex>
			<Flex justify='space-between'>
				<Text color='text.muted'>Delivery</Text>
				<Text color='green.500' fontWeight='medium'>
					Free
				</Text>
			</Flex>
			<Divider />
			<Flex justify='space-between' fontSize='lg' fontWeight='bold'>
				<Text>Total</Text>
				<Text>{formatPrice(total)}</Text>
			</Flex>
			<Text fontSize='xs' color='text.subtle'>
				Pay in cash when your books arrive.
			</Text>
		</VStack>
		{children && <Box mt={6}>{children}</Box>}
	</Box>
);
export default OrderSummary;
