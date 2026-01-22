import { createContext, useEffect, useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppContextProvider = (props) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState({});
  const [user, setUser] = useState(null);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isSeller, setIsSeller] = useState(false);

  const backendUrl = import.meta.env.VITE_API_URL;
  const currency = "₹";

  const getProducts = useCallback(async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/product/list');
      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }, [backendUrl]);

  const getCategories = useCallback(async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/category/list');
      if (data.success) {
        setCategories(data.categories);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }, [backendUrl]);

  const addToCart = async (itemId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }
    setCartItems(cartData);
  }

  const removeFromCart = async (itemId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[itemId] > 0) {
      cartData[itemId] -= 1;
      if (cartData[itemId] === 0) {
        delete cartData[itemId];
      }
      setCartItems(cartData);
    }
  }

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      if (cartItems[items] > 0) {
        totalCount += cartItems[items];
      }
    }
    return totalCount;
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      if (itemInfo) {
        try {
          if (cartItems[items] > 0) {
            totalAmount += itemInfo.offerPrice * cartItems[items];
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
    return totalAmount;
  };

  useEffect(() => {
    getProducts();
    getCategories();
  }, []);

  const value = {
    products, setProducts,
    categories, setCategories,
    searchQuery, setSearchQuery,
    cartItems, setCartItems,
    navigate,
    backendUrl,
    user, setUser,
    token, setToken,
    showUserLogin, setShowUserLogin,
    isSeller, setIsSeller,
    currency,
    addToCart, removeFromCart, getCartCount, getCartAmount,
    axios,
    fetchProducts: getProducts,
    fetchCategories: getCategories
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
