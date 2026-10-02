import AuthForm from "../components/AuthForm";
import { useAuthStore } from "../store/auth";

const RegisterPage = () => {
	const register = useAuthStore((state) => state.register);

	return (
		<AuthForm
			title='Create your account'
			subtitle='It only takes a minute.'
			submitLabel='Create Account'
			onSubmit={register}
			fields={[
				{ name: "name", label: "Name", autoComplete: "name" },
				{ name: "email", label: "Email", type: "email", autoComplete: "email" },
				{ name: "password", label: "Password", type: "password", autoComplete: "new-password", help: "8 to 72 characters." },
			]}
			footer={{ text: "Already have an account?", linkLabel: "Log in", to: "/login" }}
		/>
	);
};
export default RegisterPage;
