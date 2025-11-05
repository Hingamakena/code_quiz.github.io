// ----- SIMPLE DRAG & DROP -----
const outerDiv = document.getElementById('outer_div');
let dragged = null;

// desktop
outerDiv.addEventListener('dragstart', e => {
  if (e.target.classList.contains('answer_section')) {
    dragged = e.target;
    e.target.classList.add('dragging');
  }
});

outerDiv.addEventListener('dragend', () => {
  if (dragged) dragged.classList.remove('dragging');
  dragged = null;
});

outerDiv.addEventListener('dragover', e => {
  e.preventDefault();
  const after = Array.from(outerDiv.querySelectorAll('.answer_section'))
    .find(div => e.clientY < div.getBoundingClientRect().top + div.offsetHeight / 2);
  outerDiv.insertBefore(dragged, after || null);
});

// mobile
outerDiv.addEventListener('touchstart', e => {
  if (!e.target.classList.contains('answer_section')) return;
  dragged = e.target;
  dragged.classList.add('dragging');
});

outerDiv.addEventListener('touchmove', e => {
  if (!dragged) return;
  e.preventDefault();
  const touch = e.touches[0];
  const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);
  const target = elemBelow?.closest('.answer_section');
  if (target && target !== dragged) {
    const before = touch.clientY < target.getBoundingClientRect().top + target.offsetHeight / 2;
    outerDiv.insertBefore(dragged, before ? target : target.nextSibling);
  }
});

outerDiv.addEventListener('touchend', () => {
  if (dragged) dragged.classList.remove('dragging');
  dragged = null;
});

// ----- LOAD DATA FROM JSON -----
fetch('questions.json')
  .then(res => res.json())
  .then(data => {
    const snippet = data[0];
    snippet.code.forEach(line => {
      const div = document.createElement('div');
      div.className = 'answer_section';
      div.draggable = true;
      div.textContent = line;
      outerDiv.appendChild(div);
    });
  })
  .catch(err => console.error('Error loading JSON:', err));
