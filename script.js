// Dynamic header quotes
const quotes = [
    "Hack the planet, ethically.",
    "Stay curious, stay safe.",
    "Knowledge is your best firewall.",
    "Think like a hacker, defend like a pro.",
    "Cybersecurity is a mindset."
];

let currentQuote = 0;
const headerQuote = document.getElementById('header-quote');

function updateQuote() {
    headerQuote.style.opacity = 0;
    setTimeout(() => {
        currentQuote = (currentQuote + 1) % quotes.length;
        headerQuote.textContent = quotes[currentQuote];
        headerQuote.style.opacity = 1;
    }, 500);
}

setInterval(updateQuote, 5000);

// Optional: fade-in animation for topics
document.querySelectorAll('.topic').forEach((card, index) => {
    card.style.opacity = 0;
    setTimeout(() => {
        card.style.transition = 'opacity 0.5s';
        card.style.opacity = 1;
    }, index * 150);
});