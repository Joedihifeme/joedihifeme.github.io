import { display } from "./functions.js";
import Gold from "./gold.js"

class Card {

	abilityMap = new Map ([
		["gain", ["+1/+0", "+2/+0", "+0/+1", "+0/+2",
			"+0/+6", "+1/+2", "+2/+4", "+0/-2", "-2/-4", 
			"-5/-10", "(l)", "(i)", "(t)", "(f)", "(w)2", 
			"(v)1", "(v)2", "1 gold", "3 gold", "x gold", 
			"spellproof", "stasis", "1 life", "all keywords"]],
		["give", ["+1/+0", "+2/+0", "+0/+1", "+0/+2",
			"+0/+6", "+1/+2", "+2/+4", "+0/-2", "-2/-4", 
			"-5/-10", "(l)", "(i)", "(t)", "(f)", "(w)2", 
			"(v)1", "(v)2", "1 gold", "3 gold", "x gold", 
			"spellproof", "stasis", "1 life", "all keywords"]],
		["get", ["+1/+0", "+2/+0", "+0/+1", "+0/+2",
			"+0/+6", "+1/+2", "+2/+4", "+0/-2", "-2/-4", 
			"-5/-10", "(l)", "(i)", "(t)", "(f)", "(w)2", 
			"(v)1", "(v)2", "1 gold", "3 gold", "x gold", 
			"spellproof", "stasis", "1 life", "all keywords"]],
		["search", ["a creature", "a consumable", "a card", "3 cards"]],
		["discard", ["x cards", "a card", "2 random cards"]],
		["draw", ["2", "3"]],
		["deal", ["same damage"]],
		["heal", "all damage"],
		["lose", "3 health"],
		["reset", "haste"],
		["arrange", "in any way"],
		["pay", "same gold cost"],
		["cost", "1 gold less"],
		["use", "(c)"],
		["put", "this"],
		["have", "0 atck"]
	]);

	abilityArr = ["destroy", "clone"];

	targetTypes = [
    "in your hand", "all consumables", "all other consumables", "all your creatures", 
		"all opposing creatures" ,"freefall","target opponent's creature", "opponent", 
		"opponent's turn", "your deck","your entire deck", "your hand", "opponent's hand", 
		"all target creatures", "target creature in discard pile","target creature", 
		"target structure", "target card", "battlefield"
  ];

	specialConsumables = ["annoy"];

	constructor(name, cost, ability, cardType, targets=false) {
		this.name = name;
		this._cost = new Gold(cost);
		this._targets = [];
    this.multiplier = cost.includes("x");
		this.discarded = false;
		this.OWNER = undefined;
		this._ability = null;
		this.clone = false;
		this.copyCounter = 0;
		this.cardType = cardType;

		if (ability !== "") {
			this._ability = [];
			this.initialiseAbility(ability.toLowerCase());
		} else this._ability = null;
		this.DISPLAYED_ABILITY = ability;

		this.special = this.specialConsumables.includes(this.rootName.toLowerCase()) ? true : false;

		if (targets && !this.special) this.initialiseTargets(ability.toLowerCase());

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
		return this._ability[0];
	}

	get targets() {
    return this._targets;
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
		const arr = [];

		this.abilityMap.forEach((value, key) => {
			if (ability.includes(key)) {

				if (value instanceof Array) {
					value.forEach(element => {
						if (ability.includes(element)) {
							foundAbility = true;
							arr.push(new Map([[key, element]]));
						}
					});
				} 

				else {
					if (ability.includes(value)) {
						foundAbility = true;
						arr.push(new Map([[key, value]]));
					}
				}
			}
		});

		this.abilityArr.forEach(element => {
			if (ability.includes(element)) {
				foundAbility = true;
				arr.push(element);
			}
		});

		if (!foundAbility) {
			throw new Error(`Ability not found for ${this.name}`);
		}

		this._ability.push(arr);
	}

	initialiseTargets(ability) {
    let foundTarget = false;

    for (let target of this.targetTypes) {
      if (ability.includes(target)) {
        foundTarget = true;
        this._targets.push(target);

        if (ability.includes("and") || ability.includes("then") || ability.includes(",")) {
          continue;
        } 

        break;
      }
    }

		if ((!foundTarget) && this.cardType === "creature") {
			this._targets.push("general");
		} else if (!foundTarget) {
      throw new Error(`Target not found for ${this.name}`);
    }
  }

	findTargets() {
		const board = this.OWNER.flatBoard
    const creatures = board.filter(creature => { return creature.cardType === "creature"; });
    const targets = this.targets; 
    if (targets.length < 1) return false;

    if (targets.includes("cards in your hand")) {
      if (this.OWNER.hand.length < 1) { return false; } 

      this.OWNER.hand.forEach(card => { this.activateAbility(card); });
      
      return true;
    }

    if (targets.includes("all your creatures")) {
      if (board.length < 1) { return false; }

      creatures.forEach(creature => { this.activateAbility(creature); });

      
      return true;
    }

		if (targets.includes("all opposing creatures")) {
			const oCreatures = this.OWNER.opponent.flatBoard.filter(card => { return card.cardType === "creature" });

			if (oCreatures.length < 1) return false;

			oCreatures.forEach(creature => { this.activateAbility(creature); });
			return true;
		}

    if (targets.includes("all other consumables")) {
      let found = false;
      const callback = function(card) { 
        if ((card.cardType === "consumable" || card.cardType === "dConsumable") && card !== this) {
          found = true;
          this.activateAbility(card); 
        }
      }.bind(this);

      this.OWNER.deck.forEach(callback);
      this.OWNER.hand.forEach(callback);
      board.forEach(callback);
      this.OWNER.discards.forEach(callback);

      if (found) {  return true; } else return false;
    }

    if (targets.includes("target opponent's creature")) {
      let i = 0;
      this.OWNER.disable();
      this.OWNER.opponent.disable("board");
      this.OWNER.opponent.flatBoard.forEach(creature => {
        if (!creature.cardType === "creature") { return; }
        if (this.name.toLowerCase().includes("destruction")) {
          if (creature.checkKeyword("I")) return;
        }

        i++;
        creature.addTargetHandler = () => {
          this.activateAbility(creature);

          if (creature.addTargetHandler) {
            creature.span.onclick = null;
            delete creature.addTargetHandler;
          }

          creatures.forEach(c => {
            if (c.addTargetHandler) {
              c.span.onclick = null;
              delete c.addTargetHandler;
            }
          });

          
          this.OWNER.enable();
          this.OWNER.opponent.enable("board");
          display(`${this.OWNER.name} to move`);
        }

        creature.span.onclick = creature.addTargetHandler;
        display(`${this.OWNER.name}, click on the card that will be affected by ${this.name}`);
      });

      if (i < 1) { 
        this.OWNER.enable();
        this.OWNER.opponent.enable(); 
        return false; 
      } else return true;

    } else if (targets.includes("opponent's hand")) {
      if (this.OWNER.opponent.hand.length < 1) { return false; }

      this.activateAbility(this.OWNER.opponent.hand); 
      
      return true;
      
    } else if (targets.includes("opponent")) {
      this.activateAbility(this.OWNER.opponent);
      
      return true;
    }

    if (targets.includes("your deck")) {
      if (this.OWNER.deck.length < 1) { return false; }

      this.OWNER.disable();
      this.activateAbility(this.OWNER.deck); 
      this.OWNER.enable();
      
      return true;
    }

    if (targets.includes("your hand")) {
      if (this.OWNER.hand.length < 1) { return false; }

      this.activateAbility(this.OWNER.hand); 
      
      return true;
    }

    if (targets.includes("all target creatures")) {
      if (board.length < 1) { return false; }

      board.forEach(card => { this.activateAbility(card); });    
      
      return true;
    }

    else if (targets.includes("target creature")) {
      let i = 0;
      this.OWNER.disable();

      creatures.forEach(creature => {
        if (!creature.cardType === "creature") { return; }

        i++;
        creature.addTargetHandler = () => {
          this.activateAbility(creature);

          if (creature.addTargetHandler) {
            creature.span.onclick = null;
            delete creature.addTargetHandler;
          }

          creatures.forEach(c => {
            if (c.addTargetHandler) {
              c.span.onclick = null;
              delete c.addTargetHandler;
            }
          });

          
          this.OWNER.enable();
          display(`${this.OWNER.name} to move`);
        }

        creature.span.onclick = creature.addTargetHandler;
        display(`${this.OWNER.name}, click on the card that will be affected by ${this.name}`);
      });

      if (i < 1) { this.OWNER.enable(); return false; } else return true;
    }

    if (targets.includes("battlefield")) {
      if (board.length < 1) return false;

      let affordable = board.find(card => { return this.OWNER.gold >= card.cost });
      if (!affordable) return false;

      this.activateAbility(board); 
      
      return true;
    }

    if (targets.includes("freefall")) {
      const freefall = this.OWNER.discards.filter(card => { return card.cardType === "creature"; });
      if (freefall.length < 1) return false;
      
      freefall.forEach(creature => { this.activateAbility(creature); });
      
      return true;
    }

		if (targets.includes("general")) { this.activateAbility(this); return true; }

    console.log(`Target in targets not recognised: ${targets}; for ${this.name}`);
    return false;
	}

	activateAbility(target) {
		if (this._ability === null) return;

		for (let ability of this.ability) {
			if (ability instanceof Map) {

				if (ability.has("gain") || ability.has("give") || ability.has("get")) {
					for (let stat of ability.values()) {
						if (target.keywordArr.includes(stat.substr(0, 3).toUpperCase())) {
							target.addKeyword(stat);
						} else if (stat.includes("gold")) {
							target.addGold(Number(stat));
						} else {
							target.changeStats(stat);
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
								if (card.legendary) return;
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

	deactivateAbility(target) {
		if (this._ability === null) return;

		for (let ability of this.ability) {
			if (ability instanceof Map) {
				if (ability.has("gain") || ability.has("give") || ability.has("gets")) {
					for (let stat of ability.values()) {
						if (target.keywordArr.includes(stat.substr(0, 3).toUpperCase())) {
							target.removeKeyword(stat);
						} else if (stat.includes("gold")) {
							target.spendGold(Number(stat));
						} else {
							target.changeStats(stat, reverse=true);
						}
					}
				}
			}
		}
	}
}

export default Card;