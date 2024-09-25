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
  const cardContainer = document.querySelector('.w-layout-hflex.cards-wrapper');
  cardContainer.innerHTML = ''; // Clear existing cards

  // Retrieve order from sessionStorage
  const order = JSON.parse(sessionStorage.getItem('attractionOrder'));

  // Loop through the order and find corresponding attractions
  order.forEach(id => {
    const attraction = attractions.find(attraction => attraction.ID === id);
    if (attraction) {
      const card = generateCard(attraction);
      cardContainer.appendChild(card);
    }
  });
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
  
// Function to handle API response and update order
function handleApiResponse(apiResponse, attractions) {
  let newOrder = apiResponse.newOrder || null;

  // Check if the newOrder is a string and parse it into an array
  if (typeof newOrder === 'string') {
    try {
      console.log("Received newOrder as a string:", newOrder); // Log the string version
      newOrder = JSON.parse(newOrder); // Convert string to array
      console.log("Parsed newOrder:", newOrder); // Log the parsed array
    } catch (error) {
      console.error("Error parsing newOrder string:", error);
      return;
    }
  }

  // Check if the newOrder is valid and is an array
  if (newOrder && Array.isArray(newOrder)) {
    console.log("New order received:", newOrder);

    // Store the new order in sessionStorage
    sessionStorage.setItem('attractionOrder', JSON.stringify(newOrder));
    console.log("New order stored in sessionStorage:", sessionStorage.getItem('attractionOrder'));

    // Re-render the cards using the new order
    updateOrderAndRender(newOrder, attractions);
  } else {
    console.error("Invalid or missing newOrder in the API response.");
  }
}

// Function to update card order and re-render
function updateOrderAndRender(newOrder, attractions) {
  // Store the new order in sessionStorage (if needed)
  sessionStorage.setItem('attractionOrder', JSON.stringify(newOrder));

  // Clear the existing card container and re-render based on new order
  renderCards(attractions);
}

// Function to render cards based on sessionStorage order, showing only 3 cards
function renderCards(attractions) {
  const cardContainer = document.querySelector('.w-layout-hflex.cards-wrapper');
  cardContainer.innerHTML = ''; // Clear existing cards

  // Retrieve order from sessionStorage
  const storedOrder = sessionStorage.getItem('attractionOrder');
  console.log("Order retrieved from sessionStorage:", storedOrder); // Log the order from sessionStorage

  if (storedOrder) {
    const order = JSON.parse(storedOrder);

    // Render the first 3 attractions only
    order.slice(0, 3).forEach(id => {
      const attraction = attractions.find(attraction => attraction.ID === id);
      if (attraction) {
        const card = generateCard(attraction);
        cardContainer.appendChild(card);
      }
    });
  } else {
    console.error("No order found in sessionStorage.");
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
  document.addEventListener("DOMContentLoaded", initializePage);
  