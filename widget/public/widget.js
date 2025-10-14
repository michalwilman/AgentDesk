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
    iframe.style.cssText = `
      position: fixed;
      bottom: 0;
      right: 0;
      width: 100%;
      height: 100%;
      border: none;
      z-index: 999999;
      pointer-events: none;
    `;

    // Allow pointer events on the iframe content
    iframe.setAttribute('allow', 'clipboard-read; clipboard-write');
    
    document.body.appendChild(iframe);

    // Make iframe interactive
    iframe.addEventListener('load', function() {
      iframe.style.pointerEvents = 'auto';
    });
  }

  // Load widget when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadWidget);
  } else {
    loadWidget();
  }
})();

