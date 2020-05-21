var web3 = new Web3(Web3.givenProvider);
var contractInstance;
const TAIL = 0;
const HEAD = 1;
var betSelected;


$(document).ready(()=> {
  console.log("V72");
    window.ethereum.enable().then((accounts)=>{
        contractInstance = new web3.eth.Contract(abi, "0x62E37c9Ba584A1426f39418c0768d4808f0096b7", {from: accounts[0]});

                $("#head_button").click(()=>{placeBet(HEAD)});
                $("#tail_button").click(()=>{placeBet(TAIL)});
                $("#fund_button").click(fundContractValue);
                $(".lds-ellipsis").hide();
                getCurrentBalance();
        });
});

  function placeBet(betOn){
    var betAmount = $("#amount_input").val();
    var betWin;
    var flipResult;
    var latestNumber;
    var queryId;
    const config = {
            value: web3.utils.toWei(betAmount, "ether")
    };

    $("#betResult_output").hide();

    displayBetOn(betOn);
    contractInstance.methods.placeBet(betOn).send(config)
        .on("transactionHash", (hash) =>{
            console.log("hash => " + hash);
            $(".lds-ellipsis").show();
        })
        .on("confirmation", (confirmationNr) => {
            //console.log("confirmationNr => " + confirmationNr);
        })
        .on("receipt",  (receipt) => {
            console.log("receipt => " +   JSON.stringify(receipt));
            console.log("queryId => " +   receipt.events.logQueryId.returnValues.queryId);
            queryId = receipt.events.logQueryId.returnValues.queryId;

            getCurrentBalance();

            contractInstance.events.betPlaced({
              filter: { queryId: queryId},
                fromBlock: 0,
                toBlock: 'latest'
              }, function(error, event){ console.log(event); })
              .on('data', function(event){

                  console.log("betPlaced data => " + JSON.stringify(event));

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

        }).catch(e=> {alert(JSON.stringify(e))});
  }

  function displayResult(betResult){
        $("#betResult_output").show();
      if (betResult) {
        $("#betResult_output").text("You Win").css('color', 'green');
          console.log("You win " + betResult + ", on " + betSelected );
      } else {
          $("#betResult_output").text("You lose").css('color', 'red');
          console.log("You lose " + betResult + ", on " + betSelected);
      }
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
          $(".lds-ellipsis").hide();
      }, 3000);
     });
  }

  function getCurrentBalance(){
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
          getCurrentBalance();
      })
    } catch(e) {
     alert(e);
    }
  }
