import React from "react";
import { Toaster } from "react-hot-toast";
import { AervynxDashboard } from "./AervynxDashboard";

export function App() {
  return (
    <div style={{ background: "#060911", minHeight: "100vh", color: "#fff" }}>
      {/* تنظیمات استایل برای هماهنگی با تم وب۳ (محیط تاریک با حاشیه سایان/طلایی) */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#0f172a",
            color: "#f8fafc",
            border: "1px solid rgba(56, 189, 248, 0.3)",
            borderRadius: "12px",
            padding: "16px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
          },
          success: {
            iconTheme: {
              primary: "#38bdf8",
              secondary: "#0f172a",
            },
          },
        }}
      />
      <AervynxDashboard />
    </div>
  );
}