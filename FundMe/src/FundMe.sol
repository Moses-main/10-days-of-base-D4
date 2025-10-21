// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract FundMe{

    function fundMe() public payable  {
        require(msg.value > 0, "Amount must be greater than 0");
    }

    function getBalance() public view returns  (uint256){
        return address(this).balance;
    }

    receive() external payable {
        revert("Use FundMe");
     }
}