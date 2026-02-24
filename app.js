// ফায়ারবেস ইমপোর্ট
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// আপনার ফায়ারবেস কনফিগারেশন
const firebaseConfig = {
  apiKey: "AIzaSyAt-H95VSOCGe6yAxSZe-mVHNukT0YgwS4",
  authDomain: "nahids-vault.firebaseapp.com",
  projectId: "nahids-vault",
  storageBucket: "nahids-vault.firebasestorage.app",
  messagingSenderId: "652335808665",
  appId: "1:652335808665:web:41383acadf92ed0c1ab808",
  measurementId: "G-T7RRS1202Z"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// অ্যানিমেশন এবং নেভিগেশন লজিক
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const introScreen = document.getElementById('intro-screen');
        const mainApp = document.getElementById('main-app');
        introScreen.style.opacity = '0';
        setTimeout(() => {
            introScreen.classList.add('hidden');
            mainApp.classList.remove('hidden');
        }, 1500); 
    }, 6000); 
});

window.openVault = function(languageName, colorCode) {
    const grid = document.getElementById('language-grid');
    const vault = document.getElementById('vault-room');
    const title = document.getElementById('vault-title');
    const header = document.querySelector('.profile-header');
    const banner = document.querySelector('.justice-banner');

    title.innerHTML = `<i class="fa-solid fa-code"></i> ${languageName} VAULT`;
    title.style.textShadow = `0 0 25px ${colorCode}`;
    title.style.color = colorCode;

    grid.style.opacity = '0';
    header.style.opacity = '0';
    banner.style.opacity = '0';
    
    setTimeout(() => {
        grid.classList.add('hidden');
        header.classList.add('hidden');
        banner.classList.add('hidden');
        vault.classList.remove('hidden');
        vault.style.opacity = '0';
        setTimeout(() => { vault.style.opacity = '1'; }, 50);
    }, 400); 
}

window.closeVault = function() {
    const grid = document.getElementById('language-grid');
    const vault = document.getElementById('vault-room');
    const header = document.querySelector('.profile-header');
    const banner = document.querySelector('.justice-banner');

    vault.style.opacity = '0';
    setTimeout(() => {
        vault.classList.add('hidden');
        grid.classList.remove('hidden');
        header.classList.remove('hidden');
        banner.classList.remove('hidden');
        grid.style.opacity = '1';
        header.style.opacity = '1';
        banner.style.opacity = '1';
    }, 400);
}

// FIREBASE CLOUD LOGIC
const saveBtn = document.getElementById('save-btn');
const uploaderInput = document.getElementById('uploader-name'); // NEW FIELD
const titleInput = document.getElementById('code-title');
const categoryInput = document.getElementById('code-category');
const contentInput = document.getElementById('code-content');
const codesDisplayArea = document.getElementById('codes-display-area');
const searchBox = document.getElementById('search-box');

let allCodes = [];

saveBtn.addEventListener('click', async () => {
    const uploader = uploaderInput.value.trim() || "Anonymous Hero"; // নাম না দিলে Anonymous দেখাবে
    const title = titleInput.value.trim();
    const category = categoryInput.value;
    const content = contentInput.value.trim();

    if (title === "" || content === "") {
        alert("Please enter Script Name and Code!");
        return;
    }

    saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Transmitting...';
    
    try {
        await addDoc(collection(db, "codes"), {
            uploader: uploader,
            title: title,
            category: category,
            content: content,
            timestamp: new Date()
        });

        titleInput.value = "";
        contentInput.value = "";
        // নামটা ক্লিয়ার করছি না, যাতে একই মানুষ বারবার আপলোড করতে পারে
        saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Successfully Secured!';
        
        setTimeout(() => {
            saveBtn.innerHTML = '<i class="fa-solid fa-shield-halved"></i> Secure & Transmit';
        }, 2000);

    } catch (error) {
        console.error("Error adding document: ", error);
        alert("Error saving code. Check console.");
        saveBtn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Error!';
    }
});

const q = query(collection(db, "codes"), orderBy("timestamp", "desc"));
onSnapshot(q, (snapshot) => {
    allCodes = [];
    snapshot.forEach((doc) => {
        allCodes.push({ id: doc.id, ...doc.data() });
    });
    renderCodes(allCodes);
});

searchBox.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredCodes = allCodes.filter(code => 
        code.title.toLowerCase().includes(searchTerm) || 
        code.category.toLowerCase().includes(searchTerm) ||
        (code.uploader && code.uploader.toLowerCase().includes(searchTerm)) // নাম দিয়েও সার্চ করা যাবে!
    );
    renderCodes(filteredCodes);
});

function renderCodes(codes) {
    if (codes.length === 0) {
        codesDisplayArea.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-folder-open"></i>
                <p>No codes found in the vault.</p>
            </div>
        `;
        return;
    }

    let html = "";
    codes.forEach(code => {
        html += `
            <div style="background: rgba(0,25,40,0.8); border: 1px solid rgba(0,240,255,0.3); border-radius: 8px; padding: 20px; margin-bottom: 20px; text-align: left; box-shadow: 0 5px 15px rgba(0,0,0,0.5);">
                <h3 style="color: #ffffff; margin-bottom: 8px; font-family: 'Montserrat', sans-serif; text-shadow: 0 0 10px #00f0ff;">${code.title}</h3>
                
                <div style="display: flex; gap: 10px; margin-bottom: 15px; flex-wrap: wrap;">
                    <span style="background: rgba(16, 185, 129, 0.2); color: #10b981; padding: 4px 10px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; border: 1px solid #10b981;">
                        <i class="fa-solid fa-folder-tree"></i> ${code.category}
                    </span>
                    <span style="background: rgba(0, 240, 255, 0.1); color: #00f0ff; padding: 4px 10px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; border: 1px solid #00f0ff;">
                        <i class="fa-solid fa-user-astronaut"></i> Uploaded by: ${code.uploader || "Anonymous Hero"}
                    </span>
                </div>

                <pre style="background: rgba(0,0,0,0.6); padding: 15px; border-radius: 6px; overflow-x: auto; color: #e2e8f0; font-family: 'Fira Code', monospace; font-size: 0.95rem; border: 1px solid rgba(0,240,255,0.1);">${escapeHTML(code.content)}</pre>
            </div>
        `;
    });
    codesDisplayArea.innerHTML = html;
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}
