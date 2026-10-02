import { Box, Container, Flex, HStack, Link, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import Logo from "./Logo";

const Footer = () => (
	<Box as='footer' borderTopWidth='1px' borderColor='border.subtle' bg='bg.surface' mt={16}>
		<Container maxW='container.xl' py={8}>
			<Flex direction={{ base: "column", md: "row" }} justify='space-between' align={{ base: "flex-start", md: "center" }} gap={6}>
				<Box>
					<Logo />
					<Text color='text.muted' fontSize='sm' mt={2}>
						Books for curious minds. Pay cash on delivery.
					</Text>
				</Box>
				<HStack spacing={6} fontSize='sm'>
					<Link as={RouterLink} to='/' color='text.muted'>
						Browse
					</Link>
					<Link as={RouterLink} to='/cart' color='text.muted'>
						Cart
					</Link>
					<Link as={RouterLink} to='/my-orders' color='text.muted'>
						My orders
					</Link>
				</HStack>
			</Flex>
			<Text color='text.subtle' fontSize='xs' mt={6}>
				© {new Date().getFullYear()} BookStore. All rights reserved.
			</Text>
		</Container>
	</Box>
);
export default Footer;
