import Card from "./card.js";

class Consumable extends Card {
  targetTypes = [
    "in your hand", "all consumables", "all your creatures", "freefall",
    "target opponent's creature", "opponent", "opponent's turn", "your deck",
    "your entire deck", "your hand", "target creature in discard pile",
    "target creature", "target structure", "target card", "a card"
  ];

  specialConsumables = ["annoy"];

  constructor(name, cost, ability) {
    super(name, cost, ability, true);
    this._targets = [];
    //this.multiplier = cost.includes("x"); <-- for later when gold is done

    if (!this.specialConsumables.includes(this.rootName.toLowerCase())) {
      this.initialiseTargets(ability.toLowerCase());
      this.special = false;
    } else {
      this.special = true;
    }

    this.updateSpan();
  }

  updateSpan() {
    this.span.innerHTML = `
      Card Type: Consumable
      Name: ${this.name} <br>
      Price ${this.cost}<hr>
      ${this.DISPLAYED_ABILITY}
      `;
  }

  initialiseTargets(ability) {
    let foundTarget = false;

    this.targetTypes.forEach(target => {
      if (ability.includes(target)) {
        foundTarget = true;
        this._targets.push(target);
      }
    });

    if (!foundTarget) {
      throw new Error(`Target not found for ${this.name}`);
    }
  }
}

export default Consumable