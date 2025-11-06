const outerDiv = document.getElementById('outer_div');
let dragged = null;
let dragGhost = null;
let questions = [];
let currentQuestion = 0;

// ---------------------- DESKTOP DRAG & DROP ----------------------
function enableDesktopDrag(container) {
  container.querySelectorAll('.answer_section').forEach(div => {
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

  container.addEventListener('dragover', e => {
    e.preventDefault();
    if (!dragged) return;

    const afterElement = getDragAfterElement(container, e.clientY);
    if (!afterElement) {
      container.appendChild(dragged);
    } else {
      container.insertBefore(dragged, afterElement);
    }
  });
}

// Helper: find closest element to mouse
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
function enableMobileSwap() {
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
}

function moveGhost(touch) {
  if (!dragGhost) return;
  dragGhost.style.left = `${touch.clientX - dragGhost.offsetWidth / 2}px`;
  dragGhost.style.top = `${touch.clientY - dragGhost.offsetHeight / 2}px`;
}

// ---------------------- LOAD QUESTIONS FROM JSON ----------------------
async function loadQuestions() {
  try {
    const res = await fetch('questions.json');
    const data = await res.json();

    // Shuffle questions
    questions = shuffleArray(data);
    currentQuestion = 0;

    loadQuestion(currentQuestion);
  } catch (err) {
    console.error('Error loading JSON:', err);
  }
}

function loadQuestion(index) {
  const snippet = questions[index];
  const divs = document.querySelectorAll('.answer_section');

  // Shuffle lines for display
  const shuffledLines = shuffleArray([...snippet.code]);

  snippet.shuffled = shuffledLines; // save for reference
  divs.forEach((div, i) => {
    div.textContent = shuffledLines[i] || '';
  });

  console.log(`Question ${index + 1} loaded`);
}

// ---------------------- CHECK ORDER & NEXT QUESTION ----------------------
function checkOrder() {
  if (!questions.length) return;

  const snippet = questions[currentQuestion];
  const divs = [...outerDiv.querySelectorAll('.answer_section')];

  const currentLines = divs.map(div => div.textContent.trim());
  const correctLines = snippet.code.map(line => line.trim());

  const isCorrect = currentLines.length === correctLines.length &&
                    currentLines.every((line, idx) => line === correctLines[idx]);

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

// ---------------------- UTILITY ----------------------
function shuffleArray(array) {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

// ---------------------- INITIALIZE ----------------------
window.addEventListener('DOMContentLoaded', async () => {
  enableDesktopDrag(outerDiv);
  enableMobileSwap();
  await loadQuestions();
});
