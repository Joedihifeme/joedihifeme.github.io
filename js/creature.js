import Card from "./card.js";
import Player from "./playerClass.js";
import { display } from "./functions.js";

class Creature extends Card {

	keywordArr = [
		null, "H", "(H)", "F", "(F)", "R", "(R)", "C", "(C)", "I", "(I)", "T", "(T)", 
		"L", "(L)", "W", "(W)", "V", "(V)", "D", "(D)", "S", "(S)", "G", "(G)"
	];
	numberedKeywords = ["L", "W", "V", "G"];

	constructor(name, attack, health, cost, type, keywords=null) {
		super(name, cost);
		this.ATTACK = attack;
		this.attack = attack;
		this.HEALTH = health;
		this.health = health;
		this.type = type;

		if (keywords !== null && keywords !== "") {
			keywords = keywords.split(",");
			this.keywords = []
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

		this.firstTurn = true;
		this.blocking = false;
		this.tapped = false;
		this.target = null;
		this.poison = {damage: 0, player: undefined}; //called poison to differentiate from venom method
		//the object has a player property in case the poisoned creature has ward

		this.updateSpan();
	}

	get keywordsHTML() {
		let text = "";
		if (this.keywords === null) {
			return "None";
		}

		this.keywords.forEach(element => {
			let keyword = `(${element.toUpperCase()}) `
			text += keyword;
		});

		return text
	}

	updateSpan() {
		this.span.innerHTML = `
			Card Type: Creature <br>
			Name: ${this.name} <br>
			Attack: ${this.attack} <br>
			Health: ${this.health > 0 ? this.health : 0} <br>
			Price: ${this.cost} gold <br>
			Keywords: ${(this.keywordsHTML)} <br>
			`;
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

		keywords.forEach(element => {
			let keyword = element.substr(1, 1).toUpperCase();
			if (this.numberedKeywords.includes(keyword)) {
				keyword += element.at(-1);
			}

			this.keywords.push(keyword);
		});

		this.updateSpan();
	}

	removeKeyword(...keywords) {
		if (this.keywords !== null) {
			keywords.forEach(keyword => {
				if (this.numberedKeywords.includes(keyword)) {
					this.keywords.remove(keyword + this.getKeywordX(keyword).toString());
				} else {
					this.keywords.remove(keyword);
				}
			});

			if (this.keywords.length < 1) {
				this.keywords = null;
			}
		}

		this.updateSpan();
	}

	changeStats(stat, amount) {
		if (stat === "both") {
			let stats = amount.split("/");
			this.attack += Number(stats[0]);
			this.health += Number(stats[1]);
		} else if (stat === "attack") {
			this.attack += Number(amount);
		} else if (stat === "health") {
			this.health += Number(amount);
		} else {
			throw new Error("Stat not defined");
		}

		if (this.attack < 0) {
			this.attack = 0;
		}

		if (this.health < 0) {
			this.OWNER.discard(this);
		}

		this.updateSpan();
	}

	discard() {
		super.discard();
		this.attack = this.ATTACK;
		this.health = this.HEALTH;
		this.updateSpan();

		if (this.tapHandler) {
			delete this.tapHandler;
		} else {
			delete this.blockHandler;
		}
	}

	tap() {
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

		this.setTarget();
	}

	block() {
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
		}

		this.damageTarget(target);

		let result = target.deathCheck();
		if ((this.target instanceof Creature) && result) {
			this.changeTarget();
		}
	}

	damageTarget(target, trample=false) {
		if (!trample) {
			target.health -= this.attack;
		} else {
			target.health -= 1;
			this.attack -= 1;
			target.deathCheck();
		}
		
		if (target instanceof Creature) {
			target.updateSpan();
			this.lifelink();
			this.venom(target);
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

			return true;
		}
		
		return false;
	}
}

export default Creature