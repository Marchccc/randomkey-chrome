// Generate a random password and add it to the table and storage
function generatePassword() {
    const password = generateRandomPassword();

    // Add the password and time to the table
    const time = new Date().toLocaleString();

    requestClipboardPermission().then(() => {
        addPasswordToTable(password, time);

        // Save the password and time to storage
        chrome.storage.sync.get('passwords', function (data) {
            let passwords = data.passwords || [];
            passwords.push({ password: password, time: time });
            chrome.storage.sync.set({ passwords: passwords });
        });

        const generateButton = document.getElementById("generate-button");
        generateButton.textContent = "Copied!";
        generateButton.style.backgroundColor = "#33b5e5";
        setTimeout(() => {
            generateButton.textContent = "Generate & Copy";
            generateButton.style.backgroundColor = "";
        }, 3000);
    }).catch((error) => {
        console.error(error);
    });

}

// Request clipboard permission
function requestClipboardPermission() {
    return navigator.permissions.query({ name: "clipboard-write" }).then((result) => {
        if (result.state === "granted" || result.state === "prompt") {
            return Promise.resolve();
        } else {
            return Promise.reject(new Error("Clipboard permission denied"));
        }
    });
}

// Add a password and time to the table
function addPasswordToTable(password, time) {
    const table = document.getElementById('password-table');
    const row = table.insertRow(0);
    const passwordCell = row.insertCell(0);
    const timeCell = row.insertCell(1);

    passwordCell.textContent = password;
    timeCell.textContent = time;

    // Copy the password to the clipboard
    navigator.clipboard.writeText(password).then(function () {
        console.log('Password copied to clipboard');
    }, function () {
        console.error('Failed to copy password to clipboard');
    });
}

// Generate a random password
function generateRandomPassword() {
    const length = 8;
    const excludedChars = "?iIl1o0O\/\\*#";
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]\:;?><,./-=";
    let password = "";
    for (let i = 0; i < length; i++) {
        let char = "";
        do {
            char = charset.charAt(Math.floor(Math.random() * charset.length));
        } while (excludedChars.includes(char));
        password += char;
    }
    return password;
}

// Load the last 10 passwords from storage and display them in the table
chrome.storage.sync.get('passwords', function (data) {
    if (data.passwords) {
        data.passwords.slice(-1000).forEach(function (password) {
            addPasswordToTable(password.password, password.time);
        });
    }
});

function clearStorage() {
    chrome.storage.sync.clear(function () {
        console.log('Storage cleared.');
        location.reload(); // 重新加载popup.html页面
    });
}

// Add an event listener to the "Generate" button
document.getElementById('generate-button').addEventListener('click', generatePassword);

document.getElementById('clear-button').addEventListener('click', clearStorage);
