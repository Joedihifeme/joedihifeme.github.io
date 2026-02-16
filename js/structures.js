import Creature from "./creature.js";
import { display } from "./functions.js";

class Structure extends Creature {

    constructor(name, health, cost, ability1, ability2, keywords, ) {
        super(name, 0, health, cost, "n", keywords, ability1, ability2, "");
        this.cardType = "structure"
    }

}

export default Structure;