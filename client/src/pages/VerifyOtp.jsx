import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { backendUrl, setToken, setUser, axios } = useAppContext();

  const query = new URLSearchParams(location.search);
  const email = query.get("email");
  const isGoogle = query.get("isGoogle");

  useEffect(() => {
    if (!email) {
      toast.error("Invalid access. Please login again.");
      navigate("/");
    }
  }, [email, navigate]);

  // Prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post(backendUrl + "/api/user/login-otp", {
        email,
        otp,
      }, { withCredentials: true });

      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        toast.success("Login successful!");
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden px-4">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[70%] h-[70%] bg-blue-500/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 sm:p-8 relative animate-in fade-in zoom-out duration-300 border border-gray-100 overflow-hidden">
        {/* Decorative Elements from Login */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <img src={assets.logo} alt="BuyFresh Logo" className="h-8 w-auto" />
          </div>

          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Verify OTP
          </h2>
          <p className="text-gray-500 mt-2 text-sm font-medium">
            Enter the 6-digit code sent to
            <br />
            <span className="text-gray-800 font-semibold">{email}</span>
          </p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <div className="relative">
            <input
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-200 font-bold text-xl text-center text-gray-800 placeholder-gray-300 tracking-[0.5em] shadow-sm focus:shadow-md"
              placeholder="000000"
              value={otp}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                if (val.length <= 6) setOtp(val);
              }}
              maxLength={6}
            />
          </div>

          <p className="text-xs text-center text-gray-400 font-medium">
            The code expires in 10 minutes
          </p>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-2.5 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-base tracking-wide mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Verify & Login"
            )}
          </button>

          <div className="mt-4 text-center text-sm text-gray-600">
            <p>
              Wrong email?{" "}
              <span
                onClick={() => navigate("/")}
                className="text-primary font-bold cursor-pointer hover:underline"
              >
                Login Again
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;