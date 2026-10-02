import { Container, Text } from "@chakra-ui/react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore, useIsAdmin } from "../store/auth";

// Only render children for admins; send logged-out users to the login page
const AdminRoute = ({ children }) => {
	const user = useAuthStore((state) => state.user);
	const isAdmin = useIsAdmin();
	const location = useLocation();

	if (!user) return <Navigate to='/login' replace state={{ from: location.pathname }} />;
	if (!isAdmin) {
		return (
			<Container py={12}>
				<Text fontSize='xl' textAlign='center' color='gray.500'>
					Only admins can manage books.
				</Text>
			</Container>
		);
	}
	return children;
};
export default AdminRoute;
