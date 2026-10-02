import { Box, Button, Container, Heading, Input, Text, useColorModeValue, useToast, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";

// Shared form for the login and register pages
const AuthForm = ({ title, fields, submitLabel, onSubmit, footer }) => {
	const [values, setValues] = useState(Object.fromEntries(fields.map((f) => [f.name, ""])));
	const [isSubmitting, setIsSubmitting] = useState(false);
	const toast = useToast();
	const navigate = useNavigate();
	const location = useLocation();
	const bg = useColorModeValue("white", "gray.800");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		const { success, message } = await onSubmit(values);
		setIsSubmitting(false);
		toast({
			title: success ? "Welcome!" : "Error",
			description: message,
			status: success ? "success" : "error",
			duration: 3000,
			isClosable: true,
		});
		// Go back to the page that sent the user here, or home
		if (success) navigate(location.state?.from || "/", { replace: true });
	};

	return (
		<Container maxW={"container.sm"} py={12}>
			<VStack spacing={8}>
				<Heading as={"h1"} size={"2xl"} textAlign={"center"}>
					{title}
				</Heading>
				<Box as='form' onSubmit={handleSubmit} w={"full"} bg={bg} p={6} rounded={"lg"} shadow={"md"}>
					<VStack spacing={4}>
						{fields.map((field) => (
							<Input
								key={field.name}
								name={field.name}
								type={field.type || "text"}
								placeholder={field.placeholder}
								autoComplete={field.autoComplete}
								value={values[field.name]}
								onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
								isRequired
							/>
						))}
						<Button type='submit' colorScheme='blue' w='full' isLoading={isSubmitting}>
							{submitLabel}
						</Button>
						<Text>
							{footer.text}{" "}
							<Text as={RouterLink} to={footer.to} state={location.state} color='blue.500' _hover={{ textDecoration: "underline" }}>
								{footer.linkLabel}
							</Text>
						</Text>
					</VStack>
				</Box>
			</VStack>
		</Container>
	);
};
export default AuthForm;
