import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import "@fontsource-variable/inter";
import "@fontsource-variable/fraunces";
import theme from "./theme";

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<ColorModeScript initialColorMode={theme.config.initialColorMode} />
		<BrowserRouter>
			<ChakraProvider theme={theme} toastOptions={{ defaultOptions: { position: "top-right", isClosable: true, duration: 3000 } }}>
				<App />
			</ChakraProvider>
		</BrowserRouter>
	</React.StrictMode>
);
