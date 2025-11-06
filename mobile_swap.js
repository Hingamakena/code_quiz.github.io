export function enableMobileSwap(onDropCallback) {
  let dragged = null;
  let dragGhost = null;

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
      if (dragGhost) moveGhost(e.touches[0]);
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

      onDropCallback(); // ✅ trigger check
    });
  });
}

function moveGhost(touch) {
  if (!touch) return;
  dragGhost.style.left = `${touch.clientX - dragGhost.offsetWidth / 2}px`;
  dragGhost.style.top = `${touch.clientY - dragGhost.offsetHeight / 2}px`;
}
