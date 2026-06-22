// Initialize empty cart array
let cart = [];

// DOM Elements
const cartCountEl = document.getElementById('cart-count');
const gridContainer = document.querySelector('.product-grid');

// Event Delegation for Add/Remove Buttons
gridContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart-btn')) {
        const button = e.target;
        const card = button.closest('.product-card');
        
        // Extract item details from data attributes
        const productId = card.getAttribute('data-id');
        const productName = card.getAttribute('data-name');
        const productPrice = card.getAttribute('data-price');

        // Check if item is already in the cart
        const itemIndex = cart.findIndex(item => item.id === productId);

        if (itemIndex === -1) {
            // Add Item
            cart.push({ id: productId, name: productName, price: productPrice });
            button.textContent = 'Remove from Cart';
            button.classList.add('in-cart');
        } else {
            // Remove Item
            cart.splice(itemIndex, 1);
            button.textContent = 'Add to Cart';
            button.classList.remove('in-cart');
        }

        // Update top-right cart counter
        cartCountEl.textContent = cart.length;
    }
});


// Local Storage App Memory Model
let state = {
  cart: [],
  user: { name: "", email: "", phone: "" }
};

// UI Element Targets
const cartModal = document.getElementById("cartModal");
const cartModalContent = document.getElementById("cartModalContent");
const summaryModal = document.getElementById("summaryModal");
const cartTableBody = document.getElementById("cartTableBody");
const cartTotalDisplay = document.getElementById("cartTotalDisplay");
const cartCountBadge = document.getElementById("cartCountBadge");
const summaryMessage = document.getElementById("summaryMessage");
const summaryItemsList = document.getElementById("summaryItemsList");

// Inputs Elements
const custName = document.getElementById("custName");
const custEmail = document.getElementById("custEmail");
const custPhone = document.getElementById("custPhone");

// Input Error Containers
const errName = document.getElementById("errName");
const errEmail = document.getElementById("errEmail");
const errPhone = document.getElementById("errPhone");

// Global Configuration Ruleset
const validations = {
  name: {
    fn: val => val.trim().length > 0,
    msg: "Name field is required.",
    errEl: errName, inputEl: custName
  },
  email: {
    fn: val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    msg: "Please type a valid email address structure.",
    errEl: errEmail, inputEl: custEmail
  },
  phone: {
    fn: val => /^\+?[0-9]{7,15}$/.test(val.replace(/[\s-]/g, '')),
    msg: "Please supply a valid numeric phone number (7-15 digits).",
    errEl: errPhone, inputEl: custPhone
  }
};

// Application Init Setup
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  updateUI();
});

function setupEventListeners() {
  // Storefront Dynamic Hooks
  document.querySelectorAll(".product-btn").forEach(btn => {
    btn.addEventListener("click", handleStorefrontClick);
  });

  // Modal Open/Close Controls
  document.getElementById("cartIconBtn").addEventListener("click", () => toggleModal(cartModal, true));
  document.getElementById("closeModalCross").addEventListener("click", () => toggleModal(cartModal, false));
  document.getElementById("btnContinue").addEventListener("click", () => toggleModal(cartModal, false));
  
  // Explicit requirement: Click outside the modal element boundary wrapper closes it
  cartModal.addEventListener("click", (e) => {
    if (!cartModalContent.contains(e.target)) toggleModal(cartModal, false);
  });

  // Loose Focus Form Event Triggers
  Object.keys(validations).forEach(key => {
    validations[key].inputEl.addEventListener("blur", () => validateField(key));
    validations[key].inputEl.addEventListener("input", () => clearFieldError(key));
  });

  // Process Action Directives
  document.getElementById("btnCheckout").addEventListener("click", handleCheckoutExecution);
  document.getElementById("btnSummaryOk").addEventListener("click", resetApplicationWorkflow);
}

// Handler Functions
function handleStorefrontClick(e) {
  const btn = e.target;
  const id = btn.getAttribute("data-id");
  const name = btn.getAttribute("data-name");
  const price = parseFloat(btn.getAttribute("data-price"));

  const cartIndex = state.cart.findIndex(item => item.id === id);

  if (cartIndex > -1) {
    // Treat button click as a toggle removal if item is already present
    removeCartItem(id);
  } else {
    state.cart.push({ id, name, price, quantity: 1 });
    updateUI();
  }
}

function updateUI() {
  updateCartBadge();
  renderCartTable();
  updateStoreButtons();
}

function updateCartBadge() {
  const aggregateQuantity = state.cart.reduce((acc, curr) => acc + curr.quantity, 0);
  cartCountBadge.textContent = aggregateQuantity;
}

function updateStoreButtons() {
  document.querySelectorAll(".product-btn").forEach(btn => {
    const id = btn.getAttribute("data-id");
    const activeInCart = state.cart.some(item => item.id === id);

    if (activeInCart) {
      btn.textContent = "Remove from Cart";
      btn.classList.replace("bg-orange-500", "bg-gray-500");
      btn.classList.replace("hover:bg-orange-600", "hover:bg-gray-600");
    } else {
      btn.textContent = "Add to Cart";
      btn.classList.replace("bg-gray-500", "bg-orange-500");
      btn.classList.replace("hover:bg-gray-600", "hover:bg-orange-600");
    }
  });
}





function renderCartTable() {
  cartTableBody.innerHTML = "";
  
  if (state.cart.length === 0) {
    cartTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="p-8 text-center text-gray-400 font-medium bg-gray-50/50">Your active cart is empty.</td>
      </tr>`;
    cartTotalDisplay.textContent = "GHS0";
    return;
  }

  let calculatedGrandTotal = 0;

  state.cart.forEach((item, index) => {
    const compoundedPrice = item.price * item.quantity;
    calculatedGrandTotal += compoundedPrice;

    const row = document.createElement("tr");
    row.className = "hover:bg-gray-50/80 transition-colors";
    row.innerHTML = `
      <td class="p-3 text-center text-gray-400 font-medium">${index + 1}</td>
      <td class="p-3 font-semibold text-gray-800">${item.name}</td>
      <td class="p-3 text-right font-medium text-orange-600">GHc${compoundedPrice.toLocaleString()}</td>
      <td class="p-3">
        <div class="flex items-center justify-center gap-2">
          <button data-id="${item.id}" class="btn-decrement w-7 h-7 flex items-center justify-center rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold transition-all text-sm">-</button>
          <span class="w-6 text-center font-bold text-gray-800 text-sm">${item.quantity}</span>
          <button data-id="${item.id}" class="btn-increment w-7 h-7 flex items-center justify-center rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold transition-all text-sm">+</button>
        </div>
      </td>
      <td class="p-3 text-center">
        <button data-id="${item.id}" class="btn-remove px-2.5 py-1 text-xs font-semibold rounded-md border border-red-200 text-red-500 hover:bg-red-50 transition-all">Remove</button>
      </td>
    `;
    cartTableBody.appendChild(row);
  });

  cartTotalDisplay.textContent = `GHS${calculatedGrandTotal.toLocaleString()}`;

  // Attach structural logic mutations inside viewport context dynamically
  cartTableBody.querySelectorAll(".btn-increment").forEach(b => b.addEventListener("click", (e) => alterQty(e.target.dataset.id, 1)));
  cartTableBody.querySelectorAll(".btn-decrement").forEach(b => b.addEventListener("click", (e) => alterQty(e.target.dataset.id, -1)));
  cartTableBody.querySelectorAll(".btn-remove").forEach(b => b.addEventListener("click", (e) => removeCartItem(e.target.dataset.id)));
}

function alterQty(id, delta) {
  const targetItem = state.cart.find(item => item.id === id);
  if (!targetItem) return;

  targetItem.quantity += delta;
  if (targetItem.quantity <= 0) {
    removeCartItem(id);
  } else {
    updateUI();
  }
}

function removeCartItem(id) {
  state.cart = state.cart.filter(item => item.id !== id);
  updateUI();
}

// Field Validation Checks
function validateField(key) {
  const rule = validations[key];
  const value = rule.inputEl.value;
  
  if (!rule.fn(value)) {
    rule.errEl.textContent = rule.msg;
    rule.errEl.classList.remove("hidden");
    rule.inputEl.classList.add("border-red-400", "bg-red-50/30");
    return false;
  }
  clearFieldError(key);
  return true;
}

function clearFieldError(key) {
  const rule = validations[key];
  rule.errEl.classList.add("hidden");
  rule.inputEl.classList.remove("border-red-400", "bg-red-50/30");
}

function validateAllFields() {
  let formsAreValid = true;
  Object.keys(validations).forEach(key => {
    const outcome = validateField(key);
    if (!outcome) formsAreValid = false;
  });
  return formsAreValid;
}

// Workflow Handlers
function handleCheckoutExecution() {
  if (state.cart.length === 0) {
    alert("Please add items to your shopping cart layout before selecting checkout.");
    return;
  }

  const identityChecksPass = validateAllFields();
  if (!identityChecksPass) return;

  // Sync valid inputs into core application state object wrapper 
  state.user.name = custName.value.trim();
  state.user.email = custEmail.value.trim();
  state.user.phone = custPhone.value.trim();

  // Explicit requirement: Close cart modal immediately on checkout trigger
  toggleModal(cartModal, false);
  launchSummaryReceipt();
}

function launchSummaryReceipt() {
  summaryMessage.innerHTML = `Hey <strong>${state.user.name}</strong>, your purchase has been processed successfully! A copy of your invoice was dispatched to <strong>${state.user.email}</strong>.`;
  
  summaryItemsList.innerHTML = "";
  state.cart.forEach(item => {
    const li = document.createElement("li");
    li.className = "py-2 flex justify-between items-center font-medium";
    li.innerHTML = `
      <span class="text-gray-800">${item.name} <span class="text-gray-400 text-xs font-bold ml-1">x${item.quantity}</span></span>
      <span class="text-gray-600 text-sm">GHS${(item.price * item.quantity).toLocaleString()}</span>
    `;
    summaryItemsList.appendChild(li);
  });

  toggleModal(summaryModal, true);
}

function resetApplicationWorkflow() {
  toggleModal(summaryModal, false);
  // Reloading the page resets all input nodes and temporary state back to structural factory settings cleanly
  window.location.reload();
  launchpayWithPaystack();
}

function toggleModal(element, stateIndicator) {
  if (stateIndicator) {
    element.classList.remove("hidden");
  } else {
    element.classList.add("hidden");
  }
}



function payWithPaystack() {
    // 1. Get total price and customer email from your form inputs
    const amount = document.getElementById('total-price').value; // e.g., 5000 (for 50.00)
    const email = document.getElementById('customer-email').value;

    // 2. Initialize Paystack
    const handler = PaystackPop.setup({
        key: pk_test_6c1624a8179d94b9a585cca9f66e19fb4dd8bb0f, // Replace with your actual Paystack Public Key
        email: document.getElementById("email-address").value,
        amount: document.getElementById("amount").value * 100, // Paystack accepts amounts in the lowest currency (e.g., kobo for GHS/NGN)
        currency: 'GHS', // Change to 'NGN', 'KES', etc., depending on your country
        ref: '_ ' + Math.floor((Math.random() * 1000000000) + 1), // Generate a unique reference
        callback: function(response) {
            // This function runs after a successful payment
            alert('Payment complete! Reference: ' + response.reference);
            // TODO: Send the response.reference to your backend to verify the transaction
        },
        onClose: function() {
            alert('Payment window closed.');
        }
    });

    // 3. Open the Paystack popup
    handler.openIframe();
}
