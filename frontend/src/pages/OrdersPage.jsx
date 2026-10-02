import { Button, Container, Skeleton, Tab, TabList, Tabs, VStack } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { FiPackage } from "react-icons/fi";
import { Link as RouterLink } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import OrderCard from "../components/OrderCard";
import PageHeader from "../components/PageHeader";
import { ORDER_STATUSES, useOrderStore } from "../store/orders";

const FILTERS = ["all", ...ORDER_STATUSES];

// "My orders" for customers, or every order (with status controls) for admins
const OrdersPage = ({ isAdminView = false }) => {
	const { orders, isLoading, fetchOrders } = useOrderStore();
	const [filter, setFilter] = useState("all");

	useEffect(() => {
		fetchOrders({ all: isAdminView });
	}, [fetchOrders, isAdminView]);

	const counts = useMemo(() => Object.fromEntries(FILTERS.map((f) => [f, f === "all" ? orders.length : orders.filter((o) => o.status === f).length])), [orders]);
	const visible = filter === "all" ? orders : orders.filter((order) => order.status === filter);

	return (
		<Container maxW='container.lg' py={{ base: 6, md: 10 }}>
			<PageHeader
				title={isAdminView ? "All Orders" : "My Orders"}
				subtitle={isAdminView ? "Move orders along as you pack and ship them." : "Track your orders and cancel them while they're still pending."}
				breadcrumbs={isAdminView ? [{ label: "Dashboard", to: "/admin" }, { label: "Orders" }] : undefined}
			/>

			{orders.length > 0 && (
				<Tabs variant='soft-rounded' colorScheme='brand' size='sm' mb={6} index={FILTERS.indexOf(filter)} onChange={(i) => setFilter(FILTERS[i])} overflowX='auto'>
					<TabList gap={1}>
						{FILTERS.map((f) => (
							<Tab key={f} textTransform='capitalize' whiteSpace='nowrap'>
								{f} ({counts[f]})
							</Tab>
						))}
					</TabList>
				</Tabs>
			)}

			{isLoading ? (
				<VStack spacing={6}>
					<Skeleton h='56' w='full' rounded='xl' />
					<Skeleton h='56' w='full' rounded='xl' />
				</VStack>
			) : orders.length === 0 ? (
				<EmptyState
					icon={FiPackage}
					title='No orders yet.'
					description={isAdminView ? "Orders from customers will show up here." : "When you place an order, you can follow it here."}
					action={
						!isAdminView && (
							<Button as={RouterLink} to='/'>
								Start shopping
							</Button>
						)
					}
				/>
			) : visible.length === 0 ? (
				<EmptyState icon={FiPackage} title={`No ${filter} orders`} description='Choose another status above.' />
			) : (
				<VStack spacing={6}>
					{visible.map((order) => (
						<OrderCard key={order._id} order={order} isAdminView={isAdminView} />
					))}
				</VStack>
			)}
		</Container>
	);
};
export default OrdersPage;
