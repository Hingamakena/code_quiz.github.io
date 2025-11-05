const outerDiv = document.getElementById('outer_div');
let dragged = null;
let dragStartY = 0;
let placeholder = null;

// ----- DESKTOP DRAG & DROP -----
document.querySelectorAll('.answer_section').forEach(div => {
  div.draggable = true;

  div.addEventListener('dragstart', () => {
    dragged = div;
    div.classList.add('dragging');
  });

  div.addEventListener('dragend', () => {
    div.classList.remove('dragging');
    dragged = null;
  });

  div.addEventListener('dragover', e => {
    e.preventDefault();
    const afterElement = getDragAfterElement(outerDiv, e.clientY);
    if (!dragged) return;
    if (afterElement == null) {
      outerDiv.appendChild(dragged);
    } else {
      outerDiv.insertBefore(dragged, afterElement);
    }
  });
});

// helper for desktop drag (simplified + smoother)
function getDragAfterElement(container, y) {
  const elements = [...container.querySelectorAll('.answer_section:not(.dragging)')];
  let closest = null;
  let closestOffset = Number.POSITIVE_INFINITY;

  elements.forEach(el => {
    const box = el.getBoundingClientRect();
    const offset = y - box.top;
    if (offset < closestOffset && offset > 0) {
      closestOffset = offset;
      closest = el;
    }
  });
  return closest;
}

// ----- MOBILE TOUCH: swap on drop -----
document.querySelectorAll('.answer_section').forEach(div => {
  div.addEventListener('touchstart', e => {
    dragged = div;
    dragged.classList.add('dragging');
  });

  div.addEventListener('touchend', e => {
    if (!dragged) return;

    // Find the element currently under the finger
    const touch = e.changedTouches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.answer_section');

    if (target && target !== dragged) {
      // Swap positions of dragged and target divs
      const draggedNext = dragged.nextSibling === target ? dragged : dragged.nextSibling;
      const targetNext = target.nextSibling === dragged ? target : target.nextSibling;

      target.parentNode.insertBefore(dragged, targetNext);
      target.parentNode.insertBefore(target, draggedNext);
    }

    dragged.classList.remove('dragging');
    dragged = null;
  });
});


  
// ----- LOAD DATA FROM JSON -----
fetch('questions.json')
  .then(response => response.json())
  .then(data => {
    const snippet = data[0];
    const divs = document.querySelectorAll('.answer_section');
    snippet.code.forEach((line, index) => {
      if (divs[index]) divs[index].textContent = line;
    });
  })
  .catch(err => console.error('Error loading JSON:', err));
