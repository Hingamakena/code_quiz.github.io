const outerDiv = document.getElementById('outer_div');
let dragged = null;

// Make sections draggable and attach events
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
    e.preventDefault(); // allow drop
  });

  div.addEventListener('drop', e => {
    e.preventDefault();
    if (dragged && dragged !== div) {
      // Get all children
      const all = Array.from(outerDiv.children);
      const draggedIndex = all.indexOf(dragged);
      const targetIndex = all.indexOf(div);

      // Swap positions directly
      if (draggedIndex < targetIndex) {
        outerDiv.insertBefore(div, dragged); // move target before dragged
        outerDiv.insertBefore(dragged, all[targetIndex + 1] || null); // move dragged to target's original position
      } else {
        outerDiv.insertBefore(dragged, div); // move dragged before target
        outerDiv.insertBefore(div, all[draggedIndex + 1] || null); // move target to dragged's original position
      }
    }
  });
});

// Load the JSON file
fetch('questions.json')
  .then(response => response.json())
  .then(data => {
    // Pick the first snippet for now (you can randomize)
    const snippet = data[0];

    // Get the outer container
    const outerDiv = document.getElementById('outer_div');

    // Loop through each line in the snippet
    snippet.code.forEach(line => {
      const div = document.createElement('div');
      div.classList.add('answer_section');
      div.textContent = line; // display each line of code
      outerDiv.appendChild(div);
    });
  })
  .catch(error => console.error('Error loading JSON:', error));

