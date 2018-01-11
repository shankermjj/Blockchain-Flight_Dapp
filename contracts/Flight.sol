pragma solidity ^0.4.4;

contract Flight {
 address public airline_owner;
 mapping (address => uint) public flightBookings;
 uint public capacity;
 uint public scheduledDepartTime;
 uint public actualDepartTime;
 
 address[] public passengers;
 uint public passengerCount;

 // Constructor
 function Flight() {
   airline_owner = msg.sender;
   capacity = 100;
   passengerCount = 0;
   scheduledDepartTime=actualDepartTime=1600;
 }

 function departure(uint newtime) public {
   if (msg.sender != airline_owner) { return; }
   actualDepartTime = newtime;
 }
 
 function bookTicket() public payable returns (bool success) {
   if (passengerCount >= capacity) { return false; }
   flightBookings[msg.sender] = msg.value;
   passengers.push(msg.sender);
   passengerCount++;
   return true;
 }
 
 function refundTicket(address recipient, uint amount) public {
   if (msg.sender != airline_owner) { return; }
   if (flightBookings[recipient] == amount) {
     address myAddress = this;
     if (myAddress.balance >= amount) {
       if(!recipient.send(amount)) throw;
       flightBookings[recipient] = 0;
       passengerCount--;
     }
   }
 }
 
 function destroy() { // so funds not locked in contract forever
   if (msg.sender == airline_owner) {
   
       if(scheduledDepartTime<actualDepartTime){
       for (uint i=0; i<passengers.length; i++) {
           uint amount=flightBookings[passengers[i]];
           uint refund=(amount*50)/100;
           if(!passengers[i].send(refund)) throw;
       }
       }
   
       suicide(airline_owner); // send funds to airline_owner
   }//end of owner check
 }//end of destroy
 
}//end of Flight
