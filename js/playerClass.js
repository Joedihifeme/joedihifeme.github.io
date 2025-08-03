import Creature from "./creature.js";
import Consumable from "./consumables.js";
import doubleConsumable from "./doubleconsumables.js";
import { display } from "./functions.js";

class Player {

  constructor (name) {
    this.name = name;
    this.id = undefined;
    this.health = 20;
    this.gold = 0;
    this.deck = [];
    this.hand = [];
    this.board = [[], []]; //blockers at board[0]; attackers on board[1];
    this.discards = [];
    this.killed = false;
    this._div = undefined;
    this.adder = 0;
    this.turn = 0;
    this.drawn = false;
    this.opponent = undefined;
  }

  //One-time use
  set div(pDiv) {
    if (this.id === 0) {
      this._div = {
        h2: pDiv.firstChild.firstChild,
        health: pDiv.firstChild.childNodes[1],
        gold: pDiv.firstChild.childNodes[2],
        endTurn: pDiv.firstChild.lastChild,
        hand: pDiv.childNodes[1],
        drawButton: pDiv.childNodes[2].firstChild.firstChild,
        drawDivText: pDiv.childNodes[2].firstChild.lastChild,
        board: pDiv.childNodes[2].childNodes[1],
        discardButton: pDiv.childNodes[2].lastChild.firstChild,
        discardText: pDiv.childNodes[2].lastChild.lastChild,
        discardModalText: pDiv.lastChild.firstChild.firstChild,
        discardModalCardSpace: pDiv.lastChild.firstChild.lastChild,
        keywordsButton: document.getElementById("keywords-button"),
        generalModal: document.getElementById("general-modal"),
        modalText: document.getElementById("general-modal").firstChild.firstChild,
        modalSpace: document.getElementById("general-modal").firstChild.lastChild
        }
      } else {
        this._div = {
        h2: pDiv.lastChild.lastChild,
        health: pDiv.lastChild.firstChild,
        gold: pDiv.lastChild.childNodes[1],
        endTurn: pDiv.lastChild.childNodes[2],
        hand: pDiv.childNodes[2],
        drawButton: pDiv.firstChild.firstChild.firstChild,
        drawDivText: pDiv.firstChild.firstChild.lastChild,
        board: pDiv.firstChild.childNodes[1],
        discardButton: pDiv.firstChild.lastChild.firstChild,
        discardText: pDiv.firstChild.lastChild.lastChild,
        discardModalText: pDiv.childNodes[1].firstChild.firstChild,
        discardModalCardSpace: pDiv.childNodes[1].firstChild.lastChild,
        keywordsButton: document.getElementById("keywords-button"),
        generalModal: document.getElementById("general-modal"),
        modalText: document.getElementById("general-modal").firstChild.firstChild,
        modalSpace: document.getElementById("general-modal").firstChild.lastChild
        }
      }
    
    this._div.player = this;
    this._div.update = function() {
      this.health.innerHTML = `Health: ${this.player.health > 0 ? this.player.health:0}`;
      this.gold.innerHTML =  `Gold: ${this.player.gold}`;
      this.drawDivText.innerHTML = `Cards left: ${this.player.deck.length}`;
      this.discardText.innerHTML = 
        `Number of discarded cards: ${this.player.discards.length}`;
      this.discardModalText.innerHTML = this.player.discards.length < 1 ? 
        "No discarded cards" : "Click on the card to bring back (for 2 gold)";
    }
    this._div.openModal = function() { this.generalModal.style.display = "block"; };
    this._div.closeModal = function() { this.generalModal.style.display = "none"; };

    this._div.populateModal = function(arr) {
      arr.forEach(card => {
        this.modalSpace.appendChild(card.span);
      });
    }

    this._div.clearModal = function() {
      for (let element of this.modalSpace.childNodes) {
        this.modalSpace.removeChild(element);
      }
      this.modalText.innerHTML = "";
    }

    Object.freeze(this._div);
  }

  get lowerName() {
    return this.name.toLowerCase();
  }

  get handList() {
    return this.div.hand.getElementsByTagName("span");
  }

  get div() {
    return this._div;
  }

  get flatBoard() {
    //change the board to a Set to remove duplicates, then change it back to an Array
    //Arrays have more methods than sets, which is why it's being used instead
    return Array.from(new Set(this.board.flat()));
  }

  get keywords() {
    return Creature.keywords();
  }

  enable(element="all") {
    if (element === "all" || element === "end turn") {
      this.div.endTurn.disabled = false;
    }

    if (element === "all" || element === "hand") {
      if (this.hand.length > 0) {
        this.hand.forEach(card => {
          card.playHandler = card.play.bind(card);
          card.span.onclick = card.playHandler;
        });
      }
    }

    if (element === "all" || element === "draw button") {
      if ((this.deck.length > 0) && (this.gold >= 1) && (!this.drawn)) {
        this.div.drawButton.disabled = false;
      }
    }

    if (element === "all" || element === "board") {
      if (this.board[0].length > 0) {
        this.board[0].forEach(creature => {
          creature.tapHandler = creature.tap.bind(creature)
          creature.span.onclick = creature.tapHandler;
        });
      }

      if (this.board[1].length > 0) {
        this.board[1].forEach(creature => {
          creature.blockHandler = creature.block.bind(creature);
          creature.span.onclick = creature.blockHandler;
        });
      }

    }

    if (element === "all" || element === "discard button") {
      if (this.gold >= 2) {
        this.div.discardButton.disabled = false;
      }
    }

    if (element === "all") {
      this.div.keywordsButton.disabled = false;
    }
  }

  disable(element="all") {
    if (element === "all" || element === "end turn") {
      this.div.endTurn.disabled = true;
    }

    if (element === "all" || element === "hand") {
      if (this.hand.length > 0) {
        this.hand.forEach(card => {
          if (card.playHandler) {
            card.span.onclick = null;
            delete card.playHandler;
          }
        });
      }
    }

    if (element === "all" || element === "draw button") {
      this.div.drawButton.disabled = true;
    }

    if (element === "all" || element === "board") {
      if (this.board[0].length > 0) {
        this.board[0].forEach(creature => {
          if (creature.tapHandler) {
            creature.span.onclick = null;
            delete creature.tapHandler;
          }
        });
      }

      if (this.board[1].length > 0) {
        this.board[1].forEach(creature => {
          if (creature.blockHandler) {
            creature.span.onclick = null;
            delete creature.blockHandler;
          }
        });
      }
    }
    
    if (element === "all" || element === "discard button") {
      this.div.discardButton.disabled = true;
    }

    if (element === "all") {
      this.div.keywordsButton.disabled = true;
    }
  }

  addGold(num) {
    this.gold += num;
    this.flatBoard.forEach(creature => {
      Creature.checkEvent(creature, "when you gain gold", "activate");
    });
    this.div.update();
  }

  spendGold(num) {
    this.gold -= num;
    if (this.gold < 2) {
      this.disable("discard button")
      if (this.gold < 1) {
      this.disable("draw button");
      }
    }
    
    this.div.update();
  }

  addHealth(num, extra) {
    this.health += num;
    //extra signifies the result of stat.includes("more").
    if (!extra) {
      this.flatBoard.forEach(creature => {
      Creature.checkEvent(creature, "when you gain life", "activate");
    });
    }
    this.div.update();

  }

  startTurnRoutine() {
    if (this.turn > 0) {
      this.flatBoard.forEach(creature => { 
        Creature.checkEvent(creature, "every turn", "activate");
        creature.sufferVenom(); 
      });
    }

    this.adder += 1;
    this.turn += 1;
    this.drawn = false;
    this.addGold(3 + this.adder);
    this.drawCard(1);
    display(`${this.name} to move`);
    this.enable();
  }

  drawCard(num, paid=false) {
    try {
      for (let i = 0; i < num; i++) {
        if (this.div.hand.innerHTML === "No cards in hand yet") {
          this.div.hand.innerHTML = "";
        }
        this.drawSpecificCard(this.deck.randomElement());
      }
      if (paid) {
        this.disable("draw button");
        this.spendGold(1);
        this.drawn = true;
      }
      if (this.deck.length < 1) {
        this.disable("draw button");
      }
    }
    catch(err) {
      display("Draw pile is empty");
      this.disable("draw button");
    }
  }

  drawSpecificCard(card) {
    this.deck.remove(card);
    this.hand.push(card);
    this.div.hand.appendChild(card.span);
    card.playHandler = card.play.bind(card);
    card.span.onclick = card.playHandler;
    this.div.update();
  }

  playCard(card, clone=undefined) {
    if (this.gold < card.cost && !(card instanceof doubleConsumable)) {
      console.log(`Player: ${this.gold}, card: ${card._cost.numeric}`);
      display("Not enough gold to play this card");
      setTimeout(() => { display(`${this.name} to move`); }, 1000);
      return;
    }

    if (this.div.board.innerHTML === "No cards placed...") {
      this.div.board.innerHTML = "";
    }

    if (!(card instanceof doubleConsumable)) { 
      if (!card.multiplier) { 
        if (card.clone) this.spendGold(clone._cost.x(card._cost.x()));
        else this.spendGold(card._cost.x()); 
      }
    }

    card.span.remove();
    this.hand.remove(card);

    if (card.playHandler) {
      card.span.onclick = null;
      delete card.playHandler;
    }

    if (card instanceof Creature) {
      this.div.board.appendChild(card.span);

      if (card.checkKeyword("S")) {
        this.stamina(card);
        card.tapped, card.blocking = true;
      } else {
        this.board[0].push(card);
        card.blocking = true;

        card.tapHandler = card.tap.bind(card);
        card.span.onclick = card.tapHandler;
        card.span.style.borderColor = "blue";

        Creature.checkEvent(card, "when blocking", "activate");

      this.keywordsOnPlay(card); 
      }

    } else if (card instanceof Consumable) {
      let ableToUse = card.playConsumable();

      if (!ableToUse) {
        display(`${this.name}, you cannot use ${card.name} right now`);
        setTimeout(() => { 
          display(`${this.name} to move`); 
          card.playHandler = card.play.bind(card);
          card.span.onclick = card.playHandler; 
        }, 1000);
        
        this.hand.push(card);
        this.div.hand.appendChild(card.span);
        card.span.style.borderColor = card.span.style.color;

        if (card instanceof doubleConsumable) {
          if (card.currentlyChosenAbility === 1) { 
            this.addGold(card._cost.previousValue); 
          } else { 
            this.addGold(card._cost2.previousValue); 
          }

          card.currentlyChosenAbility = 0;
        } else { this.addGold(card._cost.previousValue); }
      }
    }
  }

  keywordsOnPlay(card) {
    this.haste(card);
    this.creatureRemovalAndIndestructible(card);
    this.grab(card)
  }

  //keyword on play
  haste(card) {
    if (card.checkKeyword("H") && card.firstTurn) {
      card.attack *= 2;
      card.updateSpan();
      display(`${card.name} is using Haste!`);
      setTimeout(() => {display(`${this.name} to move`)}, 1500);
    }
  }

  //keyword on play
  creatureRemovalAndIndestructible(card, outsideTurn=false) {
    const enemyBoard = this.opponent.flatBoard;

    if (card.checkKeyword("C")) {
      if (enemyBoard.length > 0) {
        if (enemyBoard.every(creature => { return creature.checkKeyword("I"); })) {
          display(
            `${card.name} is using Creature Removal but all enemy creatures are Indestructible!`
          )
          setTimeout(() => { display(`${this.name } to move`);}, 1500);
          return;
        }
        
        display(
          `${card.name} is using Creature Removal! ${this.name}, choose a creature to remove.`
        );
        if (outsideTurn) {
          setTimeout(() => { display(
            `${card.name} is using Creature Removal! ${this.name}, choose a creature to remove.`
          ); this.disable(); }, 1001);
        }
        

        this.disable();
        this.opponent.disable("board");
        this.opponent.flatBoard.forEach(creature => {
          if (!creature.checkKeyword("I")) {
            creature.removeHandler = function() {
              creature.OWNER.discard(creature);

              if (creature.removeHandler) {
                creature.span.onclick = null;
                delete creature.removeHandler;
              }

              creature.OWNER.flatBoard.forEach(creature => {
                if (creature.removeHandler) {
                  creature.span.onclick = null;
                  delete creature.removeHandler;
                }
              });

              this.enable()
              display(`${this.name} to move.`);
            }.bind(this);

            creature.span.onclick = creature.removeHandler;
          }
        });
      }
    }
  }

  //keyword on play
  grab(card) {
    if (card.checkKeyword("G") && this.discards.length > 0) {
      let n = card.getKeywordX("G");

      for (let i = 0; i < n; i++) {
        const consum = this.discards.find(card => { return card instanceof Consumable });
        if (consum !== undefined) { consum.revive(false); }
      }
    }
  }

  stamina(card) {
    this.board.forEach(section => { section.push(card); });
    card.span.style.borderColor = "purple";
    display(`${card.name} is using stamina!`);
    setTimeout(() => { card.setTarget(); }, 1500);
  }

  discard(card) {
    for (let section of this.board) {
      if (section.includes(card)) {
        section.remove(card);
      }
    }

    //this block is outside of the loop as a stamina creature will appear in each section of the board
    if (card.clone) {
      card.span.remove(); 
      card.vanish(); 
    } else {
      this.discards.push(card);
      card.discard();
      this.div.update();
      this.div.discardModalCardSpace.appendChild(card.span);
    }

    if (card instanceof Creature) {
      this.flatBoard.forEach(creature => {
        Creature.checkEvent(creature, "discarded creature", "activate");
      });
    }
  }

  reviveCard(card, paid=false) {
    this.discards.remove(card);
    this.hand.push(card);
    this.div.hand.appendChild(card.span);
    if (paid) {
      this.spendGold(2);
    }
    this.div.update();
  }

  deathCheck() {
    if (this.health <= 0) {
      this.disable();
      this.div.update();
      this.opponent.disable();
      this.opponent.div.update();
      this.killed = true;
    }
  }

  async endTurnRoutine() {
    this.disable();

    for (let creature of this.board[1]) {
      if (creature instanceof Creature) {
        if (!creature.checkKeyword("T")) {
          creature.goAttack();
        } else {
          await creature.trampleAttack();
        }
      }
    }

    this.flatBoard.forEach(creature => { 
      creature.firstTurn = false;
      creature.currentAbility = 0;
    });

    if (this.opponent.killed) { 
      display(`${this.opponent.name} has won!<br>Reload the page to play again.`);
      return;
    }
    
    setTimeout(() => { this.opponent.startTurnRoutine() }, 1000);
  }
}

export default Player;