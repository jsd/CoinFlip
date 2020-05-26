
const CoinFlip = artifacts.require("CoinFlip");
const truffleAssert = require("truffle-assertions");


contract("CoinFlip", async function(accounts){

  let instance;

  before(async function(){
    instance = await CoinFlip.deployed()
  });

  it("should flipCoin", async ()=> {
      let flipCoin = await instance.flipCoin();
      console.log("flipCoin : " + parseFloat(flipCoin))
      assert(flipCoin == 0 || flipCoin == 1, "flip 0 or 1");      //assert(result === 100);
  });

  it("should get balance", async ()=> {
      let currentBalance = await parseFloat(await web3.eth.getBalance(accounts[0]));
      let balance = await instance.balance;
      let balaneFloat = parseFloat(balance);
      //let flipCoin = await instance.flipCoin();
      console.log(currentBalance);
        //assert(flipCoin == 0 || flipCoin == 1, "flip 0 or 1");      //assert(result === 100);
  });

  it("should withdraw", async ()=> {
        await instance.getBalance({from: accounts[4], value: web3.utils.toWei("1", "ether")});
        //await instance.withdraw(web3.utils.toWei("1", "ether"));
        //assert(flipCoin == 0 || flipCoin == 1, "flip 0 or 1");      //assert(result === 100);
  });


});
