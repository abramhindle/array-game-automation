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

  Initially I was trying to stay away from the game's state but I eventually gave up.
  So there is a mix of screen scraping and direct calls and even a bit of inspection of the global game object.

*/ 

function ensureNumber(x) {
    return Number((""+x).replaceAll(",",""));
}
function convertBird(x) {
    if (x[0] == "{") {
        return Number(x.split(", ")[1].replace("}","").replaceAll(",",""))
    } else {
        return Math.log10(ensureNumber(x));
    }
}
function gte(x,y) {
    if (x[0] == "{" || y[0] == "{") {
        return convertBird(x) >= convertBird(y);
    } else {
        return ensureNumber(x) >= ensureNumber(y);
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
    var entries = ["A","B","C","D","E","F"];
    for (var i = 0; i < entries.length; i++) {
        score[entries[i]] = format(game.array[i],0,9,"Array");
    }
    score["S"] = format(game.separators[0],0,9,"Array");
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
        var upgrades = document.getElementsByClassName("BUpgrade");
        if (i-1 >= upgrades.length) {
            return true;
        }
        return !(upgrades[i-1].disabled);
    }
    isBUpgradeBuyable(i) {
        return this.isBUpgradeEnabled(i);
    }
    buyBUpgrades() {
        for (var i = 1; i <= 11; i++) {
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
        return game.separatorUpgradesBought.length >= oneIndexed && game.separatorUpgradesBought[oneIndexed-1].toNumber() == 0;
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
        if (game.separatorBoosts && game.separatorBoosts.length >= 3) {
            calculateUnspentSeparators();
            buySeparatorBoost(4);
        }
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
        unlockSeparators();
        upgradeSeparator();
        this.enableConfirm();
        // just make sure this is ok.
        calculateUnspentSeparators();
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
ArrayAI.instance.disableConfirm();

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
    AI().buySBoosts();
    AI().buyMaxEF();
    var score = parseScore();
    if (doSeparatorCheckAndReset(machine)) {
        return stateStart;
    }
    if (gte(score["A"],"{10, 10}")) {
        return stateAResetting;
    }
    return stateStart;
}

// Returns true if we could reset and buy Keep A & B Challenges
function separatorCheck(machine) {
    var separatorPoints = game.separatorPoints;
    // check for the first upgrade, check for the 5th upgrade
    return (separatorPoints.gte(5) && game.separatorUpgradesBought.length >= 1 &&  game.separatorUpgradesBought[0] == 0) ||  (separatorPoints.gte(123) && game.separatorUpgradesBought.length >= 5 &&  game.separatorUpgradesBought[4] == 0) || (separatorPoints.gte(123+250000) && game.separatorUpgradesBought.length >= 6 &&  game.separatorUpgradesBought[5] == 0) ;
}
function separatorResetAndBuy(machine) {
        var separatorPoints = game.separatorPoints;
        if (game.unspentSeparatorPoints && game.unspentSeparatorPoints.lt(5)) {
            console.log("We are resetting to ensure we buy an SP upgrade!");
            ArrayAI.instance.disableConfirm();
            refundSeparatorPoints(); // this is a reset!
            ArrayAI.instance.enableConfirm();
        }
        console.log("Buying Separator upgrades");
        AI().buyUpgrades();
        AI().buySBoosts();
        AI().buyMaxEF();
}
function doSeparatorCheckAndReset(machine) {
    if (separatorCheck(machine)) {
        separatorResetAndBuy(machine);
        return true;
    }
    return false;
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
        ArrayAI.instance.disableConfirm();
        AI().resetA();
        ArrayAI.instance.enableConfirm();
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
    // var bResetScore = AI().isCMilestoneMet(8)?"{10, 14.2301}":"{10, 10.01}";
    var bResetScore = "{10, 10.01}";
    if (gte(score["B"],bResetScore)) {
        // there's going to be a problem here
        // we have to go back to Aresetting unless
        // we have 20% gain enabled
        AI().disableConfirm()
        AI().resetB();
        AI().enableConfirm()
        if (AI().isBUpgradeEnabled(3)) {
            console.log("We don't have enough Cs to keep 20% B/s going");
            return stateStart;
        }
    }
    // is this fast enough?
    // AI().buyAGenerators();
    AI().buyUpgrades(); // upgrades before A generators?
    score = parseScore();
    if (gte(score["B"],machine.get("BResetHoldMin",1e9)) && lt(score["B"],"{10, 10}")) {
        // don't buy
        console.log("Not buying B");
    } else {
        AI().buyBGenerators();
    }
    if (AI().isCMilestoneMet(9) && !AI().isCMilestoneMet(10)) {
        // don't buy between 100 and 300
        if (game.CGeneratorsBought[1].toString() == "0") {
            buyGenerator(3,2); // just buy 1
        }
    } else {
        AI().buyCGenerators(); 
    }
    AI().buyAGenerators();

    // do we do a challenge?
    var ticks = machine.inc("BResetting Ticks");
    if (ticks > 0 && ticks % machine.get("BTicksPerChallenge",600) == 0) {
        machine.push(stateBResetting);
        return stateChooseAChallenge;
    }
    return stateBResetting;
}

function stateCBuying(machine=undefined) {
    machine.debug("stateCBuying");
    var score = parseScore();
    machine.set("CBuyingTicks",1+machine.get("CBuyingTicks",1));
    var cticks = machine.get("CBuyingTicks",0);
    if (cticks > 0 && (cticks % machine.get("CTicksPerChallenge",200)) == 0) {
        machine.push(stateCBuying);
        return stateChooseChallenge;
    }
    // if (gte(score["C"],"{10, 10.01}")) {
    if (gte(score["C"],"{10, 9.2}")) {
        return stateCResetting;
    }
    AI().buyUpgrades();
    AI().buyAllGenerators();
    return stateCBuying;
}
function doesDSelfGenerate() {
    return game.DMilestonesReached >= 8 
}

// there could be some bugs here about the resetC and transitioning to DBuying
function stateCResetting(machine=undefined) {
    machine.debug("stateCResetting");
    var score = parseScore();
    if (gte(score["D"],100) || doesDSelfGenerate()) {
        // buy upgrades will purchase the upgrade at 100
        AI().buyUpgrades();
        return stateDBuying;
    }
    if (gt(score["C"],"{10, 10}")) {
        AI().disableConfirm();
        AI().resetC();
        AI().enableConfirm();
        // we need a check here for if we achieved the C/s
        // if 
        return stateStart;
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
    if (eq(score["S"],1) && gte(score["D"],"{10, 10.00}")) {
        AI().disableConfirm();
        AI().resetD();
        AI().enableConfirm();
        AI().buyUpgrades();
        AI().buySBoosts();
        AI().buyMaxEF();
        return stateStart;
    }
    if (gte(score["D"],"{10, 12.01}")) {
        // time to build up to a reset
        return stateDResetting;
    }
    if (gt(score["D"],"{10, 10.00}")) {
        if (! machine.get("unlocksep",0)) {
            machine.set("unlocksep",1);
	    unlockSeparators();
	    console.log("Unlocked separators!");
        }
    }
    return stateDBuying;
}
function stateDResetting(machine=undefined) {
    machine.debug("stateDResetting");
    var score = parseScore();
    if (!AI().isSeparatorUpgradeBuyable(5)) {
        console.log("I think we don't need to reset D, we already get separators automatically");
        changeTab(5);
        return stateSeparator;        
    }    
    // if we haven't seen a 14.14 reset now
    var override = false;
    if (!machine.get("D14",false) && gt(score["D"],"{10, 14.32}")) {
        machine.set("D14", true);
        override = true;
    }
    if (override || gte(score["D"],machine.get("DReset","{10, 17.3201}"))) {
        console.log("Resetting D");
        AI().disableConfirm();
        AI().resetD();
        AI().enableConfirm();
        AI().buyUpgrades();
        AI().buySBoosts();
        AI().buyMaxEF();
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
    if (doSeparatorCheckAndReset(machine)) {
        return stateStart;
    }
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

