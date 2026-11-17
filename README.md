<div align="center">

# 🚀 Aervynx FlightYield RWA Protocol
### *Institutional-Grade Real-World Asset Tokenization & Automated Yield Distribution on DotOne Chain (ID: 505)*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.20-blue)](https://soliditylang.org/)
[![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-5.0-blueviolet)](https://openzeppelin.com/)
[![Foundry](https://img.shields.io/badge/Built%20with-Foundry-orange.svg)](https://getfoundry.sh/)
[![Network](https://img.shields.io/badge/Network-DotOne%20Chain%20(505)-cyan)](https://explorer.dotone.io)

</div>

---

## 🌐 Overview

**Aervynx FlightYield** is an advanced, institutional-grade Real-World Asset (RWA) protocol engineered to tokenize physical commercial drone and vehicle fleets. By bridging real-world operational cash flows with decentralized finance (DeFi) on **DotOne Chain (ID: 505)**, the protocol ensures complete transparency, strict regulatory compliance, and automated yield distribution to fractional token holders.

---

## 🏗 System Architecture & Workflow

The protocol implements a secure, modular architecture leveraging **UUPS Proxies** for upgradeability, **EIP-712** for gasless off-chain report verification, and strict role-based access control.

```mermaid
graph TD
    A[Physical Fleet Operations] -->|Telemetry & Financial Logs| B(Data Verification & Audit);
    B -->|Signed Reports (EIP-712)| C[Smart Contract Infrastructure (EVM)];
    
    subgraph Core Protocol (UUPS Proxies)
        C1[DroneRWA Token - DRZ] -->|ERC-3643 Style Compliance| C2[Whitelist / KYC];
        C3[DroneProfitPool] -->|Automated Waterfall| C4[Reserve Treasury & Operator Wallet];
        C5[ReportVerifier] -->|Multi-Sig Threshold| C6[DroneFleetHealth Hook];
    end

    C --> D[Qualified Investors & Stakeholders];
    D -->|Stake / Redeem| C1;
    D -->|Claim Yields (USDT)| C3;

📜 Core Smart Contracts InventoryAll core contracts are upgradeable using the UUPS (Universal Upgradeable Proxy Standard) pattern, managed securely via a Timelock controller.Contract NameStandard / Design PatternPrimary Role & FunctionalityDroneRWA.solERC-20, Permit, Votes, UUPS, AccessControlRepresents fractional ownership shares of the physical fleet (DRZ). Enforces strict compliance and whitelist restrictions.DroneProfitPool.solUUPS, Pausable, ReentrancyGuard, AccessControlHandles the financial waterfall, revenue intake (USDT/Stablecoins), reserve allocation, and pro-rata yield distribution.DroneReportVerifier.solEIP-712, UUPS, AccessControlValidates off-chain operational reports via multi-signature oracle consensus before triggering yield distribution.


⚙️ Key Technical Features1. The FlightYield Financial WaterfallThe DroneProfitPool automates enterprise-grade revenue distribution upon report finalization:Net Revenue: $\text{Gross Revenue} - \text{Refunds}$Deductions: $\text{OPEX} + \text{Reserve Contribution} + \text{Carry-Forward Loss}$Distributable Profit: Split equally (50/50) between the Investor Pool and the Operator Wallet.Pro-Rata Payouts: Distributed to token holders using a gas-optimized rewardPerShare tracking mechanism.2. Fleet Health Hook & Dynamic ReservesIntegrates a fleetHealthIndex (0–100 scale) evaluated by IoT telematics and auditors.If health drops below 80%, the protocol automatically scales up allocations to the Reserve Treasury, protecting physical asset longevity over short-term yields.3. Decentralized Multi-Sig Verification (EIP-712)Operational reports require cryptographic signatures from a threshold of authorized auditors (ORACLE_SIGNER_ROLE) prior to on-chain settlement, eliminating single points of failure.🛠 Getting Started & DevelopmentThis repository uses Foundry for blazing-fast smart contract compilation, testing, and deployment.PrerequisitesEnsure you have Foundry installed on your system:
curl -L [https://foundry.paradigm.xyz](https://foundry.paradigm.xyz) | bash
foundryup

Installation

    Clone the repository:
git clone [https://github.com/Aervynx/FlightYield-Protocol.git](https://github.com/Aervynx/FlightYield-Protocol.git)
cd FlightYield-Protocol

Install dependencies:
forge install

Configure environment variables:
Create a .env file in the root directory based on .env.example:
PRIVATE_KEY=your_wallet_private_key_here
RPC_URL=[https://rpc.dotone.io](https://rpc.dotone.io)
PAYMENT_TOKEN_ADDRESS=0x_your_usdt_address
OPERATOR_WALLET_ADDRESS=0x_operator_address
RESERVE_TREASURY_ADDRESS=0x_treasury_address

🧪 Testing & Gas Reporting

Run the comprehensive unit and integration test suite:
forge test

To generate a detailed gas consumption report:
forge test --gas-report

📦 Deployment

To deploy the upgradeable UUPS proxy architecture and initialize contracts on the target network (e.g., DotOne Chain ID 505):
forge script script/DeployAervynxRWA.s.sol:DeployAervynxRWA \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify

🛡 Security & Audits

    Upgrade Safety: Protected by OpenZeppelin's upgrade safety plugins.
    Access Control: Granular role management (DEFAULT_ADMIN_ROLE, UPGRADER_ROLE, COMPLIANCE_ROLE, ORACLE_SIGNER_ROLE).
    Reentrancy Protection: All financial transfer functions are secured with ReentrancyGuardUpgradeable.

👥 Authors & Contributors

    Parsa Abolhasani  - Senior Blockchain Developer & Web3 Architect 

    Aervynx Core Engineering Team

📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

Aervynx Ecosystem © 2026. All Rights Reserved.

Website • Documentation
