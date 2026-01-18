import Creature from "./creature.js";
import Legendary from "./legendary.js";
import Consumable from "./consumables.js";
import doubleConsumable from "./doubleconsumables.js";
import Player from "./playerClass.js"
import { setupGame } from "./functions.js";

const cards = [];
const players = [];
const gameDiv = document.getElementById("game");
var displayMode = "white";
let goldPerTurn = 4;
let rampPerTurn = 1;

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
      try {
        if (creature.type === "n") {
          cards.push(new Creature(
            creature.name, creature.attack, creature.health, creature.gold, 
            creature.type, creature.keywords, creature.ability1, creature.ability2,
            creature.attribute
          ));
        } else {
          cards.push(new Legendary(
            creature.name, creature.attack, creature.health, creature.gold, 
            creature.type, creature.keywords, creature.ability1, creature.ability2,
            creature.attribute
          ));
        }
      } catch (error) {
        console.log(`There was a problem with loading in ${creature.name}:\n ${error}`)
      }
      
      
    });

    data.consumables.forEach(consumable => {
      try {
        if (consumable.implemented) {
          cards.push(new Consumable(consumable.name, consumable.gold, consumable.ability));
        }
      } catch (error) {
        console.log(`There was a problem with loading in ${consumable.name}:\n ${error}`)
      }
      
    });

    data.doubleConsumables.forEach(dc => {
      try {
        if (dc.implemented) {
          cards.push(new doubleConsumable(
            dc.name, dc.gold1, dc.ability1, dc.gold2, dc.ability2
          ));
        }
      } catch (error) {
        console.log(`There was a problem with loading in ${dc.name}:\n ${error}`)
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
  askingDiv.setAttribute("class", "pregame-page");
  gameDiv.appendChild(askingDiv);

  const text = document.createElement("p");
  askingDiv.appendChild(text);
  text.innerHTML = "Player 1 name:";

  const playerInput = document.createElement("input");
  playerInput.setAttribute("type", "text");
  playerInput.required = true;
  askingDiv.appendChild(playerInput);
  
  const submitButton = document.createElement("button");
  submitButton.setAttribute("class", "submit-button");
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
  settingsPage.setAttribute("id", "settings-page");
  settingsPage.setAttribute("class", "pregame-page");
  document.body.appendChild(settingsPage);

  const screenMode = document.createElement("button");
  screenMode.innerHTML = "Dark mode";

  screenMode.onclick = () => { displayMode === "white" ? darkMode(screenMode) : lightMode(screenMode) };
  settingsPage.appendChild(screenMode);

  const goldModeButon = document.createElement("button");
  goldModeButon.setAttribute("id", "gold-mode");
  goldModeButon.innerHTML = "Gold mode";
  goldModeButon.onclick = changeGoldMode;
  settingsPage.append(goldModeButon)

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

function changeGoldMode() {
  const settingsPage = document.getElementById("settings-page");
  settingsPage.remove();

  const goldDiv = document.createElement("div");
  goldDiv.setAttribute("class", "pregame-page");
  document.body.appendChild(goldDiv);

  const currentSettings = document.createElement("p");
  currentSettings.innerHTML = `Gold per turn: ${goldPerTurn}; Ramp per turn: ${rampPerTurn}`;
  goldDiv.appendChild(currentSettings);

  const text = document.createElement("p");
  text.innerHTML = "Choose what you want to change:";
  goldDiv.appendChild(text);

  const askingDiv = document.createElement("div");

  const input = document.createElement("input");
  input.setAttribute("type", "text");
  input.required = true;
  askingDiv.appendChild(input);

  const submitButton = document.createElement("button");
  submitButton.setAttribute("class", "submit-button");
  submitButton.innerHTML = "Submit";
  askingDiv.appendChild(submitButton);

  const buttonDiv = document.createElement("div");
  goldDiv.appendChild(buttonDiv);

  const changeGoldButton = document.createElement("button");
  changeGoldButton.innerHTML = "Change Gold amount earned per turn";
  buttonDiv.appendChild(changeGoldButton);
  changeGoldButton.onclick = () => {
    buttonDiv.remove();
    goldDiv.appendChild(askingDiv);
    text.innerHTML = "Enter how much gold will be earned per turn:";
    let attempted = 0;
    submitButton.onclick = () => {
      attempted++;
      let value = Number(input.value.trim());
      const warning = document.createElement("p");
      warning.innerHTML = "Enter a number";

      if (!isNaN(value)) {
        text.innerHTML = "Choose what you want to change:";
        input.value = "";
        goldPerTurn = value;
        currentSettings.innerHTML = `Gold per turn: ${goldPerTurn}; Ramp per turn: ${rampPerTurn}`;
        askingDiv.remove();
        goldDiv.appendChild(buttonDiv);
      } else {
        if (attempted === 1) {
          askingDiv.appendChild(warning);
        }
      }
    }
  }

  const changeRampButton = document.createElement("button");
  changeRampButton.innerHTML = "Change ramp amount per turn";
  buttonDiv.appendChild(changeRampButton);
  changeRampButton.onclick = () => {
    buttonDiv.remove();
    goldDiv.appendChild(askingDiv);
    text.innerHTML = "Enter how much gold will ramp up per turn:";
    let attempted = 0;
    submitButton.onclick = () => {
      attempted++;
      let value = Number(input.value.trim());
      const warning = document.createElement("p");
      warning.innerHTML = "Enter a number";

      if (!isNaN(value)) {
        text.innerHTML = "Choose what you want to change:";
        input.value = "";
        rampPerTurn = value;
        currentSettings.innerHTML = `Gold per turn: ${goldPerTurn}; Ramp per turn: ${rampPerTurn}`;
        askingDiv.remove();
        goldDiv.appendChild(buttonDiv);
      } else {
        if (attempted === 1) {
          askingDiv.appendChild(warning);
        }
      }
    }
  }

  const backButton = document.createElement("button");
  backButton.innerHTML = "Back";
  backButton.onclick = () => {
    goldDiv.remove();
    document.body.appendChild(settingsPage);
  }
  buttonDiv.appendChild(backButton);

}

function askForName(inputBox, text, div) {
  if (inputBox.value.trim() !== "") {
    players.push(new Player(inputBox.value.trim(), goldPerTurn, rampPerTurn));
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
  div.setAttribute("class", "pregame-page");
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