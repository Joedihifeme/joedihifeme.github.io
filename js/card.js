import Player from "./playerClass.js"

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
		["discard", "x cards"],
		["pay", "same mana cost"]
	]);

	abilityArr = ["Destroy, Clone"];

	constructor(name, cost, ability=null, targets=null) {
		this.name = name;
		this._cost = Number(cost);
		this.discarded = false;
		this.OWNER = undefined;
		this.ability = null;

		//creatures do not have abilities (yet) so this will be skipped during their initialisation
		if (ability !== null && targets !== null) {
			this.ability = [];
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

	//will be updated later once gold is done
	get cost() {
		return this._cost;
	}

	set owner(player) {
		if (player instanceof Player) {this.OWNER = player;} else {throw "Owner must be of type Player";}
	}

	duplicate() {
		const dup = Object.create(this);
		dup.name += " I";
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

	discard() {
		this.discarded = true;
		this.span.remove();
	}

	initialiseAbility(ability) {
		let foundAbility = false;

		this.abilityMap.forEach((value, key) => {
			if (ability.includes(key)) {
				value.forEach(element => {
					if (ability.includes(element)) {
						foundAbility = true;
						this.ability.push(new Map([[key, element]]));
					}
				});
			}
		});

		this.abilityArr.forEach(element => {
			if (ability.includes(element)) {
				foundAbility = true;
				this.ability.push(element);
			}
		});

		if (!foundAbility) {
			throw new Error(`Ability not found for ${this.name}`);
		}
	}

}

export default Card;