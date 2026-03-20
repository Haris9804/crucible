// Expand / Collapse Card
function toggleCard(button) {

    const card = button.closest(".vuln-card");
    const cards = Array.from(document.querySelectorAll(".vuln-card"));
    const index = cards.indexOf(card);

    const warning = document.getElementById("phase-warning");

    if(index !== 0){
        const previousCard = cards[index-1];
        const prevId = previousCard.dataset.id;
        const prevStatus = localStorage.getItem(prevId);

        if(prevStatus !== "completed"){

            const prevTitle = previousCard.querySelector("h3").innerText;

            warning.innerText = `⚠ Complete "${prevTitle}" before accessing this phase`;
            warning.classList.add("show");

            setTimeout(()=>{
                warning.classList.remove("show");
            },3000);

            return;
        }
    }

    card.classList.toggle("active");

    const expandBtn = card.querySelector(".expand-btn");
    expandBtn.style.display = card.classList.contains("active") ? "none" : "inline-block";
}

/*
function contactAdmin(button){
    const card = button.closest(".vuln-card");
    const phaseTitle = card.querySelector("h3").innerText;

    const message = encodeURIComponent("Hi Admin, I have an issue with " + phaseTitle);
    
    const phone = "91xxxxxxxxxx"; // replace with your number

    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
}
*/

function contactAdmin(button){

    const card = button.closest(".vuln-card");
    const title = card.querySelector("h3").innerText;

    const phaseNumber = title.match(/Phase\s*\d+/i);
    const message = encodeURIComponent(`Issue in ${phaseNumber}`);

    const phone = "91xxxxxxxxxx";

    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
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

    const isCompleted = button.dataset.state === "completed";

    if (!isCompleted) {

        statusBadge.innerText = "Completed";
        statusBadge.style.color = "green";

        localStorage.setItem(cardId, "completed");

        button.innerText = "Reset";
        button.style.background = "#ffcc00";
        button.dataset.state = "completed";

    } else {

        statusBadge.innerText = "Incomplete";
        statusBadge.style.color = "red";

        localStorage.setItem(cardId, "incomplete");

        button.innerText = "Mark Complete";
        button.style.background = "#00ff00";
        button.dataset.state = "incomplete";
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
    learntBtn.dataset.state = "completed";

} else {

    statusBadge.innerText = "Incomplete";
    statusBadge.style.color = "red";

    learntBtn.innerText = "Mark Complete";
    learntBtn.style.background = "#00ff00";
    learntBtn.dataset.state = "incomplete";
}
    });

    updateProgress();
});