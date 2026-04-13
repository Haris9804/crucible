const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const modalBody = document.getElementById("modal-body");

const modalNext = document.getElementById("modal-next");
const modalPrev = document.getElementById("modal-prev");
const modalClose = document.getElementById("modal-close");

let currentSlide = 0;
let currentCard = null;

const chapters = [
{ id:1,title:"Ethical Hacking Basics",file:"chapter1.json"},
{ id:2,title:"Common Cyber Attacks",file:"chapter2.json"},
{ id:3,title:"Tools Basics",file:"chapter3.json"},
{ id:4,title:"Hacking Terminologies",file:"chapter4.json"},
{ id:5,title:"Hacking Hygiene & Ethical Awareness",file:"chapter5.json"}
];

const container=document.getElementById("chapters-container");

async function loadChapters(){

for(const chapter of chapters){

try{

const res=await fetch(chapter.file);
const data=await res.json();

const section=document.createElement("section");
section.classList.add("chapter");

const title=document.createElement("h2");
title.classList.add("chapter-title");
title.textContent=`Chapter ${chapter.id}: ${data.chapter_title}`;

section.appendChild(title);

const cards=document.createElement("div");
cards.classList.add("chapter-cards");

data.cards.forEach(card=>{

const el=document.createElement("div");
el.classList.add("topic");

const h3=document.createElement("h3");
h3.textContent=card.title;

const p=document.createElement("p");
p.textContent=card.description_short;

const btn=document.createElement("button");
btn.textContent="Learn More";

btn.onclick=()=>openModal(card);

el.appendChild(h3);
el.appendChild(p);
el.appendChild(btn);

cards.appendChild(el);

});

section.appendChild(cards);
container.appendChild(section);

}catch(err){
console.error(err);
}

}

}

function openModal(card){

currentCard=card;
currentSlide=0;

modalTitle.textContent=card.title;

renderSlide();

modal.style.display="flex";

}

function renderSlide(){

if(currentSlide===0){

modalBody.innerHTML=`<p>${currentCard.description_long}</p>`;

modalPrev.style.display="none";
modalNext.style.display="inline-block";

}

else if(currentSlide===1){

let points="<ul>";

currentCard.main_points.forEach(p=>{
points+=`<li>${p}</li>`;
});

points+="</ul>";

modalBody.innerHTML=points;

modalPrev.style.display="inline-block";
modalNext.style.display="inline-block";

}

else if(currentSlide===2){

const formattedExample = currentCard.example.replace(/\n/g, "<br>");

modalBody.innerHTML = `<p>${formattedExample}</p>`;

modalPrev.style.display="inline-block";
modalNext.style.display="none";

}

}

modalNext.onclick=()=>{
currentSlide++;
renderSlide();
}

modalPrev.onclick=()=>{
currentSlide--;
renderSlide();
}

modalClose.onclick=()=>{
modal.style.display="none";
}

window.onclick=e=>{
if(e.target===modal){
modal.style.display="none";
}
}

window.addEventListener("keydown",e=>{
if(e.key==="Escape"){
modal.style.display="none";
}
});

loadChapters();