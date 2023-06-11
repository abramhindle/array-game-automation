/*

   buyUpgrade(1,4) buys all the *X upgrades for A
 buyMaxGenerators(1,6) buys max A generators for A
 buyMaxGenerators(2,6) buys max B generators for B
 buyMaxABoosterators() buys A boosters on the B page
 prestigerConfirm(2) reset B for C points
 buyMaxGenerators(3,6) buys max C generators for C
 buyMaxGenerators(4,6) buys max D generators for D

 get the score: document.getElementById("array").innerText 
*/

/*

clearInterval(myTimerABReset);  myTimerABReset = setInterval(  () => { console.log(Date.now() + " B reset "); prestigeConfirm(2)} , 90*1000) 
myTimerABoosterators = setInterval( () => buyMaxABoosterators(), 10*1000)
myTimerABReset = setInterval(  () => prestigeConfirm(2), 30*1000)
myFastTimerBBuy = setInterval(()=>buyMaxGenerators(2,6), 11*1000)
myFastTimerABuy = setInterval(()=>buyMaxGenerators(1,6), 7*1000)
myFastTimerCBuy = setInterval(()=>buyMaxGenerators(3,6), 17*1000) 
*/

function convertBird(x) {
    if (x[0] == "{") {
        return Number(x.split(", ")[1].replace("}",""))
    } else {
        return Math.log10(x);
    }
}
function gte(x,y) {
    if (x[0] == "{" || y[0] == "{") {
        return convertBird(x) >= convertBird(y);
    } else {
        return Number((""+x).replaceAll(",","")) >= Number((""+y).replaceAll(",",""))
    }
}
function parseScore() {
    var scores = [...document.getElementById("array").children].map(x => x.innerText);
    var sectioned = document.getElementById("array").innerText.indexOf("[") >= 0;
    // console.log(scores);
    var score = {};
    score["A"] = scores[0];
    if ( sectioned ) {
        score["B"] = 0;
        score["C"] = 0;
        score["D"] = 0;
        score["S"] = scores[scores.length-2];
        score["E"] = scores[scores.length-1];
        if ( scores.length > 3 ) {
            score["B"] = scores[1];
        }
        if ( scores.length > 4 ) {
            score["C"] = scores[2];
        }
        if ( scores.length > 5 ) {
            score["D"] = scores[3];
        }
    } else {
        score["B"] = 0;
        score["C"] = 0;
        score["D"] = 0;
        if ( scores.length >= 2 ) {
            score["B"] = scores[1];
        }
        if ( scores.length >= 3 ) {
            score["C"] = scores[2];
        }
        if ( scores.length >= 4 ) {
            score["D"] = scores[3];
        }

    }
    return score
}

class ArrayAI {
    // Task 1: keep track of timers
    constructor() {
        this.timers = {};
    }
    startTimer( t, c, sec = 30 ) {
        this.timers[t] = setInterval( c, sec * 1000 );
    }
    stopTimer( t ) {
        if (t in this.timers) {
            clearInterval(this.timers[t]);
            delete this.timers[t];
        }
    }
    buyAGenerators() {
        buyMaxGenerators(1,6);
    }
    buyBGenerators() {
        buyMaxGenerators(2,6);
    }
    buyCGenerators() {
        buyMaxGenerators(3,6);
    }
    buyDGenerators() {
        buyMaxGenerators(4,6);
    }
    buyAllGenerators() {
        for (var i = 1 ; i <= 4; i++ ) {
            buyMaxGenerators(i,6);
        }
    }
    _startGeneratorBuying( t, g, sec=5 ) {
        console.log("Starting " + t);
        this.startTimer( t, () => buyMaxGenerators(g,6), sec );
    }
    _stopGeneratorBuying( t, g=0) { 
        console.log("Stopping " + t);
        this.stopTimer( t );
    }
    startAGeneratorBuying( sec=5 ) {
        this._startGeneratorBuying("AGeneratorBuying", 1);
    }
    startBGeneratorBuying( sec=5 ) {
        this._startGeneratorBuying("BGeneratorBuying", 2);
    }
    startCGeneratorBuying( sec=5 ) {
        this._startGeneratorBuying("CGeneratorBuying", 3);
    }
    startDGeneratorBuying( sec=5 ) {
        this._startGeneratorBuying("DGeneratorBuying", 4);
    }
    stopAGeneratorBuying( sec=5 ) {
        this._stopGeneratorBuying("AGeneratorBuying", 1);
    }
    stopBGeneratorBuying( sec=5 ) {
        this._stopGeneratorBuying("BGeneratorBuying", 2);
    }
    stopCGeneratorBuying( sec=5 ) {
        this._stopGeneratorBuying("CGeneratorBuying", 3);
    }
    stopDGeneratorBuying( sec=5 ) {
        this._stopGeneratorBuying("DGeneratorBuying", 4);
    }
    buyCDoubler() {
        buyUpgrade(2,9); // upgrade to double C
    }
    buyBUpgrades() {
        for (var i = 1; i <= 10; i++) {
            buyUpgrade(2,i)
        }
    }
    buyMaxABoosterators() {
        buyMaxABoosterators();
    }
    buyUpgrades() {
        this.buyCDoubler();
        this.buyBUpgrades();
        this.buyMaxABoosterators();
        buyUpgrade(1,4); // buy max A upgrades
    }
    startBuyUpgrades(sec=30) {
        let t = "BuyUpgrades";
        console.log("Starting " + t);
        this.startTimer( t, () => this.buyUpgrades(), sec );
    }
    stopBuyUpgrades() {
        let t = "BuyUpgrades";
        console.log("stopping " + t);
        this.stopTimer( t );
    }
    _reset( g, sec=60 ) {
        prestigeConfirm(g);
    }
    resetA() {
        this._reset(1);
    }
    resetB() {
        this._reset(2);
    }
    resetC() {
        this._reset(3);
    }
    resetD() {
        this._reset(4);
    }
    _startReset(t, f, sec=120) {
        console.log("Starting " + t + " at "+ sec + "s");
        this.startTimer( t, f, sec );        
    }
    _stoptReset(t, sec=120) {
        console.log("Stopping " + t );
        this.stopTimer( t );
    }
    startAReseting(sec = 120) {
        this._startReset( "AReset", () => this.resetA(), sec );
    }
    startBReseting(sec = 120) {
        this._startReset( "BReset", () => this.resetB(), sec );
    }
    stopAReseting() {
        this._stopReset( "AReset" );
    }
    stopBReseting() {
        this._stopReset( "BReset" );
    }
    startNormal() {
        this.startAGeneratorBuying( sec=5 );
        this.startBGeneratorBuying( sec=5 );
        this.startCGeneratorBuying( sec=5 );
        this.startDGeneratorBuying( sec=5 );        
        this.startBuyUpgrades( sec = 11 );
    }
    stopNormal() {
        this.stopAGeneratorBuying();
        this.stopBGeneratorBuying();
        this.stopCGeneratorBuying();
        this.stopDGeneratorBuying();
        this.stopBuyUpgrades();
    }
    startBReseting(sec=120) {
        stopNormal();        
        this.startBReseting(sec);
        this.startAGeneratorBuying( 2 );
        this.startBGeneratorBuying( 5 );
        this.startBuyUpgrades( 7 );
    }        
    stopBReseting() {
        this.stopAGeneratorBuying( );
        this.stopBGeneratorBuying( );
        this.stopBuyUpgrades( );
        this.stopBReseting( );
    }
    disableAlert() {
        if ( ! this.alert ) {
            this.alert = window.alert;
        }
        window.alert = console.log;            
    }
    enableAlert() {
        if ( this.alert ) {
            window.alert = this.alert;
            delete this.alert;
        }
    }
}
ArrayAI.instance = new ArrayAI();
ArrayAI.instance.disableAlert();
var stateDebug = false;
function stateStart() {
    if (stateDebug) console.log("stateStart");
    ArrayAI.instance.buyUpgrades();
    ArrayAI.instance.buyAllGenerators();
    var score = parseScore();
    if (gte(score["A"],"{10, 10}")) {
        return stateAResetting;
    }
    return startStart;
}
var minAReset = "{10, 14.14}";
function stateAResetting() {
    if (stateDebug) console.log("stateAResetting");
    var score = parseScore();
    if (gte(score["B"],200)) {
        // buy upgrades will purchase the upgrade at 200
        ArrayAI.instance.buyUpgrades();
        return stateBBuying;
    }
    if (gte(score["A"], minAReset)) {
        ArrayAI.instance.resetA();
    }
    ArrayAI.instance.buyAGenerators();
    ArrayAI.instance.buyBGenerators();// should we do this?
    ArrayAI.instance.buyUpgrades();
    ArrayAI.instance.buyAGenerators();
    return stateAResetting;
}

function stateBBuying() {
    if (stateDebug) console.log("stateBBuying");
    ArrayAI.instance.buyUpgrades();
    ArrayAI.instance.buyAllGenerators();
    var score = parseScore();
    if (gte(score["B"],"{10, 10}")) {
        return stateBResetting;
    }
    return startBBuying;
}

function stateBResetting() {
    if (stateDebug) console.log("stateBResetting");
    var score = parseScore();
    if (gte(score["C"],200)) {
        // buy upgrades will purchase the upgrade at 200
        ArrayAI.instance.buyUpgrades();
        return stateCBuying;
    }
    if (gte(score["B"],"{10, 10}")) {
        ArrayAI.instance.resetA();
    }   
    ArrayAI.instance.buyAGenerators();
    ArrayAI.instance.buyBGenerators();
    ArrayAI.instance.buyCGenerators(); // should we?
    ArrayAI.instance.buyUpgrades();
    ArrayAI.instance.buyAGenerators();
    return stateBResetting;
}

function stateCBuying() {
    if (stateDebug) console.log("stateCBuying");
    ArrayAI.instance.buyUpgrades();
    ArrayAI.instance.buyAllGenerators();
    var score = parseScore();
    if (gte(score["C"],"{10, 14.32}")) {
        return stateBResetting;
    }
    return startCBuying;
}
function stateCResetting() {
    if (stateDebug) console.log("stateCResetting");
    var score = parseScore();
    if (gte(score["C"],200)) {
        // buy upgrades will purchase the upgrade at 200
        ArrayAI.instance.buyUpgrades();
        return stateDBuying;
    }
    if (gte(score["B"],"{10, 10}")) {
        ArrayAI.instance.resetA();
    }   
    ArrayAI.instance.buyAGenerators();
    ArrayAI.instance.buyBGenerators();// should we do this?
    ArrayAI.instance.buyUpgrades();
    ArrayAI.instance.buyAGenerators();
    return stateCResetting;
}
function stateDBuying() {
    if (stateDebug) console.log("stateDBuying");
    ArrayAI.instance.buyUpgrades();
    ArrayAI.instance.buyAllGenerators();
    return startDBuying;
}
var myTimerStateMachine;
var myState;
function stateMachine(startState, seconds=5) {
    myState = startState;
    myTimerStateMachine = setInterval(function() {
        myState = myState();
    }, seconds * 1000);
}
stateMachine(stateStart,5);
/*

  thoughts:

  it's conditions

  once we can generate 3 Bs reset
  
  buying b upgrades and reset until 200B

  buy all b upgrades
  
  start buying Bs
  
  once we can generate 1 C reset

  start buying As, Bs, B upgrades and reset until 300 C

  


  

*/
