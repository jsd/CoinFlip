pragma solidity 0.5.12;
import "./Ownable.sol";
import "./SafeMath.sol";
import "./provableAPI.sol";

contract CoinFlip is Ownable, usingProvable {

    using SafeMath for uint256;

    uint256 constant NUM_RANDOM_BYTES_REQUESTED = 1;
    uint256 public latestNumber;

    struct Bet {
      address payable playerAddress;
      uint betAmount;
      uint betOn;
    }

    event betPlaced(bytes32 indexed queryId, address playerAddress, uint betAmount, uint amountToWin, uint256 betOn, uint256 latestNumber, bool flipResult);
    event logNewProvableQuery(string description);
    event generatedRandomNumber(uint256 randomNumber);
    event logQueryId(bytes32 indexed queryId, address playerAddress);

    mapping (bytes32 => Bet) private bets;
    mapping (address => uint ) private playerBalances;

    modifier costs(uint cost){
        require(msg.value >= cost);
        _;
    }

    constructor () public {
      provable_setProof(proofType_Ledger);
    }

    function placeBet(uint betOn) public payable costs(0.05 ether) {

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
        uint betAmount =   bets[_queryId].betAmount;
        uint netBetAmount =  SafeMath.sub(betAmount, provable_getPrice("RANDOM"));
        uint amountToWin = SafeMath.mul(netBetAmount, 2);
        address payable playerAddress = bets[_queryId].playerAddress;
        bool  flipResult = false;
        uint256 betOn =  bets[_queryId].betOn;

        if(latestNumber == betOn) {
             flipResult = true;
             addPlayerBalance(playerAddress, amountToWin);
        }

        emit generatedRandomNumber(latestNumber);
        emit betPlaced(_queryId, playerAddress, betAmount, amountToWin, betOn, latestNumber, flipResult);
    }

    function getBalance() public view returns(uint){
        return address(this).balance;
    }

    function addPlayerBalance(address playerAddress, uint amount) private {
        uint previousBalance = playerBalances[playerAddress];
        playerBalances[playerAddress] = SafeMath.add(previousBalance, amount);
    }

    function getPlayerBalance(address playerAddress) public view returns(uint) {
        uint playerBalance = playerBalances[playerAddress];
        return  playerBalance;
    }

    function payoutPlayer(address payable playerAddress) public payable {
        require(msg.sender == playerAddress);
        uint playerBalance = getPlayerBalance(playerAddress);
        uint toTransfer = playerBalance;

        playerBalances[playerAddress] = 0;
        assert(playerBalances[playerAddress] == 0);

        playerAddress.transfer(toTransfer);
        balance = SafeMath.sub(balance, toTransfer);
    }

   function fundContract() public payable costs(1 ether) {
      balance = SafeMath.add(balance, msg.value);
    }

   function close() public onlyOwner {
        msg.sender.transfer(balance);
        balance = 0;
        assert(balance == 0);
        selfdestruct(msg.sender);
    }
}
