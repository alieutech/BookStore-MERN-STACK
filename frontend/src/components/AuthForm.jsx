import { Box, Button, Container, Flex, FormControl, FormHelperText, FormLabel, Heading, IconButton, Input, InputGroup, InputRightElement, Link, Text, useToast, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { FiCheckCircle, FiEye, FiEyeOff } from "react-icons/fi";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import Logo from "./Logo";

const PasswordInput = (props) => {
	const [show, setShow] = useState(false);
	return (
		<InputGroup>
			<Input type={show ? "text" : "password"} {...props} />
			<InputRightElement>
				<IconButton aria-label={show ? "Hide password" : "Show password"} icon={show ? <FiEyeOff /> : <FiEye />} size='sm' variant='ghost' colorScheme='gray' onClick={() => setShow(!show)} />
			</InputRightElement>
		</InputGroup>
	);
};

const PERKS = ["Track every order from your account", "Leave reviews and help other readers", "Pay in cash when your books arrive"];

// Shared layout for the login and sign-up pages
const AuthForm = ({ title, subtitle, fields, submitLabel, onSubmit, footer }) => {
	const [values, setValues] = useState(Object.fromEntries(fields.map((f) => [f.name, ""])));
	const [isSubmitting, setIsSubmitting] = useState(false);
	const toast = useToast();
	const navigate = useNavigate();
	const location = useLocation();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		const { success, message } = await onSubmit(values);
		setIsSubmitting(false);
		toast({ title: success ? "Welcome!" : "Error", description: message, status: success ? "success" : "error" });
		// Go back to the page that sent the user here, or home
		if (success) navigate(location.state?.from || "/", { replace: true });
	};

	return (
		<Container maxW='container.lg' py={{ base: 8, md: 16 }}>
			<Flex layerStyle='card' overflow='hidden' minH={{ md: "560px" }}>
				<Flex display={{ base: "none", md: "flex" }} direction='column' justify='space-between' w='45%' bgGradient='linear(to-br, brand.700, brand.500)' color='white' p={10}>
					<Box>
						<Logo />
					</Box>
					<Box>
						<Heading size='lg' mb={6} lineHeight='1.2'>
							Your next favourite book is a few clicks away.
						</Heading>
						<VStack align='stretch' spacing={3}>
							{PERKS.map((perk) => (
								<Flex key={perk} align='center' gap={3} color='brand.50'>
									<FiCheckCircle />
									<Text>{perk}</Text>
								</Flex>
							))}
						</VStack>
					</Box>
					<Text fontSize='sm' color='brand.100'>
						© {new Date().getFullYear()} BookStore
					</Text>
				</Flex>

				<Flex flex='1' align='center' justify='center' p={{ base: 6, md: 12 }}>
					<Box as='form' onSubmit={handleSubmit} w='full' maxW='sm'>
						<Heading as='h1' size='xl' mb={2}>
							{title}
						</Heading>
						<Text color='text.muted' mb={8}>
							{subtitle}
						</Text>
						<VStack spacing={5} align='stretch'>
							{fields.map((field) => (
								<FormControl key={field.name} isRequired>
									<FormLabel>{field.label}</FormLabel>
									{field.type === "password" ? (
										<PasswordInput name={field.name} autoComplete={field.autoComplete} value={values[field.name]} onChange={(e) => setValues({ ...values, [field.name]: e.target.value })} />
									) : (
										<Input name={field.name} type={field.type || "text"} autoComplete={field.autoComplete} value={values[field.name]} onChange={(e) => setValues({ ...values, [field.name]: e.target.value })} />
									)}
									{field.help && <FormHelperText>{field.help}</FormHelperText>}
								</FormControl>
							))}
							<Button type='submit' size='lg' w='full' isLoading={isSubmitting}>
								{submitLabel}
							</Button>
						</VStack>
						<Text mt={8} textAlign='center' color='text.muted'>
							{footer.text}{" "}
							<Link as={RouterLink} to={footer.to} state={location.state} fontWeight='semibold'>
								{footer.linkLabel}
							</Link>
						</Text>
					</Box>
				</Flex>
			</Flex>
		</Container>
	);
};
export default AuthForm;
