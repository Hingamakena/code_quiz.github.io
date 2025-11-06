const outerDiv = document.getElementById('outer_div');
let dragged = null;
let dragGhost = null;
let questions = [];
let currentQuestion = 0;

// ---------------------- DESKTOP DRAG & DROP ----------------------
function enableDesktopDrag(outerDiv, checkOrder) {
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
}

// ---------------------- MOBILE SWAP-ON-DROP ----------------------
function enableMobileSwap(checkOrder) {
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

  function moveGhost(touch) {
    if (!dragGhost) return;
    dragGhost.style.left = `${touch.clientX - dragGhost.offsetWidth / 2}px`;
    dragGhost.style.top = `${touch.clientY - dragGhost.offsetHeight / 2}px`;
  }
}

// ---------------------- LOAD & SHUFFLE QUESTIONS ----------------------
async function loadQuestions() {
  try {
    const res = await fetch('questions.json');
    let data = await res.json();

    // Shuffle questions
    data = data.sort(() => Math.random() - 0.5);

    questions = data;
    loadQuestion(currentQuestion);
  } catch (err) {
    console.error('Error loading JSON:', err);
  }
}

function loadQuestion(index) {
  const snippet = questions[index];
  const divs = document.querySelectorAll('.answer_section');

  // Shuffle lines visually, but keep original for check
  const shuffledLines = [...snippet.code].sort(() => Math.random() - 0.5);

  shuffledLines.forEach((line, i) => {
    if (divs[i]) divs[i].textContent = line;
  });

  console.log(`Question ${index + 1} loaded`);
}

// ---------------------- CHECK ORDER ----------------------
function checkOrder() {
  if (!questions.length) return;

  const snippet = questions[currentQuestion];
  const divs = [...outerDiv.querySelectorAll('.answer_section')];
  const currentLines = divs.map(div => div.textContent.trim());

  const isCorrect = currentLines.join('\n') === snippet.code.join('\n');

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

// ---------------------- INIT ----------------------
window.addEventListener('DOMContentLoaded', async () => {
  await loadQuestions();
  enableDesktopDrag(outerDiv, checkOrder);
  enableMobileSwap(checkOrder);
});
