import Card from "./card.js"
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
					console.log(`Keyword "${keyword}" does not exist.`)
				}
			}
		} else {
			this.keywords = null;
		}

		this.firstTurn = true;
		this.blocking = false;
		this.tapped = false;
		this.target = null;
		this.poison = [0, undefined]; //this.poison[0] is counter; this.poison[1] is player responsible

		this.updateSpan();
	}

	updateSpan() {
		this.span.innerHTML = `
			Card Type: Creature <br>
			Name: ${this.name} <br>
			Attack: ${this.attack} <br>
			Health: ${this.health > 0 ? this.health : 0} <br>
			Price: ${this.cost} gold <br>
			Keywords: ${(this.keywords === null ? "None":this.keywords)} <br>
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

	play() {
		this.OWNER.playCard(this);
	}

	discard() {
		super.discard();
		this.attack = this.ATTACK;
		this.health = this.HEALTH;
		this.span.onclick = null;
		this.span.style.borderColor = "black";
		this.updateSpan();

		if (this.tapHandler) {
			delete this.tapHandler;
		} else {
			delete this.blockHandler;
		}

		this.reviveHandler = this.revive.bind(this);
		this.span.onclick = this.reviveHandler;
	}

	revive() {
		if (this.reviveHandler) {
			this.span.onclick = null;
			delete this.reviveHandler;
		}

		this.OWNER.reviveCard(this, true);

		this.playHandler = this.play.bind(this);
		this.span.onclick = this.playHandler;
	}

	tap() {
		//find the index of the card, then slice it out of the array
		let index = this.OWNER.board[0].indexOf(this);
		this.OWNER.board[0].splice(index, 1);
		this.OWNER.board[1].push(this);
		this.span.style.borderColor = "red";
		if (this.tapHandler) {
			this.span.onclick = null;
			delete this.tapHandler;
		}

		this.setTarget();

		this.blockHandler = this.block.bind(this);
		this.span.onclick = this.blockHandler;
	}

	block() {
		this.OWNER.board[1].splice(this.OWNER.board[1].indexOf(this), 1);
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
		display(`${this.OWNER.name}, click on what you want to target. (A player or a creature)`);
		this.OWNER.opponent.targetHandler = function () {
			this.assignTarget(this.OWNER.opponent);
		}.bind(this);
		this.OWNER.opponent.div.h2.parentNode.onclick = this.OWNER.opponent.targetHandler;

		for (let section of this.OWNER.opponent.board) {
			for (let creature of section) {
				creature.targetHandler = function () { this.assignTarget(creature); }.bind(this);
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

	damageTarget(target) {
		target.health -= this.attack;
		if (target instanceof Creature) {
			target.updateSpan();
			this.lifelink();
		} else if (target instanceof Player) {
			target.div.update();
		}

		if (this.checkKeyword("H") && this.firstTurn) {
			this.attack /= 2;
			this.updateSpan();
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

	goAttack() {
		let target;
		let firstStrike = this.checkKeyword("F");

		if (this.target instanceof Creature) {
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
		this.damageTarget(target);

		let result = target.deathCheck();
		if ((this.target instanceof Creature) && result) {
			this.changeTarget();
		}
	}

	deathCheck() {
		if (this.health < 1) {
			this.OWNER.discard(this);
			return true;
		}
		
		return false;
	}
	
}

export default Creature