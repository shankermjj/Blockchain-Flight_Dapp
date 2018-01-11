var Flight = artifacts.require("./Flight.sol");
module.exports = function(deployer) {
  deployer.deploy(Flight);
};

