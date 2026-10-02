import { Badge, Box, Button, Divider, Flex, HStack, Image, Select, Text, useColorModeValue, useToast, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { ORDER_STATUSES, useOrderStore } from "../store/orders";
import { formatDate, formatPrice } from "../utils/format";

const STATUS_COLORS = {
	pending: "yellow",
	processing: "blue",
	shipped: "purple",
	delivered: "green",
	cancelled: "red",
};

// One order. Customers can cancel a pending order; admins can change the status.
const OrderCard = ({ order, isAdminView = false }) => {
	const { cancelOrder, updateStatus } = useOrderStore();
	const [isBusy, setIsBusy] = useState(false);
	const toast = useToast();
	const bg = useColorModeValue("white", "gray.800");
	const mutedColor = useColorModeValue("gray.600", "gray.400");
	const { shippingAddress: address } = order;

	const run = async (action) => {
		setIsBusy(true);
		const { success, message } = await action();
		setIsBusy(false);
		toast({ title: success ? "Success" : "Error", description: message, status: success ? "success" : "error", duration: 3000, isClosable: true });
	};

	return (
		<Box w='full' bg={bg} p={5} rounded='lg' shadow='md'>
			<Flex justify='space-between' align={{ base: "start", md: "center" }} gap={3} direction={{ base: "column", md: "row" }}>
				<Box>
					<Text fontWeight='bold'>Order #{order._id.slice(-8).toUpperCase()}</Text>
					<Text fontSize='sm' color={mutedColor}>
						Placed {formatDate(order.createdAt)}
						{isAdminView && order.user && ` by ${order.user.name} (${order.user.email})`}
					</Text>
				</Box>
				<HStack>
					{isAdminView ? (
						<Select
							aria-label='Order status'
							size='sm'
							w='40'
							value={order.status}
							isDisabled={isBusy}
							onChange={(e) => run(() => updateStatus(order._id, e.target.value))}
						>
							{ORDER_STATUSES.map((status) => (
								<option key={status} value={status}>
									{status}
								</option>
							))}
						</Select>
					) : (
						<Badge colorScheme={STATUS_COLORS[order.status]} fontSize='sm' px={2} py={1}>
							{order.status}
						</Badge>
					)}
					{!isAdminView && order.status === "pending" && (
						<Button size='sm' colorScheme='red' variant='outline' isLoading={isBusy} onClick={() => run(() => cancelOrder(order._id))}>
							Cancel
						</Button>
					)}
				</HStack>
			</Flex>

			<Divider my={4} />

			<VStack align='stretch' spacing={3}>
				{order.items.map((item) => (
					<HStack key={item.book} spacing={4}>
						<Image src={item.image} alt={item.title} boxSize='12' objectFit='cover' rounded='md' />
						<Text flex='1'>
							{item.title} × {item.quantity}
						</Text>
						<Text fontWeight='semibold'>{formatPrice(item.price * item.quantity)}</Text>
					</HStack>
				))}
			</VStack>

			<Divider my={4} />

			<Flex justify='space-between' gap={4} direction={{ base: "column", md: "row" }}>
				<Text fontSize='sm' color={mutedColor}>
					Ship to: {address.fullName}, {address.address}, {address.city}, {address.country} · {address.phone}
					<br />
					Payment: cash on delivery
				</Text>
				<Text fontWeight='bold' fontSize='lg' whiteSpace='nowrap'>
					Total: {formatPrice(order.totalPrice)}
				</Text>
			</Flex>
		</Box>
	);
};
export default OrderCard;
