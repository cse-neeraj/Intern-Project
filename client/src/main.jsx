import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AppContext, AppContextProvider } from "./context/AppContext.jsx";
import { BrowserRouter } from "react-router-dom";

console.log("🔗 Frontend connecting to Backend at:", import.meta.env.VITE_API_URL);

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AppContextProvider>
      <App />
    </AppContextProvider>
  </BrowserRouter>,
);
