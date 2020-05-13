const People = artifacts.require("People");

module.exports = function(deployer) {
  deployer.deploy(People);
};
