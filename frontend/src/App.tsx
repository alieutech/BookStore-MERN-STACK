import { Box } from "@chakra-ui/react"
import HomePage from "./pages/HomePage"
import CreatePage from "./pages/CreatePage"
import { Routes, Route } from "react-router-dom"
import NavBar from "./components/NavBar"


const App = () => {
  return (
    <Box minH={"100vh"}>
      <NavBar />
      <Routes>
          <Route path="/" element={< HomePage />}/>
          <Route path="/create" element={< CreatePage />}/>
      </Routes>
    </Box>
    
   
  )
}

export default App