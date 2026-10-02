import { Button, Container } from "@chakra-ui/react";
import { FiCompass } from "react-icons/fi";
import { Link as RouterLink } from "react-router-dom";
import EmptyState from "../components/EmptyState";

const NotFoundPage = () => (
	<Container maxW='container.md' py={16}>
		<EmptyState
			icon={FiCompass}
			title='Page not found'
			description="The page you're looking for doesn't exist or has moved."
			action={
				<Button as={RouterLink} to='/'>
					Back to the store
				</Button>
			}
		/>
	</Container>
);
export default NotFoundPage;
