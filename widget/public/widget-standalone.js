/**
 * AgentDesk Standalone Widget
 * Version: 1.0.0
 * 
 * Standalone chat widget that works without iframe or external dependencies.
 * Perfect for WordPress and other CMS platforms.
 * 
 * Usage:
 * <script>
 *   window.agentdeskConfig = {
 *     botToken: 'bot_xxxxx',
 *     apiUrl: 'https://api.agentdesk.com',
 *     position: 'bottom-right'
 *   };
 * </script>
 * <script src="https://cdn.agentdesk.com/widget-standalone.js" async defer></script>
 */

(function() {
  'use strict';

  // Check if already loaded
  if (window.AgentDeskWidget) {
    console.warn('AgentDesk Widget already loaded');
    return;
  }

  // Get configuration
  const config = window.agentdeskConfig || {};
  const BOT_TOKEN = config.botToken;
  const API_URL = config.apiUrl || 'https://api.agentdesk.com';
  const POSITION = config.position || 'bottom-right';
  const SOURCE = config.source || 'web';
  const METADATA = config.metadata || {};

  if (!BOT_TOKEN) {
    console.error('AgentDesk Widget: botToken is required in window.agentdeskConfig');
    return;
  }

  // Widget state
  let isOpen = false;
  let messages = [];
  let botConfig = null;
  let sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(7);
  let isLoading = false;
  let isRTL = false;
  let welcomeShown = false;

  // Create widget HTML
  function createWidget() {
    // Check if already exists
    if (document.getElementById('agentdesk-widget-container')) {
      return;
    }

    const container = document.createElement('div');
    container.id = 'agentdesk-widget-container';
    container.innerHTML = `
      <style>
        #agentdesk-widget-container * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        #agentdesk-widget-container {
          position: fixed;
          ${POSITION === 'bottom-left' ? 'left: 20px;' : 'right: 20px;'}
          bottom: 20px;
          z-index: 999999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        .agentdesk-bubble {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: var(--agentdesk-primary-color, #00E0C6);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          position: relative;
        }

        .agentdesk-bubble:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 30px rgba(0, 0, 0, 0.3);
        }

        .agentdesk-bubble-icon {
          width: 32px;
          height: 32px;
          fill: white;
        }

        .agentdesk-bubble-pulse {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: var(--agentdesk-primary-color, #00E0C6);
          opacity: 0.4;
          animation: agentdesk-pulse 2s infinite;
        }

        @keyframes agentdesk-pulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        .agentdesk-chat-window {
          display: none;
          width: 380px;
          height: 600px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 50px rgba(0, 0, 0, 0.2);
          flex-direction: column;
          overflow: hidden;
          animation: agentdesk-slideUp 0.3s ease-out;
          direction: ltr;
        }
        
        .agentdesk-chat-window[dir="rtl"] {
          direction: rtl;
        }

        .agentdesk-chat-window.open {
          display: flex;
        }

        @keyframes agentdesk-slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .agentdesk-header {
          padding: 20px;
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .agentdesk-header-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .agentdesk-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 600;
        }

        .agentdesk-avatar img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }

        .agentdesk-bot-name {
          font-size: 16px;
          font-weight: 600;
        }

        .agentdesk-bot-status {
          font-size: 12px;
          opacity: 0.9;
        }

        .agentdesk-close-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .agentdesk-close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .agentdesk-close-icon {
          width: 16px;
          height: 16px;
          fill: white;
        }

        .agentdesk-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: #f9fafb;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .agentdesk-message {
          display: flex;
          gap: 10px;
          align-items: flex-end;
        }

        .agentdesk-message.user {
          flex-direction: row-reverse;
        }

        .agentdesk-message-bubble {
          max-width: 75%;
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.5;
          word-wrap: break-word;
          text-align: left;
        }
        
        .agentdesk-chat-window[dir="rtl"] .agentdesk-message-bubble {
          text-align: right;
        }

        .agentdesk-message.user .agentdesk-message-bubble {
          background: var(--agentdesk-primary-color, #00E0C6);
          color: white;
          border-bottom-right-radius: 4px;
        }
        
        .agentdesk-chat-window[dir="rtl"] .agentdesk-message.user .agentdesk-message-bubble {
          border-bottom-right-radius: 18px;
          border-bottom-left-radius: 4px;
        }

        .agentdesk-message.assistant .agentdesk-message-bubble {
          background: white;
          color: #1f2937;
          border: 1px solid #e5e7eb;
          border-bottom-left-radius: 4px;
        }
        
        .agentdesk-chat-window[dir="rtl"] .agentdesk-message.assistant .agentdesk-message-bubble {
          border-bottom-left-radius: 18px;
          border-bottom-right-radius: 4px;
        }

        .agentdesk-typing {
          display: flex;
          gap: 4px;
          padding: 12px 16px;
          background: white;
          border-radius: 18px;
          border: 1px solid #e5e7eb;
          width: fit-content;
        }

        .agentdesk-typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--agentdesk-primary-color, #00E0C6);
          animation: agentdesk-typing 1.4s infinite;
        }

        .agentdesk-typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .agentdesk-typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes agentdesk-typing {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-10px); }
        }

        .agentdesk-input-container {
          padding: 16px;
          background: white;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .agentdesk-input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 24px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          direction: ltr;
          text-align: left;
        }
        
        .agentdesk-chat-window[dir="rtl"] .agentdesk-input {
          direction: rtl;
          text-align: right;
        }

        .agentdesk-input:focus {
          border-color: var(--agentdesk-primary-color, #00E0C6);
          box-shadow: 0 0 0 3px rgba(0, 224, 198, 0.1);
        }

        .agentdesk-send-btn {
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 50%;
          background: var(--agentdesk-primary-color, #00E0C6);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.2s, transform 0.2s;
        }

        .agentdesk-send-btn:hover:not(:disabled) {
          opacity: 0.9;
          transform: scale(1.05);
        }

        .agentdesk-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .agentdesk-send-icon {
          width: 20px;
          height: 20px;
          fill: currentColor;
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          #agentdesk-widget-container {
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100%;
          }

          .agentdesk-chat-window {
            width: 100%;
            height: 100vh;
            border-radius: 0;
          }

          .agentdesk-bubble {
            position: fixed;
            ${POSITION === 'bottom-left' ? 'left: 20px;' : 'right: 20px;'}
            bottom: 20px;
          }
        }

        /* Scrollbar styling */
        .agentdesk-messages::-webkit-scrollbar {
          width: 6px;
        }

        .agentdesk-messages::-webkit-scrollbar-track {
          background: transparent;
        }

        .agentdesk-messages::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }

        .agentdesk-messages::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      </style>

      <!-- Floating Bubble -->
      <div id="agentdesk-bubble" class="agentdesk-bubble">
        <div class="agentdesk-bubble-pulse"></div>
        <svg class="agentdesk-bubble-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z" fill="currentColor"/>
          <circle cx="12" cy="10" r="1.5" fill="currentColor"/>
          <circle cx="8" cy="10" r="1.5" fill="currentColor"/>
          <circle cx="16" cy="10" r="1.5" fill="currentColor"/>
        </svg>
      </div>

      <!-- Chat Window -->
      <div id="agentdesk-chat-window" class="agentdesk-chat-window">
        <!-- Header -->
        <div id="agentdesk-header" class="agentdesk-header">
          <div class="agentdesk-header-info">
            <div class="agentdesk-avatar" id="agentdesk-avatar">
              <span id="agentdesk-avatar-text">AI</span>
            </div>
            <div>
              <div class="agentdesk-bot-name" id="agentdesk-bot-name">Loading...</div>
              <div class="agentdesk-bot-status">Online</div>
            </div>
          </div>
          <button class="agentdesk-close-btn" id="agentdesk-close-btn">
            <svg class="agentdesk-close-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <!-- Messages -->
        <div id="agentdesk-messages" class="agentdesk-messages"></div>

        <!-- Input -->
        <div class="agentdesk-input-container">
          <input
            type="text"
            id="agentdesk-input"
            class="agentdesk-input"
            placeholder="Type your message..."
            autocomplete="off"
          />
          <button id="agentdesk-send-btn" class="agentdesk-send-btn">
            <svg class="agentdesk-send-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    // Initialize widget
    initializeWidget();
  }

  // Fetch bot configuration
  async function fetchBotConfig() {
    try {
      // Remove trailing /api if present to avoid /api/api duplication
      const baseUrl = API_URL.replace(/\/api$/, '');
      const response = await fetch(`${baseUrl}/api/bots/config/${BOT_TOKEN}`);
      if (!response.ok) {
        throw new Error('Failed to fetch bot configuration');
      }
      botConfig = await response.json();
      updateWidgetUI();
      return botConfig;
    } catch (error) {
      console.error('AgentDesk Widget Error:', error);
      botConfig = {
        name: 'Chat Support',
        primary_color: '#00E0C6',
        welcome_message: 'Hello! How can I help you today?',
        language: 'en',
      };
      updateWidgetUI();
      return botConfig;
    }
  }

  // Update widget UI with bot config
  function updateWidgetUI() {
    if (!botConfig) return;

    // Detect RTL language
    isRTL = botConfig.language === 'he' || botConfig.language === 'hebrew' || botConfig.language === 'עברית';

    // Set primary color
    const root = document.documentElement;
    root.style.setProperty('--agentdesk-primary-color', botConfig.primary_color);

    // Set header background
    const header = document.getElementById('agentdesk-header');
    if (header) {
      header.style.background = botConfig.primary_color;
    }

    // Set bot name
    const botName = document.getElementById('agentdesk-bot-name');
    if (botName) {
      botName.textContent = botConfig.name;
    }

    // Set avatar
    const avatarContainer = document.getElementById('agentdesk-avatar');
    const avatarText = document.getElementById('agentdesk-avatar-text');
    if (botConfig.avatar_url) {
      avatarContainer.innerHTML = `<img src="${botConfig.avatar_url}" alt="${botConfig.name}" />`;
    } else if (avatarText) {
      avatarText.textContent = botConfig.name.charAt(0).toUpperCase();
    }

    // Set RTL direction
    const chatWindow = document.getElementById('agentdesk-chat-window');
    if (chatWindow) {
      chatWindow.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    }

    // Update input placeholder based on language
    const input = document.getElementById('agentdesk-input');
    if (input) {
      input.placeholder = isRTL ? 'הקלידי הודעה...' : 'Type your message...';
    }
  }

  // Show welcome messages with typing effect
  function showWelcomeMessages() {
    if (messages.length > 0) return;
      const messagesToShow = botConfig.welcome_messages && botConfig.welcome_messages.length > 0 
        ? botConfig.welcome_messages 
        : botConfig.welcome_message
        ? [botConfig.welcome_message]
        : [];

      if (messagesToShow.length === 0) return;

      // Show messages with typing indicator between them
      let currentIndex = 0;
      
      const showNextMessage = () => {
        if (currentIndex >= messagesToShow.length) return;
        
        const message = messagesToShow[currentIndex];
        currentIndex++;
        
        // Show typing indicator
        if (currentIndex < messagesToShow.length) {
          setTimeout(() => {
            showTyping();
            setTimeout(() => {
              hideTyping();
              addMessage('assistant', message);
              setTimeout(showNextMessage, 500);
            }, 1000);
          }, 300);
        } else {
          // Last message - no typing indicator after
          setTimeout(() => {
            addMessage('assistant', message);
          }, 300);
        }
      };
      
      showNextMessage();
    }
  }

  // Initialize widget
  function initializeWidget() {
    const bubble = document.getElementById('agentdesk-bubble');
    const chatWindow = document.getElementById('agentdesk-chat-window');
    const closeBtn = document.getElementById('agentdesk-close-btn');
    const input = document.getElementById('agentdesk-input');
    const sendBtn = document.getElementById('agentdesk-send-btn');

    // Fetch bot config
    fetchBotConfig();

    // Toggle chat window
    bubble.addEventListener('click', () => {
      isOpen = true;
      bubble.style.display = 'none';
      chatWindow.classList.add('open');
      input.focus();
      
      // Show welcome messages only once
      if (!welcomeShown && botConfig) {
        welcomeShown = true;
        showWelcomeMessages();
      }
    });

    // Close chat window
    closeBtn.addEventListener('click', () => {
      isOpen = false;
      chatWindow.classList.remove('open');
      bubble.style.display = 'flex';
    });

    // Send message on Enter
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Send message on button click
    sendBtn.addEventListener('click', sendMessage);
  }

  // Add message to UI
  function addMessage(role, content) {
    messages.push({ role, content });
    
    const messagesContainer = document.getElementById('agentdesk-messages');
    if (!messagesContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `agentdesk-message ${role}`;
    messageDiv.innerHTML = `
      <div class="agentdesk-message-bubble">${escapeHtml(content)}</div>
    `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Show typing indicator
  function showTyping() {
    const messagesContainer = document.getElementById('agentdesk-messages');
    if (!messagesContainer) return;

    const typingDiv = document.createElement('div');
    typingDiv.id = 'agentdesk-typing-indicator';
    typingDiv.className = 'agentdesk-message assistant';
    typingDiv.innerHTML = `
      <div class="agentdesk-typing">
        <div class="agentdesk-typing-dot"></div>
        <div class="agentdesk-typing-dot"></div>
        <div class="agentdesk-typing-dot"></div>
      </div>
    `;

    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Hide typing indicator
  function hideTyping() {
    const typingIndicator = document.getElementById('agentdesk-typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  // Send message
  async function sendMessage() {
    const input = document.getElementById('agentdesk-input');
    const sendBtn = document.getElementById('agentdesk-send-btn');
    
    if (!input || !sendBtn) return;
    
    const message = input.value.trim();
    if (!message || isLoading) return;

    // Add user message
    addMessage('user', message);
    input.value = '';

    // Disable input
    isLoading = true;
    input.disabled = true;
    sendBtn.disabled = true;

    // Show typing
    showTyping();

    try {
      // Remove trailing /api if present to avoid /api/api duplication
      const baseUrl = API_URL.replace(/\/api$/, '');
      const response = await fetch(`${baseUrl}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Bot-Token': BOT_TOKEN,
        },
        body: JSON.stringify({
          sessionId: sessionId,
          message: message,
          visitorMetadata: {
            ...METADATA,
            userAgent: navigator.userAgent,
            source: SOURCE,
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      // Hide typing
      hideTyping();

      // Add assistant response
      addMessage('assistant', data.message);

    } catch (error) {
      console.error('AgentDesk Error:', error);
      hideTyping();
      addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
    } finally {
      // Re-enable input
      isLoading = false;
      input.disabled = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }

  // Export to window for external control
  window.AgentDeskWidget = {
    open: function() {
      const bubble = document.getElementById('agentdesk-bubble');
      const chatWindow = document.getElementById('agentdesk-chat-window');
      if (bubble && chatWindow) {
        bubble.style.display = 'none';
        chatWindow.classList.add('open');
        isOpen = true;
      }
    },
    close: function() {
      const bubble = document.getElementById('agentdesk-bubble');
      const chatWindow = document.getElementById('agentdesk-chat-window');
      if (bubble && chatWindow) {
        bubble.style.display = 'flex';
        chatWindow.classList.remove('open');
        isOpen = false;
      }
    },
    isOpen: function() {
      return isOpen;
    },
  };

})();

