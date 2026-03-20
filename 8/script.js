// ==========================
// PANEL OPEN / CLOSE
// ==========================
function openAdminPanel() {
    document.getElementById('admin-card').classList.add('active');
}

function closeAdminPanel() {
    document.getElementById('admin-card').classList.remove('active');
    document.getElementById('admin-message').innerText = '';
    document.getElementById('admin-username').value = '';
    document.getElementById('admin-password').value = '';
}

function openTeamPanel() {
    document.getElementById('team-card').classList.add('active');
    showTeamOptions();
}

function closeTeamPanel() {
    document.getElementById('team-card').classList.remove('active');
    // Reset all forms and messages
    document.getElementById('team-registration').style.display = 'none';
    document.getElementById('team-login-area').style.display = 'none';
    document.getElementById('team-success-box').style.display = 'none';
    showTeamOptions();

    document.getElementById('team-message').innerText = '';
    document.getElementById('team-login-message').innerText = '';
    document.getElementById('team-passkey-message').innerText = '';

    // Reset Copy button text
    const copyBtn = document.getElementById('copy-team-id-btn');
    copyBtn.innerText = 'Copy';
    copyBtn.disabled = false;

    // Reset input fields
    document.querySelectorAll('#team-panel input, #team-panel select').forEach(inp => inp.value = '');
}

// ==========================
// TEAM PANEL VISIBILITY
// ==========================
function showTeamOptions(){
    document.getElementById('team-options').style.display = 'flex';
    document.getElementById('team-registration').style.display = 'none';
    document.getElementById('team-login-area').style.display = 'none';
    document.getElementById('team-success-box').style.display = 'none';
}

function showTeamRegistration() {
    document.getElementById('team-options').style.display = 'none';
    document.getElementById('team-login-area').style.display = 'none';
    document.getElementById('team-success-box').style.display = 'none';
    document.getElementById('team-registration').style.display = 'block';
}

function showTeamLoginOptions() {
    document.getElementById('team-options').style.display = 'none';
    document.getElementById('team-registration').style.display = 'none';
    document.getElementById('team-success-box').style.display = 'none';
    document.getElementById('team-login-area').style.display = 'block';
}

function showPasswordLogin(){
    document.getElementById('login-password-area').style.display = 'block';
    document.getElementById('login-passkey-area').style.display = 'none';
}

function showPasskeyLogin(){
    document.getElementById('login-passkey-area').style.display = 'block';
    document.getElementById('login-password-area').style.display = 'none';
}

// ==========================
// ADMIN LOGIN
// ==========================
function adminLogin() {
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;

    fetch('/api/index-page/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        const msg = document.getElementById('admin-message');
        if(data.success){
            msg.innerText = 'Login Successful! Redirecting...';
            // Store admin session
            localStorage.setItem("ADMIN_LOGGED_IN", "true");
            setTimeout(() => { window.location.href = 'admin.html'; }, 500);
        } else {
            msg.innerText = data.message;
        }
    });
}

// ==========================
// TEAM REGISTRATION
// ==========================
function createTeam(){
    const teamName = document.getElementById('team-name').value.trim();
    const teamPassword = document.getElementById('team-password').value.trim();
    const orgName = document.getElementById('org-name').value.trim();
    const masterKey = document.getElementById('master-key').value.trim();

    const members = [
        {
            name: document.getElementById('member1-name').value.trim(),
            profession: document.getElementById('member1-profession').value.trim(),
            gender: document.getElementById('member1-gender').value
        },
        {
            name: document.getElementById('member2-name').value.trim(),
            profession: document.getElementById('member2-profession').value.trim(),
            gender: document.getElementById('member2-gender').value
        },
        {
            name: document.getElementById('member3-name').value.trim(),
            profession: document.getElementById('member3-profession').value.trim(),
            gender: document.getElementById('member3-gender').value
        },
        {
            name: document.getElementById('member4-name').value.trim(),
            profession: document.getElementById('member4-profession').value.trim(),
            gender: document.getElementById('member4-gender').value
        }
    ];

    fetch('/api/index-page/create-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName, teamPassword, orgName, members, masterKey })
    })
    .then(res => res.json())
    .then(data => {
        const msg = document.getElementById('team-message');
        if(data.success){
            document.getElementById('team-registration').style.display = 'none';
            document.getElementById('team-success-box').style.display = 'block';
            document.getElementById('display-team-id').innerText = data.teamId;
        } else {
            msg.innerText = data.message;
        }
    });
}

// ==========================
// COPY TEAM ID
// ==========================
function copyTeamID() {
    const teamIdElement = document.getElementById('display-team-id');
    const copyBtn = document.getElementById('copy-team-id-btn');

    const teamId = teamIdElement.innerText.trim();

    if (!teamId) {
        copyBtn.innerText = "No ID";
        return;
    }

    // Create temporary input
    const tempInput = document.createElement("input");
    tempInput.value = teamId;
    document.body.appendChild(tempInput);

    // Select text
    tempInput.select();
    tempInput.setSelectionRange(0, 99999); // For mobile

    try {
        document.execCommand("copy");
        copyBtn.innerText = "Copied ✓";
        copyBtn.disabled = true;
    } catch (err) {
        copyBtn.innerText = "Copy Failed";
        console.error("Copy error:", err);
    }

    document.body.removeChild(tempInput);
}

// ==========================
// TEAM LOGIN
// ==========================
function teamLoginPassword(){
    const teamId = document.getElementById('login-team-id').value.trim();
    const password = document.getElementById('login-team-password').value.trim();

    fetch('/api/index-page/team-login-password',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ teamId, password })
    })
    .then(res=>res.json())
    .then(data=>{
        const msg = document.getElementById('team-login-message');
        if(data.success){
            msg.innerText='Login successful! Redirecting...';
            localStorage.setItem("TEAM_ID", data.teamId);
            window.location.href='team.html';;
        } else {
            msg.innerText = data.message;
        }
    });
}

function teamLoginPasskey(){
    const teamId = document.getElementById('login-team-id-passkey').value.trim();
    const passkey = document.getElementById('login-passkey').value.trim();

    fetch('/api/index-page/team-login-passkey',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ teamId, passkey })
    })
    .then(res=>res.json())
    .then(data=>{
        const msg = document.getElementById('team-passkey-message');
        if(data.success){
            msg.innerText='Login successful! Redirecting...';
            localStorage.setItem("TEAM_ID", data.teamId);
            window.location.href='team.html';
        } else {
            msg.innerText = data.message;
        }
    });
}