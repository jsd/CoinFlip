pragma solidity 0.5.12;

contract Ownable {

    address payable public owner;
    uint public balance;

    modifier onlyOwner(){
        require(msg.sender == owner);
        _; //Continue execution
    }

    constructor() public{
        owner = msg.sender;
    }
}
