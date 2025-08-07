import Creature from "./creature.js";

class Legendary extends Creature {

  constructor(name, attack, health, cost, type, keywords, ability1, ability2) {
    super(name, attack, health, cost, type, keywords, ability1, ability2);
    this.cardType = "legendary";
  }

  updateSpan() {
    super.updateSpan();
    let t = this.span.innerHTML;
    let text = t.replace("Creature", "Legendary");
    this.span.innerHTML = text;
  }

}

export default Legendary;