import Card from "./card.js";
import Player from "./playerClass.js";
import { display, copy } from "./functions.js";

class Creature extends Card {

	abilityEventsArr = [
		"once per turn", "when played", "upon death", "when attacking", "survives whilst blocking",
		"when blocking", "when alive", "when attacked", "when damaged", "every turn", "when drawn",
		"when a card gains a keyword"
	];
	keywordArr = [
		null, "H", "(H)", "F", "(F)", "R", "(R)", "C", "(C)", "I", "(I)", "T", "(T)", 
		"L", "(L)", "W", "(W)", "V", "(V)", "D", "(D)", "S", "(S)", "G", "(G)"
	];
	numberedKeywords = ["L", "W", "V", "G"];

	constructor(name, attack, health, cost, type, keywords, ability1, ability2, attribute) {
		super(name, cost, ability1, "creature", true);
		this.ATTACK = attack;
		this.attack = attack;
		this.HEALTH = health;
		this.health = health;
		this.previousAttack = 0
		this.previousHealth = 0;
		this.cumulatedHealth = health;
		this.type = type;
		this.ATTRIBUTE = attribute;

		if (keywords !== "") {
			keywords = keywords.split(",");
			this.keywords = [];
			for (let keyword of keywords) {
				if (this.keywordArr.includes(keyword[0])) {
					this.keywords.push(keyword)
				} else {
					throw new Error(`Keyword "${keyword}" does not exist.`);
				}
			}
		} else {
			this.keywords = null;
		}

		this.KEYWORDS = copy(this.keywords);
		this.previousKeywords = copy(this.keywords);

		if (ability2 !== "") { 
			if (this._ability === null) this._ability = [];
			super.initialiseAbility(ability2.toLowerCase());
			super.initialiseTargets(ability2.toLowerCase());
		}

		this.DISPLAYED_ABILITY2 = ability2;
		this.abilityEvents = [];
		this.initAbilityEvent();
		this.currentAbility = 0;

		this.firstTurn = true;
		this.blocking = false;
		this.tapped = false;
		this.target = null;
		this.attacker = null;
		this.poison = {damage: 0, player: undefined}; //called poison to differentiate from venom method
		//the object has a player property in case the poisoned creature has ward

		this.updateSpan();
	}

	get keywordsHTML() {
		let text = "";
		if (this.keywords === null) {
			return "";
		}

		this.keywords.forEach(element => {
			let keyword = `(${element.toUpperCase()}) `
			text += keyword;
		});

		return text
	}

	get ability() {
		return this._ability[this.currentAbility];
	}

	static checkEvent(creature, event, mode) {
		if (!creature instanceof Creature) return;
		if (creature.abilityEvents.includes(event)) {
			creature.currentAbility = creature.abilityEvents.indexOf(event);
			creature.findTargets(mode);
			if (mode === "deactivate") creature.currentAbility = 0;
		}
	}

	initAbilityEvent() {
		const abilites = [this.DISPLAYED_ABILITY, this.DISPLAYED_ABILITY2];

		abilites.forEach(ability => {
			if (ability === "") return;

			let found = false;

			this.abilityEventsArr.forEach(ev => {
				if (ability.toLowerCase().includes(ev)) {
					this.abilityEvents.push(ev);
					found = true;
				}
				
				if (found) return;
			});

			if (!found) {
				this.abilityEvents.push("general");
			}
		});
	}

	updateSpan() {
		let text = `
			Card Type: Creature <br>
			Name: ${this.name} <br>
			Attack: ${this.attack} <br>
			Health: ${this.health > 0 ? this.health : 0} <br>
			Price: ${this.cost} gold <hr>
		`;

		if (this.DISPLAYED_ABILITY !== "") text += `-${this.DISPLAYED_ABILITY}<br>`;
		if (this.DISPLAYED_ABILITY2 !== "") text += `-${this.DISPLAYED_ABILITY2}<br>`;
		if (this.ATTRIBUTE !== "") text += `-${this.ATTRIBUTE}<br>`;
		if (this.keywords !== null) text += `${(this.keywordsHTML)}<br>`;

		this.span.innerHTML = text;
	}

	duplicate() {
		const dup = super.duplicate();
		dup.updateSpan();
		return dup;
	}

	copyCard() {
		const copy = super.copyCard();
		copy.updateSpan();
		return copy;
	}

	addKeyword(...keywords) {
		if (this.keywords === null) {
			this.keywords = [];
		} 

		this.previousKeywords = copy(this.keywords);

		keywords.forEach(element => {
			let keyword = element.replace(/(|)\W/g, "").toUpperCase();
			let numbered = false;;
			if (this.numberedKeywords.includes(keyword[0])) {
				numbered = true;
			}

			if (!numbered) {
				//for non-numbered keywords
				if (!this.keywords.includes(keyword)) {
					this.keywords.push(keyword);
				}

			} else /*for numbered keywords*/ {
				let numberedKeyword = this.keywords.find(value => { return keyword[0] == value[0] });
				
				//for numbered keywords that are not included yet (adding L2 to a creature with W2) 
				if (numberedKeyword === undefined) {
					this.keywords.push(keyword);

				} else if (Number(numberedKeyword[1]) < Number(keyword[1]))  {
					//for numbered keywords that are inclued but different in value (V1 and V2)
					this.keywords.splice(this.keywords.indexOf(numberedKeyword), 1, keyword);
				}
			}
		});

		this.updateSpan();

		console.log(this.keywords, ",", this.previousKeywords);
	}

	//follows a similar algo to its counterpart
	removeKeyword(...keywords) {
		this.previousKeywords = copy(this.keywords);

		keywords.forEach(element => {
			let keyword = element.replace(/(|)\W/g, "").toUpperCase();
			let numbered = false;;
			if (this.numberedKeywords.includes(keyword[0])) {
				numbered = true;
			}

			if (!numbered) {
				if (this.keywords.includes(keyword)) {
					this.keywords.remove(keyword);
				}
			} else {
				let numberedKeyword = this.keywords.find(value => { return keyword == value });
				let ogNumberedKeyword;
				if (this.KEYWORDS !== null) {
					 ogNumberedKeyword = this.KEYWORDS.find(value => { return keyword[0] == value[0] });
				} else ogNumberedKeyword = undefined;

				if (numberedKeyword === undefined) {
					return;
				}

				if (ogNumberedKeyword === undefined) this.keywords.remove(numberedKeyword);
				else this.keywords.splice(this.keywords.indexOf(numberedKeyword), 1, ogNumberedKeyword);
			}

		});

		this.updateSpan();
	}

	changeStats(amount, reverse=false) {
		if (!amount.includes("/")) {
			console.log("Error: cannot read stats");
		}

		this.previousAttack = this.attack;
		this.previousHealth = this.health;

		let stats = amount.split("/");
		if (reverse) {
			this.attack += -Number(stats[0]);
			this.health += -Number(stats[1]);
			this.cumulatedHealth += -Number(stats[1]);

			Creature.checkEvent(this, "when damaged", "activate");
		} else {
			this.attack += Number(stats[0]);
			this.health += Number(stats[1]);
			this.cumulatedHealth += Number(stats[1]);
		}

		if (this.attack < 0) {
			this.attack = 0;
		}

		if (this.health < 1) {
			this.OWNER.discard(this);
		}

		this.updateSpan();
	}
	
	play() {
		if (this.abilityEvents.includes("when played")) {
			this.currentAbility = this.abilityEvents.indexOf("when played");
			this.findTargets("activate");
		}

		super.play();
	}

	discard() {
		super.discard();
		this.previousAttack = this.attack;
		this.attack = this.ATTACK;
		this.health = this.HEALTH;

		const temp = [];

		if (this.KEYWORDS !== null) {
			this.keywords.forEach(keyword => {
			if (!this.KEYWORDS.includes(keyword)) {
				temp.push(keyword);
			}
		});
		this.removeKeyword(...temp);
		} else {
			this.previousKeywords = copy(this.keywords);
			this.keywords = null; 
		}

		this.updateSpan();

		if (this.tapHandler) {
			delete this.tapHandler;
		} else {
			delete this.blockHandler;
		}
	}

	tap() {
		Creature.checkEvent(this, "when blocking", "deactivate");

		this.OWNER.board[0].remove(this);
		this.OWNER.board[1].push(this);
		this.span.style.borderColor = "red";
		if (this.tapHandler) {
			this.span.onclick = null;
			delete this.tapHandler;
		}

		this.blockHandler = this.block.bind(this);
		this.span.onclick = this.blockHandler;

		if (this.checkKeyword("T")) {
			this.target = this.OWNER.opponent;
			this.span.style.borderColor = "brown";
			return;
		}

		Creature.checkEvent(this, "when attacking", "activate");

		this.setTarget();
	}

	block() {
		Creature.checkEvent(this, "when attacking", "deactivate");

		this.OWNER.board[1].remove(this);
		this.OWNER.board[0].push(this);
		this.span.style.borderColor = "blue";
		if (this.blockHandler) {
			this.span.onclick = null;
			delete this.blockHandler;
		}
		this.tapHandler = this.tap.bind(this);
		this.span.onclick = this.tapHandler;
		this.target = null;

		Creature.checkEvent(this, "when blocking", "activate");
	}

	setTarget() {
		this.OWNER.disable();
		display(`${this.OWNER.name}, click on what you want to target. (A player or a creature)`);
		this.OWNER.opponent.targetHandler = function () {
			this.assignTarget(this.OWNER.opponent);
			this.OWNER.enable();
		}.bind(this);
		this.OWNER.opponent.div.h2.parentNode.onclick = this.OWNER.opponent.targetHandler;

		for (let section of this.OWNER.opponent.board) {
			for (let creature of section) {
				creature.targetHandler = function () { 
					this.assignTarget(creature); 
					this.OWNER.enable();
				}.bind(this);
				creature.span.onclick = creature.targetHandler;
			}
		}
	}

	assignTarget(target) {
		this.target = target;
		display(`Target set to ${target.name}`);
		setTimeout(() => {display(`${this.OWNER.name} to move`)}, 500);
		this.removeTargetHandlers();
	}

	removeTargetHandlers() {
		if (this.OWNER.opponent.targetHandler) {
			this.OWNER.opponent.div.h2.parentNode.onclick = null;
			delete this.OWNER.opponent.targetHandler;
		}

		for (let section of this.OWNER.opponent.board) {
			for (let creature of section) {
				if (creature.targetHandler) {
					creature.span.onclick = null;
					delete creature.targetHandler;
				}
			}
		}
	}

	changeTarget() {
		this.target = this.OWNER.opponent;
	}

	//returns true or false
	checkKeyword(keyword) {
		if (this.keywords === null) {
			return false;
		}

		if (!this.numberedKeywords.includes(keyword)) {
			return this.keywords.includes(keyword);
		} else {
			return this.keywords.some(element => { return element[0] === keyword; });
		}
	}

	getKeywordX(keyword) {
		if (!this.numberedKeywords.includes(keyword)) {
			throw new Error(`"${keyword}" is not a numbered keyword`);
		}

		for (let element of this.keywords) {
			if (element[0] === keyword) {
				return Number(element[1]);
			}
		}

		throw new Error(`"${keyword}" not in this.keywords`);
	}

	lifelink() {
		if (this.checkKeyword("L")) {
			display(`${this.name} is using lifelink!`)
			this.health += this.getKeywordX("L");
			this.updateSpan();
		}
	}

	venom(target) {
		if (this.checkKeyword("V")) {
			let venomCounter = this.getKeywordX("V");

			if (venomCounter > target.poison.damage) {
				target.poison.damage = venomCounter;
				target.poison.player = this.OWNER.opponent; //for future use (adding more players)
				display(`${this.name} has used venom! 
								${target.name} will now suffer a venom counter of ${venomCounter}`);

				target.span.style.outline = "3px solid green";
			}
		}
	}

	sufferVenom() {
		if (this.poison.damage > 0) {
			this.health -= this.poison.damage;
			this.updateSpan();

			if (this.deathCheck()) {
				this.span.style.outline = "none";
				this.poison.damage = 0;
				this.poison.player = undefined;
			}
		}
	}

	ward(target) {
		if (target.checkKeyword("W")) {
			if (this.OWNER.gold >= target.getKeywordX("W")) {
				return true;
			} 

			return false;
		}

		return null;
	}

	goAttack() {
		let target;
		let firstStrike = this.checkKeyword("F");
		let useDefender = false;
		const defender = this.OWNER.opponent.flatBoard.find(creature => {
			if (creature.checkKeyword("D")) {
				return true;
			}

			return false;
		});

		if (defender !== undefined) {
			if (window.confirm(`
				${defender.name} has Defender\n
				${this.OWNER.opponent.name}, would you like to use it to block ${this.name}'s attack`
			)) {
				useDefender = true;
			}
		}

		if (useDefender) {
			target = defender;
		} else if (this.target instanceof Creature) {
			target = this.target;
		} else if (this.target instanceof Player) {
			const reachCreature = this.target.board[0].find(creature => {
				return creature.checkKeyword("R");
			});

			if ((this.target.board[0].length > 0) && (!firstStrike)) {
				//no first strike creautre
				target = this.target.board[0][0];
			} else if ((reachCreature !== undefined) && (firstStrike)) {
				//first strike creature, but reach is on the board
				target = reachCreature;
			} else {
				//first strike bypassing blockers, or no blockers at all
				target = this.target;
			}
		}

		if (target instanceof Creature) {
			switch (this.ward(target)) {
				case true:
					this.OWNER.spendGold(target.getKeywordX("W"));
					break;

				case false:
					return;

				default:
					break;
			}

			target.previousHealth = target.health;
		}

		this.damageTarget(target);
		if (target instanceof Creature) Creature.checkEvent(target, "when attacked", "activate");

		if (target.deathCheck() && this.target instanceof Creature) {
			this.changeTarget();
		}
	}

	damageTarget(target, trample=false, attack=null) {
		if (!trample) {
			target.health -= attack !== null ? attack : this.attack;
		} else {
			target.health -= 1;
			this.attack -= 1;
			target.deathCheck();
		}
		
		if (target instanceof Creature) {
			target.updateSpan();
			this.lifelink();
			this.venom(target);
			target.attacker = this;
			Creature.checkEvent(target, "when damaged", "activate");
		} else if (target instanceof Player) {
			target.div.update();
		}

		if (this.checkKeyword("H") && this.firstTurn) {
			this.attack /= 2;
			this.updateSpan();
		}

		if (trample) {
			if (this.attack === 0) {
				this.attack = this.ATTACK;

				if (this.OWNER.opponent.trampleHandler) {
					this.OWNER.opponent.div.h2.parentNode.onclick = null;
					delete this.OWNER.opponent.trampleHandler;
				}

				this.OWNER.opponent.forEachOnBoard(creature => {
					if (creature.trampleHandler) {
						creature.span.onclick = null;
						delete creature.trampleHandler;
					}
				});

				if (this.trampleDone) {
					this.trampleDone();
					this.trampleDone = null;
				}
			}
		}
	}

	trampleAttack() {
		return new Promise(resolve => {
			this.trampleDone = resolve;

			this.OWNER.opponent.trampleHandler = function() { 
				this.damageTarget(this.OWNER.opponent, true); 
			}.bind(this);
			this.OWNER.opponent.div.h2.parentNode.onclick = this.OWNER.opponent.trampleHandler;

			this.OWNER.opponent.forEachOnBoard(creature => {
				creature.trampleHandler = function() {
					if (creature.checkKeyword("W")) {
						if (this.OWNER.gold < creature.cost) {
							return;
						}
						this.OWNER.spendGold(creature.getKeywordX("W"));					
					}
					this.damageTarget(creature, true);
				}.bind(this);

				creature.span.onclick = creature.trampleHandler;
			});

			display(`${this.OWNER.name}, click on who you want to take trample damage from ${this.name}`);
		});
	}

	deathCheck(trample=false) {
		if (this.health < 1) {
			this.OWNER.discard(this);

			if (trample) {
				if (this.trampleHandler) {
					this.span.onclick = false;
					delete this.trampleHandler;
				}
			}

			Creature.checkEvent(this, "upon death");

			return true;
		}

		if (this.blocking) {
			Creature.checkEvent(this, "survives whilst blocking", "activate");
		}
		
		return false;
	}
}

export default Creature