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
		this._ability = null;

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

	//will be updated later once gold is done
	get cost() {
		return this._cost;
	}

	get dAbility1 () {
    return this.DISPLAYED_ABILITY.toLowerCase();
  }

	get ability() {
		return this._ability;
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

	revive() {
		if (this.reviveHandler) {
			this.span.onclick = null;
			delete this.reviveHandler;
		}

		this.OWNER.reviveCard(this, true);

		this.playHandler = this.play.bind(this);
		this.span.onclick = this.playHandler;
	}

	initialiseAbility(ability) {
		let foundAbility = false;

		this.abilityMap.forEach((value, key) => {
			if (ability.includes(key)) {
				value.forEach(element => {
					if (ability.includes(element)) {
						foundAbility = true;
						this._ability.push(new Map([[key, element]]));
					}
				});
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

				} //else if (ability.has("draw"))
			
			} else {
				if (ability === "destroy") {
					//TODO
				}
			}
		}
	}
}

export default Card;