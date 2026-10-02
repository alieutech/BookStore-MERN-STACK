import { Button, Container } from "@chakra-ui/react";
import { FiLock } from "react-icons/fi";
import { Link as RouterLink, Navigate, useLocation } from "react-router-dom";
import { useAuthStore, useIsAdmin } from "../store/auth";
import EmptyState from "./EmptyState";

// Send logged-out users to the login page (and back afterwards).
// With adminOnly, non-admins see a message instead of the page.
const ProtectedRoute = ({ children, adminOnly = false }) => {
	const user = useAuthStore((state) => state.user);
	const isAdmin = useIsAdmin();
	const location = useLocation();

	if (!user) return <Navigate to='/login' replace state={{ from: location.pathname }} />;
	if (adminOnly && !isAdmin) {
		return (
			<Container maxW='container.md' py={16}>
				<EmptyState
					icon={FiLock}
					title='Only admins can see this page.'
					description='Ask a store admin for access if you think you should have it.'
					action={
						<Button as={RouterLink} to='/'>
							Back to the store
						</Button>
					}
				/>
			</Container>
		);
	}
	return children;
};
export default ProtectedRoute;
