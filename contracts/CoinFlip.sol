pragma solidity 0.5.12;
import "./Ownable.sol";

contract CoinFlip is Ownable {

    struct Bet {
      address playerAddress;
      uint amount;
      bool betResult;
    }
    event betPlaced(address playerAddress, uint amount, bool betWon, uint flipResult);
    modifier costs(uint cost){
        require(msg.value >= cost);
        _;
    }

    function placeBet(uint betOn) public payable costs(1 ether) returns(bool) {
     require(betOn == 1 || betOn == 0, "Bet need to be 1 or 0");
     uint potentialWin =  msg.value*3;
     address playerAddress = msg.sender;
     bool betWon = false;
     uint flipResult = flipCoin();

       if(flipResult == betOn) {
           betWon = true;
           Bet(playerAddress, 100, betWon);
           emit betPlaced(msg.sender, potentialWin, betWon, flipResult);
           msg.sender.transfer(potentialWin);
           return betWon;
       } else {
            Bet(playerAddress, 100, betWon);
           emit betPlaced(msg.sender, potentialWin, betWon, flipResult);
           return false;
       }

    }

   function withdraw(uint amount) public {
       msg.sender.transfer(amount);
   }

   function getBalance() public view returns(uint){
       return address(this).balance;
   }

   function fundContract() public payable costs(1 ether) {
      balance += msg.value;
    }

   function flipCoin() public view returns(uint) {
       return now % 2;
   }
}
