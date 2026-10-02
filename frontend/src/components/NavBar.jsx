import { 
  Badge,
  Button, 
  Container, 
  Flex, 
  HStack, 
  Link, 
  Text, 
  useColorMode, 
  useColorModeValue 
} from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuthStore, useIsAdmin } from "../store/auth";
import { useCartCount } from "../store/cart";
import { FiShoppingCart } from "react-icons/fi";
import { AiOutlinePlusSquare } from "react-icons/ai";
import { IoMoon } from "react-icons/io5";
import { LuSun } from "react-icons/lu";


const NavBar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue("gray.100", "gray.900");
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isAdmin = useIsAdmin();
  const cartCount = useCartCount();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Container maxW={"1140px"} px={4} bg={bgColor}>
      <Flex
        h={16}
        alignItems={"center"}
        justifyContent={"space-around"}
        flexDir={{ base: "column", sm: "row" }}
      >
        <HStack spacing={2}>         
          <Text
            fontSize={{ base: "22", sm: "28" }}
            fontWeight={"extrabold"}
            textTransform={"uppercase"}
            textAlign={"center"}
            bgGradient={"linear(to-r, cyan.400, blue.500)"}
            bgClip={"text"}      
          >       
            <Link as={RouterLink} to={"/"}>
              Book Store 📚
            </Link>
          </Text>
        </HStack>
        <HStack spacing={2} alignItems={"center"}>
          {isAdmin && (
            <Link as={RouterLink} to={"/create"}>
              <Button aria-label="Add book">
               <AiOutlinePlusSquare fontSize={20} />
              </Button>
            </Link>
          )}
          <Button as={RouterLink} to={"/cart"} aria-label={`Cart, ${cartCount} items`} position="relative">
            <FiShoppingCart fontSize={20} />
            {cartCount > 0 && (
              <Badge colorScheme="red" rounded="full" position="absolute" top="-1" right="-1" fontSize="xs">
                {cartCount}
              </Badge>
            )}
          </Button>
          {user ? (
            <>
              <Button as={RouterLink} to={isAdmin ? "/admin/orders" : "/my-orders"} variant="ghost">
                {isAdmin ? "Orders" : "My orders"}
              </Button>
              <Text display={{ base: "none", md: "block" }}>Hi, {user.name}</Text>
              <Button onClick={handleLogout}>Log out</Button>
            </>
          ) : (
            <Button as={RouterLink} to={"/login"}>Log in</Button>
          )}
          <Button onClick={toggleColorMode}>
            {colorMode === "light" ? <IoMoon /> : <LuSun />}
          </Button>
        </HStack>
      </Flex>
    </Container>
  );
};

export default NavBar;
