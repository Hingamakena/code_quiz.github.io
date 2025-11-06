import { loadQuestions } from './questions_loader.js';
import { enableDesktopDrag } from './desktop_swap.js';
import { enableMobileSwap } from './mobile_swap.js';
import { checkOrder } from './progress_checker.js';

window.addEventListener('DOMContentLoaded', async () => {
  await loadQuestions();

  const outerDiv = document.getElementById('outer_div');

  // Enable both desktop and mobile functionality
  enableDesktopDrag(outerDiv, checkOrder);
  enableMobileSwap(checkOrder);
});
