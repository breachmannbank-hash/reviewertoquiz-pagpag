const reviewerText = document.getElementById("reviewerText");
const generateBtn = document.getElementById("generateBtn");
const clearBtn = document.getElementById("clearBtn");
const questionsList = document.getElementById("questionsList");
const message = document.getElementById("message");
const connectionStatus = document.getElementById("connectionStatus");

const STORAGE_KEYS = {
  text: "reviewerText",
  questions: "generatedQuestions",
};

function setMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
}

function updateConnectionStatus() {
  const online = navigator.onLine;
  connectionStatus.textContent = online ? "Online" : "Offline";
  connectionStatus.classList.toggle("online", online);
  connectionStatus.classList.toggle("offline", !online);
}

function saveReviewerText() {
  localStorage.setItem(STORAGE_KEYS.text, reviewerText.value);
}

function saveQuestions(questions) {
  localStorage.setItem(STORAGE_KEYS.questions, JSON.stringify(questions));
}

function getSavedQuestions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.questions)) || [];
  } catch {
    return [];
  }
}

function renderQuestions(questions) {
  questionsList.innerHTML = "";

  if (!questions.length) {
    questionsList.innerHTML = '<p class="empty-state">No saved questions found yet.</p>';
    return;
  }

  questions.slice(0, 5).forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "question-card";

    const title = document.createElement("h3");
    title.textContent = `${index + 1}. ${item.question}`;

    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = "Show answer";

    const answer = document.createElement("p");
    answer.className = "answer";
    answer.textContent = item.answer;

    details.append(summary, answer);
    card.append(title, details);
    questionsList.appendChild(card);
  });
}

function loadSavedData() {
  const savedText = localStorage.getItem(STORAGE_KEYS.text);
  const savedQuestions = getSavedQuestions();

  if (savedText) {
    reviewerText.value = savedText;
  }

  if (savedQuestions.length) {
    renderQuestions(savedQuestions);
  }
}

async function generateQuestions() {
  const text = reviewerText.value.trim();
  saveReviewerText();

  if (!text) {
    setMessage("Please paste reviewer text first.", true);
    return;
  }

  if (!navigator.onLine) {
    setMessage("You are offline. Showing saved questions instead.");
    renderQuestions(getSavedQuestions());
    return;
  }

  generateBtn.disabled = true;
  generateBtn.textContent = "Generating...";
  setMessage("Generating questions...");

  try {
    const response = await fetch("/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to generate questions.");
    }

    saveQuestions(data.questions);
    renderQuestions(data.questions);
    setMessage("Questions generated and saved.");
  } catch (error) {
    const savedQuestions = getSavedQuestions();

    if (savedQuestions.length) {
      renderQuestions(savedQuestions);
      setMessage("Could not reach the server. Showing saved questions instead.");
    } else {
      setMessage(error.message, true);
    }
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = "Generate Questions";
  }
}

function clearSavedData() {
  localStorage.removeItem(STORAGE_KEYS.text);
  localStorage.removeItem(STORAGE_KEYS.questions);
  reviewerText.value = "";
  renderQuestions([]);
  setMessage("Saved reviewer text and questions were cleared.");
}

window.addEventListener("online", updateConnectionStatus);
window.addEventListener("offline", () => {
  updateConnectionStatus();
  setMessage("You are offline. Showing saved questions instead.");
  renderQuestions(getSavedQuestions());
});

reviewerText.addEventListener("input", saveReviewerText);
generateBtn.addEventListener("click", generateQuestions);
clearBtn.addEventListener("click", clearSavedData);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js").catch(() => {
    console.warn("Service worker registration failed.");
  });
}

updateConnectionStatus();
loadSavedData();

if (!navigator.onLine) {
  setMessage("You are offline. Showing saved questions instead.");
  renderQuestions(getSavedQuestions());
}
