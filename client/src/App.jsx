import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import Home from "./pages/home";
import toast, { Toaster } from "react-hot-toast";
import Cart from "./pages/Cart";
import ProductDetails from "./pages/ProductDetails";
import Login from "./components/Login";
import { useAppContext } from "./context/AppContext";
import Footer from "./components/Footer";
import AllProducts from "./pages/AllProducts";
import ProductCategories from "./pages/ProductCategories";
import AddAddress from "./pages/AddAddress";
import MyOrders from "./pages/MyOrders";
import SellerLayout from "./pages/seller/SellerLayout";
import AddProduct from "./pages/seller/AddProduct";
import ProductList from "./pages/seller/ProductList";
import Orders from "./pages/seller/Orders";
import Category from "./pages/seller/Category";
import Contact from "./pages/Contact";
import Loading from "./components/Loading";
import SellerBannerConfig from "./components/SellerBannerConfig";
import StoreSettings from "./pages/seller/StoreSettings";
import ContactRequests from "./pages/seller/ContactRequests";
import NewsletterSubscribers from "./pages/seller/NewsletterSubscribers";
import AddNotification from "./pages/seller/AddNotification";
import Inventory from "./pages/seller/Inventory";
import MySubscriptions from "./pages/MySubscriptions";
import ProductSubscribers from "./pages/seller/ProductSubscribers";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import SellerLogin from "./pages/seller/SellerLogin";

const App = () => {
  const { showUserLogin, isSeller, backendUrl, axios, setIsSeller, searchQuery, navigate, products, user, setToken, setUser } = useAppContext();
  const location = useLocation();
  const isSellerPath = location.pathname.includes("seller");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";

    const checkSellerAuth = async () => {
      try {
        const { data } = await axios.get(backendUrl + '/api/seller/is-auth', { withCredentials: true });
        if (data.success) {
          setIsSeller(true);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    checkSellerAuth();

    const token = localStorage.getItem('token');
    if (token) {
      setToken(token);
      const fetchUser = async () => {
        try {
          const { data } = await axios.post(backendUrl + '/api/user/is-auth', {}, { headers: { Authorization: `Bearer ${token}` } });
          if (data.success) {
            setUser(data.user);
          } else {
            localStorage.removeItem('token');
            setToken('');
          }
        } catch (error) {
          console.log(error);
          localStorage.removeItem('token');
          setToken('');
        }
      };
      fetchUser();
    }
  }, []);

  useEffect(() => {
    if (searchQuery && !isSellerPath) {
      const matches = products.filter((product) => product.name.toLowerCase().includes(searchQuery.toLowerCase()));
      if (matches.length === 1) {
        navigate(`/product/${matches[0].category.toLowerCase()}/${matches[0]._id}`);
      } else if (location.pathname !== "/products") {
        navigate("/products");
      }
    }
  }, [searchQuery, products]);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get("token");
    if (token) {
      setToken(token);
      localStorage.setItem("token", token);
      
      const fetchUser = async () => {
        try {
          const { data } = await axios.post(backendUrl + '/api/user/is-auth', {}, { headers: { Authorization: `Bearer ${token}` } });
          if (data.success) {
            setUser(data.user);
            toast.success("Login successful");
          }
        } catch (error) {
          console.log(error);
        }
      };
      fetchUser();
      navigate("/");
    }
  }, [location.search]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-24 w-24 border-gray-300 border-t-primary"></div>
      </div>
    );
  }

  return (
    <div className="text-default min-h-screen text-gray-700 bg-white">
      {showUserLogin ? <Login /> : null}
      {isSellerPath ? null : <Navbar />}
      <Toaster
        position="top-center"
        toastOptions={{
          className: '',
          style: {
            fontSize: '14px',
            fontWeight: '500',
            padding: '12px 24px',
            borderRadius: '12px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            maxWidth: '400px',
          },
          success: {
            style: {
              background: '#F0FDF4',
              border: '1px solid #22C55E',
              color: '#15803D',
            },
            iconTheme: {
              primary: '#22C55E',
              secondary: '#F0FDF4',
            },
          },
          error: {
            style: {
              background: '#FEF2F2',
              border: '1px solid #EF4444',
              color: '#B91C1C',
            },
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FEF2F2',
            },
          },
        }}
      />

      <div className={`${isSellerPath ? "" : "px-6 md:px-16 lg:px-24"}`}>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/products" element={<AllProducts />} />
          <Route path="/products/:category" element={<ProductCategories />} />
          <Route path="/product/:category/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/add-address" element={<AddAddress />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/my-subscriptions" element={<MySubscriptions />} />
          <Route path="/loaders" element={<Loading />} />
          <Route path="/reset-password/:userId/:token" element={<ResetPassword />} />
          <Route path="/profile" element={<Profile />} />

          <Route path="/contact" element={<Contact />} />
          <Route path="/seller-login" element={isSeller ? <Navigate to="/seller" /> : user ? <Navigate to="/" /> : <SellerLogin />} />
          <Route
            path="/seller"
            element={isSeller ? <SellerLayout /> : <Navigate to="/seller-login" />}
          >
            <Route index element={isSeller ? <AddProduct /> : null} />
            <Route path="product-list" element={<ProductList />} />
            <Route path="orders" element={<Orders />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="category" element={<Category />} />
            <Route path="banner" element={<SellerBannerConfig />} />
            <Route path="store-settings" element={<StoreSettings />} />
            <Route path="contact-requests" element={<ContactRequests />} />
            <Route path="product-subscribers" element={<ProductSubscribers />} />
            <Route path="newsletter-subscribers" element={<NewsletterSubscribers />} />
            <Route path="notification" element={<AddNotification />} />
          </Route>
        </Routes>
      </div>
      {!isSellerPath && <Footer />}
    </div>
  );
};

export default App;
