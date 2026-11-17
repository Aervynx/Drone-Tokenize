import { ethers } from "ethers";

// ABI های مورد نیاز (نسخه ساده‌شده برای تعامل با پراکسی)
import DroneRWA_ABI from "./abis/DroneRWA.json";
import DroneProfitPool_ABI from "./abis/DroneProfitPool.json";

// آدرس‌های استقرار یافته پراکسی روی شبکه (مثلاً DotOne Chain یا تست‌نت)
const PROXY_ADDRESSES = {
  rwaToken: "0xYourDroneRWAProxyAddressHere",
  profitPool: "0xYourDroneProfitPoolProxyAddressHere",
};

export class AervynxWeb3Client {
  private provider: ethers.BrowserProvider;
  private signer: ethers.Signer | null = null;
  public rwaContract: ethers.Contract;
  public profitPoolContract: ethers.Contract;

  constructor(ethereumProvider: any) {
    this.provider = new ethers.BrowserProvider(ethereumProvider);
    
    // نکته مهم: آدرس اتصال همیشه آدرس پراکسی است
    this.rwaContract = new ethers.Contract(
      PROXY_ADDRESSES.rwaToken,
      DroneRWA_ABI,
      this.provider
    );

    this.profitPoolContract = new ethers.Contract(
      PROXY_ADDRESSES.profitPool,
      DroneProfitPool_ABI,
      this.provider
    );
  }

  // احراز هویت و اتصال والت کاربر
  async connectWallet(): Promise<string> {
    await this.provider.send("eth_requestAccounts", []);
    this.signer = await this.provider.getSigner();
    
    // اتصال ساینر به قراردادها برای اجرای تراکنش‌های مالی
    this.rwaContract = this.rwaContract.connect(this.signer);
    this.profitPoolContract = this.profitPoolContract.connect(this.signer);

    return await this.signer.getAddress();
  }

  // استعلام موجودی توکن RWA کاربر
  async getRwaBalance(walletAddress: string): Promise<string> {
    const balance = await this.rwaContract.balanceOf(walletAddress);
    return ethers.formatUnits(balance, 18);
  }

  // استعلام سود قابل برداشت کاربر (Earned Rewards)
  async getClaimableRewards(walletAddress: string): Promise<string> {
    const earned = await this.profitPoolContract.earned(walletAddress);
    return ethers.formatUnits(earned, 18);
  }

  // اجرای تابع کلایم سود دوره
  async claimProfitRewards(): Promise<string> {
    if (!this.signer) throw new Error("Wallet not connected");

    const tx = await this.profitPoolContract.claimReward();
    const receipt = await tx.wait();
    
    return receipt.hash;
  }
}