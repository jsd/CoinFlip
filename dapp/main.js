var web3 = new Web3(Web3.givenProvider);
var contractInstance;
const TAIL = 0;
const HEAD = 1;
var betSelected;
var playerAddress;

$(document).ready(()=> {
    window.ethereum.enable().then((accounts)=>{
        contractInstance = new web3.eth.Contract(abi, "0x718Aba5BB6C93C96eAdAdCea6E9C58a6B0d400Dc", {from: accounts[0]});
          //console.log("contract Instance", contractInstance  );
                playerAddress = web3.currentProvider.selectedAddress;
                $("#head_button").click(()=>{placeBet(HEAD)});
                $("#tail_button").click(()=>{placeBet(TAIL)});
                $("#fund_button").click(fundContractValue);
                $("#payout_button").click(payoutPlayer);
                hideEllipsis();
                getContractBalance();
                getPlayerBalance();
        });
});

  function placeBet(betOn){
    var betAmount = $("#amount_input").val();
    var betWin;
    var flipResult;
    var latestNumber;
    var queryId;

    if(betAmount === "" || betAmount == 0 ) {
      alert("You must enter a valid amount");
    }

    const config = {
          value: web3.utils.toWei(betAmount, "ether")
    };

    hideBetResult();
    displayBetOn(betOn);

    contractInstance.methods.placeBet(betOn).send(config)
        .on("transactionHash", (hash) =>{
            console.log("hash => " + hash);
            showEllipsis();
        })
        .on("confirmation", (confirmationNr) => {
            //console.log("confirmationNr => " + confirmationNr);
        })
        .on("receipt",  (receipt) => {
            console.log("receipt => " +   JSON.stringify(receipt));
            console.log("queryId => " +   receipt.events.logQueryId.returnValues.queryId);
            queryId = receipt.events.logQueryId.returnValues.queryId;

            getContractBalance();

            contractInstance.events.betPlaced({
              filter: { queryId: queryId},
                fromBlock: 0,
                toBlock: 'latest'
              }, function(error, event){ console.log(event); })
              .on('data', function(event){
                  //console.log("betPlaced data => " + JSON.stringify(event));
                  flipResult =  event.returnValues.flipResult;
                  latestNumber = event.returnValues.latestNumber;
                  spinCoin(latestNumber, flipResult);
                  displayResult(flipResult);
              })
              .on('changed', function(event){

                  console.log("betPlaced changed => " + JSON.stringify(event))
              })
              .on('error', console.error);
        }).then(()=>{

        }).catch(e=> {console.log("placeBet error => " + e)});
  }

  function displayResult(betResult){
        hideEllipsis();

      if (betResult) {
        showBetResult();
        $("#betResult_output").text("You Win").css('color', 'green');
          console.log("You win " + betResult + ", on " + betSelected );
      } else {
        showBetResult();
          $("#betResult_output").text("You lose").css('color', 'red');
          console.log("You lose " + betResult + ", on " + betSelected);
      }
      getPlayerBalance();
  }

  function displayBetOn(betOn) {
    const displayHead = "Head";
    const displayTAIL = "Tail";
    var outputCSS;

    if(betOn === HEAD){
      betSelected = displayHead;
      outputCSS = "outputSelectionHead";
    } else {
      betSelected = displayTAIL;
      outputCSS = "outputSelectionTail";
    }
    $("#betOn_ouput").text(betSelected).addClass(outputCSS);
  }

  function spinCoin(sideCoin, betResult){
   var animation;

   if (sideCoin == HEAD){
        animation = "animation2160";
    } else {
        animation = "animation1980";
    }

    return new Promise((resolve) => {
      $('#coin').removeClass();
        setTimeout(()=>{
          $('#coin').addClass(animation);
        }, 100);
        resolve();
     }).then(()=> {
       setTimeout(()=>{
          displayResult(betResult);
          hideEllipsis();
      }, 3000);
     });
  }

 
  function getContractBalance(){
    contractInstance.methods.getBalance().call().then((balance) =>{
        console.log("balance => " + balance);
        displayBalance(balance);
    });
  }

  function displayBalance(value){
    $("#balance_output").text(web3.utils.fromWei(value, "ether") + " eth");
  }

  function fundContractValue() {
    var config = {
          value: web3.utils.toWei("2", "ether")
    }
    try {
      contractInstance.methods.fundContract().send(config).then(()=>{
          getContractBalance();
      })
    } catch(e) {
     alert(e);
    }
  }

  function getPlayerBalance(){
    contractInstance.methods.getPlayerBalance(playerAddress).call().then((balance) =>{
        displayPlayerBalance(balance);
        console.log("Player balance => " + balance);
    });
  }

  function displayPlayerBalance(value){
      $("#playerBalance_ouput").text(web3.utils.fromWei(value, "ether") + " eth");
  }

  function payoutPlayer(){

    contractInstance.methods.payoutPlayer(playerAddress).send().then((result)=>{
      getPlayerBalance();
      getContractBalance();
    }).catch(e=> {console.log("payout exception: " +JSON.stringify(e))});
  }

  function showBetResult() {
    $("#betResult_output").show();
  }

  function hideBetResult() {
    $("#betResult_output").hide();
  }

  function showEllipsis() {
    $(".lds-ellipsis").show();
  }

  function hideEllipsis() {
    $(".lds-ellipsis").hide();
  }
