import Creature from "./creature.js";
import { display } from "./functions.js";

class Structure extends Creature {

    constructor(name, health, cost, ability1, ability2, keywords, ) {
        super(name, 0, health, cost, "n", keywords, ability1, ability2, "");
        this.cardType = "structure"
        this.blocking = true;
        delete this.tapped;
        delete this.tap;
    }

    updateSpan() {
        let text = `
			Card Type: Structure <br>
			Name: ${this.name} <br>
			Health: ${this.health > 0 ? this.health : 0} <br>
			Price: ${this.cost} gold <hr>
		`;

		if (this.DISPLAYED_ABILITY !== "") text += `-${this.DISPLAYED_ABILITY}<br>`;
		if (this.DISPLAYED_ABILITY2 !== "") text += `-${this.DISPLAYED_ABILITY2}<br>`;
		if (this.keywords !== null) text += `${(this.keywordsHTML)}<br>`;

		this.span.innerHTML = text;
    }

    provoke() {

    }

    discard() {
        super.discard();

        if (this.provokeHandler) {
            delete this.provokeHandler;
        }
    }

}

export default Structure;