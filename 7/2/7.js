// Expand / Collapse Card
function toggleCard(button) {
    const card = button.closest(".vuln-card");
    card.classList.toggle("active");
    const expandBtn = card.querySelector(".expand-btn");
    expandBtn.style.display = card.classList.contains("active") ? "none" : "inline-block";
}

// Copy payload
function copySingle(button) {
    const code = button.parentElement.querySelector("code").innerText;
    navigator.clipboard.writeText(code).then(() => {
        button.innerText = "Copied!";
        setTimeout(() => button.innerText = "Copy", 1200);
    });
}

// Update progress tracker
function updateProgress() {
    const cards = document.querySelectorAll(".vuln-card");
    const total = cards.length;
    let completed = 0;

    cards.forEach(card => {
        const cardId = card.dataset.id;
        const savedStatus = localStorage.getItem(cardId);
        if (savedStatus === "completed") completed++;
    });

    const tracker = document.getElementById("progress-tracker");
    tracker.innerText = `Sections completed: ${completed} / ${total}`;
}

// Learnt / Reset toggle
function toggleLearnt(button) {
    const card = button.closest(".vuln-card");
    const statusBadge = card.querySelector(".status-badge");
    const cardId = card.dataset.id;

    if (button.innerText === "Mark Complete") {
        statusBadge.innerText = "Completed";
        statusBadge.style.color = "green";
        localStorage.setItem(cardId, "completed");
        button.innerText = "Reset";
        button.style.background = "#ffcc00";
    } else {
        statusBadge.innerText = "Incomplete";
        statusBadge.style.color = "red";
        localStorage.setItem(cardId, "incomplete");
        button.innerText = "Mark Complete";
        button.style.background = "#00ff00";
    }

    updateProgress();
}

// Load saved status
window.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".vuln-card").forEach(card => {
        const cardId = card.dataset.id;
        const statusBadge = card.querySelector(".status-badge");
        const learntBtn = card.querySelector(".learnt-btn");
        const savedStatus = localStorage.getItem(cardId);

        if (savedStatus === "completed") {
            statusBadge.innerText = "Completed";
            statusBadge.style.color = "green";
            learntBtn.innerText = "Reset";
            learntBtn.style.background = "#ffcc00";
        } else {
            statusBadge.innerText = "Incomplete";
            statusBadge.style.color = "red";
            learntBtn.innerText = "Mark Complete";
            learntBtn.style.background = "#00ff00";
        }
    });

    updateProgress();
});