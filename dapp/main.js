var web3 = new Web3(Web3.givenProvider);
var contractInstance;
const TAIL = 0;
const HEAD = 1;


$(document).ready(()=> {
    window.ethereum.enable().then((accounts)=>{
        contractInstance = new web3.eth.Contract(abi, "0x9FE082B1bC9ccd278a611e957CB0F923cD9D4d6c", {from: accounts[0]});
        console.log(contractInstance);
    }).then(()=> {

        $("#head_button").click(()=>{placeBet(HEAD)});
        $("#tail_button").click(()=>{placeBet(TAIL)});
        $("#fund_button").click(initContractValue);
        getCurrentBalance();
    });
})


function placeBet(betOn){

  var betAmount = $("#amount_input").val();
  var betWon;
  var flipResult;
  const config = {
          value: web3.utils.toWei(betAmount, "ether")
  }

  displayBetOn(betOn);

  contractInstance.methods.placeBet(betOn).send(config) .on("transactionHash", (hash) =>{
          console.log(hash);
      })
      .on("confirmation", (confirmationNr) => {
          console.log(confirmationNr);
      })
      .on("receipt", async (receipt) => {
          console.log("receipt => " +   JSON.stringify(receipt));

          flipResult = receipt.events.betPlaced.returnValues[3];
          betWon =  receipt.events.betPlaced.returnValues[2];
          await spinCoin(flipResult);

      }).then(()=>{
          getCurrentBalance();
          displayResult(betWon);
    });
  }
  function displayResult(betWon){

      if (betWon) {
        $("#betResult_output").text("You Win").css('color', 'green');
          console.log("You win " + betWon );
      } else {
          $("#betResult_output").text("You lose").css('color', 'red');
          console.log("You lose " + betWon);
      }
  }

  function displayBetOn(betOn) {
    const displayHead = "Head";
    const displayTAIL = "Tail";
    var displayOutput;
    var outputCSS;

    if(betOn == HEAD){
      displayOutput = displayHead;
      outputCSS = "outputSelectionHead";
    } else {
      displayOutput = displayTAIL;
      outputCSS = "outputSelectionTail";
    }
    $("#betOn_ouput").text(displayOutput).addClass(outputCSS);
  }

  async function spinCoin(sideCoin){
   var animation;

   if (sideCoin == HEAD){
      animation = "animation2160";
    } else {
        animation = "animation1980";
    }

    return new Promise(resolve => {
      $('#coin').removeClass();
        setTimeout(()=>{
          $('#coin').addClass(animation);
        }, 100);
     }).then(()=> {
        console.log("");
     });

  }

  function getCurrentBalance(){
  contractInstance.methods.getBalance().call().then((res) =>{
        console.log(res);
        displayInfo(res);
    });
  }

  function displayInfo(wei){
    $("#balance_output").text(web3.utils.fromWei(wei, "ether") + " eth");
  }

  function initContractValue() {
    var config = {
          value: web3.utils.toWei("2", "ether")
    }
    contractInstance.methods.fundContract().send(config).then(()=>{
        getCurrentBalance();
    })
  }
