// NeonChat - Frontend Behaviour & Interface Controller

// Mapping of internal Persona keys to user-facing labels and avatars
const PERSONA_LABELS = {
    "FRIENDLY": { name: "Friendly AI", avatar: "💬" },
    "TOXIC_GF": { name: "Toxic Girlfriend", avatar: "💅" },
    "INDIAN_MOM": { name: "Indian Mom", avatar: "🦚" },
    "ROAST_BOT": { name: "Savage Roast", avatar: "🪓" },
    "GENZ_BRAINROT": { name: "Gen Z Brainrot", avatar: "💀" },
    "SIGMA_GURU": { name: "Sigma Guru", avatar: "👑" },
    "MEDIEVAL_WIZARD": { name: "Medieval Wizard", avatar: "🧙‍♂️" },
    "HIGH_UNCLE": { name: "High Uncle", avatar: "🍺" },
    "CODING_MENTOR": { name: "Coding Mentor", avatar: "💻" },
    "STRICT_TEACHER": { name: "Strict Teacher", avatar: "📚" },
    "PRODUCTIVITY_COMMANDER": { name: "Productivity Commander", avatar: "🎯" }
};

// API Endpoint Configuration
// Automatically switches between localhost for development and Render for production
const API_BASE_URL = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
    ? "http://127.0.0.1:8000"
    : "https://neonchat-backend-vrvs.onrender.com"; // Replace with your actual deployed Render backend URL

let typingIndicator = null;

// Initialization when DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    // Initialise Lucide outline icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // Initialize Theme Switcher
    initThemeSystem();

    // Initialize Sidebar Controls
    initSidebarControls();

    // Initialize Keyboard Actions
    initInputActions();

    // Initialize Persona and History persistence
    initPersonaAndHistory();
});

// 1. Theme Toggle System
function initThemeSystem() {
    const themeToggleBtn = document.getElementById("theme-toggle");
    
    // Read persisted setting or default to dark
    const savedTheme = localStorage.getItem("neonchat-theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeIcon(savedTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            const currentTheme = document.documentElement.getAttribute("data-theme");
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            
            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("neonchat-theme", newTheme);
            updateThemeIcon(newTheme);
        });
    }
}

function updateThemeIcon(theme) {
    const themeIcon = document.getElementById("theme-icon");
    if (!themeIcon) return;

    if (theme === "light") {
        themeIcon.setAttribute("data-lucide", "moon");
    } else {
        themeIcon.setAttribute("data-lucide", "sun");
    }

    // Rerender icons through Lucide
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// 2. Responsive Sidebar Drawer Controls
function initSidebarControls() {
    const sidebarToggleBtn = document.getElementById("sidebar-toggle");
    const personaSidebar = document.getElementById("persona-sidebar");
    const sidebarOverlay = document.getElementById("sidebar-overlay");

    if (sidebarToggleBtn && personaSidebar && sidebarOverlay) {
        // Toggle click
        sidebarToggleBtn.addEventListener("click", () => {
            personaSidebar.classList.toggle("active");
            sidebarOverlay.classList.toggle("active");
        });

        // Overlay click
        sidebarOverlay.addEventListener("click", () => {
            personaSidebar.classList.remove("active");
            sidebarOverlay.classList.remove("active");
        });

        // Close sidebar on option click (for mobile experience)
        const personaCards = document.querySelectorAll(".persona-card");
        personaCards.forEach(card => {
            card.addEventListener("click", () => {
                if (window.innerWidth <= 768) {
                    personaSidebar.classList.remove("active");
                    sidebarOverlay.classList.remove("active");
                }
            });
        });
    }
}

// 3. Input Actions (Submit on Enter and Live Character Counter)
function initInputActions() {
    const messageInput = document.getElementById("message");
    const charCounter = document.getElementById("char-counter");
    const sendButton = document.getElementById("send-button");
    
    if (messageInput) {
        messageInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault(); // Prevents line breaks
                const length = messageInput.value.trim().length;
                if (length > 0 && length <= 250) {
                    sendMessage();
                }
            }
        });

        messageInput.addEventListener("input", () => {
            const length = messageInput.value.length;
            if (charCounter) {
                charCounter.innerText = `${length}/250`;
                if (length > 250) {
                    charCounter.classList.add("limit-exceeded");
                } else {
                    charCounter.classList.remove("limit-exceeded");
                }
            }
            if (sendButton) {
                if (length > 250) {
                    sendButton.disabled = true;
                    sendButton.style.opacity = "0.5";
                    sendButton.style.pointerEvents = "none";
                } else {
                    sendButton.disabled = false;
                    sendButton.style.opacity = "";
                    sendButton.style.pointerEvents = "";
                }
            }
        });
    }
}

// 4. Dynamic Message Rendering UI Helper
function appendMessage(sender, text, personaKey = null) {
    const chatMessages = document.getElementById("chat-messages");
    
    // Hide welcome panel on first message
    const welcomeView = document.getElementById("welcome-view");
    if (welcomeView && welcomeView.style.display !== "none") {
        welcomeView.style.display = "none";
    }

    const msgWrapper = document.createElement("div");
    msgWrapper.classList.add("msg-wrapper");
    
    const isUser = (sender === "user");
    msgWrapper.classList.add(isUser ? "user-msg" : "ai-msg");

    // Avatar structure
    const avatar = document.createElement("div");
    avatar.classList.add("chat-avatar");
    if (isUser) {
        avatar.innerText = "U";
    } else {
        const info = PERSONA_LABELS[personaKey] || { avatar: "🤖" };
        avatar.innerText = info.avatar;
    }

    // Chat bubble wrapper
    const bubble = document.createElement("div");
    bubble.classList.add("chat-bubble");

    // Meta details (Sender label and Timestamp)
    const meta = document.createElement("div");
    meta.classList.add("bubble-meta");

    const senderName = document.createElement("span");
    senderName.classList.add("meta-sender");
    if (isUser) {
        senderName.innerText = "You";
    } else {
        const info = PERSONA_LABELS[personaKey] || { name: "Assistant" };
        senderName.innerText = info.name;
    }

    const timeVal = document.createElement("span");
    timeVal.classList.add("meta-time");
    const now = new Date();
    timeVal.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    meta.appendChild(senderName);
    meta.appendChild(timeVal);

    // Text Content block
    const content = document.createElement("div");
    content.classList.add("bubble-content");
    content.innerText = text;

    bubble.appendChild(meta);
    bubble.appendChild(content);

    msgWrapper.appendChild(avatar);
    msgWrapper.appendChild(bubble);

    chatMessages.appendChild(msgWrapper);
    
    // Auto Scroll to latest message
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 5. Typing Indicator Animation Controllers
function showTypingIndicator(personaKey) {
    const chatMessages = document.getElementById("chat-messages");
    
    // Hide welcome panel if still visible
    const welcomeView = document.getElementById("welcome-view");
    if (welcomeView && welcomeView.style.display !== "none") {
        welcomeView.style.display = "none";
    }

    if (typingIndicator) return;

    const msgWrapper = document.createElement("div");
    msgWrapper.classList.add("msg-wrapper", "ai-msg");
    msgWrapper.id = "typing-indicator-wrapper";

    const avatar = document.createElement("div");
    avatar.classList.add("chat-avatar");
    const info = PERSONA_LABELS[personaKey] || { avatar: "🤖" };
    avatar.innerText = info.avatar;

    const bubble = document.createElement("div");
    bubble.classList.add("chat-bubble");

    const meta = document.createElement("div");
    meta.classList.add("bubble-meta");
    const senderName = document.createElement("span");
    senderName.classList.add("meta-sender");
    senderName.innerText = `${info.name || "Assistant"} is analyzing...`;
    meta.appendChild(senderName);

    const dotsContainer = document.createElement("div");
    dotsContainer.classList.add("typing-dots");
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement("div");
        dot.classList.add("typing-dot");
        dotsContainer.appendChild(dot);
    }

    bubble.appendChild(meta);
    bubble.appendChild(dotsContainer);
    
    msgWrapper.appendChild(avatar);
    msgWrapper.appendChild(bubble);
    
    chatMessages.appendChild(msgWrapper);
    typingIndicator = msgWrapper;

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
    if (typingIndicator) {
        typingIndicator.remove();
        typingIndicator = null;
    }
}

// 6. Core Chat Transmit logic (API Integration)
async function sendMessage() {
    const messageInput = document.getElementById("message");
    if (!messageInput) return;

    const message = messageInput.value.trim();
    if (!message) return; // Prevent dispatching empty statements
    if (message.length > 250) return; // Prevent dispatching longer than limit

    // Instantly wipe text field for natural UX speed
    messageInput.value = "";

    // Reset character counter and send button states
    const charCounter = document.getElementById("char-counter");
    if (charCounter) {
        charCounter.innerText = "0/250";
        charCounter.classList.remove("limit-exceeded");
    }
    const sendButton = document.getElementById("send-button");
    if (sendButton) {
        sendButton.disabled = false;
        sendButton.style.opacity = "";
        sendButton.style.pointerEvents = "";
    }

    // Read active selected Persona
    const selectedRadio = document.querySelector('input[name="persona"]:checked');
    const persona = selectedRadio ? selectedRadio.value : "FRIENDLY";

    // Append user's text bubble
    appendMessage("user", message);

    // Render typing loader
    showTypingIndicator(persona);

    // Retrieve conversation history from sessionStorage
    let history = [];
    try {
        const historyStr = sessionStorage.getItem("neonchat-history");
        history = historyStr ? JSON.parse(historyStr) : [];
        if (!Array.isArray(history)) {
            history = [];
        }
    } catch (e) {
        history = [];
    }

    try {
        // Fetch to backend service
        let response = await fetch(`${API_BASE_URL}/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message,
                persona: persona,
                history: history
            })
        });

        // Hide loading dots
        hideTypingIndicator();

        // Handle Rate Limiting (FastAPI backend Limiter status 429)
        if (response.status === 429) {
            appendMessage("ai", "Too many requests. Please wait.", persona);
            return;
        }

        let data = await response.json();
        appendMessage("ai", data.reply, persona);

        // Save this exchange to local browser history memory
        history.push({ user: message, ai: data.reply });
        if (history.length > 4) {
            history = history.slice(history.length - 4);
        }
        sessionStorage.setItem("neonchat-history", JSON.stringify(history));

    } catch (error) {
        // Clear loader and show connection warning
        hideTypingIndicator();
        appendMessage("ai", "Network error. Make sure the local NeonChat backend server is running.", persona);
        console.error("Chat backend connection error:", error);
    }
}

// 7. Persona Persistence and Memory Management
function initPersonaAndHistory() {
    // Read persisted active persona from sessionStorage
    const savedPersona = sessionStorage.getItem("neonchat-active-persona") || "FRIENDLY";
    
    // Select the radio button corresponding to savedPersona
    const targetRadio = document.querySelector(`input[name="persona"][value="${savedPersona}"]`);
    if (targetRadio) {
        targetRadio.checked = true;
    }
    
    // Load historical messages from sessionStorage
    loadHistory();

    // Listen for persona radio button changes
    const personaRadios = document.querySelectorAll('input[name="persona"]');
    personaRadios.forEach(radio => {
        radio.addEventListener("change", (e) => {
            if (e.target.checked) {
                const newPersona = e.target.value;
                changePersona(newPersona);
            }
        });
    });

    // Listen for new chat button click
    const newChatBtn = document.getElementById("new-chat");
    if (newChatBtn) {
        newChatBtn.addEventListener("click", () => {
            sessionStorage.setItem("neonchat-history", JSON.stringify([]));
            clearChatMessages();
        });
    }
}

function changePersona(newPersona) {
    // Update active persona in sessionStorage
    sessionStorage.setItem("neonchat-active-persona", newPersona);
    // Reset history in sessionStorage
    sessionStorage.setItem("neonchat-history", JSON.stringify([]));
    // Clear message bubbles in the UI
    clearChatMessages();
}

function clearChatMessages() {
    const chatMessages = document.getElementById("chat-messages");
    const welcomeView = document.getElementById("welcome-view");
    if (chatMessages) {
        Array.from(chatMessages.children).forEach(child => {
            if (child !== welcomeView) {
                child.remove();
            }
        });
    }
    if (welcomeView) {
        welcomeView.style.display = ""; // Restore welcome view
    }
}

function loadHistory() {
    const savedHistoryStr = sessionStorage.getItem("neonchat-history");
    const savedPersona = sessionStorage.getItem("neonchat-active-persona") || "FRIENDLY";
    if (savedHistoryStr) {
        try {
            const history = JSON.parse(savedHistoryStr);
            if (Array.isArray(history) && history.length > 0) {
                const welcomeView = document.getElementById("welcome-view");
                if (welcomeView) {
                    welcomeView.style.display = "none";
                }
                
                history.forEach(exchange => {
                    if (exchange.user) {
                        appendMessage("user", exchange.user);
                    }
                    if (exchange.ai) {
                        appendMessage("ai", exchange.ai, savedPersona);
                    }
                });
            }
        } catch (e) {
            console.error("Error parsing history from sessionStorage:", e);
        }
    }
}