export function enableDesktopDrag(outerDiv, onDropCallback) {
  let dragged = null;

  outerDiv.addEventListener('dragstart', e => {
    if (!e.target.classList.contains('answer_section')) return;
    dragged = e.target;
    dragged.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
  });

  outerDiv.addEventListener('dragend', () => {
    if (!dragged) return;
    dragged.classList.remove('dragging');
    dragged = null;
    onDropCallback(); // 🔥 trigger correctness check
  });

  outerDiv.addEventListener('dragover', e => {
    e.preventDefault();
    const afterElement = getDragAfterElement(outerDiv, e.clientY);
    if (!afterElement) outerDiv.appendChild(dragged);
    else outerDiv.insertBefore(dragged, afterElement);
  });
}

function getDragAfterElement(container, y) {
  const elements = [...container.querySelectorAll('.answer_section:not(.dragging)')];
  return elements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) return { offset, element: child };
    else return closest;
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}
