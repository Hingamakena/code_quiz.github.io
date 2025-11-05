const outerDiv = document.getElementById('outer_div');
let dragged = null;
let dragGhost = null;

// ---------------------- DESKTOP DRAG & DROP ----------------------
document.querySelectorAll('.answer_section').forEach(div => {
  div.draggable = true;

  div.addEventListener('dragstart', () => {
    dragged = div;
    dragged.classList.add('dragging');
  });

  div.addEventListener('dragend', () => {
    dragged.classList.remove('dragging');
    dragged = null;
  });

  div.addEventListener('dragover', e => {
    e.preventDefault();
    if (!dragged) return;

    const children = [...outerDiv.children].filter(c => c !== dragged);
    let insertBefore = children.find(child => e.clientY < child.getBoundingClientRect().top + child.offsetHeight / 2);

    if (insertBefore) {
      if (dragged.nextSibling !== insertBefore) {
        outerDiv.insertBefore(dragged, insertBefore);
      }
    } else {
      if (outerDiv.lastElementChild !== dragged) {
        outerDiv.appendChild(dragged);
      }
    }
  });
});

// ---------------------- MOBILE SWAP-ON-DROP WITH GHOST ----------------------
document.querySelectorAll('.answer_section').forEach(div => {
  div.addEventListener('touchstart', e => {
    dragged = div;
    dragged.classList.add('dragging');

    // Create drag ghost
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
  .then(response => response.json())
  .then(data => {
    const snippet = data[0];
    const divs = document.querySelectorAll('.answer_section');
    snippet.code.forEach((line, index) => {
      if (divs[index]) divs[index].textContent = line;
    });
  })
  .catch(err => console.error('Error loading JSON:', err));
