import {
	Badge,
	Box,
	Container,
	Flex,
	Heading,
	SimpleGrid,
	Spinner,
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
	useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { request } from "../api/request";
import SalesChart from "../components/SalesChart";
import StockBadge from "../components/StockBadge";
import { ORDER_STATUSES } from "../store/orders";
import { formatPrice } from "../utils/format";

const Panel = ({ title, children }) => {
	const bg = useColorModeValue("white", "gray.800");
	return (
		<Box bg={bg} p={5} rounded='lg' shadow='md'>
			<Heading as='h2' size='md' mb={4}>
				{title}
			</Heading>
			{children}
		</Box>
	);
};

const DashboardPage = () => {
	const [report, setReport] = useState(null);
	const [error, setError] = useState("");
	const tileBg = useColorModeValue("white", "gray.800");

	useEffect(() => {
		request("/reports/sales")
			.then(({ data }) => setReport(data))
			.catch((err) => setError(err.message));
	}, []);

	if (error) {
		return (
			<Text py={12} textAlign='center' color='gray.500'>
				{error}
			</Text>
		);
	}
	if (!report) {
		return (
			<Flex justify='center' py={20}>
				<Spinner size='xl' />
			</Flex>
		);
	}

	const { totals, ordersByStatus, salesByDay, topBooks, lowStock, lowStockThreshold } = report;
	const tiles = [
		{ label: "Revenue", value: formatPrice(totals.revenue) },
		{ label: "Orders", value: totals.orders },
		{ label: "Books sold", value: totals.itemsSold },
		{ label: "Average order", value: formatPrice(totals.averageOrderValue) },
		{ label: "Customers", value: totals.customers },
	];

	return (
		<Container maxW='container.xl' py={12}>
			<Heading as='h1' size='xl' mb={2}>
				Dashboard
			</Heading>
			<Text color='gray.500' mb={8}>
				Sales exclude cancelled orders.
			</Text>

			<SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={4} mb={8}>
				{tiles.map((tile) => (
					<Stat key={tile.label} bg={tileBg} p={4} rounded='lg' shadow='md'>
						<StatLabel>{tile.label}</StatLabel>
						<StatNumber>{tile.value}</StatNumber>
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
					<Text as={RouterLink} to='/admin/orders' color='blue.500' fontSize='sm' display='inline-block' mt={3}>
						Manage orders →
					</Text>
				</Panel>

				<Box gridColumn={{ lg: "span 2" }}>
					<Panel title='Best sellers'>
						{topBooks.length === 0 ? (
							<Text color='gray.500'>No sales yet.</Text>
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
						<Text color='gray.500'>Everything is well stocked.</Text>
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
