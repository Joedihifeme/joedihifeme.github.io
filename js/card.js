import Player from "./playerClass.js"

class Card {
	constructor(name, cost) {
		this.name = name;
		this._cost = Number(cost);
		this.discarded = false;
		this.OWNER = undefined;

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
}

export default Card