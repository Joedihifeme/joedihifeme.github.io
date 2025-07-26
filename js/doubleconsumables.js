import Consumable from "./consumables.js";
import Gold from "./gold.js";
import { display } from "./functions.js";

class doubleConsumable extends Consumable {

  constructor(name, cost1, ability1, cost2, ability2) {
    super(name, cost1, ability1);
    this._cost2 = new Gold(cost2);
    this.initialiseAbility(ability2.toLowerCase());
    this.initialiseTargets(ability2.toLowerCase());
    this.DISPLAYED_ABILITY2 = ability2;
    this.currentlyChosenAbility = 0;

    this.updateSpan();
  }

  updateSpan() {
    this.span.innerHTML = `
    Card Type: Double Consumable <br>
    Name: ${this.name} <hr>
    <div>
    ${this.DISPLAYED_ABILITY} <br>
    Price: ${this.cost} gold <hr>
    </div>
    <div>
    ${this.DISPLAYED_ABILITY2} <br>
    Price: ${this.cost2} gold
    </div>
    `
    this.divs = {ability1: this.span.children[2], ability2: this.span.children[3]};
  }

  get dAbility2 () {
    return this.DISPLAYED_ABILITY2.toLowerCase();
  }

  get ability() {
    return this._ability[(this.currentlyChosenAbility - 1)];
  }

  get targets() {
    const temp = [];

    this._targets.forEach(target => {
      if (this._targets.count(target) > 1) {
          temp.push(this._targets[0]);
      }

      if (this.currentlyChosenAbility === 1) {
        if (this.dAbility2.includes(target) && !this.dAbility1.includes(target)) {
          temp.push(target);
        }
      } else {
        if (this.dAbility1.includes(target) && !this.dAbility2.includes(target)) {
          temp.push(target);
        }
      }
    });

    this._targets = this._targets.concat(temp);
    return temp;
  }
  
  get cost2() {
    return this._cost2.value;
  }

  play() {
    this.span.style.borderColor = "red";
 
    this.span.onclick = null;
    if (this.divs.ability1) this.divs.ability1.onclick = null;
    if (this.divs.ability2) this.divs.ability2.onclick = null;
    if (this.playHandler) delete this.playHandler;
    if (this.abilityHandler) delete this.abilityHandler;

    this.abilityHandler = function(event) {
      for (let ability in this.divs) {
        if (this.abilityHandler) {
          this.divs[ability].onclick = null;
        }
      }
      delete this.abilityHandler;

      this.OWNER.disable();

      if (event.currentTarget === this.divs.ability1) {
        if (this.OWNER.gold < this.cost) {
          display(`Not enough gold to use this ability`);
          setTimeout(() => { 
            display(`${this.OWNER.name} to move`);
            this.OWNER.enable();
            this.playHandler = this.play.bind(this);
            this.span.onclick = this.playHandler;
          }, 1000);
          this.span.style.borderColor = this.span.style.color;
          return;
        }
        this.currentlyChosenAbility = 1;
        this.OWNER.spendGold(this._cost.x());
      } else {
        if (this.OWNER.gold < this.cost2) {
          display(`Not enough gold to use this ability`);
          setTimeout(() => { 
            display(`${this.OWNER.name} to move`);
            this.OWNER.enable();
            this.playHandler = this.play.bind(this);
            this.span.onclick = this.playHandler;
          }, 1000);
          this.span.style.borderColor = this.span.style.color;
          return;
        }
        this.currentlyChosenAbility = 2;
        this.OWNER.spendGold(this._cost2.x());
      }

      this.OWNER.enable();
      this.OWNER.playCard(this);

    }.bind(this);

    this.divs.ability1.onclick = this.abilityHandler;
    this.divs.ability2.onclick = this.abilityHandler;

    display(`${this.OWNER.name}, click on the ability you want to use`);
  }

  revive(paid=true) {
    super.revive(paid);
    this.currentlyChosenAbility = 0;
  }
}

export default doubleConsumable;