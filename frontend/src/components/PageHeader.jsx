import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Flex, Heading, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

// Page title with optional breadcrumbs, subtitle and actions on the right
const PageHeader = ({ title, subtitle, breadcrumbs, actions }) => (
	<Box mb={title ? 8 : 6}>
		{breadcrumbs && (
			<Breadcrumb fontSize='sm' color='text.muted' mb={3}>
				{breadcrumbs.map((crumb) => (
					<BreadcrumbItem key={crumb.label} isCurrentPage={!crumb.to} minW={0}>
						{crumb.to ? (
							<BreadcrumbLink as={RouterLink} to={crumb.to}>
								{crumb.label}
							</BreadcrumbLink>
						) : (
							<Text as='span' noOfLines={1}>
								{crumb.label}
							</Text>
						)}
					</BreadcrumbItem>
				))}
			</Breadcrumb>
		)}
		{title && (
		<Flex justify='space-between' align={{ base: "flex-start", md: "flex-end" }} gap={4} direction={{ base: "column", md: "row" }}>
			<Box>
				<Heading as='h1' size='xl'>
					{title}
				</Heading>
				{subtitle && (
					<Text color='text.muted' mt={2}>
						{subtitle}
					</Text>
				)}
			</Box>
			{actions}
		</Flex>
		)}
	</Box>
);
export default PageHeader;
