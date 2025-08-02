import { display, copy } from "./functions.js";
import Gold from "./gold.js"

class Card {

	abilityMap = new Map ([
		["heal", "all damage"],
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
		["gets", ["+1/+0", "+2/+0", "+0/+1", "+0/+2",
			"+0/+6", "+1/+2", "+2/+4", "+0/-2", "-2/-4", 
			"-5/-10", "(l)", "(i)", "(t)", "(f)", "(w)2", 
			"(v)1", "(v)2", "1 gold", "3 gold", "x gold", 
			"spellproof", "stasis", "1 life", "all keywords"]],
		["search", ["a creature", "a consumable", "a card", "3 cards"]],
		["discard", ["x cards", "a card", "2 random cards"]],
		["draw", ["2", "3"]],
		["deal", ["same damage"]],
		["lose", "3 health"],
		["reset", "haste"],
		["arrange", "in any way"],
		["pay", "same gold cost"],
		["cost", "1 gold less"],
		["use", "(c)"],
		["put", "this"],
		["retains", "buffs"],
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
		if (this._ability !== null) dup._ability = copy(dup._ability, true);
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

	findTargets(mode) {
		const board = this.OWNER.flatBoard
    const creatures = board.filter(creature => { return creature.cardType === "creature"; });
    const targets = this.targets; 
    if (targets.length < 1) return false;

    if (targets.includes("cards in your hand")) {
      if (this.OWNER.hand.length < 1) { return false; } 

      this.OWNER.hand.forEach(card => { 
				if (mode === "activate") this.activateAbility(card); else this.deactivateAbility(card); 
			});
      
      return true;
    }

    if (targets.includes("all your creatures")) {
      if (board.length < 1) { return false; }

      creatures.forEach(creature => { 
				if (mode === "activate") this.activateAbility(creature); else this.deactivateAbility(creature) ;
				});

      
      return true;
    }

		if (targets.includes("all opposing creatures")) {
			const oCreatures = this.OWNER.opponent.flatBoard.filter(card => { return card.cardType === "creature" });

			if (oCreatures.length < 1) return false;

			oCreatures.forEach(creature => { 
				if (mode === "activate") this.activateAbility(creature); else this.deactivateAbility(creature);
				});
			return true;
		}

    if (targets.includes("all other consumables")) {
      let found = false;
      const callback = function(card) { 
        if ((card.cardType === "consumable" || card.cardType === "dConsumable") && card !== this) {
          found = true;
          if (mode === "activate") this.activateAbility(card); else this.deactivateAbility(card); 
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
          if (mode === "activate") this.activateAbility(creature); else this.deactivateAbility(creature);

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

      if (mode === "activate") this.activateAbility(this.OWNER.opponent.hand); 
			else this.deactivateAbility(this.OWNER.opponent.hand);
      
      return true;
      
    } else if (targets.includes("opponent")) {
      if (mode === "activate") this.activateAbility(this.OWNER.opponent); 
			else this.deactivateAbility(this.OWNER.opponent);
      
      return true;
    }

    if (targets.includes("your deck")) {
      if (this.OWNER.deck.length < 1) { return false; }

      this.OWNER.disable();
      if (mode === "activate") this.activateAbility(this.OWNER.deck); 
			else this.deactivateAbility(this.OWNER.deck);
      this.OWNER.enable();
      
      return true;
    }

    if (targets.includes("your hand")) {
      if (this.OWNER.hand.length < 1) { return false; }

      if (mode === "activate") this.activateAbility(this.OWNER.hand); 
			else this.deactivateAbility(this.OWNER.hand);
      
      return true;
    }

    if (targets.includes("all target creatures")) {
      if (board.length < 1) { return false; }

      board.forEach(card => { 
				if (mode === "activate") this.activateAbility(card); else this.deactivateAbility(card); 
			});
      
      return true;
    }

    else if (targets.includes("target creature")) {
      let i = 0;
      this.OWNER.disable();

      creatures.forEach(creature => {
        if (!creature.cardType === "creature") { return; }

        i++;
        creature.addTargetHandler = () => {
          if (mode === "activate") this.activateAbility(creature); 
					else this.deactivateAbility(creature);

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

      if (mode === "activate") this.activateAbility(board); else this.deactivateAbility(board);
      
      return true;
    }

    if (targets.includes("freefall")) {
      const freefall = this.OWNER.discards.filter(card => { return card.cardType === "creature"; });
      if (freefall.length < 1) return false;
      
      freefall.forEach(creature => { 
				if (mode === "activate") this.activateAbility(creature); 
				else this.deactivateAbility(creature);
			});
      
      return true;
    }

		if (targets.includes("general")) { 
			if (mode === "activate") this.activateAbility(this); 
			else this.deactivateAbility(this); 

			return true; 
		}

    console.log(`Target in targets not recognised: ${targets}; for ${this.name}`);
    return false;
	}

	async activateAbility(target) {
		if (this._ability === null) return;

		for (let ability of this.ability) {
			if (ability instanceof Map) {

				if (ability.has("gain") || ability.has("give") || ability.has("get")) {
					for (let stat of ability.values()) {
						if (target.keywordArr.includes(stat.replace(/(|)\W/g, "").at(0).toUpperCase())) {
							target.addKeyword(stat);
						} else if (stat.includes("gold")) {
							target.OWNER.addGold(Number(stat[0]));
						} else {
							target.changeStats(stat);
						}
					}

				} else if (ability.has("discard")) {
					for (let number of ability.values()) {
						let max = 0;
						let i = 0;

						if (number[0] === "a") {
							max += 1;
						} else max += Number(number[0]);

						this.OWNER.opponent.disable();

						if (number.includes("random card")) {
							for (i; i < max; i++) {
								const card = target.randomElement();
								card.OWNER.discard(card);
							}
						} else {
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
									i++;

									if (i === max) {
										card.OWNER.enable();
										display(`${card.OWNER.opponent.name} to move`);
									}
								}

								card.span.onclick = card.addTargetHandler;
							});

							display(`${this.OWNER.name}, discard a card`);
						}
					}

				} else if (ability.has("search")) {
					let max = 0;
					let i = 0;
					let cards = target;

					for (let number of ability.values()) {
						if (number[0] === "a") {
							max += 1;

							if (number.includes("creature") || number.includes("consumable")) {
								cards = target.filter(card => { 
									return card.cardType.includes(number.slice(2));
								});
							}

						} else max += Number(number[0]);
					}

					if (cards.length < 1) return;

					this.OWNER.div.populateModal(cards);
					this.OWNER.div.openModal();

					const useModal = function() {
						return new Promise(resolve => {
							cards.forEach(card => {
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
										resolve();
									}
								}
								card.span.onclick = card.drawHandler;
							});
							this.OWNER.div.modalText.innerHTML = `${this.OWNER.name}, pick a card`;
						});
					}.bind(this);


					await useModal();
					

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
				} else if (ability.has("heal")) {
					for (let amount of ability.values()) {
						if (amount.includes("all damage")) {
							target.health = target.previousHealth;
							target.updateSpan();
						}
					}
				} else if (ability.has("use")) {
					for (let item of ability.values()) {
						if (item.includes("(c)")) {
							this.addKeyword("(c)");
							this.OWNER.creatureRemovalAndIndestructible(this, true);
							this.removeKeyword("(c)");
						}
					}
				} else if (ability.has("put")) {
					for (let element of ability.values()) {
						if (element.includes("this")) {
							this.revive(false);
						}
					}
				} else if (ability.has("retains")) {
					for (let element of ability.values()) {
						if (element.includes("buffs")) {
							this.attack = this.previousAttack;
							this.health = this.cumulatedHealth;
							this.keywords = this.previousKeywords;
							this.updateSpan();
						}
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
							target.changeStats(stat, true);
						}
					}
				}
			}
		}
	}
}

export default Card;