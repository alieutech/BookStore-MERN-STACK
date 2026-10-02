import { Container, Flex, Heading, Spinner, Text, VStack } from "@chakra-ui/react";
import { useEffect } from "react";
import OrderCard from "../components/OrderCard";
import { useOrderStore } from "../store/orders";

// "My orders" for customers, or every order (with status controls) for admins
const OrdersPage = ({ isAdminView = false }) => {
	const { orders, isLoading, fetchOrders } = useOrderStore();

	useEffect(() => {
		fetchOrders({ all: isAdminView });
	}, [fetchOrders, isAdminView]);

	return (
		<Container maxW='container.md' py={12}>
			<Heading as='h1' size='xl' mb={8} textAlign='center'>
				{isAdminView ? "All Orders" : "My Orders"}
			</Heading>
			{isLoading ? (
				<Flex justify='center' py={10}>
					<Spinner size='xl' />
				</Flex>
			) : orders.length === 0 ? (
				<Text fontSize='xl' textAlign='center' color='gray.500'>
					No orders yet.
				</Text>
			) : (
				<VStack spacing={6}>
					{orders.map((order) => (
						<OrderCard key={order._id} order={order} isAdminView={isAdminView} />
					))}
				</VStack>
			)}
		</Container>
	);
};
export default OrdersPage;
