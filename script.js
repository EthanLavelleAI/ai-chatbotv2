const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const chatMessages = document.getElementById('chat-messages');
const typingIndicator = document.getElementById('typing-indicator');
const sidebarToggle = document.getElementById('mobile-sidebar-toggle');
const sidebar = document.querySelector('.sidebar');
const newChatButton = document.getElementById('new-chat');
const chatHistoryList = document.getElementById('chat-history-list');
const currentChatTitle = document.getElementById('current-chat-title');

// Settings elements
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeModal = document.querySelector('.close-modal');
const themeSelect = document.getElementById('theme-select');
const autoScroll = document.getElementById('auto-scroll');
const clearAllChats = document.getElementById('clear-all-chats');

// Create message sound effect
const messageSoundEffect = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAABQADQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+MYxAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxDsAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV');

// Chat history management
let chats = JSON.parse(localStorage.getItem('chats')) || [{
    id: generateId(),
    title: 'New Chat',
    messages: [{
        content: 'Hello! How can I help you today?',
        isUser: false,
        timestamp: new Date().toISOString()
    }]
}];

let currentChatId = localStorage.getItem('currentChatId') || chats[0].id;

// Settings management
let settings = JSON.parse(localStorage.getItem('settings')) || {
    theme: 'dark',
    autoScroll: true
};

function generateId() {
    return Math.random().toString(36).substring(2, 15);
}

function saveChats() {
    localStorage.setItem('chats', JSON.stringify(chats));
    localStorage.setItem('currentChatId', currentChatId);
}

function saveSettings() {
    localStorage.setItem('settings', JSON.stringify(settings));
}

function getCurrentChat() {
    return chats.find(chat => chat.id === currentChatId);
}

function updateChatTitle(chatId, firstMessage) {
    const chat = chats.find(c => c.id === chatId);
    if (chat && chat.title === 'New Chat' && firstMessage) {
        chat.title = firstMessage.split(' ').slice(0, 4).join(' ') + '...';
        saveChats();
        updateSidebar();
    }
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatCodeBlocks(text) {
    if (text.includes('```')) {
        const parts = text.split('```');
        let formatted = '';
        for (let i = 0; i < parts.length; i++) {
            if (i % 2 === 0) {
                formatted += parts[i];
            } else {
                const codeContent = parts[i].trim();
                formatted += `
                    <div class="code-block">
                        <div class="code-block-header">
                            <button class="code-block-btn copy-btn">
                                <i class="fas fa-copy"></i>
                                Copy
                            </button>
                            <button class="code-block-btn download-btn">
                                <i class="fas fa-download"></i>
                                Download
                            </button>
                        </div>
                        <pre><code>${codeContent}</code></pre>
                    </div>`;
            }
        }
        return formatted;
    }
    return text;
}

function updateSidebar() {
    chatHistoryList.innerHTML = '';
    chats.forEach(chat => {
        const historyItem = document.createElement('div');
        historyItem.className = `history-item${chat.id === currentChatId ? ' active' : ''}`;
        historyItem.innerHTML = `
            <i class="fas fa-message"></i>
            <span>${chat.title}</span>
        `;
        historyItem.onclick = () => switchChat(chat.id);
        chatHistoryList.appendChild(historyItem);
    });
}

function switchChat(chatId) {
    currentChatId = chatId;
    const chat = getCurrentChat();
    currentChatTitle.textContent = chat.title;
    loadMessages(chat.messages);
    saveChats();
    updateSidebar();
    
    if (window.innerWidth <= 768) {
        sidebar.classList.remove('show');
    }
}

function scrollToBottom() {
    if (settings.autoScroll) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

function loadMessages(messages) {
    chatMessages.innerHTML = '';
    messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${msg.isUser ? 'user-message' : 'bot-message'}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = formatCodeBlocks(msg.content);
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-timestamp';
        timeDiv.textContent = formatTimestamp(msg.timestamp);
        
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timeDiv);
        chatMessages.appendChild(messageDiv);
    });
    scrollToBottom();
}

function playMessageSound() {
    if (settings.messageSound) {
        messageSoundEffect.currentTime = 0;
        messageSoundEffect.play().catch(() => {
            // Ignore autoplay errors
        });
    }
}

function addMessage(content, isUser) {
    const chat = getCurrentChat();
    const message = {
        content: content,
        isUser: isUser,
        timestamp: new Date().toISOString()
    };
    
    chat.messages.push(message);
    updateChatTitle(currentChatId, content);
    saveChats();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = formatCodeBlocks(content);
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-timestamp';
    timeDiv.textContent = formatTimestamp(message.timestamp);
    
    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(timeDiv);
    chatMessages.appendChild(messageDiv);
    
    scrollToBottom();
    if (!isUser) {
        playMessageSound();
    }
}

function createNewChat() {
    const newChat = {
        id: generateId(),
        title: 'New Chat',
        messages: [{
            content: 'Hello! How can I help you today?',
            isUser: false,
            timestamp: new Date().toISOString()
        }]
    };
    chats.unshift(newChat);
    switchChat(newChat.id);
    saveChats();
}

async function handleMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    addMessage(message, true);
    messageInput.value = '';

    typingIndicator.style.display = 'block';

    try {
        const response = await puter.ai.chat(message, {model: 'claude-3-5-sonnet'});
        const botResponse = response.message.content[0].text;
        
        typingIndicator.style.display = 'none';
        addMessage(botResponse, false);
    } catch (error) {
        typingIndicator.style.display = 'none';
        addMessage('Sorry, I encountered an error. Please try again.', false);
    }
}

// Settings handlers
function applyTheme(theme) {
    document.body.className = theme;
}

function handleThemeChange(theme) {
    settings.theme = theme;
    applyTheme(theme);
    saveSettings();
}

function handleAutoScrollChange(enabled) {
    settings.autoScroll = enabled;
    saveSettings();
}

// Settings event listeners
themeSelect.addEventListener('change', (e) => handleThemeChange(e.target.value));
autoScroll.addEventListener('change', (e) => handleAutoScrollChange(e.target.checked));

clearAllChats.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all chat history? This cannot be undone.')) {
        chats = [{
            id: generateId(),
            title: 'New Chat',
            messages: [{
                content: 'Hello! How can I help you today?',
                isUser: false,
                timestamp: new Date().toISOString()
            }]
        }];
        currentChatId = chats[0].id;
        saveChats();
        updateSidebar();
        switchChat(currentChatId);
        settingsModal.classList.remove('show');
    }
});

// Modal controls
settingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('show');
});

closeModal.addEventListener('click', () => {
    settingsModal.classList.remove('show');
});

settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.classList.remove('show');
    }
});

// Chat event listeners
sendButton.addEventListener('click', handleMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleMessage();
    }
});

newChatButton.addEventListener('click', createNewChat);

sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('show');
});

// Initialize the interface
function initializeInterface() {
    // Apply saved settings
    applyTheme(settings.theme);
    themeSelect.value = settings.theme;
    autoScroll.checked = settings.autoScroll;
    
    // Initialize chat interface
    updateSidebar();
    switchChat(currentChatId);
}

// Start the app
initializeInterface();

document.addEventListener('click', async (e) => {
    const target = e.target.closest('.code-block-btn');
    if (!target) return;

    const codeBlock = target.closest('.code-block');
    const codeContent = codeBlock.querySelector('code').textContent;

    if (target.classList.contains('copy-btn')) {
        try {
            await navigator.clipboard.writeText(codeContent);
            target.classList.add('copied');
            const originalText = target.innerHTML;
            target.innerHTML = '<i class="fas fa-check"></i>Copied!';
            setTimeout(() => {
                target.classList.remove('copied');
                target.innerHTML = originalText;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    } else if (target.classList.contains('download-btn')) {
        const blob = new Blob([codeContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'code-snippet.txt';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
});
