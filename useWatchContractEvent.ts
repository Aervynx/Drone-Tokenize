import { useWatchContractEvent } from "wagmi";
import DroneProfitPool_ABI from "./abis/DroneProfitPool.json";

const PROFIT_POOL_PROXY_ADDRESS = "0xYourDroneProfitPoolProxyAddressHere";

export function useAervynxEvents() {
  // گوش دادن به PeriodFinalized
  useWatchContractEvent({
    address: PROFIT_POOL_PROXY_ADDRESS as `0x${string}`,
    abi: DroneProfitPool_ABI,
    eventName: "PeriodFinalized",
    onLogs(logs) {
      logs.forEach((log: any) => {
        const { periodId, netProfit, investorPool } = log.args;
        console.log(`Period ${periodId} finalized! Investor Pool: ${investorPool}`);
      });
    },
  });

  // گوش دادن به RewardClaimed
  useWatchContractEvent({
    address: PROFIT_POOL_PROXY_ADDRESS as `0x${string}`,
    abi: DroneProfitPool_ABI,
    eventName: "RewardClaimed",
    onLogs(logs) {
      logs.forEach((log: any) => {
        const { investor, amount } = log.args;
        console.log(`User ${investor} claimed ${amount} tokens!`);
      });
    },
  });
}