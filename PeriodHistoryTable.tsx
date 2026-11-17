import React from "react";

interface PeriodRecord {
  periodId: string;
  netProfit: string;
  investorPool: string;
  operatorPool: string;
  adjustedReserve: string;
  fleetHealth: number;
  txHash: string;
}

interface PeriodHistoryTableProps {
  periods: PeriodRecord[];
}

export function PeriodHistoryTable({ periods }: PeriodHistoryTableProps) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #0b0f19 0%, #111827 100%)",
      border: "1px solid rgba(56, 189, 248, 0.2)",
      borderRadius: "16px",
      padding: "24px",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h3 style={{ color: "#38bdf8", margin: 0, fontSize: "18px", fontWeight: 600 }}>
          تاریخچه دوره‌های مالی ناوگان RWA (FlightYield)
        </h3>
        <span style={{
          background: "rgba(56, 189, 248, 0.1)",
          color: "#38bdf8",
          padding: "4px 12px",
          borderRadius: "20px",
          fontSize: "12px",
          border: "1px solid rgba(56, 189, 248, 0.3)"
        }}>
          Chain ID: 505 (DotOne)
        </span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)", color: "#94a3b8", fontSize: "13px" }}>
              <th style={{ padding: "12px" }}>شناسه دوره (Period ID)</th>
              <th style={{ padding: "12px" }}>سود قابل توزیع</th>
              <th style={{ padding: "12px" }}>استخر سرمایه‌گذاران (50%)</th>
              <th style={{ padding: "12px" }}>سهم اپراتور (50%)</th>
              <th style={{ padding: "12px" }}>ذخیره اضطراری</th>
              <th style={{ padding: "12px" }}>سلامت ناوگان</th>
              <th style={{ padding: "12px", textAlign: "right" }}>تراکنش</th>
            </tr>
          </thead>
          <tbody>
            {periods.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                  هیچ دوره نهایی‌شده‌ای ثبت نشده است.
                </td>
              </tr>
            ) : (
              periods.map((period, index) => (
                <tr key={index} style={{
                  borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                  transition: "background 0.2s",
                }}>
                  <td style={{ padding: "14px", color: "#f8fafc", fontWeight: 500, fontSize: "14px" }}>
                    {period.periodId}
                  </td>
                  <td style={{ padding: "14px", color: "#38bdf8", fontWeight: 600 }}>
                    ${period.netProfit} USDT
                  </td>
                  <td style={{ padding: "14px", color: "#10b981", fontWeight: 600 }}>
                    ${period.investorPool} USDT
                  </td>
                  <td style={{ padding: "14px", color: "#cbd5e1" }}>
                    ${period.operatorPool} USDT
                  </td>
                  <td style={{ padding: "14px", color: "#f59e0b" }}>
                    ${period.adjustedReserve} USDT
                  </td>
                  <td style={{ padding: "14px" }}>
                    <span style={{
                      background: period.fleetHealth >= 80 ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                      color: period.fleetHealth >= 80 ? "#10b981" : "#ef4444",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 500
                    }}>
                      {period.fleetHealth}% SoH
                    </span>
                  </td>
                  <td style={{ padding: "14px", textAlign: "right" }}>
                    <a
                      href={`https://explorer.dotone.io/tx/${period.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: "#38bdf8",
                        textDecoration: "none",
                        fontSize: "13px",
                        border: "1px solid rgba(56, 189, 248, 0.3)",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        background: "rgba(56, 189, 248, 0.05)"
                      }}
                    >
                      مشاهده ↗
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}