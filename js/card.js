import { display } from "./functions.js";
import Gold from "./gold.js"

class Card {

	abilityMap = new Map ([
		["gain", ["+1/+2", "+2/+4", "-2/-4", "-5/-10", 
			"(l)", "(i)", "(t)", "(f)", "(w)2", "(v)1", 
			"+1atck", "6hp", "3 gold", "x gold", "spellproof", "stasis"]],
		["give", ["+1/+2", "+2/+4", "-2/-4", "-5/-10", 
			"(l)", "(i)", "(t)", "(f)", "(w)2", "(v)1", 
			"+1atck", "6hp", "3 gold", "x gold", "spellproof", "stasis"]],
		["gets", ["+1/+2", "+2/+4", "-2/-4", "-5/-10", 
			"(l)", "(i)", "(t)", "(f)", "(w)2", "(v)1", 
			"+1atck", "6hp", "3 gold", "x gold", "spellproof", "stasis"]],
		["lose", "3 health"],
		["reset", "haste"],
		["draw", "3"],
		["arrange", "in any way"],
		["discard", ["x cards", "a card"]],
		["pay", "same mana cost"]
	]);

	abilityArr = ["destroy", "clone"];

	constructor(name, cost, ability=null, targets=null) {
		this.name = name;
		this._cost = new Gold(cost);
		this.discarded = false;
		this.OWNER = undefined;
		this._ability = null;
		this.clone = false;
		this.copyCounter = 0;

		//creatures do not have abilities (yet) so this will be skipped during their initialisation
		if (ability !== null && targets !== null) {
			this._ability = [];
			this.initialiseAbility(ability.toLowerCase());
			this.DISPLAYED_ABILITY = ability;
		}

		this.span = document.createElement("span");
		this.span.setAttribute("class", "card-display");
		this.span.setAttribute("id", `${this.name}`);
	}

	//This method will be used to compare cards (with their duplicates)
	get rootName() {
		let ogName = this.name.replaceAll("I", "");
		return ogName;
	}

	get cost() {
		return this._cost.value;
	}

	get dAbility1 () {
    return this.DISPLAYED_ABILITY.toLowerCase();
  }

	get ability() {
		return this._ability;
	}

	duplicate() {
		const dup = Object.create(this);
		this.copyCounter++;
		if (this.copyCounter > 2) {
			dup.name = dup.rootName;
			for (let i = 0; i < this.copyCounter; i++) {
				dup.name += "I"
			}
		} else dup.name += " I";
		dup.span = this.span.cloneNode();
		dup.span.setAttribute("id", `${dup.name}`);
		return dup;
	}

	//only used before start of game
	copyCard() {
		const copy = this.duplicate();
		copy.name += "I";
		copy.span = this.span.cloneNode();
		copy.span.setAttribute("id", `${copy.name}`);
		return copy;
	}

	play() {
		this.OWNER.playCard(this);
	}

	discard() {
		this.discarded = true;
		this.span.remove();
		this.span.onclick = null;
		this.span.style.borderColor = this.span.style.color;

		this.reviveHandler = this.revive.bind(this);
		this.span.onclick = this.reviveHandler;
		
	}

	revive(paid=true) {
		if (this.reviveHandler) {
			this.span.onclick = null;
			delete this.reviveHandler;
		}

		this.OWNER.reviveCard(this, paid);

		this.playHandler = this.play.bind(this);
		this.span.onclick = this.playHandler;
	}
	
	vanish() {
		delete this;
	}

	initialiseAbility(ability) {
		let foundAbility = false;

		this.abilityMap.forEach((value, key) => {
			if (ability.includes(key)) {

				if (value instanceof Array) {
					value.forEach(element => {
						if (ability.includes(element)) {
							foundAbility = true;
							this._ability.push(new Map([[key, element]]));
						}
					});
				} 

				else {
					if (ability.includes(value)) {
						foundAbility = true;
						this._ability.push(new Map([key, value]));
					}
				}
			}
		});

		this.abilityArr.forEach(element => {
			if (ability.includes(element)) {
				foundAbility = true;
				this._ability.push(element);
			}
		});

		if (!foundAbility) {
			throw new Error(`Ability not found for ${this.name}`);
		}
	}

	activateAbility(target) {
		if (this._ability === null) {
			return;
		}

		for (let ability of this.ability) {
			if (ability instanceof Map) {

				if (ability.has("gain") || ability.has("give") || ability.has("gets")) {
					for (let stat of ability.values()) {
						if (target.keywordArr.includes(stat.substr(0, 3).toUpperCase())) {
							target.addKeyword(stat);
						} else if (stat.includes("atck")) {
							target.changeStats("attack", stat[1]);
						} else if (stat.includes("hp")) {
							target.changeStats("health", stat[0]);
						} else if (stat.includes("gold")) {
							target.addGold(Number(stat));
						} else {
							target.changeStats("both", stat);
						}
					}

				} else if (ability.has("discard")) {
					for (let number of ability.values()) {
						if (number.includes("a card")) {
							this.OWNER.opponent.disable();

							target.forEach(card => {
								card.addTargetHandler = () => {
									target.forEach(c => {
										if (c.addTargetHandler) {
											c.span.onclick = null;
											delete c.addTargetHandler
										}
									});

									card.OWNER.discard(card);
									card.OWNER.enable();
									display(`${card.OWNER.opponent.name} to move`);
								}

								card.span.onclick = card.addTargetHandler;
							});

							display(`${this.OWNER.name}, discard a card`);
						}
					}

				} //else if (ability.has("draw"))
			
			} else {
				if (ability === "clone") {
					this.OWNER.opponent.disable();

							target.forEach(card => {
								card.addTargetHandler = () => {
									target.forEach(c => {
										if (c.addTargetHandler) {
											c.span.onclick = null;
											delete c.addTargetHandler
										}
									});

									const clone = card.duplicate();
									clone.clone = true;
									card.OWNER.hand.push(clone);
									card.OWNER.div.hand.appendChild(clone.span);
									card.OWNER.playCard(clone);
									card.OWNER.enable();
									display(`${card.OWNER.name} to move`);
								}

								card.span.onclick = card.addTargetHandler;
							});

							display(`${this.OWNER.name}, clone a card on the board`);
				}
			}
		}
	}
}

export default Card;