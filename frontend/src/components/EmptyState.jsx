import { Box, Heading, Icon, Text, VStack } from "@chakra-ui/react";

// A friendly message for empty lists and errors, with an optional action button
const EmptyState = ({ icon, title, description, action, ...props }) => (
	<VStack spacing={3} textAlign='center' py={16} px={6} layerStyle='card' borderStyle='dashed' shadow='none' {...props}>
		{icon && (
			<Box p={4} rounded='full' bg='bg.brand' color='text.brand'>
				<Icon as={icon} boxSize={7} />
			</Box>
		)}
		<Heading as='h2' size='md'>
			{title}
		</Heading>
		{description && (
			<Text color='text.muted' maxW='md'>
				{description}
			</Text>
		)}
		{action && <Box pt={2}>{action}</Box>}
	</VStack>
);
export default EmptyState;
