const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const chatMessages = document.getElementById('chat-messages');
const typingIndicator = document.getElementById('typing-indicator');

function formatCodeBlocks(text) {
    // Check if the text contains code block markers
    if (text.includes('```')) {
        // Split by code block markers
        const parts = text.split('```');
        let formatted = '';
        
        for (let i = 0; i < parts.length; i++) {
            if (i % 2 === 0) {
                // Regular text
                formatted += parts[i];
            } else {
                // Code block
                const codeContent = parts[i].trim();
                formatted += `<pre class="code-block"><code>${codeContent}</code></pre>`;
            }
        }
        return formatted;
    }
    return text;
}

function addMessage(content, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    // Format code blocks if present
    const formattedContent = formatCodeBlocks(content);
    
    // Use innerHTML to render HTML for code blocks
    messageDiv.innerHTML = formattedContent;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
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

// Event listeners
sendButton.addEventListener('click', handleMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleMessage();
    }
});
