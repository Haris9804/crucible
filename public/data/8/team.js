// ==========================
// GLOBAL VARIABLES
// ==========================
let TEAM_DATA = null;
let CTF_DATA = [];
let TEAM_SUBMITTED = false;
let TEAM_ID = null;
let FLAG_RESPONSES = {}; // { CTF_ID: { FLAG_NUMBER: {submitted, status} } }

// ==========================
// INIT PAGE
// ==========================
window.addEventListener('DOMContentLoaded', async () => {
    await fetchTeamInfo();
    if (!TEAM_SUBMITTED) {
        await fetchCTFs();
    }
});

// ==========================
// NOTIFICATION
// ==========================
function showNotification(msg, type="success") {
    const notification = document.getElementById('notification');
    notification.innerText = msg;
    notification.className = type;
    notification.style.display = 'block';
    setTimeout(() => notification.style.display = 'none', 2000);
}

// ==========================
// LOGOUT FUNCTION
// ==========================
function logout() {
    showNotification("Logging out...", "success");
    setTimeout(() => {
        localStorage.removeItem("TEAM_ID");
        window.location.href = 'index.html';
    }, 1200);
}

// ==========================
// FETCH TEAM INFO
// ==========================
async function fetchTeamInfo() {
    try {
        const storedTeamId = localStorage.getItem("TEAM_ID");
        if (!storedTeamId) { window.location.href = "index.html"; return; }

        const res = await fetch('/api/team-page/team-info/' + storedTeamId);
        const data = await res.json();

        if (!data.success) {
            document.getElementById('team-info').innerText = data.message;
            return;
        }

        TEAM_DATA = data.team;
        TEAM_ID = TEAM_DATA.TEAM_ID;

        const resultsRes = await fetch('/api/team-page/team-results/' + TEAM_ID);
        const resultsData = await resultsRes.json();

        if (resultsData.found) {
            TEAM_SUBMITTED = true;
            displayResults(resultsData.result);
        } else {
            TEAM_SUBMITTED = false;
            displayTeamInfo(TEAM_DATA);
        }
    } catch (err) {
        console.error(err);
    }
}

// ==========================
// DISPLAY TEAM INFO
// ==========================
function displayTeamInfo(team) {
    const container = document.getElementById('team-info');
    container.innerHTML = `
        <div><strong>Team ID:</strong> ${team.TEAM_ID}</div>
        <div><strong>Team Name:</strong> ${team.TEAM_NAME}</div>
        <div><strong>Organisation:</strong> ${team.TEAM_ORGANISATION_NAME}</div>
        <div><strong>Members:</strong></div>
        <ul>
            <li>${team.TEAM_MEMBERS.MEMBER_1_DETAILS.name} - ${team.TEAM_MEMBERS.MEMBER_1_DETAILS.profession} (${team.TEAM_MEMBERS.MEMBER_1_DETAILS.gender})</li>
            <li>${team.TEAM_MEMBERS.MEMBER_2_DETAILS.name} - ${team.TEAM_MEMBERS.MEMBER_2_DETAILS.profession} (${team.TEAM_MEMBERS.MEMBER_2_DETAILS.gender})</li>
            ${team.TEAM_MEMBERS.MEMBER_3_DETAILS.name ? `<li>${team.TEAM_MEMBERS.MEMBER_3_DETAILS.name} - ${team.TEAM_MEMBERS.MEMBER_3_DETAILS.profession} (${team.TEAM_MEMBERS.MEMBER_3_DETAILS.gender})</li>` : ''}
            ${team.TEAM_MEMBERS.MEMBER_4_DETAILS.name ? `<li>${team.TEAM_MEMBERS.MEMBER_4_DETAILS.name} - ${team.TEAM_MEMBERS.MEMBER_4_DETAILS.profession} (${team.TEAM_MEMBERS.MEMBER_4_DETAILS.gender})</li>` : ''}
        </ul>
    `;
}

// ==========================
// FETCH ACTIVE CTFs
// ==========================
async function fetchCTFs() {
    try {
        const res = await fetch('/api/team-page/ctfs');
        const data = await res.json();
        if (!data.success) return;

        CTF_DATA = data.ctfs.filter(ctf => ctf.CTF_STATUS === "Active");
        displayCTFs();
    } catch (err) {
        console.error(err);
    }
}

// ==========================
// DISPLAY CTF BOXES
// ==========================
function displayCTFs() {
    const container = document.getElementById('ctf-container');
    container.innerHTML = '';

    CTF_DATA.forEach(ctf => {
        const ctfBox = document.createElement('div');
        ctfBox.classList.add('ctf-box');
        ctfBox.id = `ctf-${ctf.CTF_ID}`;

        let activeFlags = 0;
        let flagsHtml = '';

        Object.keys(ctf.CTF_FLAGS).forEach(flagNum => {
            const flag = ctf.CTF_FLAGS[flagNum];
            if (flag.FLAG_STATUS !== "Active") return;

            activeFlags++;
            if (!FLAG_RESPONSES[ctf.CTF_ID]) FLAG_RESPONSES[ctf.CTF_ID] = {};
            FLAG_RESPONSES[ctf.CTF_ID][flagNum] = { submitted: "", status: "Uncaptured" };

            flagsHtml += `
            <div class="flag-item" id="flag-${ctf.CTF_ID}-${flagNum}">
                <div><strong>Flag ${flagNum} - ${flag.FLAG_NAME} (${flag.FLAG_POINTS} pts)</strong></div>
                <input type="text" placeholder="Enter flag" />
                <div class="flag-item-buttons">
                    <button onclick="showHint('${ctf.CTF_ID}', '${flagNum}')">Hint</button>
                    <button onclick="checkFlag('${ctf.CTF_ID}', '${flagNum}')">Submit Flag</button>
                </div>
                <div class="flag-status pending" id="status-${ctf.CTF_ID}-${flagNum}">
                    Status: Pending
                </div>
                <div class="hint-text" id="hint-${ctf.CTF_ID}-${flagNum}">
                <div class="hint-content">
                    ${flag.FLAG_HINT.join('<br>')}
                </div>
                <button class="close-hint-btn" onclick="closeHint('${ctf.CTF_ID}','${flagNum}')">Close Hint</button>
            </div>
            </div>
        `;
        });

        ctfBox.innerHTML = `
            <div class="ctf-title">
                ${ctf.CTF_NAME}
                <span class="answered-flags" id="progress-text-${ctf.CTF_ID}">0 / ${activeFlags}</span>
            </div>
            <div class="ctf-progress">
                <div class="ctf-progress-bar" id="progress-${ctf.CTF_ID}"></div>
            </div>
            ${flagsHtml}
        `;

        container.appendChild(ctfBox);
    });
}

// ==========================
// CHECK FLAG
// ==========================
function checkFlag(ctfId, flagNum) {
    const input = document.querySelector(`#flag-${ctfId}-${flagNum} input`);
    const value = input.value.trim();
    const flag = CTF_DATA.find(c => c.CTF_ID === ctfId).CTF_FLAGS[flagNum];

    if (flag.FLAG_ANSWERS.some(ans => ans.toLowerCase() === value.toLowerCase())) {
        FLAG_RESPONSES[ctfId][flagNum] = { submitted: value, status: "Captured" };
        input.disabled = true;

        const status = document.getElementById(`status-${ctfId}-${flagNum}`);
        status.innerText = "Status: Captured";
        status.classList.remove("pending");
        status.classList.add("captured");

        updateCTFProgress(ctfId);
        showNotification("Correct Flag Captured!", "success");
    } else {
        showNotification("Incorrect Flag!", "error");
    }
}

function updateCTFProgress(ctfId) {
    const flags = FLAG_RESPONSES[ctfId];
    const total = Object.keys(flags).length;
    const captured = Object.values(flags).filter(f => f.status === "Captured").length;
    const percent = (captured / total) * 100;

    const bar = document.getElementById(`progress-${ctfId}`);
    bar.style.width = percent + "%";

    // Color coding
    if (percent <= 20) bar.style.background = "#ff0000";
    else if (percent <= 40) bar.style.background = "#ff8800";
    else if (percent <= 60) bar.style.background = "#ffff00";
    else if (percent <= 80) bar.style.background = "#88ff00";
    else if (percent < 100) bar.style.background = "#00ff44";
    else bar.style.background = "#00cccc";

    document.getElementById(`progress-text-${ctfId}`).innerText = `${captured} / ${total}`;
}

// ==========================
// HINT HANDLERS
// ==========================
function showHint(ctfId, flagNum) {
    document.getElementById(`hint-${ctfId}-${flagNum}`).classList.add('active');
}
function closeHint(ctfId, flagNum) {
    document.getElementById(`hint-${ctfId}-${flagNum}`).classList.remove('active');
}

// ==========================
// SUBMIT MODAL
// ==========================
function openSubmitModal() { document.getElementById('submit-modal').classList.add('active'); }
function closeSubmitModal() { document.getElementById('submit-modal').classList.remove('active'); }

// ==========================
// CONFIRM SUBMIT
// ==========================
async function confirmSubmit() {
    closeSubmitModal();
    const payload = { teamId: TEAM_ID, responses: FLAG_RESPONSES };
    try {
        const res = await fetch('/api/team-page/submit-responses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
            showNotification("Responses submitted successfully!", "success");
            displayResults(data.result);
            TEAM_SUBMITTED = true;
        } else showNotification(data.message, "error");
    } catch (err) { console.error(err); }
}

// ==========================
// DISPLAY RESULTS AFTER SUBMISSION
// ==========================
function displayResults(result) {
    const container = document.getElementById('team-info');
    container.innerHTML = `
        <h3>Please find the CTF submission report for your team.</h3>
        <hr class="divider">

        <div class="result-section">
            <h4>Team Details</h4>
            <div><strong>Team ID:</strong> ${result.TEAM_ID}</div>
            <div><strong>Team Name:</strong> ${result.TEAM_NAME}</div>
            <div><strong>Organisation:</strong> ${result.TEAM_ORGANISATION_NAME}</div>
        </div>

        <hr class="divider">

        <div class="result-section">
            <h4>Flags Details</h4>
            <div><strong>Total Flags Count:</strong> ${result.TOTAL_FLAGS_COUNT}</div>
            <div><strong>Maximum Total Points:</strong> ${result.ALL_FLAGS_TOTAL_POINTS}</div>
        </div>

        <hr class="divider">

        <div class="result-section">
            <h4>Team Performance</h4>
            <div><strong>Captured Flags Count:</strong> ${result.TEAM_CAPTURED_FLAGS_COUNT}</div>
            <div><strong>Uncaptured Flags Count:</strong> ${result.TEAM_UNCAPTURED_FLAGS_COUNT}</div>
            <div><strong>Team Total Score:</strong> ${result.TEAM_TOTAL_SCORE}</div>
            <div><strong>Time of Submission:</strong> ${result.TIME_OF_SUBMISSION}</div>
        </div>

        <hr class="divider">

        <div class="result-section">
            <h4>Flags Section</h4>
            ${result.FLAGS_CAPTURED.map(ctf => `
                <div class="ctf-result">
                    <strong>${ctf.CTF_NAME}</strong>
                    ${Object.keys(ctf.FLAGS).map(flagNum => `
                        <div class="flag-result">
                            Flag ${flagNum} :
                            <span class="${ctf.FLAGS[flagNum].FLAG_RESPONSE === 'Captured' ? 'captured' : 'uncaptured'}">
                                ${ctf.FLAGS[flagNum].FLAG_RESPONSE}
                            </span>
                            | Submitted: ${ctf.FLAGS[flagNum].FLAG_SUBMITTED || "—"}
                        </div>
                    `).join('')}
                </div>
            `).join('')}
        </div>
    `;

    document.querySelector("#team-info-section h2").innerText =
        `Congratulations ${result.TEAM_NAME} on your CTF submission!`;

    document.getElementById('playground-section').style.display = 'none';
    document.getElementById('submit-btn').style.display = 'none';
}