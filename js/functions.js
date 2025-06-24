function buildInterface(players, gameDiv, displayMode) {
  const p1Div = document.createElement("div");
  p1Div.setAttribute("id", "player1");
  p1Div.setAttribute("class", "player");
  gameDiv.appendChild(p1Div);
  const textSpace = document.createElement("div");
  textSpace.setAttribute("id", "text-space");
  gameDiv.appendChild(textSpace);
  const p2Div = document.createElement("div");
  p2Div.setAttribute("id", "player2");
  p2Div.setAttribute("class", "player");
  gameDiv.appendChild(p2Div)

  //Stats + end turn button for player 1
  const p1Stats = document.createElement("div");
  p1Stats.setAttribute("class", "player-stats");
  const p1h2 = document.createElement("h2");
  p1h2.innerHTML = `Player: ${players[0].name}`;
  const p1HealthSpan = document.createElement("span");
  p1HealthSpan.innerHTML = "Health: 20";
  const p1GoldSpan = document.createElement("span");
  p1GoldSpan.innerHTML = `Gold: ${players[0].gold}`;
  const p1EndTurn = document.createElement("button");
  p1EndTurn.onclick = () => {players[0].endTurnRoutine();}
  p1EndTurn.innerHTML = "End turn";
  p1Stats.appendChild(p1h2);
  p1Stats.appendChild(p1HealthSpan);
  p1Stats.appendChild(p1GoldSpan);
  p1Stats.appendChild(p1EndTurn);
  p1Div.appendChild(p1Stats);

  //Player 1's hand
  const p1Hand = document.createElement("div");
  p1Hand.setAttribute("class", "player-hand");
  p1Hand.innerHTML = "No cards in hand yet";
  p1Div.appendChild(p1Hand);

  const divs = [p1Div, p2Div]; //for automation of next bit

  //creating row of the draw card button, discard button and the player's side of the board
  for (let i = 0; i < 2; i++) {
    const playerRow = document.createElement("div");
    playerRow.setAttribute("class", "player-row")
    divs[i].appendChild(playerRow);
    
    //draw-card div
    const drawDiv = document.createElement("div");
    drawDiv.setAttribute("class", "draw-pile");
    playerRow.appendChild(drawDiv);
    const drawButton = document.createElement("button");
    drawButton.innerHTML = "Draw Card (for 1 gold)"
    drawButton.onclick = () => {
      players[i].drawCard(1, true); 
      players[i].disable("draw card");
      players[i].div.update();
    };
    drawDiv.appendChild(drawButton);
    const cardsLeft = document.createElement("p");
    cardsLeft.innerHTML = `Cards left: ${players[i].deck.length}`;
    drawDiv.appendChild(cardsLeft);

    //player-board div
    const playerBoard = document.createElement("span");
    playerBoard.innerHTML = "No cards placed...";
    playerRow.appendChild(playerBoard);

    //discards div
    const discardsDiv = document.createElement("div");
    discardsDiv.setAttribute("class", "discards");
    playerRow.appendChild(discardsDiv);
    const discardsButton = document.createElement("button");
    discardsButton.innerHTML = "Open discard pile";
    discardsDiv.appendChild(discardsButton);
    const discardedCards = document.createElement("p");
    discardedCards.innerHTML = `Number of discarded cards: ${players[i].discards.length}`;
    discardsDiv.appendChild(discardedCards);

    //discards modal
    const discardModal = document.createElement("div");
    discardModal.setAttribute("class", "discard-modal");
    discardModal.style.display = "none";
    const modalContent = document.createElement("div");
    modalContent.setAttribute("class", "modal-content");
    modalContent.style.backgroundColor = displayMode === "white" ? "white" : "black";
    discardModal.appendChild(modalContent);
    const modalText = document.createElement("p");
    modalText.innerHTML = "Click on the card to bring back (for 2 gold)";
    modalContent.appendChild(modalText);
    const cardSpace = document.createElement("div");
    modalContent.appendChild(cardSpace);
    discardsButton.onclick = () => {
      discardModal.style.display = "block"; 
      players[i].disable("hand");
      players[i].disable("board");
    };
    window.addEventListener("click", (event) => {
      if (event.target === discardModal) {
        discardModal.style.display = "none";
        players[i].enable("hand");
        players[i].enable("board");
      }
    });
    divs[i].appendChild(discardModal);
  }

  //Player 2's hand
  const p2Hand = document.createElement("div");
  p2Hand.setAttribute("class", "player-hand");
  p2Hand.innerHTML = "No cards in hand yet";
  p2Div.appendChild(p2Hand);

  //Stats + end turn button for player 2
  const p2Stats = document.createElement("div");
  p2Stats.setAttribute("class", "player-stats");
  const p2h2 = document.createElement("h2");
  p2h2.innerHTML = `Player: ${players[1].name}`;
  const p2HealthSpan = document.createElement("span");
  p2HealthSpan.innerHTML = "Health: 20";
  const p2GoldSpan = document.createElement("span");
  p2GoldSpan.innerHTML = `Gold: ${players[1].gold}`;
  const p2EndTurn = document.createElement("button");
  p2EndTurn.onclick = () => {players[1].endTurnRoutine();}
  p2EndTurn.innerHTML = "End turn";
  p2Stats.appendChild(p2HealthSpan);
  p2Stats.appendChild(p2GoldSpan);
  p2Stats.appendChild(p2EndTurn);
  p2Stats.appendChild(p2h2);
  p2Div.appendChild(p2Stats);

  players[0].div = p1Div;
  players[1].div = p2Div;
}

function display(text) {
  document.getElementById("text-space").innerHTML = text;
}

function setupGame(players, gameDiv) {
  buildInterface(players, gameDiv);

  //players draw a starting 6
  players.forEach(player => {
    display(`${player.name} is drawing a starting 6`);
    player.drawCard(6);
  });

  display(`${players[0].name} to move`);
  players[0].startTurnRoutine();
  players[1].disable();
}

export { setupGame, display }