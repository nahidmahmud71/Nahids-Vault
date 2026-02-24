// ১. ফায়ারবেস ইমপোর্ট করা (Firebase Version 10)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// ২. আপনার ফায়ারবেস কনফিগারেশন (আপনার দেওয়া কোড)
const firebaseConfig = {
  apiKey: "AIzaSyAt-H95VSOCGe6yAxSZe-mVHNukT0YgwS4",
  authDomain: "nahids-vault.firebaseapp.com",
  projectId: "nahids-vault",
  storageBucket: "nahids-vault.firebasestorage.app",
  messagingSenderId: "652335808665",
  appId: "1:652335808665:web:41383acadf92ed0c1ab808",
  measurementId: "G-T7RRS1202Z"
};

// ৩. ফায়ারবেস চালু করা
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ========================================================
   অ্যানিমেশন এবং নেভিগেশন লজিক (আগের মতোই মারাত্মক আছে)
======================================================== */
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

// যেহেতু type="module" ব্যবহার করা হয়েছে, ফাংশনগুলোকে গ্লোবাল করতে হবে
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
        setTimeout(() => {
            vault.style.opacity = '1';
        }, 50);
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

/* ========================================================
   FIREBASE CLOUD LOGIC (কোড সেভ করা এবং সার্চ করা)
======================================================== */

// HTML থেকে ইলিমেন্টগুলো ধরা
const saveBtn = document.getElementById('save-btn');
const titleInput = document.getElementById('code-title');
const categoryInput = document.getElementById('code-category');
const contentInput = document.getElementById('code-content');
const codesDisplayArea = document.getElementById('codes-display-area');
const searchBox = document.getElementById('search-box');
const emptyStateMsg = document.getElementById('empty-state-msg');

let allCodes = []; // ক্লাউড থেকে সব কোড এখানে জমা হবে

// ১. ক্লাউডে কোড সেভ করার লজিক (Save Data)
saveBtn.addEventListener('click', async () => {
    const title = titleInput.value.trim();
    const category = categoryInput.value;
    const content = contentInput.value.trim();

    if (title === "" || content === "") {
        alert("Please enter both Script Name and Code!");
        return;
    }

    // সেভ করার সময় বাটনের টেক্সট চেঞ্জ হবে
    saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Transmitting...';
    
    try {
        // ফায়ারবেসের "codes" ফোল্ডারে ডাটা পাঠানো হচ্ছে
        await addDoc(collection(db, "codes"), {
            title: title,
            category: category,
            content: content,
            timestamp: new Date()
        });

        // সাকসেস হলে ইনপুট ফিল্ড ক্লিয়ার করে দেওয়া
        titleInput.value = "";
        contentInput.value = "";
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

// ২. ক্লাউড থেকে কোড নিয়ে আসার লজিক (Real-time Fetch)
const q = query(collection(db, "codes"), orderBy("timestamp", "desc"));
onSnapshot(q, (snapshot) => {
    allCodes = [];
    snapshot.forEach((doc) => {
        allCodes.push({ id: doc.id, ...doc.data() });
    });
    renderCodes(allCodes);
});

// ৩. সার্চ এবং ফিল্টার লজিক
searchBox.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredCodes = allCodes.filter(code => 
        code.title.toLowerCase().includes(searchTerm) || 
        code.category.toLowerCase().includes(searchTerm)
    );
    renderCodes(filteredCodes);
});

// ৪. স্ক্রিনে কোডগুলো সুন্দর করে সাজানোর লজিক
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
        // সুন্দর গ্লাসমরফিজম কার্ডের মধ্যে কোড শো করানো
        html += `
            <div style="background: rgba(0,0,0,0.6); border: 1px solid #1e293b; border-radius: 8px; padding: 20px; margin-bottom: 20px; text-align: left;">
                <h3 style="color: #00f0ff; margin-bottom: 5px; font-family: 'Montserrat', sans-serif;">${code.title}</h3>
                <span style="display: inline-block; background: rgba(16, 185, 129, 0.2); color: #10b981; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem; margin-bottom: 15px; font-weight: bold;">${code.category}</span>
                <pre style="background: #000; padding: 15px; border-radius: 6px; overflow-x: auto; color: #e2e8f0; font-family: 'Fira Code', monospace; font-size: 0.95rem; border: 1px solid rgba(255,255,255,0.05);">${escapeHTML(code.content)}</pre>
            </div>
        `;
    });
    codesDisplayArea.innerHTML = html;
}

// HTML হ্যাকিং প্রোটেকশন (Security)
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