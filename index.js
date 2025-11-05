const outerDiv = document.getElementById('outer_div');
let dragged = null;
let placeholder = null;
let dragGhost = null;

// ---------------------- DESKTOP DRAG & DROP (Smooth & Correct) ----------------------
document.querySelectorAll('.answer_section').forEach(div => {
  div.draggable = true;

  div.addEventListener('dragstart', e => {
    dragged = div;
    dragged.classList.add('dragging');

    // Hide dragged element visually while using placeholder
    div.style.display = 'none';

    // Create placeholder for spacing
    placeholder = document.createElement('div');
    placeholder.className = 'answer_section placeholder';
    placeholder.style.height = `${div.offsetHeight}px`;
    outerDiv.insertBefore(placeholder, div.nextSibling);

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
  });

  div.addEventListener('dragend', () => {
    // Show dragged element again
    dragged.style.display = '';

    if (placeholder) {
      outerDiv.replaceChild(dragged, placeholder);
      placeholder = null;
    }
    dragged.classList.remove('dragging');
    dragged = null;
  });

  div.addEventListener('dragover', e => {
    e.preventDefault();
    if (!dragged || !placeholder) return;

    const rect = div.getBoundingClientRect();
    const next = (e.clientY - rect.top) > rect.height / 2;

    if (next && div.nextSibling !== placeholder) {
      outerDiv.insertBefore(placeholder, div.nextSibling);
    } else if (!next && div !== placeholder.nextSibling) {
      outerDiv.insertBefore(placeholder, div);
    }
  });
});

// ---------------------- MOBILE SWAP-ON-DROP WITH GHOST ----------------------
document.querySelectorAll('.answer_section').forEach(div => {
  div.addEventListener('touchstart', e => {
    dragged = div;
    dragged.classList.add('dragging');

    // Create ghost for finger dragging
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
