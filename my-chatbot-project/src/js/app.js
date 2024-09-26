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
        cardContainer.innerHTML = ''; // Clear existing cards

        // Retrieve order from sessionStorage
        const order = JSON.parse(sessionStorage.getItem('attractionOrder'));

        // Loop through the order and find corresponding attractions
        order.forEach(id => {
            const attraction = attractions.find(attraction => attraction.ID === id);
            if (attraction) {
                const card = generateCard(attraction);
                card.classList.add('card-noshadow', 'card-blank'); // Add initial state classes
                cardContainer.appendChild(card);
            }
        });

        // Trigger the reverse transitions for the newly generated cards
        const newCards = cardContainer.querySelectorAll('.card');
        newCards.forEach(card => {
            setTimeout(() => {
                card.classList.remove('card-blank');
            }, 600); // Remove `card-blank` after 100ms
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
  
/* -------------------------------------------------------------------------- */
/*                               fix area starts                              */
/* -------------------------------------------------------------------------- */

function handleApiResponse(apiResponse, attractions) {
  console.log("handleApiResponse called"); // Confirm function is called

  try {
      // Declare newOrder explicitly
      let newOrder = null;

      // Check if apiResponse has the newOrder property
      if (apiResponse && apiResponse.newOrder) {
          newOrder = apiResponse.newOrder;

          if (typeof newOrder === 'string') {
              console.log("Received newOrder as a string:", newOrder);
              newOrder = JSON.parse(newOrder); // Attempt to parse the newOrder
              console.log("Parsed newOrder:", newOrder);
          }
      } else {
          console.error("No newOrder found in API response.");
          return;
      }

      // Check if newOrder is now an array
      if (newOrder && Array.isArray(newOrder)) {
          console.log("New order received:", newOrder);

          // Update sessionStorage
          sessionStorage.setItem('attractionOrder', JSON.stringify(newOrder));
          console.log("New order stored in sessionStorage:", sessionStorage.getItem('attractionOrder'));

          // Confirm that sessionStorage was updated correctly
          const storedOrder = sessionStorage.getItem('attractionOrder');
          if (storedOrder) {
              console.log("SessionStorage update confirmed:", storedOrder);
          } else {
              console.error("Failed to update sessionStorage.");
          }

          // Call updateOrderAndRender to re-render the cards
          updateOrderAndRender(newOrder, attractions);
      } else {
          console.error("Invalid newOrder format in the API response.");
      }
  } catch (error) {
      console.error("Error in handleApiResponse:", error);
  }
}





/* -------------------------------------------------------------------------- */
/*                                fix area ends                               */
/* -------------------------------------------------------------------------- */

  
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
    console.log("Initializing page...");

    const attractions = await fetchJSON("https://boosterrocketjg.github.io/DOM-changes-PoC-1_0/my-chatbot-project/src/data/attractions.json");

    if (!sessionStorage.getItem('attractionOrder')) {
        initializeOrder(attractions);
    }

    renderCards(attractions);
    initializeLikeDislikeButtons();

    // Call fetchApiResponse after a delay to avoid interfering with the initial page setup
    setTimeout(async () => {
        console.log("Calling fetchApiResponse...");
        await fetchApiResponse();
    }, 1000); // 1 second delay
}

  
  async function fetchApiResponse() {
    try {
        console.log("Fetching API response...");
        const response = await fetch("https://hp9axj.buildship.run/cluj");

        // Check if the response is successful
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        // Attempt to parse the response as JSON
        const apiResponse = await response.json();
        console.log("API response received:", apiResponse);
        
    } catch (error) {
        console.error("Error in fetchApiResponse:", error);
    }
}

  
  // Initialize everything when the DOM is ready
  document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded and parsed.");
    initializePage(); // Make sure this function is being called.
});

  
  window.onerror = function (message, source, lineno, colno, error) {
    console.error("Global Error Caught:", message, "at", source, ":", lineno, ":", colno, "Error Object:", error);
};
