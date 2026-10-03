import {
	Avatar,
	Badge,
	Box,
	Button,
	Container,
	Drawer,
	DrawerBody,
	DrawerCloseButton,
	DrawerContent,
	DrawerHeader,
	DrawerOverlay,
	Flex,
	HStack,
	IconButton,
	Menu,
	MenuButton,
	MenuDivider,
	MenuGroup,
	MenuItem,
	MenuList,
	Text,
	Tooltip,
	useColorMode,
	useDisclosure,
	VStack,
} from "@chakra-ui/react";
import { FiBarChart2, FiChevronDown, FiHeart, FiLogOut, FiMenu, FiMoon, FiPackage, FiPlusSquare, FiShoppingBag, FiShoppingCart, FiSun, FiTruck } from "react-icons/fi";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuthStore, useIsAdmin } from "../store/auth";
import { useCartCount } from "../store/cart";
import { useWishlistCount } from "../store/wishlist";
import HeaderSearch from "./HeaderSearch";
import Logo from "./Logo";

// Links in the account menu (desktop) and the drawer (mobile)
const accountLinks = (isAdmin) => [
	{ to: "/wishlist", label: "Wishlist", icon: FiHeart },
	{ to: "/my-orders", label: "My orders", icon: FiPackage },
	...(isAdmin
		? [
				{ to: "/admin", label: "Dashboard", icon: FiBarChart2, admin: true },
				{ to: "/admin/orders", label: "Manage orders", icon: FiTruck, admin: true },
				{ to: "/create", label: "Add a book", icon: FiPlusSquare, admin: true },
			]
		: []),
];

const CartButton = () => {
	const cartCount = useCartCount();
	return (
		<Tooltip label='Cart' openDelay={400}>
			<Box position='relative'>
				<IconButton as={RouterLink} to='/cart' aria-label={`Cart, ${cartCount} items`} icon={<FiShoppingCart />} variant='ghost' colorScheme='gray' fontSize='xl' />
				{cartCount > 0 && (
					<Badge position='absolute' top='0' right='0' transform='translate(25%, -25%)' bg='brand.500' color='white' rounded='full' minW='5' h='5' fontSize='xs' display='flex' alignItems='center' justifyContent='center' pointerEvents='none'>
						{cartCount}
					</Badge>
				)}
			</Box>
		</Tooltip>
	);
};

const WishlistLink = () => {
	const count = useWishlistCount();
	return (
		<Tooltip label='Wishlist' openDelay={400}>
			<Box position='relative'>
				<IconButton as={RouterLink} to='/wishlist' aria-label={`Wishlist, ${count} ${count === 1 ? "book" : "books"}`} icon={<FiHeart />} variant='ghost' colorScheme='gray' fontSize='xl' />
				{count > 0 && (
					<Badge position='absolute' top='0' right='0' transform='translate(25%, -25%)' bg='pink.500' color='white' rounded='full' minW='5' h='5' fontSize='xs' display='flex' alignItems='center' justifyContent='center' pointerEvents='none'>
						{count}
					</Badge>
				)}
			</Box>
		</Tooltip>
	);
};

const NavBar = () => {
	const { colorMode, toggleColorMode } = useColorMode();
	const user = useAuthStore((state) => state.user);
	const logout = useAuthStore((state) => state.logout);
	const isAdmin = useIsAdmin();
	const navigate = useNavigate();
	const drawer = useDisclosure();
	const links = accountLinks(isAdmin);

	const handleLogout = () => {
		logout();
		drawer.onClose();
		navigate("/");
	};

	const colorModeButton = (
		<IconButton aria-label={colorMode === "light" ? "Switch to dark mode" : "Switch to light mode"} icon={colorMode === "light" ? <FiMoon /> : <FiSun />} onClick={toggleColorMode} variant='ghost' colorScheme='gray' fontSize='lg' />
	);

	return (
		<Box as='header' position='sticky' top={0} zIndex='sticky' bg='bg.surface' borderBottomWidth='1px' borderColor='border.subtle' backdropFilter='saturate(180%) blur(8px)'>
			<Container maxW='container.xl' py={3}>
				<Flex align='center' gap={{ base: 2, md: 6 }} wrap={{ base: "wrap", md: "nowrap" }}>
					<Logo flexShrink={0} />

					<Box flex='1' maxW='xl' mx='auto' order={{ base: 3, md: 0 }} w={{ base: "full", md: "auto" }} minW={{ base: "full", md: "0" }}>
						<HeaderSearch />
					</Box>

					<HStack spacing={1} ml='auto' flexShrink={0}>
						{user && <WishlistLink />}
						<CartButton />
						<Box display={{ base: "none", md: "block" }}>{colorModeButton}</Box>

						{user ? (
							<Box display={{ base: "none", md: "block" }}>
								<Menu placement='bottom-end'>
									<MenuButton as={Button} variant='ghost' colorScheme='gray' rightIcon={<FiChevronDown />} px={2}>
										<HStack spacing={2}>
											<Avatar size='xs' name={user.name} bg='brand.500' color='white' />
											<Text fontSize='sm' maxW='32' noOfLines={1}>
												{user.name}
											</Text>
										</HStack>
									</MenuButton>
									<MenuList zIndex='dropdown'>
										<Box px={3} py={2}>
											<Text fontWeight='semibold' fontSize='sm'>
												{user.name}
											</Text>
											<Text fontSize='xs' color='text.muted'>
												{user.email}
											</Text>
										</Box>
										<MenuDivider />
										<MenuItem as={RouterLink} to='/wishlist' icon={<FiHeart />}>
											Wishlist
										</MenuItem>
										<MenuItem as={RouterLink} to='/my-orders' icon={<FiPackage />}>
											My orders
										</MenuItem>
										{isAdmin && (
											<>
												<MenuDivider />
												<MenuGroup title='Admin'>
													{links
														.filter((link) => link.admin)
														.map((link) => (
															<MenuItem key={link.to} as={RouterLink} to={link.to} icon={<link.icon />}>
																{link.label}
															</MenuItem>
														))}
												</MenuGroup>
											</>
										)}
										<MenuDivider />
										<MenuItem icon={<FiLogOut />} onClick={handleLogout}>
											Log out
										</MenuItem>
									</MenuList>
								</Menu>
							</Box>
						) : (
							<HStack spacing={2} display={{ base: "none", md: "flex" }}>
								<Button as={RouterLink} to='/login' variant='ghost' colorScheme='gray'>
									Log in
								</Button>
								<Button as={RouterLink} to='/register'>
									Sign up
								</Button>
							</HStack>
						)}

						<IconButton aria-label='Open menu' icon={<FiMenu />} onClick={drawer.onOpen} variant='ghost' colorScheme='gray' fontSize='xl' display={{ base: "inline-flex", md: "none" }} />
					</HStack>
				</Flex>
			</Container>

			<Drawer isOpen={drawer.isOpen} onClose={drawer.onClose} placement='right'>
				<DrawerOverlay />
				<DrawerContent>
					<DrawerCloseButton />
					<DrawerHeader borderBottomWidth='1px' borderColor='border.subtle'>
						{user ? (
							<HStack>
								<Avatar size='sm' name={user.name} bg='brand.500' color='white' />
								<Box>
									<Text fontSize='md'>{user.name}</Text>
									<Text fontSize='xs' fontWeight='normal' color='text.muted'>
										{user.email}
									</Text>
								</Box>
							</HStack>
						) : (
							"Menu"
						)}
					</DrawerHeader>
					<DrawerBody py={4}>
						<VStack align='stretch' spacing={1}>
							<Button as={RouterLink} to='/' onClick={drawer.onClose} variant='ghost' colorScheme='gray' justifyContent='flex-start' leftIcon={<FiShoppingBag />}>
								Browse books
							</Button>
							{user &&
								links.map((link) => (
									<Button key={link.to} as={RouterLink} to={link.to} onClick={drawer.onClose} variant='ghost' colorScheme='gray' justifyContent='flex-start' leftIcon={<link.icon />}>
										{link.label}
									</Button>
								))}
							<Button onClick={toggleColorMode} variant='ghost' colorScheme='gray' justifyContent='flex-start' leftIcon={colorMode === "light" ? <FiMoon /> : <FiSun />}>
								{colorMode === "light" ? "Dark mode" : "Light mode"}
							</Button>
						</VStack>
						<Box pt={6}>
							{user ? (
								<Button w='full' variant='outline' colorScheme='gray' leftIcon={<FiLogOut />} onClick={handleLogout}>
									Log out
								</Button>
							) : (
								<VStack spacing={2}>
									<Button as={RouterLink} to='/register' onClick={drawer.onClose} w='full'>
										Sign up
									</Button>
									<Button as={RouterLink} to='/login' onClick={drawer.onClose} w='full' variant='outline'>
										Log in
									</Button>
								</VStack>
							)}
						</Box>
					</DrawerBody>
				</DrawerContent>
			</Drawer>
		</Box>
	);
};

export default NavBar;
