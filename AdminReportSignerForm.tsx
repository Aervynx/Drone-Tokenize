import React, { useState } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";

interface ReportFormState {
  periodId: string;
  grossRevenue: string;
  refunds: string;
  opex: string;
  reserveContribution: string;
  carryForwardLoss: string;
}

export function AdminReportSignerForm() {
  const [formData, setFormData] = useState<ReportFormState>({
    periodId: "0x7072642d323032362d7134", // مثلاً کدگذاری هگز نام دوره
    grossRevenue: "100000",
    refunds: "2000",
    opex: "35000",
    reserveContribution: "8000",
    carryForwardLoss: "5000",
  });
  
  const [signature, setSignature] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // تعریف دامنه و ساختار داده‌ها مطابق با قرارداد DroneReportVerifier
  const getEIP712Domain = (chainId: number, verifierAddress: string) => ({
    name: "AervynxDroneReportVerifier",
    version: "1.0",
    chainId: chainId,
    verifyingContract: verifierAddress,
  });

  const types = {
    PeriodReportData: [
      { name: "periodId", type: "bytes32" },
      { name: "grossRevenue", type: "uint256" },
      { name: "refunds", type: "uint256" },
      { name: "opex", type: "uint256" },
      { name: "reserveContribution", type: "uint256" },
      { name: "carryForwardLoss", type: "uint256" },
    ],
  };

  const handleSignReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(window as any).ethereum) {
      toast.error("لطفاً کیف پول متامسک را نصب کنید.");
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();

      // آدرس قرارداد Verifier که روی شبکه دیپلوی شده است
      const verifierAddress = "0xYourDroneReportVerifierProxyAddressHere";

      const domain = getEIP712Domain(Number(network.chainId), verifierAddress);

      // آماده‌سازی مقادیر با مقیاس مناسب
      const value = {
        periodId: formData.periodId,
        grossRevenue: ethers.parseUnits(formData.grossRevenue, 18),
        refunds: ethers.parseUnits(formData.refunds, 18),
        opex: ethers.parseUnits(formData.opex, 18),
        reserveContribution: ethers.parseUnits(formData.reserveContribution, 18),
        carryForwardLoss: ethers.parseUnits(formData.carryForwardLoss, 18),
      };

      // درخواست امضای EIP-712 از طریق متامسک (آف‌لاین و بدون کارمزد)
      const sig = await signer.signTypedData(domain, types, value);
      setSignature(sig);
      
      toast.success("گزارش درآمدی با موفقیت توسط حسابرس امضا شد!");
    } catch (error: any) {
      console.error(error);
      toast.error(`خطا در امضای گزارش: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: "linear-gradient(135deg, #0b0f19 0%, #111827 100%)",
      border: "1px solid rgba(56, 189, 248, 0.2)",
      borderRadius: "16px",
      padding: "24px",
      color: "#fff",
      maxWidth: "600px",
      margin: "0 auto",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)"
    }}>
      <h3 style={{ color: "#38bdf8", marginTop: 0, marginBottom: "8px" }}>
        پنل حسابرس: امضای آف‌لاین گزارش EIP-712
      </h3>
      <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "20px" }}>
        پارامترهای مالی دوره پهپادی را وارد کرده و با امضای دیجیتال حسابرس تایید کنید.
      </p>

      <form onSubmit={handleSignReport} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div>
          <label style={{ display: "block", fontSize: "12px", color: "#cbd5e1", marginBottom: "4px" }}>شناسه دوره (Bytes32 Period ID)</label>
          <input
            type="text"
            value={formData.periodId}
            onChange={(e) => setFormData({ ...formData, periodId: e.target.value })}
            style={{ width: "100%", padding: "10px", background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }}
            required
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#cbd5e1", marginBottom: "4px" }}>درآمد ناخالص (USDT)</label>
            <input
              type="text"
              value={formData.grossRevenue}
              onChange={(e) => setFormData({ ...formData, grossRevenue: e.target.value })}
              style={{ width: "100%", padding: "10px", background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }}
              required
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#cbd5e1", marginBottom: "4px" }}>استرداد / بازپرداخت (-)</label>
            <input
              type="text"
              value={formData.refunds}
              onChange={(e) => setFormData({ ...formData, refunds: e.target.value })}
              style={{ width: "100%", padding: "10px", background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }}
              required
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#cbd5e1", marginBottom: "4px" }}>هزینه عملیاتی (Opex)</label>
            <input
              type="text"
              value={formData.opex}
              onChange={(e) => setFormData({ ...formData, opex: e.target.value })}
              style={{ width: "100%", padding: "10px", background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }}
              required
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#cbd5e1", marginBottom: "4px" }}>سهم ذخیره</label>
            <input
              type="text"
              value={formData.reserveContribution}
              onChange={(e) => setFormData({ ...formData, reserveContribution: e.target.value })}
              style={{ width: "100%", padding: "10px", background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }}
              required
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#cbd5e1", marginBottom: "4px" }}>ضرر انباشته</label>
            <input
              type="text"
              value={formData.carryForwardLoss}
              onChange={(e) => setFormData({ ...formData, carryForwardLoss: e.target.value })}
              style={{ width: "100%", padding: "10px", background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: "10px",
            background: "linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)",
            color: "#0b0f19",
            fontWeight: 600,
            padding: "12px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "opacity 0.2s"
          }}
        >
          {loading ? "در حال امضای دیجیتال..." : "امضای گزارش (Sign Typed Data)"}
        </button>
      </form>

      {signature && (
        <div style={{ marginTop: "20px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "12px", borderRadius: "8px" }}>
          <strong style={{ color: "#10b981", display: "block", marginBottom: "4px", fontSize: "13px" }}>امضای تولید شده (تایید شده):</strong>
          <code style={{ wordBreak: "break-all", fontSize: "11px", color: "#cbd5e1" }}>{signature}</code>
        </div>
      )}
    </div>
  );
}