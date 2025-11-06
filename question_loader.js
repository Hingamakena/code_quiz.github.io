export let questions = [];
export let currentQuestion = 0;

export function loadQuestions() {
  return fetch('questions.json')
    .then(res => res.json())
    .then(data => {
      questions = data;
      loadQuestion(currentQuestion);
    });
}

export function loadQuestion(index) {
  const container = document.getElementById('outer_div');
  container.innerHTML = '';

  const snippet = questions[index];
  snippet.code.forEach(line => {
    const div = document.createElement('div');
    div.className = 'answer_section';
    div.textContent = line;
    container.appendChild(div);
  });
}
