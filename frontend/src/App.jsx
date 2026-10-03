import { Box, Flex } from "@chakra-ui/react"
import { useEffect } from "react"
import { Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import CreatePage from "./pages/CreatePage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import NavBar from "./components/NavBar"
import Footer from "./components/Footer"
import NotFoundPage from "./pages/NotFoundPage"
import ScrollToTop from "./components/ScrollToTop"
import ProtectedRoute from "./components/ProtectedRoute"
import CartPage from "./pages/CartPage"
import BookDetailsPage from "./pages/BookDetailsPage"
import CheckoutPage from "./pages/CheckoutPage"
import OrdersPage from "./pages/OrdersPage"
import DashboardPage from "./pages/DashboardPage"
import WishlistPage from "./pages/WishlistPage"
import { useWishlistStore } from "./store/wishlist"
import { useAuthStore } from "./store/auth"


const App = () => {
  const token = useAuthStore((state) => state.token)
  const refreshUser = useAuthStore((state) => state.refreshUser)

  const userId = useAuthStore((state) => state.user?._id)
  const loadWishlist = useWishlistStore((state) => state.load)
  const clearWishlist = useWishlistStore((state) => state.clear)

  // Make sure a saved login is still valid
  useEffect(() => {
    if (token) refreshUser()
  }, [token, refreshUser])

  // Load the wishlist for whoever is logged in, and forget it on logout
  useEffect(() => {
    if (userId) loadWishlist()
    else clearWishlist()
  }, [userId, loadWishlist, clearWishlist])

  return (
    <Flex direction="column" minH="100vh">
      <ScrollToTop />
      <NavBar />
      <Box as="main" flex="1">
      <Routes>
          <Route path="/" element={< HomePage />}/>
          <Route path="/create" element={<ProtectedRoute adminOnly><CreatePage /></ProtectedRoute>}/>
          {/* /book/:id, not /books/:id, because /books is the API path */}
          <Route path="/book/:id" element={< BookDetailsPage />}/>
          <Route path="/cart" element={< CartPage />}/>
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>}/>
          <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>}/>
          <Route path="/my-orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>}/>
          <Route path="/admin" element={<ProtectedRoute adminOnly><DashboardPage /></ProtectedRoute>}/>
          <Route path="/admin/orders" element={<ProtectedRoute adminOnly><OrdersPage isAdminView /></ProtectedRoute>}/>
          <Route path="/login" element={< LoginPage />}/>
          <Route path="/register" element={< RegisterPage />}/>
          <Route path="*" element={<NotFoundPage />}/>
      </Routes>
      </Box>
      <Footer />
    </Flex>
  )
}

export default App
