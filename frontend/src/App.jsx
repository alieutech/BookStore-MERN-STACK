import { Box } from "@chakra-ui/react"
import { useEffect } from "react"
import { Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import CreatePage from "./pages/CreatePage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import NavBar from "./components/NavBar"
import ProtectedRoute from "./components/ProtectedRoute"
import CartPage from "./pages/CartPage"
import BookDetailsPage from "./pages/BookDetailsPage"
import CheckoutPage from "./pages/CheckoutPage"
import OrdersPage from "./pages/OrdersPage"
import DashboardPage from "./pages/DashboardPage"
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
          <Route path="/create" element={<ProtectedRoute adminOnly><CreatePage /></ProtectedRoute>}/>
          {/* /book/:id, not /books/:id, because /books is the API path */}
          <Route path="/book/:id" element={< BookDetailsPage />}/>
          <Route path="/cart" element={< CartPage />}/>
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>}/>
          <Route path="/my-orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>}/>
          <Route path="/admin" element={<ProtectedRoute adminOnly><DashboardPage /></ProtectedRoute>}/>
          <Route path="/admin/orders" element={<ProtectedRoute adminOnly><OrdersPage isAdminView /></ProtectedRoute>}/>
          <Route path="/login" element={< LoginPage />}/>
          <Route path="/register" element={< RegisterPage />}/>
      </Routes>
    </Box>
  )
}

export default App
