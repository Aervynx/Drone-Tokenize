// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/DroneRWA.sol";
import "../src/DroneProfitPool.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract DeployAervynxRWA is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy DroneRWA Implementation
        DroneRWA rwaImplementation = new DroneRWA();

        // 2. Prepare initialization data for DroneRWA Proxy
        bytes memory rwaInitData = abi.encodeWithSelector(
            DroneRWA.initialize.selector,
            "Aervynx Drone RWA",
            "DRZ",
            deployer,
            1_000_000 * 10**18
        );

        // 3. Deploy ERC1967Proxy for DroneRWA
        ERC1967Proxy rwaProxy = new ERC1967Proxy(
            address(rwaImplementation),
            rwaInitData
        );
        DroneRWA droneRWA = DroneRWA(address(rwaProxy));

        // 4. Deploy DroneProfitPool Implementation
        DroneProfitPool profitPoolImplementation = new DroneProfitPool();

        // Assuming a mock or target payment token address (e.g., USDT/USDC on testnet)
        address paymentToken = vm.envAddress("PAYMENT_TOKEN_ADDRESS");
        address operatorWallet = vm.envAddress("OPERATOR_WALLET_ADDRESS");
        address reserveTreasury = vm.envAddress("RESERVE_TREASURY_ADDRESS");

        // 5. Prepare initialization data for DroneProfitPool Proxy
        bytes memory poolInitData = abi.encodeWithSelector(
            DroneProfitPool.initialize.selector,
            paymentToken,
            address(droneRWA),
            operatorWallet,
            reserveTreasury
        );

        // 6. Deploy ERC1967Proxy for DroneProfitPool
        ERC1967Proxy poolProxy = new ERC1967Proxy(
            address(profitPoolImplementation),
            poolInitData
        );
        DroneProfitPool profitPool = DroneProfitPool(address(poolProxy));

        vm.stopBroadcast();

        // Log deployed addresses for verification
        console.log("DroneRWA Proxy Deployed at:", address(droneRWA));
        console.log("DroneProfitPool Proxy Deployed at:", address(profitPool));
    }
}