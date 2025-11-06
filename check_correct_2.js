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
      div.classList.remove('dragging');
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

// Helper
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

// ---------------------- LOAD QUESTIONS ----------------------
async function loadQuestions() {
  try {
    const res = await fetch('questions.json');
    const data = await res.json();

    // Shuffle question order
    questions = shuffleArray(data);
    currentQuestion = 0;

    loadQuestion(currentQuestion);
  } catch (err) {
    console.error('Error loading JSON:', err);
  }
}

function loadQuestion(index) {
  const snippet = questions[index];
  const shuffledLines = shuffleArray([...snippet.code]); // display lines shuffled

  outerDiv.innerHTML = ''; // clear previous question
  shuffledLines.forEach(line => {
    const div = document.createElement('div');
    div.classList.add('answer_section');
    div.textContent = line;
    outerDiv.appendChild(div);
  });

  enableDesktopDrag(outerDiv);
  enableMobileSwap();

  console.log(`✅ Loaded question ${index + 1}`);
}

// ---------------------- CHECK ORDER ----------------------
function checkOrder() {
  if (!questions.length) return;

  const snippet = questions[currentQuestion];
  const userOrder = [...outerDiv.querySelectorAll('.answer_section')].map(div => div.textContent.trim());
  const correctOrder = snippet.code.map(line => line.trim());

  const isCorrect = userOrder.length === correctOrder.length &&
                    userOrder.every((line, i) => line === correctOrder[i]);

  if (isCorrect) {
    console.log(`✅ Question ${currentQuestion + 1} correct!`);
    setTimeout(() => {
      currentQuestion++;
      if (currentQuestion < questions.length) {
        loadQuestion(currentQuestion);
      } else {
        alert('🎉 Level one complete, congratulations!');
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
window.addEventListener('DOMContentLoaded', loadQuestions);
