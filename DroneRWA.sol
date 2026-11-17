// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20VotesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract DroneRWA is Initializable, ERC20Upgradeable, ERC20PermitUpgradeable, ERC20VotesUpgradeable, AccessControlUpgradeable, UUPSUpgradeable {
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    uint256 public constant MAX_SUPPLY = 1_000_000 * 10**18;
    
    mapping(address => bool) public isWhitelisted;

    event WhitelistUpdated(address indexed account, bool status);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory name,
        string memory symbol,
        address initialAccount,
        uint256 initialMintAmount
    ) initializer public {
        __ERC20_init(name, symbol);
        __ERC20Permit_init(name);
        __ERC20Votes_init();
        __AccessControl_init();
        // Note: UUPSUpgradeable does not require an explicit initializer call here

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(COMPLIANCE_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);

        isWhitelisted[initialAccount] = true;
        require(initialMintAmount <= MAX_SUPPLY, "Initial mint exceeds max supply");
        _mint(initialAccount, initialMintAmount);
    }

    function setWhitelist(address account, bool status) external onlyRole(COMPLIANCE_ROLE) {
        isWhitelisted[account] = status;
        emit WhitelistUpdated(account, status);
    }

    function mint(address to, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(isWhitelisted[to], "Recipient not whitelisted");
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        require(msg.sender == from || hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Not authorized to burn");
        _burn(from, amount);
    }

    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20Upgradeable, ERC20VotesUpgradeable) {
        if (from != address(0) && to != address(0)) {
            require(isWhitelisted[from] && isWhitelisted[to], "Transfer restricted: address not whitelisted");
        }
        super._update(from, to, value);
    }

    function nonces(
        address owner
    ) public view override(ERC20PermitUpgradeable, NoncesUpgradeable) returns (uint256) {
        return super.nonces(owner);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}
}