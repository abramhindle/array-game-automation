/*
    Array Game AI/State Machine - Plays Array Game for you!
    Copyright (C) 2023 Abram Hindle

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.

*/

/*

  For Array game v0.4.2
 
  Go to: https://demonin.com/games/arrayGame/

  Usage: open up firefox, open up inspector, go to console and paste
  all this code into the console. It will start playing the game for you.

  After having fun consider paying demonin for it:

  https://www.patreon.com/Demonin
*/

/*
Notes:
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
Original timers:

clearInterval(myTimerABReset);  myTimerABReset = setInterval(  () => { console.log(Date.now() + " B reset "); prestigeConfirm(2)} , 90*1000) 
myTimerABoosterators = setInterval( () => buyMaxABoosterators(), 10*1000)
myTimerABReset = setInterval(  () => prestigeConfirm(2), 30*1000)
myFastTimerBBuy = setInterval(()=>buyMaxGenerators(2,6), 11*1000)
myFastTimerABuy = setInterval(()=>buyMaxGenerators(1,6), 7*1000)
myFastTimerCBuy = setInterval(()=>buyMaxGenerators(3,6), 17*1000) 
*/

/*

  Initially I was trying to stay away from the game's state but I eventually gave up.
  So there is a mix of screen scraping and direct calls and even a bit of inspection of the global game object.

*/ 

function convertBird(x) {
    if (x[0] == "{") {
        return Number(x.split(", ")[1].replace("}","").replaceAll(",",""))
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
function lte(x,y) {
    return gte(y,x);
}
function gt(x,y) {
    var g = gte(x,y);
    var l = lte(x,y);
    return (g && l)?false:g;
}
function lt(x,y) {
    return gt(y,x);
}
function eq(x,y) {
    return lte(x,y) && gte(x,y);
}
function neq(x,y) {
    return (!eq(x,y));
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
        score["S"] = scores[scores.length-3];
        score["E"] = scores[scores.length-2];
        score["F"] = scores[scores.length-1];
        if ( scores.length > 3 ) {
            score["B"] = scores[1];
        }
        if ( scores.length > 4 ) {
            score["C"] = scores[2];
        }
        if ( scores.length > 5 ) {
            score["D"] = scores[3];
        }
        if ( scores.length > 6 ) {
            score["S"] = scores[4];
            score["E"] = scores[5];
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

// ArrayAI class is not an AI, it's just a utility.
// Initially it kept timers but we use a state machine now.
class ArrayAI {
    constructor() {
        ArrayAI.instance = this;
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
    buyCDoubler() {
        buyUpgrade(2,9); // upgrade to double C
    }
    isBUpgradeEnabled(i) {
        // 1-indexed
        return !(document.getElementsByClassName("BUpgrade")[i-1].disabled);
    }
    isBUpgradeBuyable(i) {
        return this.isBUpgradeEnabled(i);
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
    isSeparatorUpgradeBuyable(oneIndexed) {
        return game.separatorUpgradesBought[oneIndexed-1].toNumber() == 0;
    }
    buySeparatorUpgrade(oneIndexed) {
        if (this.isSeparatorUpgradeBuyable(oneIndexed)) {
            buySeparatorUpgrade(oneIndexed);
        }
    }
    buySeparatorUpgrades() {
        for (var i = 1; i <= 6; i++) {
            this.buySeparatorUpgrade(i);
        }
    }
    buySBoosts() {
        buySeparatorBoost(4);
    }
    buyUpgrades() {
        this.buyCDoubler();
        this.buyBUpgrades();
        this.buyMaxABoosterators();
        this.buyMaxAUpgrades();
        this.buySeparatorUpgrades();
    }
    buyMaxEF() {
        gainMaxArray(1)
        gainMaxArray(2)
        buyMaxGenerators(5,1)
        buyMaxGenerators(6,1)
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
        // hmmm
        this.disableConfirm();
        upgradeSeparator();
        this.enableConfirm();
        //this._reset(4);
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

// Singleton :(
ArrayAI.instance = new ArrayAI();
ArrayAI.instance.disableAlert();

function AI() {
    return ArrayAI.instance;
}

// States are functions that return states
// State: machine -> State


// var stateDebug = false;
function stateStart(machine=undefined) {
    machine.debug("stateStart");
    AI().buyUpgrades();
    AI().buyAllGenerators();
    var score = parseScore();
    if (gte(score["A"],"{10, 10}")) {
        return stateAResetting;
    }
    return stateStart;
}

// There's a bug here we transition to BBuying without our upgrade
var _minAReset = "{10, 10.01}";
var minAReset = _minAReset;
function stateAResetting(machine=undefined) {
    machine.debug("stateAResetting");
    var score = parseScore();
    if (gte(score["B"],200) && AI().isBUpgradeBuyable(3)) {
        // buy upgrades will purchase the upgrade at 200
        buyUpgrade(2,3);
        AI().buyUpgrades();
        minAReset = _minAReset;
        changeTab(1);
        // it should be buyable now right?
        // return stateBBuying;
    }
    // did we buy it already?
    if (!AI().isBUpgradeBuyable(3)) {
        console.log("OK we can skip resetting A, we get 20% already");
        changeTab(1);
        return stateBBuying;
    }
    if (gte(score["A"], machine.get("minAResetThresh","{10, 13.50}")) && minAReset == _minAReset ) {
        minAReset = "{10, 14.3201}";
        console.log("Setting min Reset to 14.3201 instead of 10.01");
    }
    if (gte(score["A"], machine.get("minAReset",minAReset))) {
        AI().resetA();
    }
    AI().buyMaxAUpgrades();
    AI().buyAGenerators();
    // From 100 B up just race to 200 B
    if (lte(score["B"],100) || gt(score["B"],200)) {
        AI().buyBGenerators();// should we do this?
        AI().buyUpgrades();
    }
    return stateAResetting;
}

function stateBBuying(machine=undefined) {
    machine.debug("stateBBuying");
    AI().buyUpgrades();
    AI().buyAllGenerators();
    var score = parseScore();
    if (gte(score["B"],100000) && !machine.get("triedBChallenge",false)) {
        machine.set("triedBChallenge",true);
        machine.push(stateBBuying);
        return stateChooseAChallenge;
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
    if (AI().isCMilestoneMet(10) || gte(score["C"],300)) {
        // buy upgrades will purchase the upgrade at 200
        console.log("Milestone met? "+ AI().isCMilestoneMet(10))
        console.log(document.querySelectorAll(".CMilestone"));
        console.log("Score "+ score + " " + gte(score["C"],300));
        AI().buyUpgrades();
        return stateCBuying;
    }
    var bResetScore = AI().isCMilestoneMet(8)?"{10, 14.2301}":"{10, 10.01}";
    if (gte(score["B"],bResetScore)) {
        // there's going to be a problem here
        // we have to go back to Aresetting unless
        // we have 20% gain enabled        
        AI().resetB();
        if (AI().isBUpgradeEnabled(3)) {
            console.log("We don't have enough Cs to keep 20% B/s going");
            return stateStart;
        }
    }   
    AI().buyAGenerators();
    AI().buyBGenerators();
    if (AI().isCMilestoneMet(9) && !AI().isCMilestoneMet(10)) {
        // don't buy between 100 and 300
        if (game.CGeneratorsBought[1].toString() == "0") {
            buyGenerator(3,2); // just buy 1
        }
    } else {
        AI().buyCGenerators(); 
    }
    AI().buyUpgrades();
    // do we do a challenge?
    var ticks = machine.inc("BResetting Ticks");
    if (ticks > 0 && ticks % machine.get("BTicksPerChallenge",200) == 0) {
        machine.push(stateBResetting);
        return stateChooseAChallenge;
    }
    return stateBResetting;
}

function stateCBuying(machine=undefined) {
    machine.debug("stateCBuying");
    AI().buyUpgrades();
    AI().buyAllGenerators();
    var score = parseScore();
    machine.set("CBuyingTicks",1+machine.get("CBuyingTicks",1));
    var cticks = machine.get("CBuyingTicks",0);
    if (cticks > 0 && (cticks % machine.get("CTicksPerChallenge",200)) == 0) {
        machine.push(stateCBuying);
        return stateChooseChallenge;
    }
    if (gte(score["C"],"{10, 10.01}")) {
        return stateCResetting;
    }
    return stateCBuying;
}
function stateCResetting(machine=undefined) {
    machine.debug("stateCResetting");
    var score = parseScore();
    if (gte(score["D"],200)) {
        // buy upgrades will purchase the upgrade at 200
        AI().buyUpgrades();
        return stateDBuying;
    }
    if (gte(score["C"],"{10, 10}")) {
        AI().resetC();
        // we need a check here for if we achieved the C/s
        // if 
        // return stateStart;
    }   
    AI().buyAGenerators();
    AI().buyBGenerators();// should we do this?
    AI().buyUpgrades();
    AI().buyAGenerators();
    return stateCResetting;
}
function stateDBuying(machine=undefined) {
    machine.debug("stateDBuying");
    AI().buyUpgrades();
    AI().buyAllGenerators();
    machine.set("DBuyingTicks",1+machine.get("DBuyingTicks",1));
    var cticks = machine.get("DBuyingTicks",0);
    if (cticks > 0 && (cticks % machine.get("DTicksPerChallenge",200)) == 0) {
        machine.push(stateDBuying);
        return stateChooseChallenge;
    }
    var score = parseScore();
    if (gte(score["D"],"{10, 12.01}")) {
        // time to build up to a reset
        return stateDResetting;
    }
    return stateDBuying;
}
function stateDResetting(machine=undefined) {
    machine.debug("stateDResetting");
    var score = parseScore();
    if (gte(score["D"],machine.get("DReset","{10, 17.3201}"))) {
        AI().resetD();
        // we need a check here for if we achieved the D/s
        // probably we're fine, the state machine will run its course
        if (!AI().isSeparatorUpgradeBuyable(5)) {
            changeTab(5);
            return stateSeparator;
        } else {
            return stateStart;
        }
    }   
    AI().buyAGenerators();
    AI().buyBGenerators();
    AI().buyCGenerators();
    AI().buyUpgrades();
    var ticks = machine.inc("DResettingTicks",0);
    if (ticks > 0 && (ticks % machine.get("DResettingTicksPerChallenge",600)) == 0) {
        machine.push(stateDResetting);
        return stateChooseChallenge;        
    }
    return stateDResetting;
}
function stateSeparator(machine) {
    machine.debug("stateSeparator");
    var score = parseScore();
    AI().buyAllGenerators();
    AI().buyUpgrades();
    AI().buySBoosts();
    AI().buyMaxEF();
    return stateSeparator;
}

function isAChallengeAvailable(oneIndex) {
    var buttons = document.querySelectorAll(".challenge.AButton");
    return (oneIndex-1 < buttons.length) &&
        document.querySelectorAll(".challenge.AButton")[oneIndex-1].style.display != "none" &&
        document.querySelectorAll(".challenge.AButton")[oneIndex-1].innerText.indexOf("[6/6]") == -1;
}
function isBChallengeAvailable(oneIndex) {
    var buttons = document.querySelectorAll(".challenge.BButton");
    return (oneIndex-1 < buttons.length) &&
        document.querySelectorAll(".challenge.BButton")[oneIndex-1].style.display != "none" &&
        document.querySelectorAll(".challenge.BButton")[oneIndex-1].innerText.indexOf("[6/6]") == -1;
}

function isChallengeAvailable(num) {
    if (num >= 5) {
        // B Challenge
        return isBChallengeAvailable(num-4);
    }
    return isAChallengeAvailable(num);
}

function stateChooseChallenge(machine) {
    machine.debug("ChooseChallenge");
    changeTab(3);
    return stateChooseChallengeE;
}
function stateChooseAChallenge(machine) {
    machine.debug("ChooseAChallenge");
    changeTab(3);
    return stateChooseAChallengeE;
}
function availableChallenges() {
    var arr = [];
    for (var i = 0 ; i < 8; i++ ) {
        if (isChallengeAvailable(i+1)) {
            arr.push(i+1);
        }
    }
    return arr;
}
function choose(arr) {
    return arr[Math.floor(Math.random()*arr.length)];
}
function chooseChallenge() {
    var arr = availableChallenges();
    if (arr.length == 0) {
        return false;
    }
    return choose(arr);
}
function chooseAChallenge() {
    var arr = availableChallenges();
    arr = arr.filter( x => x <= 4 );
    if (arr.length == 0) {
        return false;
    }
    return choose(arr);
}

function _stateChooseChallengeE(machine,name,chooser=chooseChallenge) {
    // private version of stateChooseChallengeE to allow for As or A+B
    machine.debug(name);
    var choice = chooser();
    // DANGER DANGER
    if ( choice && isChallengeAvailable(choice)) {
        machine.debug("Chose Challenge "+choice);
        AI().disableConfirm();
        enterChallenge(choice);
        machine.set("challengeTicks",machine.get("ticks",10));
        machine.set("challenge",choice);
        return stateDoChallenge;
    }
    // Not sure what to do;
    console.log("Challenge Wasn't Available? "+choice);
    return stateChallengeCleanUp;
}
function stateChooseChallengeE(machine) {
    return _stateChooseChallengeE(machine,"ChooseChallengeE",chooseChallenge);
}
function stateChooseAChallengeE(machine) {
    return _stateChooseChallengeE(machine,"ChooseAChallengeE",chooseAChallenge);
}


function stateDoChallenge(machine) {
    machine.debug("StateDoChallenge");
    var ticks = machine.get("challengeTicks",0);
    machine.set("challengeTicks",ticks-1);
    var challenge = machine.get("challenge",1)    
    if (!document.getElementById("finishChallengeButton").disabled && document.getElementById("finishChallengeButton").disabled !== "") {
        console.log("Finishing Challenge "+challenge);
        finishChallenge( challenge );
        return stateChallengeCleanUp;
    }
    if (ticks <= 0) {
        console.log("Bailing on Challenge "+challenge);
        enterChallenge( challenge );
        return stateChallengeCleanUp;
    }
    AI().buyAllGenerators();
    AI().buyUpgrades();
    return stateDoChallenge;
}
function stateChallengeCleanUp(machine) {
    AI().enableConfirm();
    machine.set("challengeTicks",0);
    machine.set("challenge",0);
    return machine.pop(); 
}

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
    inc(x) {
        var v = 1+this.get(x,0);
        this.set(x,v);
        return v;
    }
}

stateMachine = new ArrayStateMachine(stateStart,true);
stateMachine.start(2);

