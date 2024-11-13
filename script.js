let targetList = JSON.parse(localStorage.getItem('targetList')) || [];  // Ambil data target dari localStorage, jika ada
let totalSpam = parseInt(localStorage.getItem('totalSpam')) || 0;  // Ambil jumlah spam yang terkirim dari localStorage
let spamInterval = null;  // Untuk mengontrol interval spam
let isSpamRunning = false;  // Flag untuk cek apakah spam sedang berjalan

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
        const url = "https://cors-anywhere.herokuapp.com/https://ngl.link/api/submit"; // Proxy untuk mengatasi CORS
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

        if (response.ok) {
            totalSpam++;  // Increment jumlah spam terkirim
            localStorage.setItem('totalSpam', totalSpam);  // Simpan ke localStorage
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

// Menangani input form dan menambah target ke list (tapi hanya jika spam sudah selesai)
document.getElementById('sendMessageForm').addEventListener('submit', (event) => {
    event.preventDefault();

    if (isSpamRunning) {
        alert('Spam is running! Wait until it finishes before adding new targets.');
        return;
    }

    const username = document.getElementById('username').value;
    const message = document.getElementById('message').value;

    // Tambahkan target ke list hanya setelah spam selesai
    targetList.push({ username, message });
    localStorage.setItem('targetList', JSON.stringify(targetList));  // Simpan daftar target ke localStorage

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
    if (isSpamRunning) {
        alert('Spam is already running!');
        return;
    }

    if (targetList.length === 0) {
        alert('No targets in the list!');
        return;
    }

    isSpamRunning = true;  // Set flag spam running
    let currentIndex = 0;
    spamInterval = setInterval(() => {
        if (currentIndex < targetList.length) {
            const { username, message } = targetList[currentIndex];
            sendMessage(username, message);
            currentIndex++;
        } else {
            clearInterval(spamInterval);  // Hentikan spam jika semua target sudah terkirim
            alert('All messages sent!');
            isSpamRunning = false;  // Reset flag spam running setelah selesai
        }
    }, 2000);  // Kirim pesan setiap 2 detik
};

// Fungsi untuk menghentikan spam
const stopSpam = () => {
    if (spamInterval) {
        clearInterval(spamInterval);
        spamInterval = null;
        alert('Spam stopped!');
        isSpamRunning = false;  // Reset flag spam running
    }
};

// Menghubungkan tombol Start dan Stop dengan fungsi terkait
document.getElementById('startSpamButton').addEventListener('click', startSpam);
document.getElementById('stopSpamButton').addEventListener('click', stopSpam);

// Menampilkan target yang sudah ada di localStorage ketika halaman dimuat ulang
document.addEventListener('DOMContentLoaded', () => {
    // Tampilkan daftar target
    targetList.forEach(target => {
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item');
        listItem.textContent = `Target: ${target.username}, Message: ${target.message}`;
        document.getElementById('targetList').appendChild(listItem);
    });

    // Menampilkan total spam yang sudah terkirim
    document.getElementById('totalSpam').textContent = totalSpam;
});
