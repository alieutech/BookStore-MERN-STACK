import { Box } from "@chakra-ui/react"
import { useEffect } from "react"
import { Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import CreatePage from "./pages/CreatePage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import NavBar from "./components/NavBar"
import AdminRoute from "./components/AdminRoute"
import { useAuthStore } from "./store/auth"


const App = () => {
  const token = useAuthStore((state) => state.token)
  const refreshUser = useAuthStore((state) => state.refreshUser)

  // Make sure a saved login is still valid
  useEffect(() => {
    if (token) refreshUser()
  }, [token, refreshUser])

  return (
    <Box minH={"100vh"}>
      <NavBar />
      <Routes>
          <Route path="/" element={< HomePage />}/>
          <Route path="/create" element={<AdminRoute><CreatePage /></AdminRoute>}/>
          <Route path="/login" element={< LoginPage />}/>
          <Route path="/register" element={< RegisterPage />}/>
      </Routes>
    </Box>
  )
}

export default App
