// Theme toggle
const themeBtn = document.getElementById('toggleTheme');
themeBtn.onclick = () => {
    document.body.classList.toggle('light-theme');
    localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
};
if(localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-theme');
}

// User logic
const usersKey = 'hackUsers';
function encode(str) {
    return btoa(unescape(encodeURIComponent(str)));
}
function decode(str) {
    return decodeURIComponent(escape(atob(str)));
}
function getUsers() {
    let raw = localStorage.getItem(usersKey);
    if (!raw) return [];
    try {
        return JSON.parse(decode(raw));
    } catch {
        return [];
    }
}
function saveUsers(users) {
    localStorage.setItem(usersKey, encode(JSON.stringify(users)));
}
function findUser(email) {
    return getUsers().find(u => u.email === email);
}
function findUserByPin(pin) {
    return getUsers().find(u => u.pin === pin);
}

// Registration page logic
if(document.getElementById('registerBtn')) {
    const regEmail = document.getElementById('regEmail');
    const regPin = document.getElementById('regPin');
    document.getElementById('registerBtn').onclick = () => {
        const email = regEmail.value.trim().toLowerCase();
        const pin = regPin.value.trim();
        if(!email || !pin || pin.length !== 4 || isNaN(pin)) {
            alert('Enter valid email and 4-digit PIN!');
            return;
        }
        if(findUser(email)) {
            alert('Email already registered!');
            return;
        }
        const users = getUsers();
        users.push({email, pin});
        saveUsers(users);
        localStorage.setItem('currentUser', encode(JSON.stringify({email, pin})));
        window.location.href = 'index.html';
    };
}

// Login page logic
if(document.getElementById('loginBtn')) {
    const loginEmail = document.getElementById('loginEmail');
    const loginPin = document.getElementById('loginPin');
    const hackInfo = document.getElementById('hackInfo');
    let hackStep = false;
    let hackedUser = null;
    document.getElementById('loginBtn').onclick = () => {
        const email = loginEmail.value.trim().toLowerCase();
        const pin = loginPin.value.trim();
        if(!email || !pin || pin.length !== 4 || isNaN(pin)) {
            alert('Enter valid email and 4-digit PIN!');
            return;
        }
        if(!hackStep) {
            // First step: check if PIN matches any user
            const hacked = findUserByPin(pin);
            if(hacked) {
                hackInfo.style.display = '';
                hackInfo.innerHTML = `<b>You found a password!</b><br>Email: <span class='green'>${hacked.email}</span><br>PIN: <span class='green'>${hacked.pin}</span><br>Now login with this email and PIN to hack the account.`;
                hackedUser = hacked;
                hackStep = true;
                loginEmail.value = hacked.email;
                loginPin.value = hacked.pin;
                return;
            } else {
                alert('No user found with this PIN.');
                return;
            }
        } else {
            // Second step: login with hacked credentials
            if(hackedUser && email === hackedUser.email && pin === hackedUser.pin) {
                localStorage.setItem('currentUser', encode(JSON.stringify(hackedUser)));
                window.location.href = 'index.html';
            } else {
                alert('Wrong credentials for hacked account!');
            }
        }
    };
}

// Main page logic
if(document.getElementById('mainContent')) {
    // Redirect if not logged in
    let rawUser = localStorage.getItem('currentUser');
    let user = null;
    if(rawUser) {
        try { user = JSON.parse(decode(rawUser)); } catch { user = null; }
    }
    if(!user) {
        window.location.href = 'login.html';
    }

    // Show fun content
    // Matrix effect
    const matrix = document.getElementById('matrix');
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789@#$%&*';
    function randomLine(len) {
        let s = '';
        for(let i=0;i<len;i++) s += chars[Math.floor(Math.random()*chars.length)];
        return s;
    }
    function showMatrix() {
        let lines = [];
        for(let i=0;i<8;i++) lines.push(randomLine(32));
        matrix.textContent = lines.join('\n');
    }
    setInterval(showMatrix, 300);
    showMatrix();

    // Terminal playground
    const terminalInput = document.getElementById('terminalInput');
    const terminalOutput = document.getElementById('terminalOutput');
    if(terminalInput && terminalOutput) {
        terminalInput.addEventListener('keydown', function(e) {
            if(e.key === 'Enter') {
                let cmd = terminalInput.value.trim();
                let out = '';
                if(cmd === 'sudo hack_the_world') {
                    out = 'Access granted. Welcome, elite hacker!';
                } else if(cmd === 'ls') {
                    out = 'users.txt  secrets.txt  matrix.exe';
                } else if(cmd === 'cat secrets.txt') {
                    out = 'The cake is a lie.';
                } else if(cmd === 'hack users.txt') {
                    out = getUsers().map(u => u.email).join(', ');
                } else if(cmd === 'cat matrix.exe') {
                    out = '01101000 01100001 01100011 01101011';
                } else if(cmd === 'help') {
                    out = 'Available commands: sudo hack_the_world, ls, cat secrets.txt, hack users.txt, cat matrix.exe, help';
                } else {
                    out = 'Unknown command. Type help.';
                }
                terminalOutput.textContent += `> ${cmd}\n${out}\n`;
                terminalInput.value = '';
            }
        });
    }

    // Hacker challenges
    // Secret code
    const secretCode = document.getElementById('secretCode');
    if(secretCode) {
        secretCode.textContent = Math.floor(1000 + Math.random()*9000);
    }
    // Hacked count
    const hackedCount = document.getElementById('hackedCount');
    if(hackedCount) {
        let users = getUsers();
        hackedCount.textContent = users.length;
    }

    // More fun content
    // Display current user info (hidden)
    let infoDiv = document.createElement('div');
    infoDiv.style.display = 'none';
    infoDiv.id = 'hiddenUserInfo';
    infoDiv.textContent = `Logged in as: ${user.email} | PIN: ${user.pin}`;
    document.body.appendChild(infoDiv);

    // Add a random hacker quote
    let quotes = [
        'The only secure computer is one that’s unplugged.',
        'Hack the planet!',
        'I am root.',
        'There is no patch for human stupidity.',
        'Access granted. Welcome, elite hacker!'
    ];
    let quoteDiv = document.createElement('div');
    quoteDiv.className = 'fun-quote';
    quoteDiv.style.margin = '2em 0';
    quoteDiv.style.textAlign = 'center';
    quoteDiv.innerHTML = `<em>"${quotes[Math.floor(Math.random()*quotes.length)]}"</em>`;
    document.querySelector('.fun-content').appendChild(quoteDiv);

    // Add a fake hacking progress bar
    let progressDiv = document.createElement('div');
    progressDiv.className = 'hack-progress';
    progressDiv.style.margin = '2em 0';
    progressDiv.innerHTML = '<label>Hacking Progress:</label><progress id="hackBar" value="0" max="100" style="width:100%"></progress>';
    document.querySelector('.fun-content').appendChild(progressDiv);
    let hackBar = document.getElementById('hackBar');
    let val = 0;
    let interval = setInterval(()=>{
        if(val<100){ hackBar.value = ++val; }
        else clearInterval(interval);
    }, 50);
}
