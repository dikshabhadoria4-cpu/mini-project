// CSIT Academic Portal - Login & Authentication Logic

const AUTH_KEY = "csit_portal_auth_user";
const THEME_KEY = "csit_portal_theme";

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    setupInputs();
});

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
    } else {
        document.body.classList.remove("dark-mode");
    }
    updateThemeButton();
}

function toggleLoginTheme() {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
    updateThemeButton();
}

function updateThemeButton() {
    const btn = document.getElementById("loginThemeToggle");
    if (!btn) return;
    const isDark = document.body.classList.contains("dark-mode");
    btn.innerHTML = isDark
        ? '<i class="fa-solid fa-sun"></i> <span>Light Mode</span>'
        : '<i class="fa-solid fa-moon"></i> <span>Dark Mode</span>';
}

// Toast Notification
function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.innerText = message;
    toast.style.display = "block";
    setTimeout(() => {
        toast.style.display = "none";
    }, 3000);
}

// Password Visibility Toggle
function togglePasswordVisibility() {
    const pwdInput = document.getElementById("loginPassword");
    const btn = document.getElementById("togglePasswordBtn");
    if (pwdInput.type === "password") {
        pwdInput.type = "text";
        btn.innerHTML = '<i class="fa-regular fa-eye-slash"></i>';
    } else {
        pwdInput.type = "password";
        btn.innerHTML = '<i class="fa-regular fa-eye"></i>';
    }
}

// Login Form Submission
function handleLoginSubmit(e) {
    e.preventDefault();

    const emailInput = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const rememberMe = document.getElementById("rememberMe").checked;

    const submitBtn = document.getElementById("btnLoginSubmit");
    const submitText = document.getElementById("btnSubmitText");
    const submitIcon = document.getElementById("btnSubmitIcon");

    if (!emailInput || !password) {
        showToast("Please enter both Email/Username and Password.");
        triggerCardShake();
        return;
    }

    if (password.length < 3) {
        showToast("Password must be at least 3 characters.");
        triggerCardShake();
        return;
    }

    // Determine Authenticated User Profile
    let authenticatedUser = null;
    const lowerEmail = emailInput.toLowerCase();

    if (lowerEmail === "admin" || lowerEmail === "admin@csit.edu" || lowerEmail === "admin@csitportal.edu.in") {
        authenticatedUser = {
            email: emailInput.includes("@") ? emailInput : "admin@csitportal.edu.in",
            name: "Dr. Admin Officer",
            role: "Administrator",
            loginTime: new Date().toISOString()
        };
    } else {
        // Format display name from entered email or username
        const formattedName = emailInput.includes("@")
            ? emailInput.split("@")[0].replace(".", " ").replace(/\b\w/g, l => l.toUpperCase())
            : emailInput.replace(/\b\w/g, l => l.toUpperCase());

        authenticatedUser = {
            email: emailInput,
            name: formattedName,
            role: "Administrator",
            loginTime: new Date().toISOString()
        };
    }

    // UI Loading feedback
    submitBtn.disabled = true;
    submitText.innerText = "Authenticating...";
    submitIcon.className = "fa-solid fa-spinner fa-spin";

    // Save auth session to localStorage
    try {
        localStorage.setItem(AUTH_KEY, JSON.stringify(authenticatedUser));
        if (rememberMe) {
            localStorage.setItem("csit_remember_email", emailInput);
        } else {
            localStorage.removeItem("csit_remember_email");
        }
    } catch (err) {
        console.error("Storage error:", err);
    }

    // Smooth redirect transition
    setTimeout(() => {
        showToast(`Welcome, ${authenticatedUser.name}! Access Granted.`);
        setTimeout(() => {
            window.location.replace("index.html");
        }, 500);
    }, 600);
}

// Shake Animation Trigger on Error
function triggerCardShake() {
    const card = document.getElementById("loginCard");
    card.classList.remove("shake");
    void card.offsetWidth; // trigger reflow
    card.classList.add("shake");
}

// Autofill remembered email if available
function setupInputs() {
    const rememberedEmail = localStorage.getItem("csit_remember_email");
    if (rememberedEmail) {
        document.getElementById("loginEmail").value = rememberedEmail;
        document.getElementById("rememberMe").checked = true;
    }
}

// Forgot Password Modal
function openForgotModal(e) {
    if (e) e.preventDefault();
    document.getElementById("forgotModal").style.display = "flex";
}

function closeForgotModal() {
    document.getElementById("forgotModal").style.display = "none";
}
