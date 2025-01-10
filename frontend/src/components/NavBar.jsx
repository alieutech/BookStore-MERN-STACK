import React from "react";
import { 
  Button, 
  Container, 
  Flex, 
  HStack, 
  Link, 
  Text, 
  useColorMode, 
  useColorModeValue 
} from "@chakra-ui/react";
import { AiOutlinePlusSquare } from "react-icons/ai";
import { IoMoon } from "react-icons/io5";
import { LuSun } from "react-icons/lu";


const NavBar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue("gray.100", "gray.900");

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
            <Link href={"/"}>
              Book Store 📚
            </Link>
          </Text>
        </HStack>
        <HStack spacing={2} alignItems={"center"}>
          <Link href={"/create"}>
            <Button>
             <AiOutlinePlusSquare fontSize={20} />
            </Button>
          </Link>
          <Button onClick={toggleColorMode}>
            {colorMode === "light" ? <IoMoon /> : <LuSun />}
          </Button>
        </HStack>
      </Flex>
    </Container>
  );
};

export default NavBar;







