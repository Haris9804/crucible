// ======================= CyberSec Academy Script =======================

const modulesState = {};

// ======================= Load Questions =======================
async function loadQuestions(moduleNumber) {
    const response = await fetch(`questions/m${moduleNumber}.json`);
    return await response.json();
}

// ======================= Initialize =======================
document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll('.take-test-btn').forEach(btn => {
        const moduleNumber = btn.dataset.module;
        const moduleCard = document.getElementById(`module${moduleNumber}`);
        const statusSpan = moduleCard.querySelector('.module-status');

        // Restore saved status
        const savedStatus = JSON.parse(localStorage.getItem(`module${moduleNumber}-status`));
        if (savedStatus) {
            statusSpan.textContent = savedStatus.statusText;
            statusSpan.dataset.status = savedStatus.status;
            if (savedStatus.status === "completed") {
                btn.textContent = "View Score";
            }
        }

        btn.addEventListener('click', async () => {

            if (btn.textContent === "View Score") {
                await viewScore(moduleNumber);
                return;
            }

            statusSpan.textContent = "Ongoing";
            statusSpan.dataset.status = "ongoing";
            localStorage.setItem(`module${moduleNumber}-status`,
                JSON.stringify({ status: "ongoing", statusText: "Ongoing" })
            );

            if (!modulesState[moduleNumber]) {
                const questions = await loadQuestions(moduleNumber);
                modulesState[moduleNumber] = {
                    questions,
                    currentIndex: 0,
                    scores: [],
                    viewOnly: false
                };
            }

            renderQuestion(moduleNumber);
        });
    });

});

// ======================= Render Question =======================
function renderQuestion(moduleNumber, viewOnly = false) {

    const state = modulesState[moduleNumber];
    const { currentIndex, questions, scores } = state;
    const questionData = questions[currentIndex];
    const quizContainer = document.getElementById(`module${moduleNumber}-quiz`);

    quizContainer.innerHTML = `
        <div class="module-test-grid">

            <div class="topics-container">
                <div class="topic" id="module${moduleNumber}-q${currentIndex}">
                    <h3>${currentIndex + 1}. ${questionData.question}</h3>

                    ${questionData.options.map((opt, i) =>
                        `<button data-answer="${i}" 
                            onclick="selectOption(this)"
                            ${viewOnly ? "disabled" : ""}>
                            ${opt}
                        </button>`
                    ).join("")}

                    <label>
                        Confidence:
                        <span class="confidence-value">60</span>
                    </label>

                    <input type="range"
                        class="confidence-slider"
                        min="0" max="100" value="60"
                        oninput="updateConfidence(this)"
                        ${viewOnly ? "disabled" : ""}>

                    ${!viewOnly ?
                        `<button class="submit-question"
                            id="submit-btn-${moduleNumber}"
                            onclick="submitQuestion(${moduleNumber})">
                            Submit
                        </button>`
                        : ""
                    }

                    <div class="navigation-buttons">
                        ${currentIndex > 0 ?
                            `<button class="back-btn"
                                    onclick="prevQuestion(${moduleNumber})">
                                Back
                            </button>` : ""
                        }

                        ${currentIndex < questions.length - 1 ?
                            `<button class="next-btn"
                                onclick="nextQuestion(${moduleNumber})"
                                style="display:none;">
                                Next
                            </button>`
                            :
                            `<button class="finish-btn"
                                onclick="finishModule(${moduleNumber})"
                                style="display:none;">
                                Finish Test
                            </button>`
                        }
                    </div>

                    <p class="score-display"></p>
                </div>
            </div>

            <aside class="module-score-panel">
                <p id="module${moduleNumber}-test-total"
                   style="font-weight:bold; margin-bottom:1rem;"></p>

                <button class="reset-module-btn"
                    onclick="resetModule(${moduleNumber})">
                    Reset Test
                </button>

                <button class="close-module-btn"
                        onclick="endModule(${moduleNumber})">
                    Close Test
                </button>
            </aside>

        </div>
    `;

    restoreSavedAnswer(moduleNumber);
    updateModuleTotal(moduleNumber);
}

// ======================= Restore Answer =======================
function restoreSavedAnswer(moduleNumber) {

    const state = modulesState[moduleNumber];
    const { currentIndex } = state;
    const topic = document.getElementById(`module${moduleNumber}-q${currentIndex}`);

    const saved = JSON.parse(localStorage.getItem(`module${moduleNumber}-q${currentIndex}`));
    if (!saved) return;

    topic.dataset.submitted = true;
    topic.querySelector('.confidence-slider').value = saved.confidence;
    topic.querySelector('.confidence-value').textContent = saved.confidence;
    topic.querySelector('.score-display').textContent = `Score: ${saved.score}`;

    topic.querySelectorAll('button[data-answer]').forEach(btn => {
        btn.disabled = true;
        if (parseInt(btn.dataset.answer) === saved.selected) {
            btn.classList.add(saved.score >= 0 ? "correct" : "wrong");
        }
    });
// Hide submit button
const submitBtn = topic.querySelector('.submit-question');
if (submitBtn) submitBtn.style.display = "none";

// Show next or finish button
const navBtn = topic.querySelector('.next-btn, .finish-btn');
if (navBtn) navBtn.style.display = "inline-block";
}

// ======================= Select Option =======================
function selectOption(button) {
    const topic = button.closest('.topic');
    if (topic.dataset.submitted) return;

    topic.dataset.selected = button.dataset.answer;
    topic.querySelectorAll('button[data-answer]')
        .forEach(btn => btn.classList.remove("selected"));

    button.classList.add("selected");
}

// ======================= Confidence =======================
function updateConfidence(slider) {
    slider.parentElement.querySelector('.confidence-value')
        .textContent = slider.value;
}

// ======================= Submit =======================
function submitQuestion(moduleNumber) {

    const state = modulesState[moduleNumber];
    const { currentIndex, questions } = state;
    const topic = document.getElementById(`module${moduleNumber}-q${currentIndex}`);

    if (!topic.dataset.selected) {
        alert("Please select an option.");
        return;
    }

    const selected = parseInt(topic.dataset.selected);
    const correct = questions[currentIndex].correct_option;
    const confidence = parseInt(topic.querySelector('.confidence-slider').value);
    const score = selected === correct ? confidence : -confidence;

    state.scores[currentIndex] = score;

    topic.querySelector('.score-display').textContent = `Score: ${score}`;
    topic.dataset.submitted = true;

    topic.querySelectorAll('button[data-answer]').forEach(btn => {
        btn.disabled = true;
        if (parseInt(btn.dataset.answer) === selected) {
            btn.classList.add(selected === correct ? "correct" : "wrong");
        }
    });

    localStorage.setItem(`module${moduleNumber}-q${currentIndex}`,
        JSON.stringify({ selected, confidence, score })
    );

    // Hide submit button
const submitBtn = topic.querySelector('.submit-question');
if (submitBtn) submitBtn.style.display = "none";

// Show next button
const navBtn = topic.querySelector('.next-btn, .finish-btn');
if (navBtn) navBtn.style.display = "inline-block";

    updateModuleTotal(moduleNumber);
}

// ======================= Navigation =======================
function nextQuestion(moduleNumber) {
    modulesState[moduleNumber].currentIndex++;
    renderQuestion(moduleNumber, modulesState[moduleNumber].viewOnly);
}

function prevQuestion(moduleNumber) {
    modulesState[moduleNumber].currentIndex--;
    renderQuestion(moduleNumber, modulesState[moduleNumber].viewOnly);
}

// ======================= Finish =======================
function finishModule(moduleNumber) {

    const state = modulesState[moduleNumber];
    const total = state.scores.reduce((a, b) => a + b, 0);
    const max = state.questions.length * 100;
    const percent = Math.round((total / max) * 100);

    const quizContainer = document.getElementById(`module${moduleNumber}-quiz`);

    quizContainer.innerHTML = `
        <div class="final-result">
            <h3>Test Completed!</h3>
            <p>Total Score: ${total} / ${max} (${percent}%)</p>
            <p>${percent >= 70 ? "✅ Passed!" : "❌ Failed!"}</p>

            <button onclick="resetModule(${moduleNumber})">
                Reset Test
            </button>

            <button onclick="endModule(${moduleNumber})">
                Close Test
            </button>
        </div>
    `;

    const moduleCard = document.getElementById(`module${moduleNumber}`);
    moduleCard.querySelector('.take-test-btn').textContent = "View Score";

    const statusSpan = moduleCard.querySelector('.module-status');
    statusSpan.textContent = "Completed";
    statusSpan.dataset.status = "completed";

    localStorage.setItem(`module${moduleNumber}-status`,
        JSON.stringify({ status: "completed", statusText: "Completed" })
    );
}

// ======================= View Score =======================
async function viewScore(moduleNumber) {

    const questions = await loadQuestions(moduleNumber);

    modulesState[moduleNumber] = {
        questions,
        currentIndex: 0,
        scores: questions.map((_, idx) => {
            const saved = JSON.parse(localStorage.getItem(`module${moduleNumber}-q${idx}`));
            return saved ? saved.score : 0;
        }),
        viewOnly: true
    };

    renderQuestion(moduleNumber, true);
}

// ======================= Reset =======================
function resetModule(moduleNumber) {

    const state = modulesState[moduleNumber];
    if (!state) return;

    state.currentIndex = 0;
    state.scores = [];
    state.viewOnly = false;

    state.questions.forEach((_, idx) =>
        localStorage.removeItem(`module${moduleNumber}-q${idx}`)
    );

    localStorage.removeItem(`module${moduleNumber}-status`);

    const moduleCard = document.getElementById(`module${moduleNumber}`);
    moduleCard.querySelector('.take-test-btn').textContent = "Take Test";

    const statusSpan = moduleCard.querySelector('.module-status');
    statusSpan.textContent = "Unattended";
    statusSpan.dataset.status = "unattended";

    endModule(moduleNumber);
}

// ======================= Close =======================
function endModule(moduleNumber) {
    document.getElementById(`module${moduleNumber}-quiz`).innerHTML = "";
}

// ======================= Update Total =======================
function updateModuleTotal(moduleNumber) {

    const state = modulesState[moduleNumber];
    if (!state) return;

    const total = state.scores.reduce((a, b) => a + b, 0);
    const max = state.questions.length * 100;
    const percent = max ? Math.round((total / max) * 100) : 0;

    const display = document.getElementById(`module${moduleNumber}-test-total`);
    if (display) {
        display.textContent = `Total Score: ${total} / ${max} (${percent}%)`;
    }
}