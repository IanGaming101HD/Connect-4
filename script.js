let positions = Array.from(document.getElementsByClassName('position'));
let closeButton = document.getElementById('close-button');
let continueButton = document.getElementById('continue-button');
let popupContainer = document.getElementById('popup-container');
let colours = {
  red: '#FF0000',
  yellow: '#FFFF00'
};
sessionStorage.setItem('ColoursTurn', 'red');

function formatText(text) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

function displayPopup(title, message) {
  let popupHeader = document.getElementById('popup-header');
  let popupParagraph = document.getElementById('popup-paragraph');
  popupHeader.innerText = title
  popupParagraph.innerText = message
  popupContainer.hidden = false
  lockBoard()
}

function draw() {
  displayPopup('Draw', 'It was a draw!')
}

function win(colour) {
  displayPopup('Win', `Winner: ${formatText(colour)}`)
}

function lockBoard() {
  positions.forEach((pos) => pos.disabled = true)
}

function unlockBoard() {
  positions.forEach((pos) => pos.disabled = false)
}

function clearBoard() {
  positions.forEach((pos) => {
    if (Object.values(colours).includes(convertRgbToHex(getComputedStyle(pos).getPropertyValue('background-color')))) {
      pos.style.backgroundColor = '#FFFFFF';
    }
  })
}

function checkColumn(x, colour) {
  let columnPositions = positions.filter((pos) => pos.id.charAt(0) === x).sort((a, b) => (a.id > b.id ? 1 : b.id > a.id ? -1 : 0));
  let consecutiveColours = 0
  let hasFourConsecutiveColours = columnPositions.some((pos) => {
    if (convertRgbToHex(getComputedStyle(pos).getPropertyValue('background-color')) === colours[colour]) {
      consecutiveColours += 1
      if (consecutiveColours >= 4) {
        return true
      }
    } else {
      consecutiveColours = 0
    }
  })
  return hasFourConsecutiveColours
}

function checkRow(y, colour) {
  let rowPositions = positions.filter((pos) => pos.id.charAt(1) === y).sort((a, b) => (a.id > b.id ? 1 : b.id > a.id ? -1 : 0));
  let consecutiveColours = 0
  let hasFourConsecutiveColours = rowPositions.some((pos) => {
    if (convertRgbToHex(getComputedStyle(pos).getPropertyValue('background-color')) === colours[colour]) {
      consecutiveColours += 1
      if (consecutiveColours >= 4) {
        return true
      }
    } else {
      consecutiveColours = 0
    }
  })
  return hasFourConsecutiveColours
}

function checkDiagonals(x, y, colour) {
  let startX = x.charCodeAt(0) - 'a'.charCodeAt(0);
  let startY = parseInt(y) - 1;

  function checkDirection(deltaX, deltaY) {
    let consecutiveColours = 0;
    for (let i = -3; i <= 3; i++) {
      let currentX = String.fromCharCode(startX + deltaX * i + 'a'.charCodeAt(0));
      let currentY = (startY + deltaY * i + 1).toString();
      if (currentX < 'a' || currentX > 'g' || currentY < '1' || currentY > '6') continue;
      let pos = positions.find(p => p.id === currentX + currentY);
      if (pos && convertRgbToHex(getComputedStyle(pos).getPropertyValue('background-color')) === colours[colour]) {
        consecutiveColours += 1;
        if (consecutiveColours >= 4) return true;
      } else {
        consecutiveColours = 0;
      }
    }
    return false;
  }
  return checkDirection(1, 1) || checkDirection(-1, 1) || checkDirection(1, -1) || checkDirection(-1, -1);
}

function checkBoard(x, y, colour) {
  if (checkColumn(x, colour) || checkRow(y, colour) || checkDiagonals(x, y, colour)) {
    win(colour)
    return;
  }

  let possiblePositions = positions.filter((pos) => !Object.values(colours).includes(convertRgbToHex(getComputedStyle(pos).getPropertyValue('background-color'))))
  if (possiblePositions.length === 0) {
    draw()
  }
}

function placePiece(position) {
  let column = positions.filter((pos) => pos.id.charAt(0) === position.id.charAt(0) && !Object.values(colours).includes(convertRgbToHex(getComputedStyle(pos).getPropertyValue('background-color')))).sort((a, b) => (a.id > b.id ? 1 : b.id > a.id ? -1 : 0));
  if (column && column.length !== 0) {
    let hoverPiece = document.getElementById(`hover-piece-${position.id.charAt(0)}`)
    let colour = sessionStorage.getItem('ColoursTurn');
    let newPosition = column[0]
    newPosition.style.backgroundColor = colours[colour];

    if (colour === 'red') {
      sessionStorage.setItem('ColoursTurn', 'yellow');
    } else if (colour === 'yellow') {
      sessionStorage.setItem('ColoursTurn', 'red');
    }
    checkBoard(newPosition.id.charAt(0), newPosition.id.charAt(1), colour)
    hoverPiece.style.backgroundColor = sessionStorage.getItem('ColoursTurn')
  }
}

function convertRgbToHex(rgba) {
  hex = `#${rgba
    .match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+\.{0,1}\d*))?\)$/)
    .slice(1)
    .map((n, i) =>
      (i === 3 ? Math.round(parseFloat(n) * 255) : parseFloat(n))
        .toString(16)
        .padStart(2, '0')
        .replace('NaN', '')
    )
    .join('')}`.toUpperCase();
  return hex;
}

function onHover(position) {
  let hoverPiece = document.getElementById(`hover-piece-${position.id.charAt(0)}`)
  let colour = sessionStorage.getItem('ColoursTurn')
  hoverPiece.style.visibility = 'visible'
  hoverPiece.style.backgroundColor = colour
}

function onHoverLeave(position) {
  let hoverPiece = document.getElementById(`hover-piece-${position.id.charAt(0)}`)
  hoverPiece.style.visibility = 'hidden'
  hoverPiece.style.backgroundColor = 'transparent'
}

positions.forEach((position) => {
  position.addEventListener('click', (event) => placePiece(position));
  position.addEventListener('mouseover', (event) => onHover(position));
  position.addEventListener('mouseleave', (event) => onHoverLeave(position));
});

[closeButton, continueButton].forEach((button) => button.addEventListener('click', (event) => {
  sessionStorage.setItem('ColoursTurn', 'red')
  popupContainer.hidden = true
  unlockBoard()
  clearBoard()
}))