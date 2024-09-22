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

function generateCard(card, tagsData) {
    const cardId = `card-${card.ID}`; // Use numerical ID prefixed with 'card-'
  
    const cardContainer = document.createElement("div");
    cardContainer.classList.add("card");
    cardContainer.id = cardId; // Set the cardId using the prefixed ID
  
    const priceText = card.price === 0 ? "Free" : `${card.price} €`;
  
    // Loop through the carouselImages array to create carousel
    const carouselImages = Array.isArray(card.carouselImages) && card.carouselImages.length > 0
      ? card.carouselImages.map(img => `<img src="${img}" alt="Carousel Image">`).join('')
      : '<img src="assets/carousel/placeholder.webp" alt="Placeholder Image">';
  
    // Handle the tags (including icons)
    const cardTags = card.tags && card.tags.length > 0
      ? card.tags.map(tagName => {
          const tag = tagsData.find(t => t.name === tagName);
          return tag
            ? `<div class="chip"><img src="${tag.icon}" alt="${tag.name}">${tag.name}</div>`
            : `<div class="chip">${tagName}</div>`;
        }).join('')
      : '<div class="chip">No tags available</div>';
  
    // Construct the Google Maps link from coordinates
    const mapLink = `https://www.google.com/maps/search/?api=1&query=${card.coordinates}`;
  
    // Add the content to the card
    cardContainer.innerHTML = `
      <div class="card-header">
        <h3 class="card-title">${card.attractionName}</h3>
      </div>
  
      <div class="card-area">${card.areaName}</div>
  
      <div class="like-dislike-price">
        <div class="price card-price">
          <span>${priceText}</span>
        </div>
  
        <div class="like-dislike">
          <div class="toggle dislike">
            <img src="assets/icons/thumbs-down-blank.svg" alt="Dislike">
          </div>
          <div class="toggle like">
            <img src="assets/icons/thumbs-up-blank.svg" alt="Like">
          </div>
        </div>
      </div>
  
      <div class="carousel carousel-images">
        ${carouselImages}
      </div>
  
      <p class="card-short-description">${card.shortDescription}</p>
  
      <div class="card-tags">
        ${cardTags}
      </div>
  
      <p class="card-long-description">${card.longDescription}</p>
      <div class="card-address-1">${card.address1}</div>
      <div class="card-address-2">${card.address2}</div>
  
      <a href="${mapLink}" target="_blank" class="card-map-link">View on Google Maps</a>
    `;
  
    return cardContainer;
  }
  
  

// Render cards and initialize like/dislike buttons
async function renderCards() {
    const cardsData = await fetchJSON('http://127.0.0.1:5500/my-chatbot-project/src/data/attractions.json'); // Fetch attractions data
    const tagsData = await fetchJSON('http://127.0.0.1:5500/my-chatbot-project/src/data/tags.json'); // Fetch tags data
    console.log('Tags Data:', tagsData); // Debugging log
  
    // Use the existing container with class w-layout-hflex cards-wrapper
    const cardContainer = document.querySelector('.w-layout-hflex.cards-wrapper');
  
    // Limit the number of cards to 3 (if needed)
    const limitedCards = cardsData.slice(0, 3); // Take only the first 3 cards
  
    if (!limitedCards || limitedCards.length === 0) {
      console.error("No card data found");
      return;
    }
  
    const cardIds = limitedCards.map(card => `card-${card.ID}`); // Generate cardIds dynamically
  
    // Generate each card and append to the container
    limitedCards.forEach(card => {
      const cardElement = generateCard(card, tagsData);
      cardContainer.appendChild(cardElement);
    });
  
    // Initialize like/dislike buttons after rendering cards
    initializeLikeDislikeButtons(cardIds);
  }
  
  

// Initialize like/dislike buttons for each card
function initializeLikeDislikeButtons(cardIds) {
  // Pass the correct cardIds dynamically
  cardIds.forEach((cardId) => {
    console.log(`Initializing like/dislike buttons for cardId: ${cardId}`); // Add log for debugging

    // Load saved state for each card
    loadLikeDislikeState(cardId);

    // Attach event listeners to like/dislike buttons
    const likeButton = document.querySelector(`#${cardId} .like-toggle`);
    const dislikeButton = document.querySelector(`#${cardId} .dislike-toggle`);

    if (!likeButton || !dislikeButton) {
      console.warn(`Like or dislike button not found for ${cardId}`);
      return; // Safeguard if buttons are missing
    }

    likeButton.addEventListener("click", () =>
      toggleLikeDislike("like", cardId)
    );
    dislikeButton.addEventListener("click", () =>
      toggleLikeDislike("dislike", cardId)
    );
  });
}

// Function to load the like/dislike state from sessionStorage
function loadLikeDislikeState(cardId) {
  const likeButton = document.querySelector(`#${cardId} .like-toggle img`);
  const dislikeButton = document.querySelector(
    `#${cardId} .dislike-toggle img`
  );

  // Check if the buttons exist in the DOM
  if (!likeButton || !dislikeButton) {
    console.warn(`Like or dislike button not found for cardId: ${cardId}`);
    return; // Safeguard in case elements are missing
  }

  // Load the saved state from sessionStorage
  const likeState = sessionStorage.getItem(`${cardId}-like`) || "neutral";
  const dislikeState = sessionStorage.getItem(`${cardId}-dislike`) || "neutral";

  // Update the like button state
  likeButton.src =
    likeState === "liked"
      ? "assets/icons/thumbs-up-filled.svg"
      : "assets/icons/thumbs-up-blank.svg";

  // Update the dislike button state
  dislikeButton.src =
    dislikeState === "disliked"
      ? "assets/icons/thumbs-down-filled.svg"
      : "assets/icons/thumbs-down-blank.svg";
}

// Initialize the cards
document.addEventListener("DOMContentLoaded", () => {
  renderCards();
});
