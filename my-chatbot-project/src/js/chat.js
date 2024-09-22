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
  
      // Send the message to the chatbot API
      const response = await sendMessageToAPI(userMessage);
  
      // Check if the response contains a message and threadId
      if (response && response.message) {
        addMessageToChat(response.message, 'bot');
        threadId = response.threadId; // Save thread ID to maintain conversation
      } else {
        addMessageToChat("Sorry, I couldn't understand that.", 'bot');
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
  
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error:', error);
        addMessageToChat("There was an error connecting to the chatbot.", 'bot');
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
  });
  