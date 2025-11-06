// ---------------------- GLOBAL VARIABLES ----------------------
const outerDiv = document.getElementById('outer_div');
let dragged = null;
let dragGhost = null;
let questions = [];
let currentQuestion = 0;

// ---------------------- HELPER FUNCTIONS ----------------------
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function shuffleLines(lines) {
  const indexedLines = lines.map((line, i) => ({ line, index: i }));
  for (let i = indexedLines.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexedLines[i], indexedLines[j]] = [indexedLines[j], indexedLines[i]];
  }
  const shuffledLines = indexedLines.map(obj => obj.line);
  const correctOrder = indexedLines.map(obj => obj.index);
  return { lines: shuffledLines, correctOrder };
}

function moveGhost(touch) {
  if (!dragGhost) return;
  dragGhost.style.left = `${touch.clientX - dragGhost.offsetWidth / 2}px`;
  dragGhost.style.top = `${touch.clientY - dragGhost.offsetHeight / 2}px`;
}

// ---------------------- LOAD QUESTIONS ----------------------
fetch('questions.json')
  .then(res => res.json())
  .then(data => {
    // Shuffle questions
    questions = shuffleArray(data);

    // Shuffle lines for each question
    questions.forEach(q => {
      const shuffled = shuffleLines(q.code);
      q.shuffledCode = shuffled.lines;
      q.correctOrder = shuffled.correctOrder;
    });

    loadQuestion(currentQuestion);
  })
  .catch(err => console.error('Error loading JSON:', err));

function loadQuestion(index) {
  const snippet = questions[index];
  const divs = document.querySelectorAll('.answer_section');

  snippet.shuffledCode.forEach((line, i) => {
    if (divs[i]) divs[i].textContent = line;
  });

  console.log(`Question ${index + 1} loaded`);
}

// ---------------------- CHECK ORDER & NEXT QUESTION ----------------------
function checkOrder() {
  if (!questions.length) return;

  const snippet = questions[currentQuestion];
  const currentLines = [...outerDiv.querySelectorAll('.answer_section')].map(div => div.textContent.trim());
  const correctLines = snippet.correctOrder.map(i => snippet.code[i].trim());

  const isCorrect = JSON.stringify(currentLines) === JSON.stringify(correctLines);

  if (isCorrect) {
    setTimeout(() => {
      currentQuestion++;
      if (currentQuestion < questions.length) {
        loadQuestion(currentQuestion);
      } else {
        alert("🎉 Level one complete, congratulations!");
      }
    }, 400);
  }
}

// ---------------------- DESKTOP DRAG & DROP ----------------------
document.querySelectorAll('.answer_section').forEach(div => {
  div.draggable = true;

  div.addEventListener('dragstart', e => {
    dragged = div;
    div.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
  });

  div.addEventListener('dragend', () => {
    dragged.classList.remove('dragging');
    dragged = null;
    checkOrder();
  });
});

outerDiv.addEventListener('dragover', e => {
  e.preventDefault();
  if (!dragged) return;

  const afterElement = getDragAfterElement(outerDiv, e.clientY);
  if (!afterElement) {
    outerDiv.appendChild(dragged);
  } else {
    outerDiv.insertBefore(dragged, afterElement);
  }
});

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.answer_section:not(.dragging)')];
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// ---------------------- MOBILE SWAP-ON-DROP ----------------------
document.querySelectorAll('.answer_section').forEach(div => {
  div.addEventListener('touchstart', e => {
    dragged = div;
    dragged.classList.add('dragging');

    dragGhost = div.cloneNode(true);
    dragGhost.style.position = 'absolute';
    dragGhost.style.pointerEvents = 'none';
    dragGhost.style.opacity = '0.7';
    dragGhost.style.zIndex = '1000';
    document.body.appendChild(dragGhost);

    moveGhost(e.touches[0]);
  });

  div.addEventListener('touchmove', e => {
    e.preventDefault();
    if (!dragged) return;
    moveGhost(e.touches[0]);
  });

  div.addEventListener('touchend', e => {
    if (!dragged) return;

    const touch = e.changedTouches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.answer_section');

    if (target && target !== dragged) {
      const draggedNext = dragged.nextSibling === target ? dragged : dragged.nextSibling;
      const targetNext = target.nextSibling === dragged ? target : target.nextSibling;

      target.parentNode.insertBefore(dragged, targetNext);
      target.parentNode.insertBefore(target, draggedNext);
    }

    dragged.classList.remove('dragging');
    if (dragGhost) document.body.removeChild(dragGhost);
    dragged = null;
    dragGhost = null;

    checkOrder();
  });
});
