// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./DroneProfitPool.sol";

contract DroneReportVerifier is EIP712, AccessControl {
    using ECDSA for bytes32;

    bytes32 public constant ORACLE_SIGNER_ROLE = keccak256("ORACLE_SIGNER_ROLE");
    uint256 public requiredSignatures;
    DroneProfitPool public immutable profitPool;

    bytes32 private constant REPORT_TYPEHASH = keccak256(
        "PeriodReportData(bytes32 periodId,uint256 grossRevenue,uint256 refunds,uint256 opex,uint256 reserveContribution,uint256 carryForwardLoss)"
    );

    event ReportVerifiedAndFinalized(bytes32 indexed periodId, uint256 signaturesCount);

    constructor(
        address _profitPool,
        address[] memory initialSigners,
        uint256 _requiredSignatures
    ) EIP712("AervynxDroneReportVerifier", "1.0") {
        profitPool = DroneProfitPool(_profitPool);
        require(_requiredSignatures > 0 && _requiredSignatures <= initialSigners.length, "Invalid threshold");
        requiredSignatures = _requiredSignatures;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        for (uint256 i = 0; i < initialSigners.length; i++) {
            _grantRole(ORACLE_SIGNER_ROLE, initialSigners[i]);
        }
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
        bytes[] calldata signatures
    ) external {
        require(signatures.length >= requiredSignatures, "Not enough signatures provided");

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
        address lastSigner = address(0);

        for (uint256 i = 0; i < signatures.length; i++) {
            address signer = hash.recover(signatures[i]);
            require(hasRole(ORACLE_SIGNER_ROLE, signer), "Invalid oracle signature");
            require(signer > lastSigner, "Duplicate or unsorted signature");
            lastSigner = signer;
        }

        profitPool.finalizePeriod(
            report.periodId,
            report.grossRevenue,
            report.refunds,
            report.opex,
            report.reserveContribution,
            report.carryForwardLoss
        );

        emit ReportVerifiedAndFinalized(report.periodId, signatures.length);
    }
}