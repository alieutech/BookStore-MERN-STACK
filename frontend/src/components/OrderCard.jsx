import { Badge, Box, Button, Flex, HStack, Select, SimpleGrid, Stack, StackDivider, Text, useDisclosure, useToast, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { FiCheck, FiMapPin, FiUser, FiXCircle } from "react-icons/fi";
import { Link as RouterLink } from "react-router-dom";
import { ORDER_STATUSES, useOrderStore } from "../store/orders";
import { formatDate, formatPrice } from "../utils/format";
import BookCover from "./BookCover";
import ConfirmDialog from "./ConfirmDialog";

const STATUS_COLORS = {
	pending: "yellow",
	processing: "blue",
	shipped: "purple",
	delivered: "green",
	cancelled: "red",
};
const PROGRESS = ["pending", "processing", "shipped", "delivered"];

// pending → processing → shipped → delivered, as a row of dots
const OrderProgress = ({ status }) => {
	if (status === "cancelled") {
		return (
			<HStack color='red.500' fontSize='sm' spacing={2}>
				<FiXCircle />
				<Text>This order was cancelled.</Text>
			</HStack>
		);
	}
	const current = PROGRESS.indexOf(status);
	return (
		<Flex align='center' w='full' maxW='lg' aria-label={`Order status: ${status}`}>
			{PROGRESS.map((step, i) => (
				<Flex key={step} align='center' flex={i < PROGRESS.length - 1 ? 1 : "none"}>
					<VStack spacing={1}>
						<Flex w='6' h='6' rounded='full' align='center' justify='center' fontSize='xs' bg={i <= current ? "brand.500" : "bg.subtle"} color={i <= current ? "white" : "text.subtle"}>
							{i < current ? <FiCheck /> : i + 1}
						</Flex>
						<Text fontSize='xs' color={i <= current ? "text.default" : "text.subtle"} textTransform='capitalize' fontWeight={i === current ? "semibold" : "normal"}>
							{step}
						</Text>
					</VStack>
					{i < PROGRESS.length - 1 && <Box flex='1' h='2px' mx={2} mb={5} bg={i < current ? "brand.500" : "border.subtle"} />}
				</Flex>
			))}
		</Flex>
	);
};

// One order. Customers can cancel a pending order; admins can change the status.
const OrderCard = ({ order, isAdminView = false }) => {
	const { cancelOrder, updateStatus } = useOrderStore();
	const [isBusy, setIsBusy] = useState(false);
	const confirmCancel = useDisclosure();
	const toast = useToast();
	const { shippingAddress: address } = order;

	const run = async (action) => {
		setIsBusy(true);
		const { success, message } = await action();
		setIsBusy(false);
		toast({ title: success ? "Success" : "Error", description: message, status: success ? "success" : "error" });
	};

	return (
		<Box layerStyle='card' w='full' overflow='hidden'>
			<Flex bg='bg.canvas' borderBottomWidth='1px' borderColor='border.subtle' px={{ base: 4, md: 6 }} py={4} justify='space-between' align={{ base: "flex-start", md: "center" }} gap={4} direction={{ base: "column", md: "row" }}>
				<SimpleGrid columns={{ base: 2, md: 3 }} spacingX={8} spacingY={2} fontSize='sm'>
					<Box>
						<Text color='text.subtle'>Order</Text>
						<Text fontWeight='semibold'>#{order._id.slice(-8).toUpperCase()}</Text>
					</Box>
					<Box>
						<Text color='text.subtle'>Placed</Text>
						<Text fontWeight='semibold'>{formatDate(order.createdAt)}</Text>
					</Box>
					<Box>
						<Text color='text.subtle'>Total</Text>
						<Text fontWeight='semibold'>{formatPrice(order.totalPrice)}</Text>
					</Box>
				</SimpleGrid>
				<HStack>
					{isAdminView ? (
						<Select aria-label='Order status' size='sm' w='40' rounded='md' bg='bg.surface' value={order.status} isDisabled={isBusy || order.status === "cancelled"} onChange={(e) => run(() => updateStatus(order._id, e.target.value))}>
							{ORDER_STATUSES.map((status) => (
								<option key={status} value={status}>
									{status[0].toUpperCase() + status.slice(1)}
								</option>
							))}
						</Select>
					) : (
						<Badge colorScheme={STATUS_COLORS[order.status]} fontSize='sm' px={3} py={1} textTransform='capitalize'>
							{order.status}
						</Badge>
					)}
					{!isAdminView && order.status === "pending" && (
						<Button size='sm' colorScheme='red' variant='outline' isLoading={isBusy} onClick={confirmCancel.onOpen}>
							Cancel
						</Button>
					)}
				</HStack>
			</Flex>

			<Box px={{ base: 4, md: 6 }} py={5}>
				<Box mb={6}>
					<OrderProgress status={order.status} />
				</Box>

				<Stack divider={<StackDivider borderColor='border.subtle' />} spacing={3}>
					{order.items.map((item) => (
						<Flex key={item.book} gap={4} align='center'>
							<Box as={RouterLink} to={`/book/${item.book}`} w='12' flexShrink={0}>
								<BookCover book={{ title: item.title, image: item.image }} rounded='sm' compact />
							</Box>
							<Box flex='1' minW={0}>
								<Text fontWeight='medium' noOfLines={1}>
									{item.title}
								</Text>
								<Text fontSize='sm' color='text.muted'>
									Qty {item.quantity} · {formatPrice(item.price)} each
								</Text>
							</Box>
							<Text fontWeight='semibold'>{formatPrice(item.price * item.quantity)}</Text>
						</Flex>
					))}
				</Stack>

				<Flex mt={5} pt={4} borderTopWidth='1px' borderColor='border.subtle' gap={{ base: 3, md: 8 }} direction={{ base: "column", md: "row" }} fontSize='sm' color='text.muted'>
					{isAdminView && order.user && (
						<HStack align='start' spacing={2}>
							<Box mt='3px'>
								<FiUser />
							</Box>
							<Text>
								{order.user.name} · {order.user.email}
							</Text>
						</HStack>
					)}
					<HStack align='start' spacing={2} flex='1'>
						<Box mt='3px'>
							<FiMapPin />
						</Box>
						<Text>
							Ship to: {address.fullName}, {address.address}, {address.city}, {address.country} · {address.phone}
						</Text>
					</HStack>
					<Text>Payment: cash on delivery</Text>
				</Flex>
			</Box>

			<ConfirmDialog
				isOpen={confirmCancel.isOpen}
				onClose={confirmCancel.onClose}
				onConfirm={() => run(() => cancelOrder(order._id))}
				title='Cancel this order?'
				body='The books go back on the shelf and the order cannot be restarted. You can always place a new order.'
				confirmLabel='Cancel order'
			/>
		</Box>
	);
};
export default OrderCard;
