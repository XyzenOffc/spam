let targetList = [];  // Menyimpan list target
let totalSpam = 0;  // Menyimpan jumlah spam yang sudah dikirim
let spamInterval = null;  // Untuk mengontrol interval spam

// Fungsi untuk menghasilkan deviceId dengan crypto API browser
const generateDeviceId = () => {
    const array = new Uint8Array(21);
    window.crypto.getRandomValues(array);
    return Array.from(array).map(byte => byte.toString(16).padStart(2, '0')).join('');
};

// Fungsi untuk mengirim pesan ke target tertentu
const sendMessage = async (username, message) => {
    try {
        const date = new Date();
        const formattedDate = `${date.getHours()}:${date.getMinutes()}`;

        const deviceId = generateDeviceId();
        // Gunakan CORS Anywhere sebagai proxy untuk mengatasi masalah CORS
        const url = "https://cors-anywhere.herokuapp.com/https://ngl.link/api/submit";
        const headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0",
            "Accept": "*/*",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest",
            "Referer": `https://ngl.link/${username}`,
            "Origin": "https://ngl.link"
        };

        const body = new URLSearchParams({
            username: username,
            question: message,
            deviceId: deviceId
        });

        const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: body.toString(),
            mode: "cors",
            credentials: "include"
        });

        if (response.status === 200) {
            totalSpam++;  // Increment jumlah spam terkirim
            document.getElementById('totalSpam').textContent = totalSpam;
            console.log(`[${formattedDate}] [Msg] Sent: ${message}`);
        } else {
            const responseText = await response.text();  // Menampilkan pesan error atau info lainnya
            console.error(`[${formattedDate}] [Err] Failed with status ${response.status}: ${responseText}`);
        }

    } catch (error) {
        console.error(`[Err] ${error.message}`);
    }
};

// Menangani input form dan menambah target ke list
document.getElementById('sendMessageForm').addEventListener('submit', (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const message = document.getElementById('message').value;

    targetList.push({ username, message });
    
    // Menampilkan username yang ditambahkan ke daftar
    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item');
    listItem.textContent = `Target: ${username}, Message: ${message}`;
    document.getElementById('targetList').appendChild(listItem);

    // Reset input field
    document.getElementById('username').value = '';
    document.getElementById('message').value = '';
});

// Fungsi untuk memulai spam
const startSpam = () => {
    if (spamInterval) {
        clearInterval(spamInterval);  // Hentikan interval jika sebelumnya sudah ada
    }
    
    let currentIndex = 0;
    spamInterval = setInterval(() => {
        if (currentIndex < targetList.length) {
            const { username, message } = targetList[currentIndex];
            sendMessage(username, message);
            currentIndex++;
        } else {
            clearInterval(spamInterval);  // Hentikan spam jika semua target sudah terkirim
            alert('All messages sent!');
        }
    }, 2000);  // Kirim pesan setiap 2 detik
};

// Fungsi untuk menghentikan spam
const stopSpam = () => {
    if (spamInterval) {
        clearInterval(spamInterval);
        spamInterval = null;
        alert('Spam stopped!');
    }
};

// Menghubungkan tombol Start dan Stop dengan fungsi terkait
document.getElementById('startSpamButton').addEventListener('click', startSpam);
document.getElementById('stopSpamButton').addEventListener('click', stopSpam);
