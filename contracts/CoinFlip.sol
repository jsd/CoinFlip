pragma solidity 0.5.12;
import "./Ownable.sol";
import "./provableAPI.sol";

contract CoinFlip is Ownable, usingProvable {


    uint256 constant NUM_RANDOM_BYTES_REQUESTED = 1;
    uint256 public latestNumber;

    struct Bet {
      address payable playerAddress;
      uint betAmount;
      uint256 betOn;
    }

    event betPlaced(bytes32 indexed queryId, address playerAddress, uint256 betAmount, uint256 betOn, uint256 latestNumber, bool flipResult);
    event logNewProvableQuery(string description);
    event generatedRandomNumber(uint256 randomNumber);
    event logQueryId(bytes32 indexed queryId, address playerAddress);

    mapping (bytes32 => Bet) private bets;

    modifier costs(uint cost){
        require(msg.value >= cost);
        _;
    }

    function placeBet(uint256 betOn) public payable costs(0.05 ether) {

        uint256 QUERY_EXECUTION_DELAY = 0;
        uint256 GAS_FOR_CALLBACK = 200000;
        bytes32 queryId = provable_newRandomDSQuery(
            QUERY_EXECUTION_DELAY,
            NUM_RANDOM_BYTES_REQUESTED,
            GAS_FOR_CALLBACK
        );

        bets[queryId] = Bet(msg.sender, msg.value, betOn);
        emit logNewProvableQuery("Provable query was sent, standing by for the answer...");
        emit logQueryId(queryId, msg.sender);
    }

    function __callback( bytes32 _queryId, string memory _result,bytes memory _proof) public {
        require(msg.sender == provable_cbAddress());

        latestNumber = uint256(keccak256(abi.encodePacked(_result))) % 2;
        uint betAmount =   bets[_queryId].betAmount*2;
        address payable playerAddress = bets[_queryId].playerAddress;
        bool  flipResult = false;
        uint256 betOn =  bets[_queryId].betOn;

        if(latestNumber == betOn) {
             flipResult = true;
             playerAddress.transfer(betAmount);

        } else {
            flipResult = false;
        }

        emit generatedRandomNumber(latestNumber);
        emit betPlaced(_queryId, playerAddress, betAmount, betOn, latestNumber, flipResult);
    }

   function getBalance() public view returns(uint){
       return address(this).balance;
   }

   function fundContract() public payable costs(1 ether) {
      balance += msg.value;
    }

   function close() public onlyOwner {
        msg.sender.transfer(balance);
        balance = 0;
        selfdestruct(msg.sender);
    }
}
