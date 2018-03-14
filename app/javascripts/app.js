// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import {
    default as Web3
} from 'web3';
import {
    default as contract
} from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import flight_artifacts from '../../build/contracts/Flight.json'

// Flight is our usable abstraction, which we'll use through the code below.
var Flight = contract(flight_artifacts);

var accounts;
var flight;


function getBalance(address) {
  return new Promise (function (resolve, reject) {
    web3.eth.getBalance(address, function (error, result) {
      if (error) {
reject(error); }
	else {
 resolve(web3.fromWei(result.toNumber(), 'Wei'));   }
  })
})
}

window.App = {
    start: function() {
        var self = this;

        web3.eth.getAccounts(function(err, accs) {
            if (err != null) {
                alert("There was an error fetching your accounts.");
                return;
            }

            if (accs.length == 0) {
                alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
                return;
            }
            accounts = accs;

            

            self.initializeFlight();
        });
    },
  initializeFlight: function() {
        var self = this;
        Flight.deployed().then(function(instance) {
            flight = instance;

            $("#flightAddress").html(flight.address);

            self.checkValues();
        }).catch(function(e) {
            console.log(e);
        });
    },

    checkValues: function() {
        Flight.deployed().then(function(instance) {
            flight = instance;
        console.log(flight);
            flight.scheduledDepartTime.call().then(
                function(scheduledDepartTime) {
                    $("#scheduledDepartTime").text(scheduledDepartTime);
            return flight.actualDepartTime.call();
        }).then(
        function(actualDepartTime){
            $("input#actualDepartTime").val(actualDepartTime);
                    return flight.airline_owner.call();
                }).then(
                function(airline_owner) {
                    //console.log("airline_owner "+airline_owner);
                    $("#airlineOwner").text(airline_owner);
                    return flight.passengerCount.call();
                }).then(
                function(num) {
                    $("#passengerCount").html(num.toNumber());
                    return getBalance(flight.address);
                }).then(
                function(balance) {
                    $("#flightBalance").html(balance);
  });
        }).catch(function(e) {
            console.log(e);
        });
    },
    departure: function(val) {
        var flight;
        Flight.deployed().then(function(instance) {
            flight = instance;
            flight.departure(val, {
                from: accounts[0]
            }).then(
                function() {
                    return flight.actualDepartTime.call();
                }).then(
                function(actualDepartTime) {
console.log("updated"+actualDepartTime);
                    if (actualDepartTime == val) {
                        var msgResult;
                        msgResult = "Change successful";
                    } else {
                        msgResult = "Change failed";
                    }
                    $("#changeTimeResult").html(msgResult);
            $("#airline_owner").html(getBalance(accounts[0]));
                });
        }).catch(function(e) {
            console.log(e);
        });
    },

    bookTicket: function(buyerAddress, ticketPrice) {
            
        var self = this;
        Flight.deployed().then(function(instance) {
            flight = instance;
            flight.bookTicket({ from: buyerAddress,value: ticketPrice,gas: 3000000
                }).then(
                function() {
            console.log("booked Ticket");
return flight.passengerCount.call();
                }).then(
                function(num) {
                    $("#passengerCount").html(num.toNumber());
                    return flight.flightBookings.call(buyerAddress);
                }).then(
                function(valuePaid) {
                    var msgResult;
            console.log(valuePaid);
                    if (valuePaid.toNumber() == ticketPrice) {
                        msgResult = "Purchase successful";
                    } else {
                        msgResult = "Purchase failed";
                    }
                    $("#bookTicketResult").html(msgResult);
                }).then(
                function() {
                    $("#flightBalance").html(getBalance(flight.address));
             $("#acc1Balance-curr").text(getBalance(web3.eth.accounts[1]));
            $("#acc2Balance-curr").text(getBalance(web3.eth.accounts[2]));
            $("#acc3Balance-curr").text(getBalance(web3.eth.accounts[3]));
            $("#acc4Balance-curr").text(getBalance(web3.eth.accounts[4]));
            $("#acc5Balance-curr").text(getBalance(web3.eth.accounts[5]));
            
                });
        }).catch(function(e) {
            console.log(e);
        });
    },

      destroyContract: function() {
        var self = this;
        Flight.deployed().then(function(instance) {
            flight = instance;
            flight.destroy({
                from: accounts[0]
            }).then(
                function() {
                    $("#destroyContractResult").html("contract destroyed. ");
$("#acc1Balance-curr").text(getBalance(web3.eth.accounts[1]));
            $("#acc2Balance-curr").text(getBalance(web3.eth.accounts[2]));
            $("#acc3Balance-curr").text(getBalance(web3.eth.accounts[3]));
            $("#acc4Balance-curr").text(getBalance(web3.eth.accounts[4]));
            $("#acc5Balance-curr").text(getBalance(web3.eth.accounts[5]));
            $("#airline_owner").html(getBalance(accounts[0]));
                }); //end of flight destroy
        }).catch(function(e) {
            console.log(e);
        });
    }

};
window.addEventListener('load', function() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
        // Use Mist/MetaMask's provider
        window.web3 = new Web3(web3.currentProvider);
    } else {
        console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }

    Flight.setProvider(web3.currentProvider);
    App.start();
    // Wire up the UI elements
    $("#changeTime").click(function() {
        var val = $("#actualDepartTime").val();
        App.departure(val);
});
    $("#bookTicket").click(function() {
        var val = $("#ticketPrice").val();
        var buyerAddress = $("#buyerAddress").val();
        App.bookTicket(buyerAddress, web3.toWei(val));
    });
    $("#destroyContract").click(function() {
        App.destroyContract();
    });
});

