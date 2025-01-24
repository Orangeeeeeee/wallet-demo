// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockDAI is ERC20 {
    // Events (inherited from ERC20)
    // event Transfer(address indexed from, address indexed to, uint256 value);
    // event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(uint256 initialSupply) ERC20("Mock DAI", "DAI") {
        _mint(msg.sender, initialSupply);
    }

    // Function to mint new tokens (for testing)
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    // Override decimals to match DAI (18 decimals)
    function decimals() public pure override returns (uint8) {
        return 18;
    }

    // Functions already inherited from ERC20 that TokenSwap.js uses:
    // - balanceOf(address account) returns (uint256)
    // - approve(address spender, uint256 amount) returns (bool)
    // - allowance(address owner, address spender) returns (uint256)
    // - transfer(address to, uint256 amount) returns (bool)
    // - transferFrom(address from, address to, uint256 amount) returns (bool)
}
