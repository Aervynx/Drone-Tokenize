// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract DroneStakingManager is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable rwaToken;
    uint256 public constant LOCK_PERIOD = 30 days;

    struct StakeInfo {
        uint256 amount;
        uint256 unlockTime;
    }

    mapping(address => StakeInfo) public stakes;

    event Staked(address indexed user, uint256 amount, uint256 unlockTime);
    event Withdrawn(address indexed user, uint256 amount);

    constructor(address _rwaToken) Ownable(msg.sender) {
        rwaToken = IERC20(_rwaToken);
    }

    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot stake zero");
        
        rwaToken.safeTransferFrom(msg.sender, address(this), amount);

        stakes[msg.sender].amount += amount;
        stakes[msg.sender].unlockTime = block.timestamp + LOCK_PERIOD;

        emit Staked(msg.sender, amount, stakes[msg.sender].unlockTime);
    }

    function withdraw(uint256 amount) external nonReentrant {
        StakeInfo storage userStake = stakes[msg.sender];
        require(userStake.amount >= amount, "Insufficient staked balance");
        require(block.timestamp >= userStake.unlockTime, "Tokens are still locked");

        userStake.amount -= amount;
        rwaToken.safeTransfer(msg.sender, amount);

        emit Withdrawn(msg.sender, amount);
    }
}