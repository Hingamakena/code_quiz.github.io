const outerDiv = document.getElementById('outer_div'); // match your HTML ID
let dragged = null;

// Make sections draggable
document.querySelectorAll('.answer_section').forEach(div => {
  div.draggable = true;

  // Start dragging
  div.addEventListener('dragstart', () => {
    dragged = div;
    div.classList.add('dragging');
  });

  // Drag end
  div.addEventListener('dragend', () => {
    div.classList.remove('dragging');
    dragged = null;
  });

  // Dragging over another div
  div.addEventListener('dragover', e => {
    e.preventDefault(); // allow drop
  });

  // Dropping onto another div
  div.addEventListener('drop', e => {
    e.preventDefault();
    if (dragged && dragged !== div) {
      const all = Array.from(outerDiv.children);
      const draggedIndex = all.indexOf(dragged);
      const targetIndex = all.indexOf(div);

      if (draggedIndex > targetIndex) {
        outerDiv.insertBefore(dragged, div);
      } else {
        outerDiv.insertBefore(dragged, div.nextSibling);
      }
    }
  });
});
