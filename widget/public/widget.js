/**
 * AgentDesk Widget Embed Script
 * 
 * Usage:
 * <script src="https://your-domain.com/widget.js" data-bot-token="bot_xxxxx"></script>
 */

(function() {
  // Get the script tag that loaded this file
  const scripts = document.getElementsByTagName('script');
  const currentScript = scripts[scripts.length - 1];
  
  // Get the bot token from data attribute
  const botToken = currentScript.getAttribute('data-bot-token');
  
  if (!botToken) {
    console.error('AgentDesk Widget: bot token is required. Add data-bot-token attribute to the script tag.');
    return;
  }

  // Widget configuration
  const WIDGET_URL = currentScript.src.replace('/widget.js', '');

  // Create iframe container
  function loadWidget() {
    // Check if widget is already loaded
    if (document.getElementById('agentdesk-widget')) {
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'agentdesk-widget';
    iframe.src = `${WIDGET_URL}?botToken=${encodeURIComponent(botToken)}`;
    
    // Set iframe size to only cover the widget area, not the entire screen
    iframe.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      border: none;
      z-index: 999999;
      pointer-events: auto;
      background: transparent;
      transition: width 0.3s ease, height 0.3s ease;
    `;

    // Allow pointer events on the iframe content
    iframe.setAttribute('allow', 'clipboard-read; clipboard-write');
    
    document.body.appendChild(iframe);

    // Listen for messages from iframe to adjust size
    window.addEventListener('message', function(event) {
      // Verify the message is from our widget
      if (event.origin !== new URL(WIDGET_URL).origin) {
        return;
      }
      
      if (event.data.type === 'agentdesk-widget-open') {
        iframe.style.width = '380px';
        iframe.style.height = '600px';
      } else if (event.data.type === 'agentdesk-widget-close') {
        iframe.style.width = '60px';
        iframe.style.height = '60px';
      }
    });
  }

  // Load widget when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadWidget);
  } else {
    loadWidget();
  }
})();

