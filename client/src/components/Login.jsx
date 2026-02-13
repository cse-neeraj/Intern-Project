import React, { useEffect, useState, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";

const Login = () => {
  const {
    setShowUserLogin,
    backendUrl,
    setToken,
    setUser,
    axios,
    setIsSeller,
    navigate,
    isSeller,
  } = useAppContext();

  const [currentState, setCurrentState] = useState("Login");
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const rememberMeRef = useRef(rememberMe);

  const onChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  useEffect(() => {
    rememberMeRef.current = rememberMe;
  }, [rememberMe]);

  const onLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (currentState === "Login") {
        const { data: response } = await axios.post(
          backendUrl + "/api/user/login",
          { email: data.email, password: data.password },
          { withCredentials: true }
        );
        if (response.success) {
          setToken(response.token);
          setUser(response.user);
          if (rememberMe) localStorage.setItem("token", response.token);
          else sessionStorage.setItem("token", response.token);
          setShowUserLogin(false);
          toast.success(response.message);
        } else {
          toast.error(response.message);
        }
      } else if (currentState === "Sign Up") {
        const { data: response } = await axios.post(
          backendUrl + "/api/user/register",
          { name: data.name, email: data.email, password: data.password },
          { withCredentials: true }
        );
        if (response.success) {
          setToken(response.token);
          setUser(response.user);
          if (rememberMe) localStorage.setItem("token", response.token);
          else sessionStorage.setItem("token", response.token);
          setShowUserLogin(false);
          toast.success(response.message);
        } else {
          toast.error(response.message);
        }
      } else if (currentState === "Forgot Password") {
        const { data: response } = await axios.post(
          backendUrl + "/api/user/forgot-password",
          { email: data.email }
        );
        if (response.success) {
          toast.success(response.message);
          setCurrentState("Login");
        } else {
          toast.error(response.message);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    if (isSeller) {
      navigate("/seller");
      setShowUserLogin(false);
    }
  }, [isSeller, navigate, setShowUserLogin]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md transition-all duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 sm:p-8 relative animate-in fade-in zoom-out duration-300 mx-4 border border-gray-100 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={() => setShowUserLogin(false)}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all duration-200 z-10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <img src={assets.logo} alt="Logo" className="h-8 w-auto" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            {currentState}
          </h2>
          <p className="text-gray-500 mt-2 text-sm font-medium">
            {currentState === "Sign Up"
              ? "Create an account to get started."
              : currentState === "Forgot Password"
                ? "Enter your email to reset your password."
              : "Welcome back! Please login to continue."}
          </p>
        </div>

        <form
          id="login-form"
          onSubmit={onLogin}
          className="flex flex-col gap-4"
        >
          {currentState === "Sign Up" && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
              </div>
              <input
                name="name"
                onChange={onChangeHandler}
                value={data.name}
                type="text"
                placeholder="Full Name"
                className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-200 font-medium text-gray-800 placeholder-gray-400 focus:shadow-md"
                required
              />
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                />
              </svg>
            </div>
            <input
              name="email"
              onChange={onChangeHandler}
              value={data.email}
              type="email"
              placeholder="Email Address"
              className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-200 font-medium text-gray-800 placeholder-gray-400 focus:shadow-md"
              required
            />
          </div>

          {currentState !== "Forgot Password" && (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                />
              </svg>
            </div>
            <input
              name="password"
              onChange={onChangeHandler}
              value={data.password}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full pl-12 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-200 font-medium text-gray-800 placeholder-gray-400 focus:shadow-md"
              required
            />
            <div
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              )}
            </div>
          </div>
          )}

          {currentState === "Login" && (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer accent-primary transition-all hover:scale-110"
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm text-gray-600 cursor-pointer select-none group-hover:text-gray-800 transition-colors"
                  >
                    Remember me
                  </label>
                </div>
                <p 
                  onClick={() => setCurrentState("Forgot Password")}
                  className="text-sm text-primary font-medium cursor-pointer hover:underline"
                >
                  Forgot Password?
                </p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-base tracking-wide mt-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </>
            ) : currentState === "Sign Up" ? (
              "Create Account"
            ) : currentState === "Forgot Password" ? (
              "Send Reset Link"
            ) : (
              "Login"
            )}
          </button>

          {currentState !== "Forgot Password" && (
            <>
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  toast.loading("Redirecting to Google...");
                  window.location.href = `${backendUrl.replace(/\/$/, "")}/api/user/google`;
                }}
                className="w-full py-2.5 border border-gray-200 text-gray-700 font-bold rounded-2xl shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 flex justify-center items-center gap-2 text-base tracking-wide"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google 
              </button>
            </>
          )}

          {currentState === "Sign Up" && (
            <div className="flex items-start gap-3 mt-4">
              <input
                type="checkbox"
                id="terms"
                required
                className="accent-primary w-5 h-5 cursor-pointer mt-0.5"
              />
              <label
                htmlFor="terms"
                className="text-sm text-gray-500 cursor-pointer select-none leading-relaxed"
              >
                By creating an account, I agree to our{" "}
                <span className="text-primary font-semibold hover:underline">
                  Terms of Use
                </span>{" "}
                &{" "}
                <span className="text-primary font-semibold hover:underline">
                  Privacy Policy
                </span>
                .
              </label>
            </div>
          )}
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 flex flex-col gap-2">
          {currentState === "Login" ? (
            <>
              <p>
                Don't have an account?{" "}
                <span
                  onClick={() => setCurrentState("Sign Up")}
                  className="text-primary font-bold cursor-pointer hover:underline"
                >
                  Sign Up
                </span>
              </p>
              <p>
                Are you a seller?{" "}
                <span
                  onClick={() => {
                    navigate("/seller-login");
                    setShowUserLogin(false);
                  }}
                  className="text-primary font-bold cursor-pointer hover:underline"
                >
                  Login Here
                </span>
              </p>
            </>
          ) : currentState === "Sign Up" ? (
            <p>
              Already have an account?{" "}
              <span
                onClick={() => setCurrentState("Login")}
                className="text-primary font-bold cursor-pointer hover:underline"
              >
                Login Here
              </span>
            </p>
          ) : currentState === "Forgot Password" ? (
            <p>
              Remember your password?{" "}
              <span
                onClick={() => setCurrentState("Login")}
                className="text-primary font-bold cursor-pointer hover:underline"
              >
                Login Here
              </span>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Login;
