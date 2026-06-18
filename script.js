// DOM element selectors
const configContainer = document.querySelector(".config-container");
const quizContainer = document.querySelector(".quiz-container");
const answerOptions = quizContainer.querySelector(".answer-options");
const nextQuestionBtn = quizContainer.querySelector(".next-question-btn");
const questionStatus = quizContainer.querySelector(".question-status");
const timerDisplay = quizContainer.querySelector(".timer-duration");
const resultContainer = document.querySelector(".result-container");
const explanationPopup = document.querySelector(".explanation-popup");
const explanationText = document.querySelector(".explanation-text");
const explanationNextBtn = document.querySelector(".explanation-next-btn");

// Quiz state variables
const QUIZ_TIME_LIMIT = 15;
const quizCategory = "programming";

let currentTime = QUIZ_TIME_LIMIT;
let timer = null;
const numberOfQuestions = Math.min(5, questions[0].questions.length);
let currentQuestion = null;
let currentAudio = null;

const questionsIndexHistory = [];

let correctAnswersCount = 0;
let disableSelection = false;
let currentQuestionNumber = 0;

// Display quiz results
const showQuizResult = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  clearInterval(timer);

  document.querySelector(".quiz-popup").classList.remove("active");
  document.querySelector(".result-popup").classList.add("active");

  const resultText = `You answered <b>${correctAnswersCount}</b> out of <b>${questionsIndexHistory.length}</b> questions correctly.`;

  resultContainer.querySelector(".result-message").innerHTML = resultText;
};

// Reset timer
const resetTimer = () => {
  clearInterval(timer);
  currentTime = QUIZ_TIME_LIMIT;
  timerDisplay.textContent = `${currentTime}s`;
};

// Highlight correct answer
const highlightCorrectAnswer = () => {
  const correctOption =
    answerOptions.querySelectorAll(".answer-option")[currentQuestion.correctAnswer];

  if (!correctOption) return;

  correctOption.classList.add("correct");

  const iconHTML =
    `<span class="material-symbols-rounded">check_circle</span>`;

  correctOption.insertAdjacentHTML("beforeend", iconHTML);
};

// Start timer
const startTimer = () => {
  timer = setInterval(() => {
    currentTime--;

    timerDisplay.textContent = `${currentTime}s`;

    if (currentTime <= 0) {
      clearInterval(timer);

      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }

      disableSelection = true;

      nextQuestionBtn.style.visibility = "visible";

      quizContainer.querySelector(".quiz-timer").style.background =
        "#c31402";

      highlightCorrectAnswer();

      answerOptions
        .querySelectorAll(".answer-option")
        .forEach(
          option => option.style.pointerEvents = "none"
        );
    }
  }, 1000);
};

// Get random question
const getRandomQuestion = () => {
  const categoryQuestions =
    questions.find(
      cat =>
        cat.category.toLowerCase() ===
        quizCategory.toLowerCase()
    )?.questions || [];

  if (
    questionsIndexHistory.length >= categoryQuestions.length
  ) {
    showQuizResult();
    return null;
  }

  const availableQuestions =
    categoryQuestions.filter(
      (_, index) =>
        !questionsIndexHistory.includes(index)
    );

  const randomQuestion =
    availableQuestions[
      Math.floor(
        Math.random() * availableQuestions.length
      )
    ];

  questionsIndexHistory.push(
    categoryQuestions.indexOf(randomQuestion)
  );

  return randomQuestion;
};

const handleAnswer = (option, answerIndex) => {
  if (disableSelection) return;

  clearInterval(timer);
  disableSelection = true;

  const isCorrect = currentQuestion.correctAnswer === answerIndex;

  option.classList.add(isCorrect ? "correct" : "incorrect");

  if (isCorrect) {
    correctAnswersCount++;
  } else {
    highlightCorrectAnswer();
  }

  const iconHTML = `<span class="material-symbols-rounded">
    ${isCorrect ? "check_circle" : "cancel"}
  </span>`;
  option.insertAdjacentHTML("beforeend", iconHTML);

  // disable options
  answerOptions.querySelectorAll(".answer-option")
    .forEach(opt => opt.style.pointerEvents = "none");

  nextQuestionBtn.style.visibility = "hidden";

  // 🛑 STOP AUDIO
  if (currentQuestion.audioInstance) {
    currentQuestion.audioInstance.pause();
    currentQuestion.audioInstance.currentTime = 0;
  }

  // 🎯 SHOW EXPLANATION POPUP
  explanationText.textContent =
    currentQuestion.explanation || "No explanation provided";

  explanationPopup.classList.add("active");
};

const renderQuestion = () => {
  currentQuestionNumber++;
  currentQuestion = getRandomQuestion();
  if (!currentQuestion) return;

  disableSelection = false;

  resetTimer();
  startTimer();

  // UI reset
  nextQuestionBtn.style.visibility = "hidden";
  quizContainer.querySelector(".quiz-timer").style.background = "#32313C";
  quizContainer.querySelector(".question-text").textContent = currentQuestion.question;
  //questionStatus.innerHTML = `<b>${questionsIndexHistory.length + 1}</b> of <b>${numberOfQuestions}</b>`;
  questionStatus.innerHTML =`<b>${currentQuestionNumber}</b> of <b>${numberOfQuestions}</b>`;
  answerOptions.innerHTML = "";

  //AUDIO SETUP (LOOP until answered)
  const whaleAudio = new Audio(currentQuestion.audio);
  whaleAudio.loop = true;
  whaleAudio.play();

  // store so we can stop later
  currentQuestion.audioInstance = whaleAudio;

  // options
  currentQuestion.options.forEach((option, index) => {
    const li = document.createElement("li");
    li.classList.add("answer-option");
    li.textContent = option;

    li.addEventListener("click", () => handleAnswer(li, index));

    answerOptions.append(li);
  });
};
explanationNextBtn.addEventListener("click", () => {
  explanationPopup.classList.remove("active");
  renderQuestion();
});
// Start quiz
const startQuiz = () => {
  document
    .querySelector(".config-popup")
    .classList.remove("active");

  document
    .querySelector(".quiz-popup")
    .classList.add("active");

  currentQuestionNumber = 0;

  renderQuestion();
};


// Reset quiz
const resetQuiz = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  resetTimer();

  correctAnswersCount = 0;
  questionsIndexHistory.length = 0;

  document
    .querySelector(".config-popup")
    .classList.add("active");

  document
    .querySelector(".result-popup")
    .classList.remove("active");
};

// Event listeners
nextQuestionBtn.addEventListener(
  "click",
  renderQuestion
);

resultContainer
  .querySelector(".try-again-btn")
  .addEventListener(
    "click",
    resetQuiz
  );

configContainer
  .querySelector(".start-quiz-btn")
  .addEventListener(
    "click",
    startQuiz
  );