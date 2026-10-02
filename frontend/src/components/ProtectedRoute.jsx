import { Container, Text } from "@chakra-ui/react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore, useIsAdmin } from "../store/auth";

// Send logged-out users to the login page (and back afterwards).
// With adminOnly, non-admins see a message instead of the page.
const ProtectedRoute = ({ children, adminOnly = false }) => {
	const user = useAuthStore((state) => state.user);
	const isAdmin = useIsAdmin();
	const location = useLocation();

	if (!user) return <Navigate to='/login' replace state={{ from: location.pathname }} />;
	if (adminOnly && !isAdmin) {
		return (
			<Container py={12}>
				<Text fontSize='xl' textAlign='center' color='gray.500'>
					Only admins can see this page.
				</Text>
			</Container>
		);
	}
	return children;
};
export default ProtectedRoute;
