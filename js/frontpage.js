import Creature from "./creature.js"
import Consumable from "./consumables.js";
import Player from "./playerClass.js"
import { setupGame } from "./functions.js";

const cards = [];
const players = [];
const gameDiv = document.getElementById("game");
var displayMode = "white";

const savedMode = localStorage.getItem("displayMode");
if (savedMode === "black") {
  darkMode(); 
} else {
  lightMode();
}

fetch('./cards.json')
  .then(response => {
    if (!response.ok) {
      throw new Error("Something went wrong with fetching");
    }
    
    return response.json();
  })
  .then(data => {
    data.creatures.forEach(creature => {
      cards.push(new Creature(
        creature.name, creature.attack, creature.health, 
        creature.gold, creature.type, creature.keywords
      ));
    });

    data.consumables.forEach(consumable => {
      if (consumable.implemented) {
        cards.push(new Consumable(consumable.name, consumable.gold, consumable.ability));
      }
    });
  })
  .catch(error => {
    console.error(error);
  });

const startButton = document.getElementById("start-button");
const settingsButton = document.getElementById("settings-button");

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

settingsButton.onclick = () => {
  const start = settingsButton.parentNode;
  start.remove();
  const settingsPage = document.createElement("div");
  document.body.appendChild(settingsPage);

  const screenMode = document.createElement("button");
  screenMode.innerHTML = "Dark mode";

  screenMode.onclick = () => { displayMode === "white" ? darkMode(screenMode) : lightMode(screenMode) };
  settingsPage.appendChild(screenMode);

  const backButton = document.createElement("button");
  backButton.innerHTML = "Back";
  backButton.onclick = () => { settingsPage.remove(); document.body.appendChild(start); }
  settingsPage.appendChild(backButton);
};

function lightMode(screenMode=undefined) {
  document.body.style.backgroundColor = "white";
  document.body.style.color = "black";
  cards.forEach(card => {
    card.span.style.borderColor = "black";
  });

  document.querySelectorAll('.modal-content').forEach(modal => {
    modal.style.backgroundColor = "white";
  });

  if (screenMode !== undefined) {
    screenMode.innerHTML = "Dark mode";
  }
  
  displayMode = "white";
  localStorage.setItem("displayMode", displayMode);
}

function darkMode(screenMode=undefined) {
  document.body.style.backgroundColor = "black";
  document.body.style.color = "#FAEBD7";
  cards.forEach(card => {
    card.span.style.borderColor = "#FAEBD7";
  });

  document.querySelectorAll('.modal-content').forEach(modal => {
    modal.style.backgroundColor = "black";
  });

  if (screenMode !== undefined) {
    screenMode.innerHTML = "Light mode";
  }

  displayMode = "black";
  localStorage.setItem("displayMode", displayMode);
}

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
    assignCards(players, cards);
  }
}

function assignCards(players, cards) {
  const div = document.createElement("div");
  div.setAttribute("id", "card-choice-div");
  gameDiv.appendChild(div);
  const text = document.createElement("p");
  div.appendChild(text);
  const removedSpans = [];
  let playerIndex = 0;
  let cardCount = 10;

  text.innerHTML = `${players[playerIndex].name}, choose ${cardCount} cards by clicking on them.`;

  cards.forEach(card => {
    const cardSpan = card.span;
    cardSpan.onclick = function chooseCard() {
      if (cardCount > 0) {
        div.removeChild(cardSpan);
        removedSpans.push(cardSpan);
        card.OWNER = players[playerIndex];
        players[playerIndex].deck.push(card.duplicate(), card.copyCard()); 
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
            cards.forEach(card => { card.span.removeEventListener("click", chooseCard); });
            setupGame(players, gameDiv, displayMode);
          };
        }
      }
    };
    div.appendChild(cardSpan);
  });
}

export { displayMode }