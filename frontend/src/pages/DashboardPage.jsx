import {
	Badge,
	Box,
	Button,
	Container,
	Flex,
	Heading,
	HStack,
	SimpleGrid,
	Skeleton,
	Stat,
	StatLabel,
	StatNumber,
	Table,
	Tbody,
	Td,
	Text,
	Th,
	Thead,
	Tr,
} from "@chakra-ui/react";
import { FiAlertCircle, FiBookOpen, FiDollarSign, FiPlus, FiShoppingBag, FiTrendingUp, FiTruck, FiUsers } from "react-icons/fi";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { request } from "../api/request";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";
import SalesChart from "../components/SalesChart";
import StockBadge from "../components/StockBadge";
import { ORDER_STATUSES } from "../store/orders";
import { formatPrice } from "../utils/format";

const Panel = ({ title, children }) => (
	<Box layerStyle='card' p={6} h='full'>
		<Heading as='h2' size='md' mb={4}>
			{title}
		</Heading>
		{children}
	</Box>
);

const DashboardPage = () => {
	const [report, setReport] = useState(null);
	const [error, setError] = useState("");

	useEffect(() => {
		request("/reports/sales")
			.then(({ data }) => setReport(data))
			.catch((err) => setError(err.message));
	}, []);

	if (error) {
		return (
			<Container maxW='container.md' py={16}>
				<EmptyState icon={FiAlertCircle} title="Couldn't load the dashboard" description={error} />
			</Container>
		);
	}
	if (!report) {
		return (
			<Container maxW='container.xl' py={{ base: 6, md: 10 }}>
				<Skeleton h='10' w='48' mb={8} />
				<SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={4} mb={8}>
					{Array.from({ length: 5 }, (_, i) => (
						<Skeleton key={i} h='24' rounded='xl' />
					))}
				</SimpleGrid>
				<Skeleton h='72' rounded='xl' />
			</Container>
		);
	}

	const { totals, ordersByStatus, salesByDay, topBooks, lowStock, lowStockThreshold } = report;
	const tiles = [
		{ label: "Revenue", value: formatPrice(totals.revenue), icon: FiDollarSign },
		{ label: "Orders", value: totals.orders, icon: FiShoppingBag },
		{ label: "Books sold", value: totals.itemsSold, icon: FiBookOpen },
		{ label: "Average order", value: formatPrice(totals.averageOrderValue), icon: FiTrendingUp },
		{ label: "Customers", value: totals.customers, icon: FiUsers },
	];

	return (
		<Container maxW='container.xl' py={{ base: 6, md: 10 }}>
			<PageHeader
				title='Dashboard'
				subtitle='Sales exclude cancelled orders.'
				actions={
					<HStack spacing={3}>
						<Button as={RouterLink} to='/admin/orders' variant='outline' leftIcon={<FiTruck />}>
							Manage orders
						</Button>
						<Button as={RouterLink} to='/create' leftIcon={<FiPlus />}>
							Add a book
						</Button>
					</HStack>
				}
			/>

			<SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={4} mb={8}>
				{tiles.map((tile) => (
					<Stat key={tile.label} layerStyle='card' p={5}>
						<Flex justify='space-between' align='flex-start'>
							<Box>
								<StatLabel color='text.muted'>{tile.label}</StatLabel>
								<StatNumber fontSize='2xl'>{tile.value}</StatNumber>
							</Box>
							<Flex p={2} rounded='lg' bg='bg.brand' color='text.brand'>
								<tile.icon />
							</Flex>
						</Flex>
					</Stat>
				))}
			</SimpleGrid>

			<SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
				<Box gridColumn={{ lg: "span 2" }}>
					<Panel title='Revenue, last 30 days'>
						<SalesChart days={salesByDay} />
					</Panel>
				</Box>

				<Panel title='Orders by status'>
					<Table size='sm'>
						<Tbody>
							{ORDER_STATUSES.map((status) => (
								<Tr key={status}>
									<Td textTransform='capitalize'>{status}</Td>
									<Td isNumeric fontWeight='semibold'>
										{ordersByStatus[status] || 0}
									</Td>
								</Tr>
							))}
						</Tbody>
					</Table>
					<Text as={RouterLink} to='/admin/orders' color='text.brand' fontSize='sm' fontWeight='medium' display='inline-block' mt={3}>
						Manage orders →
					</Text>
				</Panel>

				<Box gridColumn={{ lg: "span 2" }}>
					<Panel title='Best sellers'>
						{topBooks.length === 0 ? (
							<Text color='text.muted'>No sales yet.</Text>
						) : (
							<Table size='sm'>
								<Thead>
									<Tr>
										<Th>Book</Th>
										<Th isNumeric>Copies sold</Th>
										<Th isNumeric>Revenue</Th>
									</Tr>
								</Thead>
								<Tbody>
									{topBooks.map((book) => (
										<Tr key={book.book}>
											<Td>
												<Text as={RouterLink} to={`/book/${book.book}`} _hover={{ textDecoration: "underline" }}>
													{book.title}
												</Text>
											</Td>
											<Td isNumeric>{book.quantity}</Td>
											<Td isNumeric>{formatPrice(book.revenue)}</Td>
										</Tr>
									))}
								</Tbody>
							</Table>
						)}
					</Panel>
				</Box>

				<Panel title={`Low stock (${lowStockThreshold} or fewer)`}>
					{lowStock.length === 0 ? (
						<Text color='text.muted'>Everything is well stocked.</Text>
					) : (
						<Table size='sm'>
							<Tbody>
								{lowStock.map((book) => (
									<Tr key={book._id}>
										<Td>
											<Text as={RouterLink} to={`/?q=${encodeURIComponent(book.title)}`} _hover={{ textDecoration: "underline" }}>
												{book.title}
											</Text>
										</Td>
										<Td isNumeric>
											<StockBadge stock={book.stock} />
										</Td>
									</Tr>
								))}
							</Tbody>
						</Table>
					)}
					<Badge mt={3} variant='subtle'>
						Edit a book to restock it
					</Badge>
				</Panel>
			</SimpleGrid>
		</Container>
	);
};
export default DashboardPage;
