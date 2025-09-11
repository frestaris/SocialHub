import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./redux/store.js";
import App from "./App.jsx";
import { StyleProvider } from "@ant-design/cssinjs";
import "./index.css";
import "antd/dist/reset.css";
import "swiper/css";
import "swiper/css/navigation";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <StyleProvider hashPriority="high">
      <Provider store={store}>
        <App />
      </Provider>
    </StyleProvider>
  </StrictMode>
);
