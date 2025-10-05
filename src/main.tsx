import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@/styles/globals.css";
import { autoConfigureDataCollection } from "@/lib/analytics/config";

// 初始化数据采集系统
autoConfigureDataCollection();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
