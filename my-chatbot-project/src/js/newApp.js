/* ---- Begin chat.js content ---- */
let attractions = [];

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
    console.log("handleUserMessage called."); // Confirm function execution

    const userMessage = chatInput.value.trim();

    if (userMessage === "") {
        console.log("User message is empty. No action taken.");
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
        console.log("API response received in handleUserMessage:", response);
        addMessageToChat(response.message, 'bot');
        threadId = response.threadId; // Save thread ID to maintain conversation

        // Call handleApiResponse if newOrder is present
        if (response.newOrder) {
            console.log("newOrder received in handleUserMessage:", response.newOrder);
            handleApiResponse(response, attractions); // Ensure attractions is accessible
        }
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
    messageElement.innerHTML = message;
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


/* ---- End chat.js content ---- */
/* ---- Begin app.js content ---- */

// Fetch the JSON data from the given file path
async function fetchJSON(filePath) {
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Network response was not OK for ${filePath}`);
      }
      const data = await response.json();
      console.log(`Data fetched from ${filePath}:`, data); // Add log for debugging
      return data;
    } catch (error) {
      console.error(`Error fetching the JSON data from ${filePath}:`, error);
      return [];
    }
  }
  
  // Initialize card order in sessionStorage
  function initializeOrder(attractions) {
    const defaultOrder = attractions.map(attraction => attraction.ID);
    sessionStorage.setItem('attractionOrder', JSON.stringify(defaultOrder));
  }
  
// Function to render cards based on sessionStorage order
function renderCards(attractions) {
  console.log("renderCards called."); // Log to confirm function execution

  const cardContainer = document.querySelector('.w-layout-hflex.cards-wrapper');
  const cards = document.querySelectorAll('.card');

  // Add transitions to existing cards before clearing them
  cards.forEach(card => {
      card.classList.add('card-noshadow');
      setTimeout(() => {
          card.classList.add('card-blank');
      }, 300); // Add `card-blank` after 300ms
  });

  // Clear cards after transitions are completed (400ms to allow opacity transition)
  setTimeout(() => {
      console.log("Clearing existing cards..."); // Log before clearing cards
      cardContainer.innerHTML = ''; // Clear existing cards

      // Retrieve order from sessionStorage
      const order = JSON.parse(sessionStorage.getItem('attractionOrder'));
      console.log("Order retrieved from sessionStorage for rendering:", order);

      // Loop through the order and find corresponding attractions
      order.forEach(id => {
          const attraction = attractions.find(attraction => attraction.ID === id);
          if (attraction) {
              console.log("Generating card for attraction ID:", attraction.ID); // Log card creation
              const card = generateCard(attraction);
              card.classList.add('card-noshadow', 'card-blank'); // Add initial state classes
              cardContainer.appendChild(card);
          } else {
              console.warn("No matching attraction found for ID:", id);
          }
      });

      // Trigger the reverse transitions for the newly generated cards
      const newCards = cardContainer.querySelectorAll('.card');
      newCards.forEach(card => {
          setTimeout(() => {
              card.classList.remove('card-blank');
          }, 100); // Remove `card-blank` after 100ms
          setTimeout(() => {
              card.classList.remove('card-noshadow');
          }, 400); // Remove `card-noshadow` after 400ms (100ms + 300ms)
      });

  }, 400); // Wait for the initial transitions to complete before clearing and regenerating
}


  
  // Function to update card order and re-render based on the API response
  function updateOrderAndRender(newOrder, attractions) {
    sessionStorage.setItem('attractionOrder', JSON.stringify(newOrder));
    renderCards(attractions);
  }
  
  // Function to generate a single card (as in your previous logic)
  function generateCard(card) {
    const cardId = `card-${card.ID}`;
  
    const cardContainer = document.createElement("div");
    cardContainer.classList.add("card");
    cardContainer.id = cardId;
  
    const priceText = card.price === 0 ? "Free" : `${card.price} €`;
    const mainImage = card.carouselImages?.length > 0
      ? `<img src="${card.carouselImages[0]}" alt="${card.attractionName} Main Image" class="card-main-image">`
      : '<img src="assets/carousel/placeholder.webp" alt="Placeholder Image" class="card-main-image">';
  
    const cardTags = card.tags?.length > 0
      ? card.tags.map(tag => `<div class="chip">${tag}</div>`).join("")
      : '<div class="chip">No tags available</div>';
  
    cardContainer.innerHTML = `
      <div class="card-header">
        <h3 class="card-title">${card.attractionName}</h3>
        <div class="like-dislike">
            <div class="toggle dislike"></div>
            <div class="toggle like"></div>
        </div>
      </div>
      <div class="card-top-content">
        <div class="card-area">${card.areaName}</div>
        <p class="card-short-description">${card.shortDescription}</p>
        <div class="chips-wrapper">${cardTags}</div>
      </div>
      <div class="card-main-image-wrapper">
        ${mainImage}
      </div>
      <p class="card-long-description">${card.longDescription}</p>
      <div class="card-address-1">${card.address1}</div>
      <div class="card-address-2">${card.address2}</div>
    `;
  
    return cardContainer;
  }


  function handleApiResponse(apiResponse, attractions) {
    console.log("handleApiResponse called"); // Confirm function is called

    try {
        let newOrder = null;

        // Check if apiResponse has the newOrder property
        if (apiResponse && apiResponse.newOrder) {
            newOrder = apiResponse.newOrder;

            if (typeof newOrder === 'string') {
                console.log("Received newOrder as a string:", newOrder);
                newOrder = JSON.parse(newOrder); // Attempt to parse the newOrder
                console.log("Parsed newOrder:", newOrder); // Log the parsed newOrder
            }
        } else {
            console.error("No newOrder found in API response.");
            return;
        }

        // Check if newOrder is now an array
        if (newOrder && Array.isArray(newOrder)) {
            console.log("Final newOrder to be set in sessionStorage:", newOrder);

            // Update sessionStorage
            sessionStorage.setItem('attractionOrder', JSON.stringify(newOrder));
            console.log("New order stored in sessionStorage:", sessionStorage.getItem('attractionOrder'));

            // Call updateOrderAndRender to re-render the cards
            updateOrderAndRender(newOrder, attractions);
        } else {
            console.error("Invalid newOrder format in the API response.");
        }
    } catch (error) {
        console.error("Error in handleApiResponse:", error);
    }
}


 
  // Initialize like/dislike buttons for each card (unchanged)
  function initializeLikeDislikeButtons() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      const likeButton = card.querySelector(".toggle.like");
      const dislikeButton = card.querySelector(".toggle.dislike");
  
      likeButton.addEventListener("click", () => {
        likeButton.classList.toggle("active");
        dislikeButton.classList.remove("active");
      });
  
      dislikeButton.addEventListener("click", () => {
        dislikeButton.classList.toggle("active");
        likeButton.classList.remove("active");
      });
    });
  }
  
  // Function to fetch and initialize data on page load
  async function initializePage() {
    const attractions = await fetchJSON("https://boosterrocketjg.github.io/DOM-changes-PoC-1_0/my-chatbot-project/src/data/attractions.json");
  
    if (!sessionStorage.getItem('attractionOrder')) {
      initializeOrder(attractions);
    }
  
    renderCards(attractions);
    initializeLikeDislikeButtons();
  }
  
  // Example function to fetch API response and update order
  async function fetchApiResponse() {
    const apiResponse = await fetch("https://hp9axj.buildship.run/cluj").then(response => response.json());
    const attractions = await fetchJSON("https://boosterrocketjg.github.io/DOM-changes-PoC-1_0/my-chatbot-project/src/data/attractions.json");
    handleApiResponse(apiResponse, attractions);
  }
  
  // Initialize everything when the DOM is ready
  document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded and parsed.");
    initializePage(); // Make sure this function is being called.
});

  
  window.onerror = function (message, source, lineno, colno, error) {
    console.error("Global Error Caught:", message, "at", source, ":", lineno, ":", colno, "Error Object:", error);
};


/* ---- End app.js content ---- */

