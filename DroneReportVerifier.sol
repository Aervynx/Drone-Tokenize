// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./DroneProfitPool.sol";

contract DroneReportVerifier is EIP712, Ownable {
    using ECDSA for bytes32;

    DroneProfitPool public immutable profitPool;
    address public authorizedSigner;

    bytes32 private constant REPORT_TYPEHASH = keccak256(
        "PeriodReportData(bytes32 periodId,uint256 grossRevenue,uint256 refunds,uint256 opex,uint256 reserveContribution,uint256 carryForwardLoss)"
    );

    event SignerUpdated(address indexed newSigner);
    event ReportVerifiedAndFinalized(bytes32 indexed periodId, address indexed verifier);

    constructor(
        address _profitPool,
        address _authorizedSigner
    ) EIP712("AervynxDroneReportVerifier", "1.0") Ownable(msg.sender) {
        profitPool = DroneProfitPool(_profitPool);
        authorizedSigner = _authorizedSigner;
    }

    struct PeriodReportData {
        bytes32 periodId;
        uint256 grossRevenue;
        uint256 refunds;
        uint256 opex;
        uint256 reserveContribution;
        uint256 carryForwardLoss;
    }

    function verifyAndFinalizePeriod(
        PeriodReportData calldata report,
        bytes calldata signature
    ) external {
        bytes32 structHash = keccak256(
            abi.encode(
                REPORT_TYPEHASH,
                report.periodId,
                report.grossRevenue,
                report.refunds,
                report.opex,
                report.reserveContribution,
                report.carryForwardLoss
            )
        );

        bytes32 hash = _hashTypedDataV4(structHash);
        address signer = hash.recover(signature);
        
        require(signer == authorizedSigner, "Invalid report signature");

        profitPool.finalizePeriod(
            report.periodId,
            report.grossRevenue,
            report.refunds,
            report.opex,
            report.reserveContribution,
            report.carryForwardLoss
        );

        emit ReportVerifiedAndFinalized(report.periodId, msg.sender);
    }

    function setAuthorizedSigner(address _newSigner) external onlyOwner {
        authorizedSigner = _newSigner;
        emit SignerUpdated(_newSigner);
    }
}