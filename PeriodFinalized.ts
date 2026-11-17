import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { PeriodHistoryTable } from "./PeriodHistoryTable";

export function DashboardContainer({ provider }: { provider: ethers.Provider }) {
  const [periods, setPeriods] = useState<any[]>([]);

  useEffect(() => {
    // نمونه داده‌های تستی منطبق بر ساختار قرارداد DroneProfitPool
    const mockData = [
      {
        periodId: "0x7072642...5134",
        netProfit: "50,000.00",
        investorPool: "25,000.00",
        operatorPool: "25,000.00",
        adjustedReserve: "8,000.00",
        fleetHealth: 92,
        txHash: "0xabc123..."
      }
    ];
    setPeriods(mockData);
  }, [provider]);

  return <PeriodHistoryTable periods={periods} />;
}