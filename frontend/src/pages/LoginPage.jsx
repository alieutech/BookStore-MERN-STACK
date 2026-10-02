import AuthForm from "../components/AuthForm";
import { useAuthStore } from "../store/auth";

const LoginPage = () => {
	const login = useAuthStore((state) => state.login);

	return (
		<AuthForm
			title='Welcome back'
			subtitle='Log in to check out, track orders and write reviews.'
			submitLabel='Log In'
			onSubmit={login}
			fields={[
				{ name: "email", label: "Email", type: "email", autoComplete: "email" },
				{ name: "password", label: "Password", type: "password", autoComplete: "current-password" },
			]}
			footer={{ text: "No account yet?", linkLabel: "Sign up", to: "/register" }}
		/>
	);
};
export default LoginPage;
