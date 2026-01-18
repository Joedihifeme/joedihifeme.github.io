import Card from "./card.js";

class Consumable extends Card {

  constructor(name, cost, ability) {
    super(name, cost, ability, "consumable", true);
    
    if (Object.getPrototypeOf(this) === Consumable.prototype) this.updateSpan();
  }

  updateSpan() {
    this.span.innerHTML = `
      Card Type: Consumable <br>
      Name: ${this.name} <br>
      Price: ${this.cost} gold<hr>
      ${this.DISPLAYED_ABILITY}
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

  playConsumable() {
    if (this.findTargets("activate")) { this.OWNER.discard(this); return true; } else return false;
  }
}

export default Consumable