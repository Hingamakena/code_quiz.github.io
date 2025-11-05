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


// ----- TOUCH SUPPORT (for mobile) -----
document.querySelectorAll('.answer_section').forEach(div => {
  div.addEventListener('touchstart', e => {
    dragged = div;
    dragStartY = e.touches[0].clientY;
    placeholder = document.createElement('div');
    placeholder.classList.add('answer_section');
    placeholder.style.visibility = 'hidden';
    placeholder.style.height = `${div.offsetHeight}px`;
    div.classList.add('dragging');
  });

  div.addEventListener('touchmove', e => {
    e.preventDefault();
    const touchY = e.touches[0].clientY;
    const afterElement = getDragAfterElement(outerDiv, touchY);
    if (afterElement == null) {
      outerDiv.appendChild(dragged);
    } else {
      outerDiv.insertBefore(dragged, afterElement);
    }
  });

  div.addEventListener('touchend', () => {
    dragged.classList.remove('dragging');
    dragged = null;
    placeholder = null;
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
