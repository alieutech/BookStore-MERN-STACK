import AuthForm from "../components/AuthForm";
import { useAuthStore } from "../store/auth";

const LoginPage = () => {
	const login = useAuthStore((state) => state.login);

	return (
		<AuthForm
			title='Log In'
			submitLabel='Log In'
			onSubmit={login}
			fields={[
				{ name: "email", type: "email", placeholder: "Email", autoComplete: "email" },
				{ name: "password", type: "password", placeholder: "Password", autoComplete: "current-password" },
			]}
			footer={{ text: "No account yet?", linkLabel: "Sign up", to: "/register" }}
		/>
	);
};
export default LoginPage;
