document.addEventListener('DOMContentLoaded', () => {
  // Get references to DOM elements based on the provided HTML structure
  const chatWindow = document.querySelector('.chat-message-box'); // Chat message box container
  const chatInput = document.querySelector('#chat-input'); // Text area input field
  const chatSubmit = document.querySelector('#chat-submit'); // Submit button

  let threadId = null; // Used to maintain the conversation thread

  // Add event listener for the submit button
  chatSubmit.addEventListener('click', handleUserMessage);

  // Optional: Add event listener for Enter key press within the textarea
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent adding new lines in the text area
      handleUserMessage();
    }
  });

  // Handle user message submission
  async function handleUserMessage() {
    const userMessage = chatInput.value.trim();

    if (userMessage === "") {
      return; // Do nothing if the input is empty
    }

    // Display the user's message in the chat window
    addMessageToChat(userMessage, 'user');

    // Clear the input field after submission
    chatInput.value = '';

    // Display a loading message with animated dots
    const loadingMessage = addLoadingMessage();

    // Send the message to the chatbot API
    const response = await sendMessageToAPI(userMessage);

    // Remove the loading message once we get a response
    removeLoadingMessage(loadingMessage);

    // Handle API response or error
    if (response && response.message) {
      addMessageToChat(response.message, 'bot');
      threadId = response.threadId; // Save thread ID to maintain conversation
    } else {
      addMessageToChat("Something's not right here, please try again later.", 'bot');
    }
  }

  // Send the message to the chatbot API
  async function sendMessageToAPI(message) {
    try {
      const response = await fetch('https://hp9axj.buildship.run/cluj', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          threadId: threadId // Include the thread ID if it exists
        })
      });

      if (!response.ok) {
        throw new Error('API Error');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error:', error);
      return null; // Return null to indicate an error occurred
    }
  }

  // Add message to chat window
  function addMessageToChat(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender); // Add 'message' and either 'user' or 'bot' class
    messageElement.textContent = message;
    chatWindow.appendChild(messageElement);

    // Scroll to the bottom of the chat window
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  // Add loading message with animated dots
  function addLoadingMessage() {
    const loadingElement = document.createElement('div');
    loadingElement.classList.add('message', 'bot'); // Loading message should appear as a bot message
    loadingElement.innerHTML = `
      <div class="dot-elastic"></div>
    `;
    chatWindow.appendChild(loadingElement);
    chatWindow.scrollTop = chatWindow.scrollHeight; // Scroll to the bottom
    return loadingElement;
  }

  // Remove loading message
  function removeLoadingMessage(loadingElement) {
    chatWindow.removeChild(loadingElement);
  }
});
