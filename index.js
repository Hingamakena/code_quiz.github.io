const outerDiv = document.getElementById('outer_div');
let dragged = null;
let dragGhost = null;

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
  });
});

// Dragover on container for smooth reordering
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
  });
});

function moveGhost(touch) {
  if (!dragGhost) return;
  dragGhost.style.left = `${touch.clientX - dragGhost.offsetWidth / 2}px`;
  dragGhost.style.top = `${touch.clientY - dragGhost.offsetHeight / 2}px`;
}

// ---------------------- LOAD DATA FROM JSON ----------------------
fetch('questions.json')
  .then(res => res.json())
  .then(data => {
    const snippet = data[0];
    const divs = document.querySelectorAll('.answer_section');
    snippet.code.forEach((line, i) => {
      if (divs[i]) divs[i].textContent = line;
    });
  })
  .catch(err => console.error('Error loading JSON:', err));
