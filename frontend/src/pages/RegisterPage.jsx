import AuthForm from "../components/AuthForm";
import { useAuthStore } from "../store/auth";

const RegisterPage = () => {
	const register = useAuthStore((state) => state.register);

	return (
		<AuthForm
			title='Sign Up'
			submitLabel='Create Account'
			onSubmit={register}
			fields={[
				{ name: "name", placeholder: "Name", autoComplete: "name" },
				{ name: "email", type: "email", placeholder: "Email", autoComplete: "email" },
				{ name: "password", type: "password", placeholder: "Password (at least 8 characters)", autoComplete: "new-password" },
			]}
			footer={{ text: "Already have an account?", linkLabel: "Log in", to: "/login" }}
		/>
	);
};
export default RegisterPage;
