import Consumable from "./consumables.js";
import { display } from "./functions.js";

class doubleConsumable extends Consumable {

  constructor(name, cost1, ability1, cost2, ability2) {
    super(name, cost1, ability1);
    this.cost2 = cost2;
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

  //To fix next time
  get ability() {
    const chosenAbility = [];

    for (let item of this._ability) {
      if (item instanceof Map) {
        for (let key of item.keys()) {
          if (this.currentlyChosenAbility === 1) {
            if (this.dAbility1.includes(key) 
              && this.dAbility1.includes(item.get(key))
            ) { chosenAbility.push(item); }
          } else {
            if (this.dAbility2.includes(key) 
              && this.dAbility2.toLowerCase().includes(item.get(key))
            ) { chosenAbility.push(item); }
          }
        }
      } else {
        if (this._ability.count(item) > 1) {
          chosenAbility.push(item);
          break;
        }
        if (this.currentlyChosenAbility === 1) {
          if (this.dAbility1.includes(item)) {
            chosenAbility.push(item);
          }
        } else {
          if (this.dAbility2.includes(item)) {
            chosenAbility.push(item);
          }
        }
      }
    }

    return chosenAbility;
  }

  get targets() {
    const temp = [];

    this._targets.forEach(target => {
      if (this._targets.count(target) > 1) {
          temp.push(this._targets[0]);
          this._targets.remove(target);
      }

      if (this.currentlyChosenAbility === 1) {
        if (this.dAbility2.includes(target) && !this.dAbility1.includes(target)) {
          temp.push(target);
          this._targets.remove(target);
        }
      } else {
        if (this.dAbility1.includes(target) && !this.dAbility2.includes(target)) {
          temp.push(target);
          this._targets.remove(target);
        }
      }
    });

    this._targets = this._targets.concat(temp);
    return temp;
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
          this.playHandler = this.play.bind(this);
          this.span.onclick = this.playHandler;
          setTimeout(() => { display(`${this.OWNER.name} to move`)}, 1000);
          this.span.borderColor = this.span.color;
          return;
        }   
        this.currentlyChosenAbility = 1;
        this.OWNER.spendGold(this.cost);
      } else {
        if (this.OWNER.gold < this.cost2) {
          display(`Not enough gold to use this ability`);
          this.playHandler = this.play.bind(this);
          this.span.onclick = this.playHandler;
          setTimeout(() => { display(`${this.OWNER.name} to move`)}, 1000);
          this.span.borderColor = this.span.color;
          return;
        }
        this.currentlyChosenAbility = 2;
        this.OWNER.spendGold(this.cost2);
      }

      this.OWNER.enable();
      this.OWNER.playCard(this);

    }.bind(this);

    this.divs.ability1.onclick = this.abilityHandler;
    this.divs.ability2.onclick = this.abilityHandler;

    display(`${this.OWNER.name}, click on the ability you want to use`);
  }

  revive() {
    super.revive();
    this.currentlyChosenAbility = 0;
  }
}

export default doubleConsumable;