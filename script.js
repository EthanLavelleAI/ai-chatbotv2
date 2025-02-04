const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const chatMessages = document.getElementById('chat-messages');
const typingIndicator = document.getElementById('typing-indicator');
const sidebarToggle = document.getElementById('mobile-sidebar-toggle');
const sidebar = document.querySelector('.sidebar');
const newChatButton = document.getElementById('new-chat');
const chatHistoryList = document.getElementById('chat-history-list');
const currentChatTitle = document.getElementById('current-chat-title');

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

function generateId() {
    return Math.random().toString(36).substring(2, 15);
}

function saveChats() {
    localStorage.setItem('chats', JSON.stringify(chats));
    localStorage.setItem('currentChatId', currentChatId);
}

function getCurrentChat() {
    return chats.find(chat => chat.id === currentChatId);
}

function updateChatTitle(chatId, firstMessage) {
    const chat = chats.find(c => c.id === chatId);
    if (chat && chat.title === 'New Chat' && firstMessage) {
        // Use the first few words of the first message as the title
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
                formatted += `<pre class="code-block"><code>${codeContent}</code></pre>`;
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
    
    // Close sidebar on mobile after selecting a chat
    if (window.innerWidth <= 768) {
        sidebar.classList.remove('show');
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
    chatMessages.scrollTop = chatMessages.scrollHeight;
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
    chatMessages.scrollTop = chatMessages.scrollHeight;
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

    // Add user message
    addMessage(message, true);
    messageInput.value = '';

    // Show typing indicator
    typingIndicator.style.display = 'block';

    try {
        // Get bot response
        const response = await puter.ai.chat(message, {model: 'claude-3-5-sonnet'});
        const botResponse = response.message.content[0].text;
        
        // Hide typing indicator and add bot response
        typingIndicator.style.display = 'none';
        addMessage(botResponse, false);
    } catch (error) {
        typingIndicator.style.display = 'none';
        addMessage('Sorry, I encountered an error. Please try again.', false);
    }
}

// Event Listeners
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

// Settings Management
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeModal = document.querySelector('.close-modal');
const themeSelect = document.getElementById('theme-select');
const messageSound = document.getElementById('message-sound');
const autoScroll = document.getElementById('auto-scroll');
const clearAllChats = document.getElementById('clear-all-chats');

// Load settings from localStorage
let settings = JSON.parse(localStorage.getItem('settings')) || {
    theme: 'dark',
    messageSound: false,
    autoScroll: true
};

// Apply settings on load
function applySettings() {
    // Apply theme
    document.body.className = settings.theme;
    themeSelect.value = settings.theme;
    
    // Apply other settings
    messageSound.checked = settings.messageSound;
    autoScroll.checked = settings.autoScroll;
}

// Save settings to localStorage
function saveSettings() {
    localStorage.setItem('settings', JSON.stringify(settings));
}

// Settings event listeners
themeSelect.addEventListener('change', (e) => {
    settings.theme = e.target.value;
    applySettings();
    saveSettings();
});

messageSound.addEventListener('change', (e) => {
    settings.messageSound = e.target.checked;
    saveSettings();
});

autoScroll.addEventListener('change', (e) => {
    settings.autoScroll = e.target.checked;
    saveSettings();
});

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

// Initialize settings
applySettings();

// Initialize the chat interface
updateSidebar();
switchChat(currentChatId);
