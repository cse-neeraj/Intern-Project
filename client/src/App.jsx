import React, { useEffect, useState, Suspense, lazy } from "react";
import Navbar from "./components/Navbar";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import Login from "./components/Login";
import { useAppContext } from "./context/AppContext";
import Footer from "./components/Footer";
import Loading from "./components/Loading";

// Lazy Load Pages
const Home = lazy(() => import("./pages/home"));
const Cart = lazy(() => import("./pages/Cart"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const AllProducts = lazy(() => import("./pages/AllProducts"));
const ProductCategories = lazy(() => import("./pages/ProductCategories"));
const AddAddress = lazy(() => import("./pages/AddAddress"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const SellerLayout = lazy(() => import("./pages/seller/SellerLayout"));
const AddProduct = lazy(() => import("./pages/seller/AddProduct"));
const EditProduct = lazy(() => import("./pages/seller/EditProduct"));
const ProductList = lazy(() => import("./pages/seller/ProductList"));
const Orders = lazy(() => import("./pages/seller/Orders"));
const Category = lazy(() => import("./pages/seller/Category"));
const Contact = lazy(() => import("./pages/Contact"));
const SellerBannerConfig = lazy(() => import("./components/SellerBannerConfig"));
const StoreSettings = lazy(() => import("./pages/seller/StoreSettings"));
const CreateSeller = lazy(() => import("./pages/seller/CreateSeller"));
const SellerHistory = lazy(() => import("./pages/seller/SellerHistory"));
const ContactRequests = lazy(() => import("./pages/seller/ContactRequests"));
const NewsletterSubscribers = lazy(() => import("./pages/seller/NewsletterSubscribers"));
const CreateNotification = lazy(() => import("./pages/seller/CreateNotification"));
const NotificationHistory = lazy(() => import("./pages/seller/NotificationHistory"));
const Inventory = lazy(() => import("./pages/seller/Inventory"));
const MySubscriptions = lazy(() => import("./pages/MySubscriptions"));
const ProductSubscribers = lazy(() => import("./pages/seller/ProductSubscribers"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Profile = lazy(() => import("./pages/Profile"));
const SellerLogin = lazy(() => import("./pages/seller/SellerLogin"));
const VerifyOtp = lazy(() => import("./pages/VerifyOtp"));

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

    const fetchUser = async () => {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
          setLoading(false);
          return;
      }
      try {
        const { data } = await axios.post(backendUrl + '/api/user/is-auth', {}, { withCredentials: true });
        if (data.success) {
          setUser(data.user);
        } else {
          // If not auth, we don't need to do anything, user is just null
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchUser();
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
    const error = query.get("error");

    if (error) {
      if (error === 'email_failed') toast.error("Login Failed: Could not send OTP email.");
      else if (error === 'auth_error') toast.error("Google Authentication Failed.");
      else toast.error("Login Failed. Please try again.");
      
      // Clean URL
      window.history.replaceState({}, document.title, "/");
    }

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

// ... existing imports

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
        <Suspense fallback={<Loading />}>
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
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/seller-login" element={isSeller ? <Navigate to="/seller" /> : user ? <Navigate to="/" /> : <SellerLogin />} />
          <Route
            path="/seller"
            element={isSeller ? <SellerLayout /> : <Navigate to="/seller-login" />}
          >
            <Route index element={isSeller ? <AddProduct /> : null} />
            <Route path="product-list" element={<ProductList />} />
            <Route path="product-list/edit/:id" element={<EditProduct />} />
            <Route path="orders" element={<Orders />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="category" element={<Category />} />
            <Route path="banner" element={<SellerBannerConfig />} />
            <Route path="store-settings" element={<StoreSettings />} />
            <Route path="create-account" element={<CreateSeller />} />
            <Route path="account-history" element={<SellerHistory />} />
            <Route path="contact-requests" element={<ContactRequests />} />
            <Route path="product-subscribers" element={<ProductSubscribers />} />
            <Route path="newsletter-subscribers" element={<NewsletterSubscribers />} />
            <Route path="newsletter-subscribers" element={<NewsletterSubscribers />} />
            <Route path="create-notification" element={<CreateNotification />} />
            <Route path="notification-history" element={<NotificationHistory />} />
          </Route>
        </Routes>
        </Suspense>
      </div>
      {!isSellerPath && <Footer />}
    </div>
  );
};

export default App;

