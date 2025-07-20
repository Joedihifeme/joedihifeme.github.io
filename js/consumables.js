import Card from "./card.js";
import Creature from "./creature.js";
import { display } from "./functions.js";

class Consumable extends Card {

  targetTypes = [
    "in your hand", "all consumables", "all other consumables", "all your creatures", "freefall",
    "target opponent's creature", "opponent", "opponent's turn", "your deck",
    "your entire deck", "your hand", "opponent's hand", "all target creatures", 
    "target creature in discard pile","target creature", "target structure", "target card", "battlefield"
  ];

  specialConsumables = ["annoy"];

  constructor(name, cost, ability) {
    super(name, cost, ability, true);
    this._targets = [];
    this.multiplier = cost.includes("x");

    if (!this.specialConsumables.includes(this.rootName.toLowerCase())) {
      this.initialiseTargets(ability.toLowerCase());
      this.special = false;
    } else {
      this.special = true;
    }

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

  initialiseTargets(ability) {
    let foundTarget = false;

    for (let target of this.targetTypes) {
      if (ability.includes(target)) {
        foundTarget = true;
        this._targets.push(target);

        if (ability.includes("and") || ability.includes("then") || ability.includes(",")) {
          continue;
        } 

        break;
      }
    }

    if (!foundTarget) {
      throw new Error(`Target not found for ${this.name}`);
    }
  }

  get targets() {
    return this._targets;
  }

  playConsumable() {
    const board = this.OWNER.flatBoard
    const creatures = board.filter(creature => { return creature instanceof Creature; });
    const targets = this.targets; 
    if (targets.length < 1) return false;

    if (targets.includes("cards in your hand")) {
      if (this.OWNER.hand.length < 1) { return false; } 

      this.OWNER.hand.forEach(card => { this.activateAbility(card); });
      this.OWNER.discard(this);
      return true;
    }

    if (targets.includes("all your creatures")) {
      if (board.length < 1) { return false; }

      board.forEach(creature => {
        if (creature instanceof Creature) { this.activateAbility(creature); }
      });

      this.OWNER.discard(this);
      return true;
    }

    if (targets.includes("all other consumables")) {
      let found = false;
      const callback = function(card) { 
        if (card instanceof Consumable && card !== this) {
          found = true;
          this.activateAbility(card); 
        }
      }.bind(this);

      this.OWNER.deck.forEach(callback);
      this.OWNER.hand.forEach(callback);
      board.forEach(callback);
      this.OWNER.discards.forEach(callback);

      if (found) { this.OWNER.discard(this); return true; } else return false;
    }

    if (targets.includes("target opponent's creature")) {
      let i = 0;
      this.OWNER.disable();
      this.OWNER.opponent.disable("board");
      this.OWNER.opponent.flatBoard.forEach(creature => {
        if (!creature instanceof Creature) { return; }

        i++;
        creature.addTargetHandler = () => {
          this.activateAbility(creature);

          if (creature.addTargetHandler) {
            creature.span.onclick = null;
            delete creature.addTargetHandler;
          }

          creatures.forEach(c => {
            if (c.addTargetHandler) {
              c.span.onclick = null;
              delete c.addTargetHandler;
            }
          });

          this.OWNER.discard(this);
          this.OWNER.enable();
          this.OWNER.opponent.enable("board");
          display(`${this.OWNER.name} to move`);
        }

        creature.span.onclick = creature.addTargetHandler;
        display(`${this.OWNER.name}, click on the card that will be affected by ${this.name}`);
      });

      if (i < 1) { 
        this.OWNER.enable();
        this.OWNER.opponent.enable(); 
        return false; 
      } else return true;

    } else if (targets.includes("opponent's hand")) {
      if (this.OWNER.opponent.hand.length < 1) { return false; }

      this.activateAbility(this.OWNER.opponent.hand); 
      this.OWNER.discard(this);
      return true;
      
    } else if (targets.includes("opponent")) {
      this.activateAbility(this.OWNER.opponent);
      this.OWNER.discard(this);
      return true;
    }

    if (targets.includes("your deck")) {
      if (this.OWNER.deck.length < 1) { return false; }

      this.OWNER.disable();
      this.activateAbility(this.OWNER.deck); 
      this.OWNER.enable();
      this.OWNER.discard(this);
      return true;
    }

    if (targets.includes("your hand")) {
      if (this.OWNER.hand.length < 1) { return false; }

      this.activateAbility(this.OWNER.hand); 
      this.OWNER.discard(this);
      return true;
    }

    if (targets.includes("all target creatures")) {
      if (board.length < 1) { return false; }

      board.forEach(card => { this.activateAbility(card); });    
      this.OWNER.discard(this);
      return true;
    }

    else if (targets.includes("target creature")) {
      let i = 0;
      this.OWNER.disable();

      creatures.forEach(creature => {
        if (!creature instanceof Creature) { return; }

        i++;
        creature.addTargetHandler = () => {
          this.activateAbility(creature);

          if (creature.addTargetHandler) {
            creature.span.onclick = null;
            delete creature.addTargetHandler;
          }

          creatures.forEach(c => {
            if (c.addTargetHandler) {
              c.span.onclick = null;
              delete c.addTargetHandler;
            }
          });

          this.OWNER.discard(this);
          this.OWNER.enable();
          display(`${this.OWNER.name} to move`);
        }

        creature.span.onclick = creature.addTargetHandler;
        display(`${this.OWNER.name}, click on the card that will be affected by ${this.name}`);
      });

      if (i < 1) { this.OWNER.enable(); return false; } else return true;
    }

    if (targets.includes("battlefield")) {
      if (board.length < 1) return false;

      let affordable = board.find(card => { return this.OWNER.gold >= card.cost });
      if (!affordable) return false;

      this.activateAbility(board); 
      this.OWNER.discard(this);
      return true;
    }

    if (targets.includes("freefall")) {
      const freefall = this.OWNER.discards.filter(card => { return card instanceof Creature; });
      if (freefall.length < 1) return false;
      
      freefall.forEach(creature => { this.activateAbility(creature); });
      this.OWNER.discard(this);
      return true;
    }

    console.log(`Target in targets not recognised: ${targets}`);
    return false;
  }
}

export default Consumable