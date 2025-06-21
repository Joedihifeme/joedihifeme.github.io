import Creature from "./creature.js"
import Player from "./playerClass.js"
import { setupGame } from "./functions.js";

const creatures = [];
const players = [];
const gameDiv = document.getElementById("game");

fetch('./cards.json')
  .then(response => {
    if (!response.ok) {
      throw new Error("Something went wrong with fetching");
    }
    
    return response.json();
  })
  .then(data => {
    data.creatures.forEach(creature => {
      creatures.push(new Creature(
        creature.name, creature.attack, creature.health, 
        creature.gold, creature.type, creature.keywords
      ));
    });
  })
  .catch(error => {
    console.error(error);
  });

const startButton = document.getElementById("start-button");
startButton.onclick = () => {
  document.getElementById("start").remove();

  const askingDiv = document.createElement("div");
  gameDiv.appendChild(askingDiv);

  const text = document.createElement("p");
  askingDiv.appendChild(text);
  text.innerHTML = "Player 1 name:";

  const playerInput = document.createElement("input");
  playerInput.setAttribute("type", "text");
  playerInput.required = true;
  askingDiv.appendChild(playerInput);
  
  const submitButton = document.createElement("button");
  submitButton.innerText = "Submit";
  askingDiv.appendChild(submitButton);

  submitButton.onclick = () => {
    askForName(playerInput, text, askingDiv);
  };
};

function askForName(inputBox, text, div) {
  if (inputBox.value.trim() !== "") {
    players.push(new Player(inputBox.value.trim()));
    text.innerHTML = "Player 2 name:";
    inputBox.value = "";
  } else {
    const warning = document.createElement("p");
    warning.innerHTML = "Do not leave it blank.";
    div.appendChild(warning);
  }

  if (players.length === 2) {
    div.remove();
    players[0].id = 0;
    players[0].opponent = players[1];
    players[1].id = 1;
    players[1].opponent = players[0];
    assignCards(players, creatures);
  }
}

function assignCards(players, creatures) {
  const div = document.createElement("div");
  div.setAttribute("class", "card-choice-div");
  gameDiv.appendChild(div);
  const text = document.createElement("p");
  div.appendChild(text);
  const removedSpans = [];
  let playerIndex = 0;
  let cardCount = 10;

  text.innerHTML = `${players[playerIndex].name}, choose ${cardCount} cards by clicking on them.`;

  creatures.forEach(creature => {
    const creatureSpan = creature.span;
    creatureSpan.onclick = function chooseCard() {
      if (cardCount > 0) {
        div.removeChild(creatureSpan);
        removedSpans.push(creatureSpan);
        creature.owner = players[playerIndex];
        players[playerIndex].deck.push(creature.duplicate(), creature.copyCard()); 
        cardCount--;
        text.innerHTML = `${players[playerIndex].name}, choose ${cardCount} cards by clicking on them.`;

        if (cardCount === 0) {
          playerIndex++;
          
          if (playerIndex < players.length) {
            removedSpans.forEach(span => {div.appendChild(span)});
            cardCount = 10;
            text.innerHTML = `${players[playerIndex].name}, choose ${cardCount} cards by clicking on them.`;
          } else {
            div.remove();
            creatures.forEach(creature => { creature.span.removeEventListener("click", chooseCard); });
            setupGame(players, gameDiv);
          };
        }
      }
    };
    div.appendChild(creatureSpan);
  });
}

