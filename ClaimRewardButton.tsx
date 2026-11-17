import React, { useState } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";

interface ClaimRewardButtonProps {
  profitPoolContract: ethers.Contract | null;
  claimableAmount: string; // مقدار سود قابل برداشت به صورت رشته (مثلاً "150.5")
  onSuccess?: () => void;
}

export function ClaimRewardButton({
  profitPoolContract,
  claimableAmount,
  onSuccess,
}: ClaimRewardButtonProps) {
  const [loadingState, setLoadingState] = useState<
    "idle" | "signing" | "pending" | "success"
  >("idle");

  const handleClaim = async () => {
    if (!profitPoolContract) {
      toast.error("قرارداد هوشمند متصل نیست.");
      return;
    }

    if (Number(claimableAmount) <= 0) {
      toast.error("موجودی قابل برداشتی برای کلایم وجود ندارد.");
      return;
    }

    try {
      // مرحله ۱: درخواست امضا و ارسال تراکنش از طریق کیف پول کاربر
      setLoadingState("signing");
      const toastId = toast.loading("در انتظار تایید تراکنش در کیف پول...");

      const tx = await profitPoolContract.claimReward();
      
      // مرحله ۲: تراکنش ارسال شد و در حال ماین شدن در بلاک‌چین است
      setLoadingState("pending");
      toast.loading("تراکنش در حال پردازش در شبکه...", { id: toastId });

      const receipt = await tx.wait();

      // مرحله ۳: موفقیت‌آمیز بودن تراکنش
      setLoadingState("success");
      toast.success(
        (t) => (
          <div>
            <b>سود با موفقیت دریافت شد!</b>
            <p style={{ margin: "4px 0", fontSize: "12px", color: "#94a3b8" }}>
              هش تراکنش: {receipt.hash.slice(0, 10)}...
            </p>
          </div>
        ),
        { id: toastId, duration: 5000 }
      );

      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error(error);
      setLoadingState("idle");
      
      // مدیریت خطاهای رایج (مانند رد کردن تراکنش توسط کاربر)
      if (error.code === "ACTION_REJECTED" || error.info?.error?.code === 4001) {
        toast.error("تراکنش توسط کاربر لغو شد.");
      } else {
        toast.error(`خطا در کلایم سود: ${error.reason || error.message}`);
      }
    } finally {
      if (loadingState !== "success") {
        setLoadingState("idle");
      }
    }
  };

  return (
    <div style={{
      background: "linear-gradient(135deg, #0b0f19 0%, #111827 100%)",
      border: "1px solid rgba(56, 189, 248, 0.2)",
      borderRadius: "16px",
      padding: "20px",
      textAlign: "center",
      color: "#fff",
      maxWidth: "350px",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)"
    }}>
      <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 6px 0" }}>
        سود قابل برداشت شما:
      </p>
      <h2 style={{ color: "#38bdf8", margin: "0 0 16px 0", fontSize: "24px" }}>
        {claimableAmount} <span style={{ fontSize: "14px", color: "#cbd5e1" }}>USDT</span>
      </h2>

      <button
        onClick={handleClaim}
        disabled={loadingState !== "idle" || Number(claimableAmount) <= 0}
        style={{
          width: "100%",
          background: loadingState !== "idle"
            ? "rgba(56, 189, 248, 0.2)"
            : "linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)",
          color: loadingState !== "idle" ? "#38bdf8" : "#0b0f19",
          fontWeight: 600,
          padding: "12px",
          border: "1px solid rgba(56, 189, 248, 0.3)",
          borderRadius: "10px",
          cursor: loadingState !== "idle" || Number(claimableAmount) <= 0 ? "not-allowed" : "pointer",
          transition: "all 0.2s ease",
          boxShadow: loadingState === "idle" ? "0 4px 12px rgba(56, 189, 248, 0.2)" : "none"
        }}
      >
        {loadingState === "signing" && "در انتظار امضا..."}
        {loadingState === "pending" && "در حال پردازش تراکنش..."}
        {loadingState === "success" && "انجام شد ✓"}
        {loadingState === "idle" && "دریافت سود (Claim Rewards)"}
      </button>
    </div>
  );
}