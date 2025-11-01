// Storage key - this is like a "table name" in our localStorage "database"
const STORAGE_KEY = "petDB";

// Initial pet data - this acts as our "seed data" when the app first runs
// Each pet is an object with properties: id, name, age, img, desc
const initialPetData = [
  {
    id: 1678886400001, // Unique identifier (timestamp-based)
    name: "Buddy",
    age: 2,
    img: "https://i.pinimg.com/736x/27/13/a0/2713a0b48576c6626ad4c9b4c26619ec.jpg",
    desc: "Loves long walks.",
  },
  {
    id: 1678886400002,
    name: "Misty",
    age: 1,
    img: "https://cdn2.thecatapi.com/images/531.jpg",
    desc: "Nap expert.",
  },
  {
    id: 1678886400003,
    name: "Rex",
    age: 4,
    img: "https://images.dog.ceo/breeds/boxer/n02108089_11032.jpg",
    desc: "Very playful.",
  },
  {
    id: 1678886400004,
    name: "Whiskers",
    age: 3,
    img: "https://apluscostumes.com/wp-content/uploads/2022/08/large-dog-costume-granny.jpg",
    desc: "Independent and cuddly.",
  },
];

// Get references to HTML elements
const appView = document.getElementById("app-view");
const cardContainer = document.getElementById("card-container");
const likeBtn = document.getElementById("like-btn");
const skipBtn = document.getElementById("skip-btn");
const adminView = document.getElementById("admin-view");
const toggleViewBtn = document.getElementById("toggle-view-btn");

function getPetData() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function savePetData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function initializeDB() {
  const data = getPetData();
  if (data.length === 0) {
    savePetData(initialPetData);
  }
}

function addPet(pet) {
  const data = getPetData(); // Load current data
  data.push(pet); // Modify: add new pet
  savePetData(data); // Save updated data
}

function updatePet(updatedPet) {
  let data = getPetData();
  data = data.map((pet) => (pet.id === updatedPet.id ? updatedPet : pet));
  savePetData(data);
}

function deletePet(petId) {
  let data = getPetData();
  data = data.filter((pet) => pet.id !== petId);
  savePetData(data);
}

// APPLICATION STATE VARIABLES
// These variables track the current state of our swipe app
let petData = []; // Will hold all pets loaded from database
let currentCardIndex = 0; // Which pet card we're currently showing
const adoptedPets = []; // Pets the user has liked/adopted

function createCardElement(pet) {
  const card = document.createElement("div");
  card.classList.add("pet-card");
  card.dataset.id = pet.id; // Store pet ID for later reference

  // GENERATE CARD HTML CONTENT
  // Template literals allow us to embed variables in strings
  card.innerHTML = `
        <img src="${pet.img}" alt="${pet.name}">
        <div class="pet-card-info">
            <h3>${pet.name} <span style="font-weight:normal; color: #555;">(${pet.age} years)</span></h3>
            <p>${pet.desc}</p>
        </div>
    `;

  // ADD DRAG FUNCTIONALITY
  card.addEventListener("mousedown", dragStart); // Desktop drag
  card.addEventListener("touchstart", dragStart, { passive: false }); // Mobile drag

  return card;
}

function renderNextCard() {
  // CHECK IF WE'VE REACHED THE END
  if (currentCardIndex >= petData.length) {
    showSummary();
    return;
  }

  // DISPLAY NEXT PET
  cardContainer.innerHTML = ""; // Clear previous card
  const pet = petData[currentCardIndex]; // Get current pet data
  const card = createCardElement(pet); // Create card element
  cardContainer.appendChild(card); // Add to DOM
}

// Function to handle like or skip action
function handleAction(action) {
  // Get current card element
  const currentCard = cardContainer.querySelector(".pet-card");
  if (!currentCard) return; // Exit if no card

  if (action === "like") {
    // Get pet ID from card
    const petId = parseInt(currentCard.dataset.id);
    // Find pet object
    const pet = petData.find((p) => p.id === petId);
    // Add to adopted pets
    adoptedPets.push(pet);
    // Add animation class
    currentCard.classList.add("swipe-right");
  } else {
    // Add skip animation class
    currentCard.classList.add("swipe-left");
  }

  // Wait for animation to finish, then show next card
  currentCard.addEventListener(
    "transitionend",
    () => {
      currentCardIndex++;
      renderNextCard();
    },
    { once: true }
  );
}

// Function to show summary of adopted pets
function showSummary() {
  // Hide main app
  document.getElementById("app-container").classList.add("hidden");
  // Show summary section
  document.getElementById("summary").classList.remove("hidden");

  const adoptedList = document.getElementById("adopted-list");
  adoptedList.innerHTML = "";

  if (adoptedPets.length === 0) {
    adoptedList.innerHTML = "<p>You haven't adopted any animals this time.</p>";
    return;
  }

  // Create card for each adopted pet
  adoptedPets.forEach((pet) => {
    const adoptedCard = document.createElement("div");
    adoptedCard.classList.add("adopted-card");
    adoptedCard.innerHTML = `<img src="${pet.img}" alt="${pet.name}"><p>${pet.name}</p>`;
    adoptedList.appendChild(adoptedCard);
  });
}

// Connect buttons to functions
likeBtn.addEventListener("click", () => handleAction("like"));
skipBtn.addEventListener("click", () => handleAction("skip"));

// Restart button functionality
document.getElementById("restart-btn").addEventListener("click", function () {
  // Hide summary
  document.getElementById("summary").classList.add("hidden");
  // Show main app
  document.getElementById("app-container").classList.remove("hidden");
  // Reset variables
  adoptedPets.length = 0; // Clear adopted pets array
  currentCardIndex = 0; // Reset to first card
  // Reload data and start over
  petData = getPetData();
  if (petData.length > 0) {
    renderNextCard();
  }
});

// Get form elements
const petForm = document.getElementById("pet-form");
const petIdInput = document.getElementById("pet-id");
const petNameInput = document.getElementById("pet-name");
const petAgeInput = document.getElementById("pet-age");
const petImgInput = document.getElementById("pet-img");
const petDescInput = document.getElementById("pet-desc");
const formSubmitBtn = document.getElementById("form-submit-btn");
const formCancelBtn = document.getElementById("form-cancel-btn");

// Function to validate form inputs
function validateForm() {
  let isValid = true;

  // Clear previous error messages
  document
    .querySelectorAll(".error-message")
    .forEach((msg) => msg.classList.remove("show"));
  document
    .querySelectorAll("input")
    .forEach((input) => input.classList.remove("error"));

  // Validate name (must be 2-30 characters)
  if (petNameInput.value.length < 2 || petNameInput.value.length > 30) {
    showError("name-error", petNameInput);
    isValid = false;
  }

  // Validate age (must be 1-20)
  const age = parseInt(petAgeInput.value);
  if (age < 1 || age > 20) {
    showError("age-error", petAgeInput);
    isValid = false;
  }

  // Validate URL (must be valid URL format)
  try {
    new URL(petImgInput.value);
  } catch {
    showError("img-error", petImgInput);
    isValid = false;
  }

  // Validate description (must be 5-100 characters)
  if (petDescInput.value.length < 5 || petDescInput.value.length > 100) {
    showError("desc-error", petDescInput);
    isValid = false;
  }

  return isValid;
}

// Function to show error message
function showError(errorId, input) {
  document.getElementById(errorId).classList.add("show");
  input.classList.add("error");
}

// Function to handle form submission
function handleFormSubmit(e) {
  // Prevent default form submission
  e.preventDefault();

  // Validate form first
  if (!validateForm()) {
    return; // Stop if validation fails
  }

  // Create pet object from form data
  const pet = {
    name: petNameInput.value.trim(),
    age: parseInt(petAgeInput.value),
    img: petImgInput.value.trim(),
    desc: petDescInput.value.trim(),
    id: parseInt(petIdInput.value) || Date.now(), // Use existing ID or create new one
  };

  // Check if we're updating existing pet or creating new one
  if (parseInt(petIdInput.value)) {
    updatePet(pet); // Update existing
  } else {
    addPet(pet); // Create new
  }

  // Reset form and refresh table
  resetForm();
  renderPetTable();
}

// Function to reset form to initial state
function resetForm() {
  petForm.reset(); // Clear all form fields
  petIdInput.value = "";
  formSubmitBtn.textContent = "Add Pet";
  formCancelBtn.classList.add("hidden");

  // Reset form title
  const formTitle = document.getElementById("form-title");
  if (formTitle) {
    formTitle.textContent = "Add New Pet";
  }
}

// Add event listener to form
petForm.addEventListener("submit", handleFormSubmit);
formCancelBtn.addEventListener("click", resetForm);

// Get filter elements
const searchInput = document.getElementById("search-input");
const ageFilter = document.getElementById("age-filter");
const sortSelect = document.getElementById("sort-select");
const clearFiltersBtn = document.getElementById("clear-filters");

// Object to store current filter settings
let currentFilters = {
  search: "",
  age: "",
  sort: "name-asc",
};

// Function to get filtered and sorted pet data
function getFilteredPets() {
  let data = getPetData();

  // Apply search filter
  if (currentFilters.search) {
    const searchTerm = currentFilters.search.toLowerCase();
    data = data.filter(
      (pet) =>
        pet.name.toLowerCase().includes(searchTerm) ||
        pet.desc.toLowerCase().includes(searchTerm)
    );
  }

  // Apply age filter
  if (currentFilters.age) {
    if (currentFilters.age === "4") {
      // 4+ years
      data = data.filter((pet) => pet.age >= 4);
    } else {
      // Exact age match
      data = data.filter((pet) => pet.age == currentFilters.age);
    }
  }

  // Apply sorting
  data.sort((a, b) => {
    switch (currentFilters.sort) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "age-asc":
        return a.age - b.age;
      case "age-desc":
        return b.age - a.age;
      default:
        return 0;
    }
  });

  return data;
}

// Search input event listener
searchInput.addEventListener("input", (e) => {
  currentFilters.search = e.target.value;
  renderPetTable();
});

// Age filter event listener
ageFilter.addEventListener("change", (e) => {
  currentFilters.age = e.target.value;
  renderPetTable();
});

// Sort select event listener
sortSelect.addEventListener("change", (e) => {
  currentFilters.sort = e.target.value;
  renderPetTable();
});

// Clear filters button
clearFiltersBtn.addEventListener("click", () => {
  currentFilters = { search: "", age: "", sort: "name-asc" };
  searchInput.value = "";
  ageFilter.value = "";
  sortSelect.value = "name-asc";
  renderPetTable();
});

// Function to render pet table with current filters
function renderPetTable() {
  const data = getFilteredPets();
  const petTableBody = document.getElementById("pet-table-body");
  petTableBody.innerHTML = "";

  // Update pet count
  const petCount = document.getElementById("pet-count");
  if (petCount) {
    petCount.textContent = `${data.length} pet${data.length !== 1 ? "s" : ""}`;
  }

  if (data.length === 0) {
    petTableBody.innerHTML = '<tr><td colspan="4">No pets found.</td></tr>';
    return;
  }

  // Create table row for each pet
  data.forEach((pet) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${pet.name}</td>
            <td>${pet.age}</td>
            <td>${pet.desc}</td>
            <td>
                <button class="edit-btn" data-id="${pet.id}">Edit</button>
                <button class="delete-btn" data-id="${pet.id}">Delete</button>
            </td>
        `;
    petTableBody.appendChild(row);
  });
}

// Function to switch between app and admin views
function toggleViews() {
  const isAdminView = !adminView.classList.contains("hidden");

  if (isAdminView) {
    // Switch to app view
    adminView.classList.add("hidden");
    appView.classList.remove("hidden");
    toggleViewBtn.textContent = "Manage Pets";
    // Restart app with fresh data
    petData = getPetData();
    currentCardIndex = 0;
    adoptedPets.length = 0;
    if (petData.length > 0) {
      renderNextCard();
    }
  } else {
    // Switch to admin view
    adminView.classList.remove("hidden");
    appView.classList.add("hidden");
    toggleViewBtn.textContent = "View App";
    renderPetTable();
  }
}

// Add event listener to toggle button
toggleViewBtn.addEventListener("click", toggleViews);

// Variables for drag functionality
let isDragging = false;
let startX = 0;
let deltaX = 0;
let currentCard = null;

// Function to start dragging
function dragStart(e) {
  if (!currentCard) return;
  isDragging = true;
  startX = e.pageX || e.touches[0].pageX;
  currentCard = e.target.closest(".pet-card");
  currentCard.classList.add("dragging");
  document.addEventListener("mousemove", dragging);
  document.addEventListener("touchmove", dragging, { passive: false });
  document.addEventListener("mouseup", dragEnd);
  document.addEventListener("touchend", dragEnd);
}

// Function during dragging
function dragging(e) {
  if (!isDragging || !currentCard) return;
  e.preventDefault();
  const currentX = e.pageX || e.touches[0].pageX;
  deltaX = currentX - startX;
  if (deltaX === 0) return;
  const rotation = deltaX / 10;
  currentCard.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;

  // Visual feedback
  const opacity = Math.max(0.3, 1 - Math.abs(deltaX) / 300);
  currentCard.style.opacity = opacity;
}

// Function to end dragging
function dragEnd() {
  if (!isDragging || !currentCard) return;
  isDragging = false;
  const threshold = 100;

  if (deltaX > threshold) {
    handleAction("like");
  } else if (deltaX < -threshold) {
    handleAction("skip");
  } else {
    // Snap back
    currentCard.classList.remove("dragging");
    currentCard.style.transform = "translateX(0) rotate(0deg)";
    currentCard.style.opacity = "1";
  }

  document.removeEventListener("mousemove", dragging);
  document.removeEventListener("touchmove", dragging);
  document.removeEventListener("mouseup", dragEnd);
  document.removeEventListener("touchend", dragEnd);
  deltaX = 0;
  startX = 0;
}

// Function to handle editing a pet
function handleEditClick(petId) {
  const data = getPetData();
  const petToEdit = data.find((pet) => pet.id === petId);
  if (!petToEdit) return;

  petIdInput.value = petToEdit.id;
  petNameInput.value = petToEdit.name;
  petAgeInput.value = petToEdit.age;
  petImgInput.value = petToEdit.img;
  petDescInput.value = petToEdit.desc;

  formSubmitBtn.textContent = "Update Pet";
  formCancelBtn.classList.remove("hidden");

  const formTitle = document.getElementById("form-title");
  if (formTitle) {
    formTitle.textContent = "Edit Pet";
  }

  window.scrollTo(0, 0);
}

// Function to handle deleting a pet
function handleDeleteClick(petId) {
  if (confirm("Are you sure you want to delete this pet?")) {
    deletePet(petId);
    renderPetTable();
  }
}

// Event listener for table buttons
const petTableBody = document.getElementById("pet-table-body");
petTableBody.addEventListener("click", (e) => {
  const petId = parseInt(e.target.dataset.id);
  if (e.target.classList.contains("edit-btn")) {
    handleEditClick(petId);
  }
  if (e.target.classList.contains("delete-btn")) {
    handleDeleteClick(petId);
  }
});

// Real-time form validation
[petNameInput, petAgeInput, petImgInput, petDescInput].forEach((input) => {
  input.addEventListener("blur", validateForm);
  input.addEventListener("input", () => {
    input.classList.remove("error");
    const errorId = input.id + "-error";
    document.getElementById(errorId).classList.remove("show");
  });
});

// Main function to initialize the application
function main() {
  initializeDB();
  petData = getPetData();

  if (petData.length > 0) {
    renderNextCard();
  } else {
    cardContainer.innerHTML =
      '<p style="text-align:center; padding: 20px;">No pets to swipe. Add some in the admin panel!</p>';
  }

  renderPetTable();
}

// Start the application
main();
