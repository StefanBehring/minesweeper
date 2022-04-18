class Field {
  constructor(posX, posY) {
    this.posX = posX;
    this.posY = posY;
    this.isBomb = false;
    this.isSecured = false;
    this.surroundingBombs = 0;
    this.neighbors = [];
  }

  getElementId() {
    return `x${this.posX}y${this.posY}`;
  }

  changeSecured() {
    this.isSecured = !this.isSecured;
  }

  createFieldDiv(fieldIndex) {
    const field = document.createElement("div");
    field.classList.add("field");
    field.setAttribute("oncontextmenu", "event.preventDefault();");
    field.setAttribute("id", this.getElementId());
    field.addEventListener("mouseup", (e) => {
      if (e.button === 2) {
        if (!fieldsCleared.includes(fieldIndex)) {
          this.changeSecured();
          if (this.isSecured) {
            field.classList.add("secure");
          } else {
            field.classList.remove("secure");
          }
        }
      } else {
        if (!this.isSecured) {
          if (this.isBomb) {
            field.classList.add("bomb");
            gameLost = true;
          } else {
            addToFieldsCleared(fieldIndex);
            addSaveToField(field, this.surroundingBombs);
            if (this.surroundingBombs === 0) {
              clearEmptyFields(this);
            }
          }
        }
        checkWinLost();
      }
    });
    return field;
  }
}

/*
  GAME SETTINGS
*/

const PLAYFIELD_WIDTH = 10;
const PLAYFIELD_HEIGHT = 10;
const BOMBS_COUNT = 10;
let gameWon = false;
let gameLost = false;
const fields = [];
const fieldsCleared = [];

/*
  INIT
*/

const app = document.getElementById("app");
let playfield = null;

runGame();

/*
  FUNCTIONS
*/

function runGame() {
  app.innerHTML = "";
  playfield = createPlayfieldDiv();
  app.append(playfield);
  gameWon = false;
  gameLost = false;
  fields.length = 0;
  fieldsCleared.length = 0;
  createPlayfield();
  placeBombs();
  getNeighbors();
  getSurroundingBombs();
  drawPlayfield();
}

function createPlayfield() {
  for (let y = 0; y < PLAYFIELD_HEIGHT; y++) {
    for (let x = 0; x < PLAYFIELD_WIDTH; x++) {
      const newField = new Field(x, y);
      fields.push(newField);
    }
  }
}

function placeBombs() {
  for (let i = 1; i <= BOMBS_COUNT; i++) {
    let success = false;
    do {
      const posX = getRandomInt(PLAYFIELD_WIDTH);
      const posY = getRandomInt(PLAYFIELD_HEIGHT);

      const bombFieldIndex = fields.findIndex(
        (field) => field.posX === posX && field.posY === posY
      );
      if (!fields[bombFieldIndex].isBomb) {
        fields[bombFieldIndex].isBomb = true;
        success = true;
      }
    } while (!success);
  }
}

function getNeighbors() {
  for (let field of fields) {
    for (let x = field.posX - 1; x <= field.posX + 1; x++) {
      if (x >= 0 && x < PLAYFIELD_WIDTH) {
        for (let y = field.posY - 1; y <= field.posY + 1; y++) {
          if (
            y >= 0 &&
            y < PLAYFIELD_HEIGHT &&
            !(field.posX === x && field.posY === y)
          ) {
            const neighborIndex = fields.findIndex(
              (el) => el.posX === x && el.posY === y
            );
            field.neighbors.push(neighborIndex);
          }
        }
      }
    }
  }
}

function getSurroundingBombs() {
  for (let field of fields) {
    let bombs = 0;
    for (let neighborIndex of field.neighbors) {
      if (fields[neighborIndex].isBomb) {
        bombs++;
      }
    }
    field.surroundingBombs = bombs;
  }
}

function drawPlayfield() {
  fields.forEach((field, index) => {
    const newField = field.createFieldDiv(index);
    playfield.append(newField);
  });
}

function clearEmptyFields(startField) {
  const clearedFields = [
    fields.findIndex(
      (el) => startField.posX === el.posX && startField.posY === el.posY
    ),
  ];
  const unclearedFields = [...startField.neighbors];

  do {
    const checkFieldIndex = unclearedFields.shift();
    const checkField = fields[checkFieldIndex];
    clearedFields.push(checkFieldIndex);

    if (checkField.surroundingBombs === 0) {
      for (let neighborIndex of checkField.neighbors) {
        if (!clearedFields.includes(neighborIndex)) {
          unclearedFields.push(neighborIndex);
        }
      }
    }

    const stone = document.getElementById(checkField.getElementId());

    addToFieldsCleared(checkFieldIndex);
    addSaveToField(stone, checkField.surroundingBombs);
  } while (unclearedFields.length > 0);
}

function createPlayfieldDiv() {
  const newPlayfield = document.createElement("div");
  newPlayfield.setAttribute("id", "playfield");
  return newPlayfield;
}

function addToFieldsCleared(fieldIndex) {
  if (!fieldsCleared.includes(fieldIndex)) {
    fieldsCleared.push(fieldIndex);
  }
}

function addSaveToField(field, surroundingBombs) {
  field.classList.remove("secure");
  field.classList.add("save");
  if (surroundingBombs > 0) {
    field.innerText = surroundingBombs;
  }
}

function checkWinLost() {
  gameWon =
    fieldsCleared.length === PLAYFIELD_HEIGHT * PLAYFIELD_WIDTH - BOMBS_COUNT;

  if (gameWon) {
    addGameEndDiv("Gewonnen");
  } else if (gameLost) {
    addGameEndDiv("Verloren");
  }
}

function addGameEndDiv(status) {
  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.setAttribute(
    "style",
    "width: " +
      PLAYFIELD_WIDTH * 2.4 +
      "rem;height: " +
      PLAYFIELD_HEIGHT * 2.4 +
      "rem;"
  );

  const pStatus = document.createElement("p");
  pStatus.textContent = status;
  modal.append(pStatus);

  const playAgainBtn = document.createElement("button");
  playAgainBtn.textContent = "Play again!";
  playAgainBtn.addEventListener("click", () => {
    runGame();
  });
  modal.append(playAgainBtn);

  playfield.append(modal);
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
