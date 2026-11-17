// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./DroneRWA.sol";

contract DroneProfitPool is Initializable, AccessControlUpgradeable, PausableUpgradeable, ReentrancyGuardUpgradeable, UUPSUpgradeable {
    using SafeERC20 for IERC20;

    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    IERC20 public paymentToken;
    DroneRWA public rwaToken;
    address public operatorWallet;
    address public reserveTreasury;

    uint256 public redemptionRatePerToken;
    uint256 public currentFleetHealthIndex;

    struct PeriodReport {
        uint256 grossRevenue;
        uint256 refunds;
        uint256 opex;
        uint256 reserveContribution;
        uint256 carryForwardLoss;
        uint256 netDistributableProfit;
        uint256 fleetHealthAtIndex;
        bool finalized;
    }

    mapping(bytes32 => PeriodReport) public periodReports;
    
    uint256 public rewardPerShare;
    uint256 public constant PRECISION = 1e18;

    mapping(address => uint256) public userRewardPerSharePaid;
    mapping(address => uint256) public rewards;

    event PeriodFinalized(bytes32 indexed periodId, uint256 netProfit, uint256 investorPool, uint256 operatorPool, uint256 adjustedReserve);
    event RewardClaimed(address indexed investor, uint256 amount);
    event TokensRedeemed(address indexed investor, uint256 tokenAmount, uint256 payoutAmount);
    event RedemptionRateUpdated(uint256 newRate);
    event FleetHealthUpdated(uint256 newHealthIndex);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _paymentToken,
        address _rwaToken,
        address _operatorWallet,
        address _reserveTreasury
    ) initializer public {
        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        paymentToken = IERC20(_paymentToken);
        rwaToken = DroneRWA(_rwaToken);
        operatorWallet = _operatorWallet;
        reserveTreasury = _reserveTreasury;
        currentFleetHealthIndex = 100;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _grantRole(AUDITOR_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
    }

    modifier updateReward(address account) {
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerSharePaid[account] = rewardPerShare;
        }
        _;
    }

    function earned(address account) public view returns (uint256) {
        uint256 balance = rwaToken.balanceOf(account);
        uint256 currentRewardPerShare = rewardPerShare;
        return (balance * (currentRewardPerShare - userRewardPerSharePaid[account])) / PRECISION + rewards[account];
    }

    function finalizePeriod(
        bytes32 periodId,
        uint256 grossRevenue,
        uint256 refunds,
        uint256 opex,
        uint256 baseReserveContribution,
        uint256 carryForwardLoss
    ) external onlyRole(AUDITOR_ROLE) whenNotPaused {
        require(!periodReports[periodId].finalized, "Period already finalized");

        uint256 adjustedReserve = baseReserveContribution;
        if (currentFleetHealthIndex < 80) {
            uint256 deficitFactor = 80 - currentFleetHealthIndex;
            adjustedReserve += (baseReserveContribution * deficitFactor) / 50;
        }

        uint256 netRevenue = grossRevenue > refunds ? grossRevenue - refunds : 0;
        uint256 totalDeductions = opex + adjustedReserve + carryForwardLoss;
        uint256 distributable = netRevenue > totalDeductions ? netRevenue - totalDeductions : 0;

        periodReports[periodId] = PeriodReport({
            grossRevenue: grossRevenue,
            refunds: refunds,
            opex: opex,
            reserveContribution: adjustedReserve,
            carryForwardLoss: carryForwardLoss,
            netDistributableProfit: distributable,
            fleetHealthAtIndex: currentFleetHealthIndex,
            finalized: true
        });

        uint256 investorPool = distributable / 2;
        uint256 operatorPool = distributable - investorPool;

        if (adjustedReserve > 0) {
            paymentToken.safeTransferFrom(msg.sender, reserveTreasury, adjustedReserve);
        }

        if (investorPool > 0) {
            uint256 tokenSupply = rwaToken.totalSupply();
            if (tokenSupply > 0) {
                rewardPerShare += (investorPool * PRECISION) / tokenSupply;
            }
        }

        if (operatorPool > 0) {
            paymentToken.safeTransferFrom(msg.sender, operatorWallet, operatorPool);
        }

        emit PeriodFinalized(periodId, distributable, investorPool, operatorPool, adjustedReserve);
    }

    function updateFleetHealth(uint256 _newHealthIndex) external onlyRole(OPERATOR_ROLE) {
        require(_newHealthIndex <= 100, "Health index must be between 0 and 100");
        currentFleetHealthIndex = _newHealthIndex;
        emit FleetHealthUpdated(_newHealthIndex);
    }

    function claimReward() external nonReentrant whenNotPaused updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        require(reward > 0, "No rewards to claim");

        rewards[msg.sender] = 0;
        paymentToken.safeTransfer(msg.sender, reward);

        emit RewardClaimed(msg.sender, reward);
    }

    function redeemTokens(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Cannot redeem zero");
        require(redemptionRatePerToken > 0, "Redemption not active");
        require(rwaToken.balanceOf(msg.sender) >= amount, "Insufficient RWA tokens");

        uint256 payoutAmount = (amount * redemptionRatePerToken) / PRECISION;
        require(paymentToken.balanceOf(address(this)) >= payoutAmount, "Insufficient pool liquidity");

        rwaToken.burn(msg.sender, amount);
        paymentToken.safeTransfer(msg.sender, payoutAmount);

        emit TokensRedeemed(msg.sender, amount, payoutAmount);
    }

    function setRedemptionRate(uint256 _newRate) external onlyRole(DEFAULT_ADMIN_ROLE) {
        redemptionRatePerToken = _newRate;
        emit RedemptionRateUpdated(_newRate);
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}
}