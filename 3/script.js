// List of chapter JSON files
const chapters = [1,2,3,4,5]; // Adjust as needed

const chaptersContainer = document.getElementById('chapters-container');
let allCards = [];

// Setup modal functionality
function setupModals(cards) {
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');

    function closeModal() { modal.style.display = 'none'; }
    window.onclick = e => { if(e.target === modal) closeModal(); }

    document.querySelectorAll('.learn-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const card = cards[btn.dataset.index];
            let commandsHtml = '';
            card.main_commands.forEach(cmd => {
                commandsHtml += `<div class="command-box">
                    <div class="command">${cmd.command}</div>
                    <div class="explanation">${cmd.explanation}</div>
                </div>`;
            });
            modalContent.innerHTML = `<span id="modal-close">&times;</span>
                <h3>${card.title}</h3>
                <p>${card.description_long}</p>
                ${commandsHtml}`;
            modal.style.display = 'flex';
            document.getElementById('modal-close').onclick = closeModal;
        });
    });

    document.querySelectorAll('.activity-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const card = cards[btn.dataset.index];
            let activityHtml = '';
            card.activity.forEach(act => {
                activityHtml += `<div class="activity-line">- ${act}</div>`;
            });
            modalContent.innerHTML = `<span id="modal-close">&times;</span>
                <h3>${card.title} - Activities</h3>
                ${activityHtml}`;
            modal.style.display = 'flex';
            document.getElementById('modal-close').onclick = closeModal;
        });
    });
}

// Load all chapters
let chapterPromises = chapters.map(chNum =>
    fetch(`chapter${chNum}.json`).then(res => res.json())
);

Promise.all(chapterPromises)
.then(allData => {
    allData.forEach(chapterData => {
        // Chapter heading
        const chapterSection = document.createElement('section');
        chapterSection.classList.add('chapter-section');

        const chapterHeading = document.createElement('h2');
        chapterHeading.textContent = chapterData.chapter_title;
        chapterHeading.classList.add('chapter-heading');

        const cardsContainer = document.createElement('div');
        cardsContainer.classList.add('chapter-cards');

        // Add cards
        chapterData.cards.forEach(card => {
            const cardEl = document.createElement('div');
            cardEl.classList.add('topic');

            const globalIndex = allCards.length;
            allCards.push(card);

            cardEl.innerHTML = `
                <h3>${card.title}</h3>
                <p>${card.description_short}</p>
                <div>
                    <button class="learn-btn" data-index="${globalIndex}">Learn More</button>
                    <button class="activity-btn" data-index="${globalIndex}">Try Activity</button>
                </div>
            `;
            cardsContainer.appendChild(cardEl);
        });

        chapterSection.appendChild(chapterHeading);
        chapterSection.appendChild(cardsContainer);
        chaptersContainer.appendChild(chapterSection);
    });

    setupModals(allCards);
})
.catch(err => console.error("Failed to load chapters:", err));