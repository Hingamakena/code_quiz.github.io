import { questions, currentQuestion, loadQuestion } from './questions_loader.js';

export function checkOrder() {
  const outerDiv = document.getElementById('outer_div');
  const snippet = questions[currentQuestion];
  const currentLines = [...outerDiv.querySelectorAll('.answer_section')].map(d => d.textContent.trim());
  const correctLines = snippet.correctOrder.map(i => snippet.code[i].trim());

  const isCorrect = JSON.stringify(currentLines) === JSON.stringify(correctLines);

  if (isCorrect) {
    setTimeout(() => {
      if (++currentQuestion < questions.length) {
        loadQuestion(currentQuestion);
      } else {
        alert('🎉 Level one complete, congratulations!');
      }
    }, 300);
  }
}
