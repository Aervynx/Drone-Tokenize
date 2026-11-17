import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

interface ProfitDataPoint {
  period: string;
  netProfit: number;
  investorPool: number;
  operatorPool: number;
  reserve: number;
}

interface ProfitTrendChartProps {
  data: ProfitDataPoint[];
}

export function ProfitTrendChart({ data }: ProfitTrendChartProps) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #0b0f19 0%, #111827 100%)",
      border: "1px solid rgba(56, 189, 248, 0.2)",
      borderRadius: "16px",
      padding: "24px",
      color: "#fff",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h3 style={{ color: "#38bdf8", margin: 0, fontSize: "18px", fontWeight: 600 }}>
          روند سودآوری و توزیع مالی ناوگان (FlightYield Trend)
        </h3>
        <span style={{ fontSize: "12px", color: "#94a3b8" }}>واحد: USDT</span>
      </div>

      <div style={{ width: "100%", height: 350 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorInvestor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
            <XAxis dataKey="period" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip
              contentStyle={{
                background: "#0f172a",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                borderRadius: "10px",
                color: "#f8fafc",
                fontSize: "12px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
            <Area
              type="monotone"
              dataKey="netProfit"
              name="سود خالص دوره"
              stroke="#38bdf8"
              fillOpacity={1}
              fill="url(#colorProfit)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="investorPool"
              name="سهم سرمایه‌گذاران (50%)"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorInvestor)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}