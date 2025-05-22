// Main App initialization
const App = {
  init: function() {
    console.log('Chatter application initialized');
    this.bindEvents();
  },
  
  bindEvents: function() {
    // Channel selection
    const channelLinks = document.querySelectorAll('.screen-container a');
    channelLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // For demo purposes only
        if (this.querySelector('span') && this.querySelector('span').textContent) {
          const channelName = this.querySelector('span').textContent.trim();
          const headerTitle = document.querySelector('.h-14 h3');
          if (headerTitle) {
            headerTitle.textContent = channelName;
          }
        }
      });
    });
    
    // Message sending functionality
    const sendButton = document.querySelector('button:has(i[data-lucide="send"])');
    const messageInput = document.querySelector('[contenteditable="true"]');
    
    if (sendButton && messageInput) {
      sendButton.addEventListener('click', function() {
        const messageText = messageInput.textContent.trim();
        if (messageText) {
          App.sendMessage(messageText);
          messageInput.textContent = '';
        }
      });
      
      // Also send on Enter (not Shift+Enter)
      messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendButton.click();
        }
      });
    }
  },
  
  sendMessage: function(text) {
    console.log('Sending message:', text);
    
    // In a real app, this would send to a backend
    // For demo purposes, we'll add it to the UI directly
    const messagesContainer = document.querySelector('.flex-1.overflow-y-auto');
    if (messagesContainer) {
      const newMessage = document.createElement('div');
      newMessage.className = 'flex items-start';
      newMessage.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center text-white font-medium">BN</div>
        <div class="ml-3">
            <div class="flex items-center">
                <span class="font-medium text-gray-900">Bien Nguyen</span>
                <span class="ml-2 text-xs text-gray-500">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            <div class="mt-1 text-gray-800">
                ${text}
            </div>
        </div>
      `;
      messagesContainer.appendChild(newMessage);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined') {
  module.exports = App;
} 