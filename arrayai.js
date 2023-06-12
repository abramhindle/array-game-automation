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
    isBUpgradeEnabled(i) {
        // 1-indexed
        return !(document.getElementsByClassName("BUpgrade")[i-1].disabled);
    }
    buyBUpgrades() {
        for (var i = 1; i <= 10; i++) {
            if (this.isBUpgradeEnabled(i)) {
                buyUpgrade(2,i)
            }
        }
    }
    buyMaxABoosterators() {
        buyMaxABoosterators();
    }
    buyMaxAUpgrades() {
        buyUpgrade(1,4); // buy max A upgrades
    }
    buyUpgrades() {
        this.buyCDoubler();
        this.buyBUpgrades();
        this.buyMaxABoosterators();
        this.buyMaxAUpgrades();
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
    disableConfirm() {
        if ( ! this.confirm ) {
            this.confirm = window.confirm;
        }
        window.confirm = (x) => true;
    }
    enableConfirm() {
        if ( this.confirm ) {
            window.confirm = this.confirm;
            delete this.confirm;
        }
    }
    isCMilestoneMet(i) {
        // DANGER DANGER
        return game.CMilestonesReached >= i;
    }
}
ArrayAI.instance = new ArrayAI();
ArrayAI.instance.disableAlert();
// var stateDebug = false;
function stateStart(machine=undefined) {
    machine.debug("stateStart");
    ArrayAI.instance.buyUpgrades();
    ArrayAI.instance.buyAllGenerators();
    var score = parseScore();
    if (gte(score["A"],"{10, 10}")) {
        return stateAResetting;
    }
    return stateStart;
}
var minAReset = "{10, 14.14}";
function stateAResetting(machine=undefined) {
    machine.debug("stateAResetting");
    var score = parseScore();
    if (gte(score["B"],200)) {
        // buy upgrades will purchase the upgrade at 200
        buyUpgrade(2,3);
        ArrayAI.instance.buyUpgrades();
        return stateBBuying;
    }
    if (gte(score["A"], machine.get("minAReset",minAReset))) {
        ArrayAI.instance.resetA();
    }
    ArrayAI.instance.buyAGenerators();
    // From 100 B up just race to 200 B
    if (! gte(score["B"],101)) {
        ArrayAI.instance.buyBGenerators();// should we do this?
        ArrayAI.instance.buyUpgrades();
    } else {
        ArrayAI.instance.buyMaxAUpgrades();
    }
    ArrayAI.instance.buyAGenerators();
    return stateAResetting;
}

function stateBBuying(machine=undefined) {
    machine.debug("stateBBuying");
    ArrayAI.instance.buyUpgrades();
    ArrayAI.instance.buyAllGenerators();
    var score = parseScore();
    if (gte(score["B"],100000) && !machine.get("triedBChallenge",false)) {
        machine.set("triedBChallenge",true);
        machine.push(stateBBuying);
        return stateChooseChallenge;
    }
    if (gte(score["B"],"{10, 10}")) {
        machine.set("triedBChallenge",false);
        return stateBResetting;
    }
    return stateBBuying;
}

function stateBResetting(machine=undefined) {
    machine.debug("stateBResetting");
    var score = parseScore();
    if (ArrayAI.instance.isCMilestoneMet(10) || gte(score["C"],300)) {
        // buy upgrades will purchase the upgrade at 200
        console.log("Milestone met? "+ ArrayAI.instance.isCMilestoneMet(10))
        console.log(document.querySelectorAll(".CMilestone"));
        console.log("Score "+ score + " " + gte(score["C"],300));
        ArrayAI.instance.buyUpgrades();
        return stateCBuying;
    }
    var bResetScore = ArrayAI.instance.isCMilestoneMet(8)?"{10, 14.2301}":"{10, 10.01}";
    if (gte(score["B"],bResetScore)) {
        // there's going to be a problem here
        // we have to go back to Aresetting unless
        // we have 20% gain enabled        
        ArrayAI.instance.resetB();
        if (ArrayAI.instance.isBUpgradeEnabled(3)) {
            console.log("We don't have enough Cs to keep 20% B/s going");
            return stateStart;
        }
    }   
    ArrayAI.instance.buyAGenerators();
    ArrayAI.instance.buyBGenerators();
    if (ArrayAI.instance.isCMilestoneMet(9) && !ArrayAI.instance.isCMilestoneMet(10)) {
        // don't buy between 100 and 300
        if (game.CGeneratorsBought[1].toString() == "0") {
            buyGenerator(3,2); // just buy 1
        }
    } else {
        ArrayAI.instance.buyCGenerators(); 
    }
    ArrayAI.instance.buyUpgrades();
    return stateBResetting;
}

function stateCBuying(machine=undefined) {
    machine.debug("stateCBuying");
    ArrayAI.instance.buyUpgrades();
    ArrayAI.instance.buyAllGenerators();
    var score = parseScore();
    machine.set("CBuyingTicks",1+machine.get("CBuyingTicks",1));
    var cticks = machine.get("CBuyingTicks",0);
    if (cticks > 0 && (cticks % machine.get("CTicksPerChallenge",50)) == 0) {
        machine.push(stateCBuying);
        return stateChooseChallenge;
    }
    return stateCBuying;
}
function stateCResetting(machine=undefined) {
    machine.debug("stateCResetting");
    var score = parseScore();
    if (gte(score["C"],200)) {
        // buy upgrades will purchase the upgrade at 200
        ArrayAI.instance.buyUpgrades();
        return stateDBuying;
    }
    if (gte(score["B"],"{10, 10}")) {
        ArrayAI.instance.resetC();
        // we need a check here for if we achieved the C/s
        return stateStart;
    }   
    ArrayAI.instance.buyAGenerators();
    ArrayAI.instance.buyBGenerators();// should we do this?
    ArrayAI.instance.buyUpgrades();
    ArrayAI.instance.buyAGenerators();
    return stateCResetting;
}
function stateDBuying(machine=undefined) {
    machine.debug("stateDBuying");
    ArrayAI.instance.buyUpgrades();
    ArrayAI.instance.buyAllGenerators();
    if (Math.random < 0.01) {
        
    }
    
    return stateDBuying;
}
/*
var myTimerStateMachine;
var myState;
function stateMachine(startState, seconds=5) {
    myState = startState;
    myTimerStateMachine = setInterval(function() {
        myState = myState();
    }, seconds * 1000);
}
stateMachine(stateStart,5);
stateDebug = true;
*/

class ArrayStateMachine {
    constructor(start = stateStart, debug=false) {
        this.state = start;
        this.startState = start;
        this.interval = 0;
        this._debug = debug;
        this.vals = {};
        this.seconds = 5;
        this.stateStack = [];
    }
    setState( state ) {
        this.state = state;
    }
    tick() {
        this.state = this.state(this);
    }
    start(seconds = 5) {
        this.seconds = seconds;
        console.log("Starting Statemachine "+seconds+" seconds");
        this.interval = setInterval( () => this.tick(), seconds * 1000);
    }
    stop() {
        console.log("Stopping Statemachine");
        clearInterval(this.interval);
        this.interval = 0;
    }
    debug(x) {
        if (this._debug) {
            console.log(x);
        }
    }
    get(x,dfl) {
        if (x in this.vals) {
            return this.vals[x];
        } else {
            return dfl;
        }
    }
    set(x,v) {
        this.vals[x] = v;
        return v;
    }
    push(state) {
        this.stateStack.push(state);
    }
    pop(state) {
        var v = this.stateStack.pop();
        if (!v) {
            return this.startState;
        }
        return v;
    }
}

stateMachine = new ArrayStateMachine(stateStart,true);
stateMachine.start(2);
stateMachine.set("ticks",30);

function isAChallengeAvailable(oneIndex) {
    var buttons = document.querySelectorAll(".challenge.AButton");
    return (oneIndex-1 < buttons.length) &&
        document.querySelectorAll(".challenge.AButton")[oneIndex-1].style.display != "none" &&
        document.querySelectorAll(".challenge.AButton")[oneIndex-1].innerText.indexOf("[6/6]") == -1;
}

function stateChooseChallenge(machine) {
    machine.debug("ChooseChallenge");
    changeTab(3);
    // var choice = 1; // choose!
    var choice = 1+Math.floor(Math.random() * 4);
    machine.debug("Chose Challenge "+choice);
    // DANGER DANGER
    if ( isAChallengeAvailable(choice)) {
        ArrayAI.instance.disableConfirm();
        enterChallenge(choice);
        machine.set("challengeTicks",machine.get("ticks",10));
        machine.set("challenge",choice);
        return stateDoChallenge;
    }
    // Not sure what to do;
    return stateChallengeCleanUp;
}
function stateDoChallenge(machine) {
    machine.debug("StateDoChallenge");
    var ticks = machine.get("challengeTicks",0);
    machine.set("challengeTicks",ticks-1);
    var challenge = machine.get("challenge",1)    
    if (!document.getElementById("finishChallengeButton").disabled && document.getElementById("finishChallengeButton").disabled !== "") {
        finishChallenge( challenge );
        return stateChallengeCleanUp;
    }
    if (ticks <= 0) {
        enterChallenge( challenge );
        return stateChallengeCleanUp;
    }
    ArrayAI.instance.buyAllGenerators();
    ArrayAI.instance.buyUpgrades();
    return stateDoChallenge;
}
function stateChallengeCleanUp(machine) {
    ArrayAI.instance.enableConfirm();
    machine.set("challengeTicks",0);
    machine.set("challenge",0);
    return machine.pop(); 
}

stateMachine.state  = stateChooseChallenge;
stateMachine.set("ticks",50);
/*

Todo:

 Challenges.
 - enterChallenge(1) - first A challenge enter and exit
 - finisChallenge() - finish it
 - maybe a state, try challenges
 - try challenges
   - chooses a challenge
   - stays in challenge mode for N ticks
     - checks to finish challenge
   - leaves the challenge
 - when to schedule them

*/

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
