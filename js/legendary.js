import Creature from "./creature.js";

class Legendary extends Creature {

  constructor(name, attack, health, cost, type, keywords, ability1, ability2) {
    super(name, attack, health, cost, type, keywords, ability1, ability2);
    this.legendary = true;
  }

  updateSpan() {
    this.span.innerHTML = `
			Card Type: <b>Legendary</b> <br>
			Name: ${this.name} <br>
			Attack: ${this.attack} <br>
			Health: ${this.health > 0 ? this.health : 0} <br>
			Price: ${this.cost} gold <br>
			Keywords: ${(this.keywordsHTML)} <br>
			`;
  }

}

export default Legendary;