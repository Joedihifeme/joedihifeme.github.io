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
		["search", ["a card", "3 cards"]],
		["discard", ["x cards", "a card"]],
		["lose", "3 health"],
		["reset", "haste"],
		["draw", "3"],
		["arrange", "in any way"],
		["pay", "same gold cost"],
		["cost", "1 gold less"]
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

	alterGold(callback, amount) {
		callback(amount);
		this.updateSpan();
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
		dup._cost = new Gold(dup._cost.value);
		if (dup._cost2) dup._cost2 = new Gold(dup._cost2.value);
		if (this._ability !== null) dup._ability = Object.create(dup._ability);
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

		setTimeout(() => {
			this.reviveHandler = this.revive.bind(this);
			this.span.onclick = this.reviveHandler;
		}, 1);
		
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
						this._ability.push(new Map([[key, value]]));
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
								if (card.checkKeyword("I")) return;
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

				} else if (ability.has("search")) {
					let max = 0;
					let i = 0;
					for (let number of ability.values()) {
						if (number[0] === "a") {
							max += 1;
						} else max += Number(number[0]);
					}

					this.OWNER.div.populateModal(target);
					target.forEach(card => {
						card.drawHandler = () => {
							if (card.drawHandler) {
								card.span.onclick = null;
								delete card.drawHandler;
							}

							card.OWNER.drawSpecificCard(card);
							i++;

							if (i === max) {
								target.forEach(c => {
									if (c.drawHandler) {
										c.span.onclick = null;
										delete c.drawHandler;
									}
								});

								card.OWNER.div.clearModal();
								card.OWNER.div.closeModal();
							}
						}
						card.span.onclick = card.drawHandler;
					});
					this.OWNER.div.modalText.innerHTML = `${this.OWNER.name}, pick a card`;
					this.OWNER.div.openModal();

				} else if (ability.has("cost")) {
					for (let cost of ability.values()) {
						if (cost.includes("1 gold less")) {
							target.alterGold(target._cost.subtract.bind(target._cost), 1);
							if (target._cost2) target.alterGold(target._cost2.subtract.bind(target._cost2), 1);
						}
					}
				} else if (ability.has("lose")) {
					for (let number of ability.values()) {
						if (number.includes("3 health")) {
							this.OWNER.health -= 3;
							this.OWNER.deathCheck();

							if (this.OWNER.killed) {
								display(`${this.opponent.name} has won!<br>Reload the page to play again.`);
      					return;
							}
						}
					}
				} else if (ability.has("draw")) {
					for (let number of ability.values()) {
						this.OWNER.drawCard(Number(number));
						display(`${this.OWNER.name} to move`);
					}
				}
			
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
									card.OWNER.playCard(clone, this);
									card.OWNER.enable();
									display(`${card.OWNER.name} to move`);
								}

								card.span.onclick = card.addTargetHandler;
							});

							display(`${this.OWNER.name}, clone a card on the board`);
							
				} else if (ability === "destroy") {
					target.OWNER.discard(target);
				}
			} 
		}
	}
}

export default Card;