import Creature from "./creature.js";
import { display } from "./runner.js";

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
        discardModalCardSpace: pDiv.lastChild.firstChild.lastChild
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
        discardModalCardSpace: pDiv.childNodes[1].firstChild.lastChild
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

  enable(element="all") {
    if (element === "all" || element === "end turn") {
      this.div.endTurn.disabled = false;
    }

    if (element === "all" || element === "hand") {
      if (this.hand.length > 0) {
        this.hand.forEach(creature => {
          creature.playHandler = creature.play.bind(creature);
          creature.span.onclick = creature.playHandler;
        });
      }
    }

    if (element === "all" || element === "draw button") {
      if (this.deck.length > 0) {
        this.div.drawButton.disabled = false;
      }
    }

    if (element === "all" || element === "board") {
      this.board.forEach(section => {
        if (section.length > 0) {
          section.forEach(creature => {
            if (creature.tapped) {
              creature.blockHandler = creature.block.bind(creature);
              creature.span.onclick = creature.blockHandler;
            } else {
              creature.tapHandler = creature.tap.bind(creature)
              creature.span.onclick = creature.tapHandler;
            }
          });
        }
      });
    }

    if (element === "all" || element === "discard button") {
      this.div.discardButton.disabled = false;
    }
  }

  disable(element="all") {
    if (element === "all" || element === "end turn") {
      this.div.endTurn.disabled = true;
    }

    if (element === "all" || element === "hand") {
      if (this.hand.length > 0) {
        this.hand.forEach(creature => {
          if (creature.playHandler) {
            creature.span.onclick = null;
            delete creature.playHandler;
          }
        });
      }
    }

    if (element === "all" || element === "draw button") {
      this.div.drawButton.disabled = true;
    }

    if (element === "all" || element === "board") {
      this.board.forEach(section => {
        if (section.length> 0) {
          section.forEach(creature => {
            if (creature.tapped) {
              if (creature.blockHandler) {
                creature.span.onclick = null;
                delete creature.blockHandler;
              }
            } else {
              if (creature.tapHandler) {
                creature.span.onclick = null;
                delete creature.tapHandler;
              }
            }
          });
        }
      });
    }
    
    if (element === "all" || element === "discard button") {
      this.div.discardButton.disabled = true;
    }
  }

  addGold(num) {
    this.gold += num;
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

  startTurnRoutine() {
    this.adder += 1;
    this.turn += 1;
    this.addGold(3 + this.adder);
    this.drawCard(1);
    display(`${this.name} to move`);
  }

  drawCard(num, paid=false) {
    try {
      for (let i = 0; i < num; i++) {
        if (this.div.hand.innerHTML === "No cards in hand yet") {
          this.div.hand.innerHTML = "";
        }
        const card = this.deck.splice(Math.floor(Math.random() * this.deck.length), 1)[0];
        this.hand.push(card);
        this.div.hand.appendChild(card.span);
        card.playHandler = card.play.bind(card);
        card.span.onclick = card.playHandler;
        this.div.update();
      }
      if (paid) {
        this.disable("draw button");
        this.spendGold(1);
      }
    }
    catch(err) {
      document.getElementById("text-space").innerHTML = "Draw pile is empty";
      this.disable("draw button");
    }
  }

  playCard(card) {
    if (this.gold < card.cost) {
      display("Not enough gold to play this card");
      setTimeout(() => {display(`${this.name} to move`)}, 1000);
      return;
    }

    let index = this.hand.indexOf(card);

    if (index === -1) {
      throw new Error("Card not in hand");
    } else {
      if (this.div.board.innerHTML === "No cards placed...") {
        this.div.board.innerHTML = "";
      }
      this.spendGold(card.cost);
      this.hand.splice(index, 1);
      this.board[0].push(card);
      card.span.remove();
      this.div.board.appendChild(card.span);
      if (card.playHandler) {
        card.span.onclick = null;
        delete card.playHandler;
      }
      card.tapHandler = card.tap.bind(card);
      card.span.onclick = card.tapHandler;
      card.span.style.borderColor = "blue";
    }
  }

  discard(card) {
    for (let section of this.board) {
      if (section.includes(card)) {
        section.splice(section.indexOf(card), 1);
        this.discards.push(card);
        card.discard();
        this.div.update();
        this.div.discardModalCardSpace.appendChild(card.span);
      }
    }
  }

  reviveCard(card, paid=false) {
    this.discards.splice(this.discards.indexOf(card), 1);
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
      display(`${this.opponent.name} has won!<br>Reload the page to play again.`);
    }

    return false;
  }

  endTurnRoutine() {
    for (let creature of this.board[1]) {
      if (creature instanceof Creature) {
        creature.goAttack()
      }
    }

    this.disable();
    this.opponent.enable();
    this.opponent.startTurnRoutine();
  }
}

export default Player;