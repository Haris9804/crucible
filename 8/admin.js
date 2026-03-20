// =============================
// GLOBAL
// =============================
const notify = (msg, type = "success") => {
    const box = document.getElementById("admin-notification");
    box.innerText = msg;
    box.className = type;
    box.style.display = "block";
    setTimeout(() => box.style.display = "none", 5000);
};

function logoutAdmin() {
    localStorage.removeItem("ADMIN_LOGGED_IN");
    window.location.href = "index.html";
}

// =============================
// CONFIRMATION MODAL
// =============================
const modal = document.getElementById("confirmation-modal");
const modalMessage = document.getElementById("confirmation-message");
const confirmBtn = document.getElementById("confirm-btn");
const closeBtn = document.getElementById("close-btn");

let modalCallback = null;


function highlightActiveTab(tabName) {
    const tabs = document.querySelectorAll(".key-tabs .tab-btn");
    tabs.forEach(tab => tab.classList.remove("active"));

    if (tabName === "master") tabs[0].classList.add("active");
    else if (tabName === "pass") tabs[1].classList.add("active");
    else if (tabName === "admin") tabs[2].classList.add("active");
}


function openConfirmation(message, callback) {
    modalMessage.innerText = message;
    modal.style.display = "flex";
    modalCallback = callback;
}

confirmBtn.onclick = () => {
    if (modalCallback) modalCallback();
    closeModal();
};

closeBtn.onclick = closeModal;

function closeModal() {
    modal.style.display = "none";
    modalCallback = null;
}

// =============================
// =============================
// SECTION 1 - KEY MANAGEMENT
// =============================
// =============================

let currentKeyType = "master";
let adminKeyData = null;


async function loadAdminKey() {
    currentKeyType = "admin";
    await loadAdmin();
}

async function loadAdmin() {
    const res = await fetch(`/api/admin-page/get-admin-key`);
    const data = await res.json();
    adminKeyData = data;

    document.getElementById("key-content").innerHTML = `
        <div class="key-box">
            <div><strong>ADMIN USERNAME:</strong> <input type="text" id="admin-username" value="${data.ADMIN_USERNAME}" disabled /></div>
            <div><strong>ADMIN PASSWORD:</strong> <input type="text" id="admin-password" value="${data.ADMIN_PASSWORD}" disabled /></div>
            <div class="key-buttons">
                <button onclick="editAdminKey()">Edit</button>
                <button onclick="regenerateAdminKey()">Regenerate</button>
            </div>
        </div>
    `;
}

async function loadMasterKey() {
    currentKeyType = "master";
    highlightActiveTab("master");
    loadKey();
}

async function loadPassKey() {
    currentKeyType = "pass";
    highlightActiveTab("pass");
    loadKey();
}

async function loadAdminKey() {
    currentKeyType = "admin";
    highlightActiveTab("admin");
    await loadAdmin();
}

async function loadKey() {
    const res = await fetch(`/api/admin-page/get-key/${currentKeyType}`);
    const data = await res.json();

    const statusColor = data.STATUS === "Active" ? "green" : "red";

    document.getElementById("key-content").innerHTML = `
        <div class="key-box">
            <div><strong>Status:</strong> 
                <span style="color:${statusColor}">${data.STATUS}</span>
            </div>

            <input type="text" id="key-input" value="${data.KEY}" disabled />

            <div class="key-buttons">
                <button onclick="editKey()">Edit</button>
                <button onclick="toggleKeyStatus()">
                    ${data.STATUS === "Active" ? "Deactivate Key" : "Activate Key"}
                </button>
                <button onclick="regenerateKey()">Regenerate Key</button>
            </div>
        </div>
    `;
}

function editKey() {
    const input = document.getElementById("key-input");
    input.disabled = false;

    document.querySelector(".key-buttons").innerHTML = `
        <button onclick="updateKey()">Update</button>
        <button onclick="loadKey()">Close</button>
    `;
}

function editAdminKey() {
    document.getElementById("admin-username").disabled = false;
    document.getElementById("admin-password").disabled = false;

    document.querySelector(".key-buttons").innerHTML = `
        <button onclick="updateAdminKey()">Update</button>
        <button onclick="loadAdmin()">Cancel</button>
    `;
}

async function updateAdminKey() {
    const username = document.getElementById("admin-username").value;
    const password = document.getElementById("admin-password").value;

    await fetch(`/api/admin-page/update-admin-key`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ADMIN_USERNAME: username, ADMIN_PASSWORD: password })
    });

    notify("Admin credentials updated");
    loadAdmin();
}

async function regenerateAdminKey() {
    await fetch(`/api/admin-page/regenerate-admin-key`, { method: "POST" });
    notify("Admin credentials regenerated");
    loadAdmin();
}

async function updateKey() {
    const newKey = document.getElementById("key-input").value;

    await fetch(`/api/admin-page/update-key/${currentKeyType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: newKey })
    });

    notify("Key Updated");
    loadKey();
}

async function regenerateKey() {
    await fetch(`/api/admin-page/regenerate-key/${currentKeyType}`, {
        method: "POST"
    });

    notify("Key Updated");
    loadKey();
}

async function toggleKeyStatus() {
    await fetch(`/api/admin-page/toggle-key/${currentKeyType}`, {
        method: "POST"
    });
    loadKey();
}



// =============================
// =============================
// SECTION 2 - TEAM MANAGEMENT
// =============================
// =============================

let teamBoardHidden = false;

async function refreshTeams() {
    const res = await fetch("/api/admin-page/all-teams");
    const data = await res.json();

    const board = document.getElementById("team-board");
    board.innerHTML = "";

    data.forEach(team => {
        board.innerHTML += renderTeam(team);
    });
}

function renderTeam(team) {

    const members = Object.values(team.TEAM_MEMBERS || {})
        .filter(m => m.name && m.name.trim() !== "")
        .map((m, index) => `
            <div>
                <strong>Member ${index + 1}:</strong>
                ${m.name} | ${m.profession} | ${m.gender}
            </div>
        `).join("");

    return `
        <div class="card">
        <hr>
            <div><strong>TEAM_ID:</strong> ${team.TEAM_ID}</div>
            <div><strong>TEAM_NAME:</strong> ${team.TEAM_NAME}</div>
            <div><strong>ORGANISATION:</strong> ${team.TEAM_ORGANISATION_NAME}</div>
            <div><strong>STATUS:</strong> ${team.TEAM_STATUS}</div>
            <div><strong>PASSWORD:</strong> ${team.TEAM_PASSWORD}</div>
            ${members}
            <hr>
        </div>
    `;
}

function toggleTeamBoard() {
    teamBoardHidden = !teamBoardHidden;
    const board = document.getElementById("team-board");

    if (teamBoardHidden) {
        board.classList.add("blurred");
    } else {
        board.classList.remove("blurred");
    }
}

async function getTotalTeams() {
    const res = await fetch("/api/admin-page/total-teams");
    const data = await res.json();
    document.getElementById("team-board").innerHTML =
        `<h3>Total Teams: ${data.total}</h3>`;
}

function removeAllTeams() {
    openConfirmation("Are you sure you want to remove all teams?", async () => {
        await fetch("/api/admin-page/remove-all-teams", { method: "POST" });
        notify("All teams are removed");
        refreshTeams();
    });
}

function deleteTeam(id) {
    openConfirmation("Are you sure you want to delete this team?", async () => {
        await fetch(`/api/admin-page/delete-team/${id}`, { method: "POST" });
        notify("Team Deleted");
        refreshTeams();
    });
}

async function fetchTeam() {
    const value = document.getElementById("team-search-input").value;
    const res = await fetch(`/api/admin-page/fetch-team/${value}`);
    const data = await res.json();

    if (!data) return;

    document.getElementById("team-board").innerHTML =
        renderTeam(data) +
        `<button onclick="deleteTeam('${data.TEAM_ID}')">Delete Team</button>
         <button onclick="clearTeamBoard()">Clear</button>`;
}

function clearTeamBoard() {
    document.getElementById("team-board").innerHTML = "";
}



// =============================
// =============================
// SECTION 3 - CTF MANAGEMENT
// =============================
// =============================

let currentEditingCTF = null;
let currentEditingFlag = null;

// ================= LOAD ALL CTFs =================
async function loadCTFs() {
    const res = await fetch("/api/admin-page/all-ctfs");
    const ctfs = await res.json();

    const left = document.getElementById("ctf-left-panel");
    const right = document.getElementById("ctf-right-panel");

    left.innerHTML = "";
    right.innerHTML = "";

    ctfs.forEach(ctf => {
        renderCTF(ctf);
    });
}

// ================= RENDER CTF =================
function renderCTF(ctf) {

    const left = document.getElementById("ctf-left-panel");

    const instructions = (ctf.CTF_INSTRUCTIONS || []).join("\n");

    left.innerHTML += `
        <div class="ctf-box">
            <div><strong>CTF_NAME:</strong> ${ctf.CTF_NAME}</div>
            <div><strong>CTF_ID:</strong> ${ctf.CTF_ID}</div>
            <div><strong>CTF_STATUS:</strong> 
                <span style="color:${ctf.CTF_STATUS === "Active" ? "green":"red"}">
                    ${ctf.CTF_STATUS}
                </span>
            </div>
            <div><strong>CTF_FILE_NAME:</strong> ${ctf.file.replace(".json","")}</div>

            <div style="margin-top:10px;">
                <strong>CTF_INSTRUCTIONS:</strong>
                <pre>${instructions}</pre>
            </div>

            <button onclick="editCTF('${ctf.file}')">Edit CTF</button>
            <button onclick="toggleCTFStatus('${ctf.file}')">
                ${ctf.CTF_STATUS === "Active" ? "Deactivate CTF":"Activate CTF"}
            </button>

            <button onclick="loadFlags('${ctf.file}')">Manage Flags</button>
            <hr>
        </div>
    `;
}

// ================= EDIT CTF =================
async function editCTF(file) {

    const res = await fetch(`/api/admin-page/get-ctf/${file}`);
    const ctf = await res.json();

    const left = document.getElementById("ctf-left-panel");

    const instructions = (ctf.CTF_INSTRUCTIONS || []).join("\n");

    left.innerHTML = `
        <div class="ctf-box">
            <input id="edit-ctf-name" value="${ctf.CTF_NAME}" />
            <textarea id="edit-ctf-instructions" rows="6">${instructions}</textarea>
            <input id="edit-ctf-file" value="${file.replace(".json","")}" />

            <button onclick="updateCTF('${file}')">Update Changes</button>
            <button onclick="loadCTFs()">Cancel</button>
        </div>
    `;
}

// ================= UPDATE CTF =================
async function updateCTF(oldFile) {

    const name = document.getElementById("edit-ctf-name").value;
    const instructionsRaw = document.getElementById("edit-ctf-instructions").value;
    const fileName = document.getElementById("edit-ctf-file").value;

    const instructions = instructionsRaw.split("\n").filter(i => i.trim() !== "");

    await fetch(`/api/admin-page/update-ctf/${oldFile}`, {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({
            CTF_NAME: name,
            CTF_INSTRUCTIONS: instructions,
            NEW_FILE_NAME: fileName
        })
    });

    loadCTFs();
}

// ================= TOGGLE CTF =================
async function toggleCTFStatus(file) {
    await fetch(`/api/admin-page/toggle-ctf/${file}`, { method:"POST" });
    loadCTFs();
}

// ================= LOAD FLAGS =================
async function loadFlags(file) {

    const res = await fetch(`/api/admin-page/get-ctf/${file}`);
    const ctf = await res.json();

    const right = document.getElementById("ctf-right-panel");

    right.innerHTML = `
        <h3 style="color:#ff00ff;">
            Flags Management — ${ctf.CTF_NAME}
        </h3>
    `;

    Object.entries(ctf.CTF_FLAGS).forEach(([num, flag]) => {

        const answers = (flag.FLAG_ANSWERS || []).join("\n");
        const hints = (flag.FLAG_HINT || []).join("\n");

        right.innerHTML += `
            <div class="ctf-box">
                <div><strong>FLAG_NUMBER:</strong> ${num}</div>
                <div><strong>FLAG_STATUS:</strong> 
                    <span style="color:${flag.FLAG_STATUS === "Active" ? "green":"red"}">
                        ${flag.FLAG_STATUS}
                    </span>
                </div>

                <div><strong>FLAG_NAME:</strong> ${flag.FLAG_NAME}</div>
                <div><strong>FLAG_POINTS:</strong> ${flag.FLAG_POINTS}</div>

                <div><strong>FLAG_ANSWERS:</strong><pre>${answers}</pre></div>
                <div><strong>FLAG_HINT:</strong><pre>${hints}</pre></div>

                <button onclick="toggleFlag('${file}','${num}')">
                    ${flag.FLAG_STATUS === "Active" ? "Deactivate Flag":"Activate Flag"}
                </button>

                <button onclick="editFlag('${file}','${num}')">Edit Flag</button>
                <hr>
            </div>
        `;
    });

    right.innerHTML += `
        <button onclick="clearFlagPanel()">Clear</button>
    `;
}

// ================= TOGGLE FLAG =================
async function toggleFlag(file, flagNumber) {
    await fetch(`/api/admin-page/toggle-flag/${file}/${flagNumber}`, {
        method:"POST"
    });
    loadFlags(file);
}

// ================= EDIT FLAG =================
async function editFlag(file, flagNumber) {

    const res = await fetch(`/api/admin-page/get-ctf/${file}`);
    const ctf = await res.json();
    const flag = ctf.CTF_FLAGS[flagNumber];

    const answers = (flag.FLAG_ANSWERS || []).join("\n");
    const hints = (flag.FLAG_HINT || []).join("\n");

    const right = document.getElementById("ctf-right-panel");

    right.innerHTML = `
        <h3 style="color:#ff00ff;">
            Editing Flag ${flagNumber} — ${ctf.CTF_NAME}
        </h3>

        <div class="ctf-box">
            <input id="edit-flag-name" value="${flag.FLAG_NAME}" />
            <input id="edit-flag-points" type="number" value="${flag.FLAG_POINTS}" />
            <textarea id="edit-flag-answers" rows="4">${answers}</textarea>
            <textarea id="edit-flag-hints" rows="4">${hints}</textarea>

            <button onclick="updateFlag('${file}','${flagNumber}')">Update</button>
            <button onclick="loadFlags('${file}')">Cancel</button>
            <button onclick="clearFlagPanel()">Clear</button>
        </div>
    `;
}

// ================= UPDATE FLAG =================
async function updateFlag(file, flagNumber) {

    const name = document.getElementById("edit-flag-name").value;
    const points = parseInt(document.getElementById("edit-flag-points").value);
    const answers = document.getElementById("edit-flag-answers").value
        .split("\n").filter(a => a.trim() !== "");
    const hints = document.getElementById("edit-flag-hints").value
        .split("\n").filter(h => h.trim() !== "");

    await fetch(`/api/admin-page/update-flag/${file}/${flagNumber}`, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
            FLAG_NAME: name,
            FLAG_POINTS: points,
            FLAG_ANSWERS: answers,
            FLAG_HINT: hints
        })
    });

    loadFlags(file);
}

// ================= CLEAR FLAG PANEL =================
function clearFlagPanel() {
    document.getElementById("ctf-right-panel").innerHTML = "";
}



// =============================
// =============================
// SECTION 4 - RESULT MANAGEMENT
// =============================
// =============================

let resultBoardHidden = false;

async function refreshResults() {
    const res = await fetch("/api/admin-page/all-results");
    const resultsData = await res.json();

    // Fetch leaderboard to determine ranks
    const leaderboardRes = await fetch("/api/admin-page/leaderboard");
    const leaderboard = await leaderboardRes.json();
    const leaderboardMap = {};
    leaderboard.forEach(team => { leaderboardMap[team.TEAM_ID] = team.rank; });

    const board = document.getElementById("result-board");
    board.innerHTML = "";

    Object.values(resultsData).forEach(result => {

        const rank = leaderboardMap[result.TEAM_ID] || "-";

        // ----- TEAM MEMBERS -----
        const members = Object.values(result.TEAM_MEMBERS || {})
            .filter(m => m.name && m.name.trim() !== "")
            .map((m, index) => `
                <div>
                    <strong>Member ${index + 1}:</strong>
                    ${m.name} | ${m.profession} | ${m.gender}
                </div>
            `).join("");

        // ----- FLAGS DETAILS -----
        const flagsDetails = (result.FLAGS_CAPTURED || []).map((ctf, index) => {
            const flags = Object.entries(ctf.FLAGS || {}).map(([num, flag]) => `
                <div>
                    Flag ${num} | ${flag.FLAG_SUBMITTED && flag.FLAG_SUBMITTED.trim() !== "" ? flag.FLAG_SUBMITTED : "-"}
                </div>
            `).join("");

            return `
                <div style="margin-top:10px;">
                    <strong>CTF ${index + 1}: ${ctf.CTF_NAME}</strong>
                    ${flags}
                </div>
            `;
        }).join("");

        board.innerHTML += `
            <div class="card">
                <hr>
                <div><strong>Rank:</strong> ${rank}</div>
                <div><strong>TEAM_ID:</strong> ${result.TEAM_ID}</div>
                <div><strong>TEAM_NAME:</strong> ${result.TEAM_NAME}</div>
                <div><strong>ORGANISATION:</strong> ${result.TEAM_ORGANISATION_NAME}</div>
                <div><strong>TOTAL_FLAGS_COUNT:</strong> ${result.TOTAL_FLAGS_COUNT}</div>
                <div><strong>ALL_FLAGS_TOTAL_POINTS:</strong> ${result.ALL_FLAGS_TOTAL_POINTS}</div>
                <div><strong>TEAM_TOTAL_SCORE:</strong> ${result.TEAM_TOTAL_SCORE}</div>
                <div><strong>TEAM_CAPTURED_FLAGS_COUNT:</strong> ${result.TEAM_CAPTURED_FLAGS_COUNT}</div>
                <div><strong>TEAM_UNCAPTURED_FLAGS_COUNT:</strong> ${result.TEAM_UNCAPTURED_FLAGS_COUNT}</div>
                <div><strong>TIME_OF_SUBMISSION:</strong> ${result.TIME_OF_SUBMISSION}</div>
                ${members}
                ${flagsDetails}
                <hr>
            </div>
        `;
    });
}

function toggleResultBoard() {
    resultBoardHidden = !resultBoardHidden;
    const board = document.getElementById("result-board");

    if (resultBoardHidden) board.classList.add("blurred");
    else board.classList.remove("blurred");
}

async function getTotalSubmitted() {
    const res = await fetch("/api/admin-page/total-results");
    const data = await res.json();
    document.getElementById("result-board").innerHTML =
        `<h3>Total Submitted: ${data.total}</h3>`;
}

function removeAllResults() {
    openConfirmation("Are you sure you want to remove all results?", async () => {
        await fetch("/api/admin-page/remove-all-results", { method: "POST" });
        notify("All results are removed");
        refreshResults();
    });
}

function deleteResult(id) {
    openConfirmation("Are you sure you want to delete this team's result?", async () => {
        await fetch(`/api/admin-page/delete-result/${id}`, { method: "POST" });
        notify("Result Deleted");
        refreshResults();
    });
}

async function fetchResult() {
    const value = document.getElementById("result-search-input").value;
    const res = await fetch(`/api/admin-page/fetch-result/${value}`);
    const result = await res.json();

    if (!result) return;

    // Fetch leaderboard to get rank
    const leaderboardRes = await fetch("/api/admin-page/leaderboard");
    const leaderboard = await leaderboardRes.json();
    const teamRank = leaderboard.find(t => t.TEAM_ID === result.TEAM_ID)?.rank || "-";

    const board = document.getElementById("result-board");

    // ----- TEAM MEMBERS -----
    const members = Object.values(result.TEAM_MEMBERS || {})
        .filter(m => m.name && m.name.trim() !== "")
        .map((m, index) => `
            <div>
                <strong>Member ${index + 1}:</strong>
                ${m.name} | ${m.profession} | ${m.gender}
            </div>
        `).join("");

    // ----- FLAGS DETAILS -----
    const flagsDetails = (result.FLAGS_CAPTURED || []).map((ctf, index) => {
        const flags = Object.entries(ctf.FLAGS || {}).map(([num, flag]) => `
            <div>
                Flag ${num} | ${flag.FLAG_SUBMITTED && flag.FLAG_SUBMITTED.trim() !== "" ? flag.FLAG_SUBMITTED : "-"}
            </div>
        `).join("");

        return `
            <div style="margin-top:10px;">
                <strong>CTF ${index + 1}: ${ctf.CTF_NAME}</strong>
                ${flags}
            </div>
        `;
    }).join("");

    board.innerHTML = `
        <div class="card">
            <div><strong>Rank:</strong> ${teamRank}</div>
            <div><strong>TEAM_ID:</strong> ${result.TEAM_ID}</div>
            <div><strong>TEAM_NAME:</strong> ${result.TEAM_NAME}</div>
            <div><strong>ORGANISATION:</strong> ${result.TEAM_ORGANISATION_NAME}</div>
            <div><strong>TOTAL_FLAGS_COUNT:</strong> ${result.TOTAL_FLAGS_COUNT}</div>
            <div><strong>ALL_FLAGS_TOTAL_POINTS:</strong> ${result.ALL_FLAGS_TOTAL_POINTS}</div>
            <div><strong>TEAM_TOTAL_SCORE:</strong> ${result.TEAM_TOTAL_SCORE}</div>
            <div><strong>TEAM_CAPTURED_FLAGS_COUNT:</strong> ${result.TEAM_CAPTURED_FLAGS_COUNT}</div>
            <div><strong>TEAM_UNCAPTURED_FLAGS_COUNT:</strong> ${result.TEAM_UNCAPTURED_FLAGS_COUNT}</div>
            <div><strong>TIME_OF_SUBMISSION:</strong> ${result.TIME_OF_SUBMISSION}</div>
            <hr>
            ${members}
            <hr>
            ${flagsDetails}
        </div>
        <button onclick="deleteResult('${result.TEAM_ID}')">Delete Team Result</button>
        <button onclick="clearResultBoard()">Clear</button>
    `;
}

function clearResultBoard() {
    document.getElementById("result-board").innerHTML = "";
}



// =============================
// =============================
// SECTION 5 - LEADERBOARD
// =============================

async function loadLeaderboard() {
    const res = await fetch("/api/admin-page/leaderboard");
    const data = await res.json();

    const box = document.getElementById("leaderboard-content");
    box.innerHTML = "";

    data.forEach(team => {
        box.innerHTML += `
            <div class="leader-row">
                <div><strong>Rank:</strong> ${team.rank}</div>
                <div><strong>TEAM_NAME:</strong> ${team.TEAM_NAME}</div>
                <div><strong>TEAM_ID:</strong> ${team.TEAM_ID}</div>
                <div><strong>TEAM_TOTAL_SCORE:</strong> ${team.TEAM_TOTAL_SCORE}</div>
                <div><strong>TEAM_CAPTURED_FLAGS_COUNT:</strong> ${team.TEAM_CAPTURED_FLAGS_COUNT}</div>
                <div><strong>TIME_OF_SUBMISSION:</strong> ${team.TIME_OF_SUBMISSION}</div>
                <hr>
            </div>
        `;
    });
}


// =============================
// INIT
// =============================
window.onload = () => {
    // Check if admin is logged in
    const isAdminLoggedIn = localStorage.getItem("ADMIN_LOGGED_IN");
    if (!isAdminLoggedIn || isAdminLoggedIn !== "true") {
        // Redirect unauthorized users to index page
        alert("Unauthorized access! Please login as admin.");
        window.location.href = "index.html";
        return;
    }

    // Only run these if logged in
    loadMasterKey();
    refreshTeams();
    loadCTFs();
    refreshResults();
    loadLeaderboard();
};