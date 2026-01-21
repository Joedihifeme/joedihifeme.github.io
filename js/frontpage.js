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
let startingHealth = 20;

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
const howToPlayButton = document.getElementById("how-to-play-button");
const creditsButton = document.getElementById("credits-button");
const start = settingsButton.parentNode;

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
  start.remove();
  const settingsPage = document.createElement("div");
  settingsPage.setAttribute("id", "settings-page");
  settingsPage.setAttribute("class", "pregame-page");
  document.body.appendChild(settingsPage);

  const settingsTitle = document.createElement("h1");
  settingsTitle.innerHTML = "Settings";
  settingsPage.appendChild(settingsTitle);

  const screenMode = document.createElement("button");
  screenMode.innerHTML = displayMode === "white" ? "Dark mode" : "Light mode";

  screenMode.onclick = () => { displayMode === "white" ? darkMode(screenMode) : lightMode(screenMode) };
  settingsPage.appendChild(screenMode);

  const goldModeButon = document.createElement("button");
  goldModeButon.setAttribute("id", "gold-mode");
  goldModeButon.innerHTML = "Gold mode";
  goldModeButon.onclick = changeGoldMode;
  settingsPage.appendChild(goldModeButon);

  const healthButton = document.createElement("button");
  healthButton.setAttribute("id", "health-button");
  healthButton.innerHTML = "Change starting health";
  healthButton.onclick = changeStartingHealth;
  settingsPage.appendChild(healthButton);

  const backButton = document.createElement("button");
  backButton.innerHTML = "Back";
  backButton.onclick = () => { settingsPage.remove(); document.body.appendChild(start); }
  settingsPage.appendChild(backButton);
};

howToPlayButton.onclick = () => {
  start.remove();

  const tutorialDiv = document.createElement("div");
  document.body.appendChild(tutorialDiv);

  const tutorialHeading = document.createElement("h1");
  tutorialHeading.innerHTML = "How To Play";
  tutorialDiv.appendChild(tutorialHeading);

  const tutorialText = document.createElement("p");
  tutorialText.setAttribute("id", "tutorial-text");
  tutorialText.innerHTML = 
  `The aim of the game is to be the last one standing. In order to do so, you can pick from 5 different card types:

    Creatures (& Legendaries): These cards can either be tapped to send attacks (red border) or made to block attacks (blue border). Some creatures may have special abilities in the form of keywords (such as (H) for haste) and abilities. Each keyword's definition can be found during the game.
    Consumables: These can be played on a player's turn to the player's advantage or the opponent's misfourtune. They are immediately discarded after use, however.
    Double consumables: These function the same as regular consumables, however have two options, of which one of them can only be picked upon use.
    Structures (coming soon): These can be placed on the board to protect your creatures and the player.
    Tools (coming soon): These can be attatched to creatures already on the board to give them certain keywords or abilites. These stay on the board as a +0/+2 (Attack/Health) when not attatched to a creature.

  Each player starts with 20 lives and picks 10 cards at the start of the game, receiving 2 copies of that card. Each player also starts with 6 cards in their hand and draws a card per turn. An extra card can be drawn per turn at the cost of 1 gold.
  If a creature is killed, a consumable used, a structure fallen or a tool knocked off the board, they go into the player's discard pile. They can be put back into one's hand at the cost of 2 gold.
  
  Good luck out there, and may the best player win!
  `;
  tutorialDiv.appendChild(tutorialText);

  const backButton = document.createElement("button");
  backButton.innerHTML = "Back";
  tutorialDiv.appendChild(backButton);
  backButton.onclick = () => {
    tutorialDiv.remove();
    document.body.appendChild(start);
  }
}

creditsButton.onclick = () => {
  start.remove();

  const creditsDiv = document.createElement("div");
  creditsDiv.setAttribute("class", "pregame-page");
  document.body.appendChild(creditsDiv);

  const creditsText = document.createElement("p");
  creditsText.innerHTML = 
  `This card game is actually made by a friend of mine.<br>`;
  const hyperlink = document.createElement("a");
  hyperlink.target = "_blank";
  hyperlink.title = "My GitHub page";
  hyperlink.href = "https://github.com/Joedihifeme";
  hyperlink.innerHTML = "Programming was done by joedihifeme<br><br>";
  creditsDiv.appendChild(creditsText);
  creditsDiv.appendChild(hyperlink);

  const backButton = document.createElement("button");
  backButton.innerHTML = "Back";
  backButton.onclick = () => {
    creditsDiv.remove();
    document.body.append(start);
  }
  creditsDiv.append(backButton);
}

function lightMode(screenMode=undefined) {
  const root = document.querySelector(":root");
  root.style.setProperty("--background-colour", "white");
  root.style.setProperty("--opposing-colour", "black");

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
  const root = document.querySelector(":root");
  root.style.setProperty("--background-colour", "black");
  root.style.setProperty("--opposing-colour", "#FAEBD7");

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
  buttonDiv.appendChild(changeGoldButton);

  const changeRampButton = document.createElement("button");
  changeRampButton.innerHTML = "Change ramp amount per turn";
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
  buttonDiv.appendChild(changeRampButton);

  const backButton = document.createElement("button");
  backButton.innerHTML = "Back";
  backButton.onclick = () => {
    goldDiv.remove();
    document.body.appendChild(settingsPage);
  }
  buttonDiv.appendChild(backButton);

}

function changeStartingHealth() {
  const settingsPage = document.getElementById("settings-page");
  settingsPage.remove();

  const healthDiv = document.createElement("div");
  healthDiv.setAttribute("class", "pregame-page");
  document.body.appendChild(healthDiv);

  const text = document.createElement("p");
  text.innerHTML = "Choose the amount of lives both players will start with:";
  healthDiv.appendChild(text);

  const input = document.createElement("input");
  input.setAttribute("type", "text");
  input.required = true;
  healthDiv.appendChild(input);

  const submitButton = document.createElement("button");
  submitButton.innerHTML = "Submit";
  let attempted = 0;
  submitButton.onclick = () => {
    attempted++;
    let value = Number(input.value.trim());

    if (!isNaN(value)) {
      input.value = "";
      startingHealth = value;
      healthDiv.remove();
      document.body.appendChild(settingsPage);
    } else {
      if (attempted === 1) {
        const warning = document.createElement("p");
        warning.innerHTML = "Enter a number";
        healthDiv.appendChild(warning);
      }
    }
  }
  healthDiv.appendChild(submitButton);

}

function askForName(inputBox, text, div) {
  if (inputBox.value.trim() !== "") {
    players.push(new Player(inputBox.value.trim(), goldPerTurn, rampPerTurn, startingHealth));
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

  const randomCardButton = document.createElement("button");
  randomCardButton.style.marginLeft = "25px"
  randomCardButton.innerHTML = "Random card";
  randomCardButton.onclick = () => {
    let success = false;

    while(!success) {
      const randomCard = cards.randomElement();
      if (!removedSpans.includes(randomCard.span)) {
        success = true;
        chooseCard(randomCard);
      }
    }
    
  }

  text.appendChild(randomCardButton);

  cards.forEach(card => {
    card.span.onclick = () => { chooseCard(card); }
    div.appendChild(card.span);
  });

  function chooseCard(card) {
    if (cardCount > 0) {
      div.removeChild(card.span);
      removedSpans.push(card.span);
      card.OWNER = players[playerIndex];
      players[playerIndex].deck.push(card.duplicate(), card.copyCard()); 
      cardCount--;
      text.innerHTML = `${players[playerIndex].name}, choose ${cardCount} cards by clicking on them.`;
      text.appendChild(randomCardButton);

      if (cardCount === 0) {
        playerIndex++;
        
        if (playerIndex < players.length) {
          removedSpans.forEach(span => {div.appendChild(span)});
          cardCount = 10;
          text.innerHTML = `${players[playerIndex].name}, choose ${cardCount} cards by clicking on them.`;
          text.appendChild(randomCardButton);
        } else {
          div.remove();
          cards.forEach(card => { card.span.removeEventListener("click", chooseCard); });
          setupGame(players, gameDiv, displayMode);
        };
      }
    }
  };
}

export { displayMode }