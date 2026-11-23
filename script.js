document.querySelector("#year").textContent = new Date().getFullYear();

const gallery = document.querySelector("#print-gallery");
const shop = document.querySelector("#shop-dialog");
const cartWindow = document.querySelector("#cart-dialog");
const detailWindow = document.querySelector("#detail-dialog");
const shopProducts = document.querySelector("#shop-products");
const cartItems = document.querySelector("#cart-items");
const cartCount = document.querySelector("[data-cart-count]");
const cartTotal = document.querySelector("#cart-total");
const filterButtons = document.querySelectorAll(".filter-button");
const previousGalleryButton = document.querySelector("#gallery-previous");
const nextGalleryButton = document.querySelector("#gallery-next");
const dialogs = [shop, cartWindow, detailWindow];

const printPrices = {
  "Hex-Keychain.jpeg": 2.99, "octo-fidget.jpeg": 3.99,
  "gear-fidget-spinner.jpeg": 4.99, "rocktopus.jpeg": 5.99
};
const printDescriptions = {
  "Hex-Keychain.jpeg": "A lightweight keychain with a hex fidget design.",
  "octo-fidget.jpeg": "A desk fidget toy with an octopus design.",
  "gear-fidget-spinner.jpeg": "A planetary gear-based fidget spinner.",
  "rocktopus.jpeg": "A rocktopus figurine."
};
const printFiles = [
  "Hex-Keychain.jpeg",
  "gear-fidget-spinner.jpeg",
  "octo-fidget.jpeg",
  "rocktopus.jpeg"
];
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

let prints = [];
let cart = [];
let selectedFilter = "all";

function updateGalleryControls() {
  const maxScroll = gallery.scrollWidth - gallery.clientWidth;
  previousGalleryButton.disabled = gallery.scrollLeft <= 1;
  nextGalleryButton.disabled = maxScroll <= 1 || gallery.scrollLeft >= maxScroll - 1;
}

function scrollGallery(direction) {
  gallery.scrollBy({
    left: direction * gallery.clientWidth * 0.85,
    behavior: "smooth"
  });
}

previousGalleryButton.addEventListener("click", function () {
  scrollGallery(-1);
});

nextGalleryButton.addEventListener("click", function () {
  scrollGallery(1);
});

gallery.addEventListener("scroll", updateGalleryControls, { passive: true });
window.addEventListener("resize", updateGalleryControls);

let galleryDragStartX = 0;
let galleryDragStartScroll = 0;
let isGalleryDragging = false;

gallery.addEventListener("pointerdown", function (event) {
  if (event.pointerType !== "mouse" || event.button !== 0 || event.target.closest("button")) {
    return;
  }

  isGalleryDragging = true;
  galleryDragStartX = event.clientX;
  galleryDragStartScroll = gallery.scrollLeft;
  gallery.classList.add("is-dragging");
  gallery.setPointerCapture(event.pointerId);
});

gallery.addEventListener("pointermove", function (event) {
  if (!isGalleryDragging) {
    return;
  }

  gallery.scrollLeft = galleryDragStartScroll - (event.clientX - galleryDragStartX);
});

function stopGalleryDrag() {
  isGalleryDragging = false;
  gallery.classList.remove("is-dragging");
}

gallery.addEventListener("pointerup", stopGalleryDrag);
gallery.addEventListener("pointercancel", stopGalleryDrag);
gallery.addEventListener("lostpointercapture", stopGalleryDrag);

function getPrintPrice(fileName) {
  const price = printPrices[fileName];
  if (price === undefined) {
    return null;
  }
  if (typeof price !== "number" || !Number.isFinite(price) || price < 0) {
    console.error('Invalid price for "' + fileName + '". Use a non-negative number.');
    return null;
  }
  return price;
}

function formatPrice(price) {
  return price === null ? "Price not set" : currencyFormatter.format(price);
}

// Make a text element and add it to another element.
function addText(parent, tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  parent.appendChild(element);
  return element;
}

function showMessage(parent, message) {
  parent.textContent = "";
  addText(parent, "p", "gallery-message", message);
}

function getTitle(fileName) {
  let title = fileName.replace(/\.(avif|gif|jpe?g|png|webp)$/i, "");
  title = title.replace(/[-_]/g, " ").trim();
  return title.charAt(0).toUpperCase() + title.slice(1);
}

function hasWord(name, words) {
  for (let i = 0; i < words.length; i++) {
    if (name.includes(words[i])) {
      return true;
    }
  }
  return false;
}

function getCategory(fileName) {
  const name = fileName.toLowerCase();

  if (hasWord(name, ["key", "ring", "brace", "clip", "holder", "case", "stand", "tag"])) {
    return "Accessories";
  }
  if (hasWord(name, ["tool", "wrench", "adapter", "bracket", "mount", "guide", "drive"])) {
    return "Tools";
  }
  if (hasWord(name, ["tray", "organizer", "desk", "pen", "lamp", "holder", "stand"])) {
    return "Desk items";
  }
  if (hasWord(name, ["dragon", "mini", "toy", "figure", "robot", "mask", "character", "ornament", "creature", "fidget" ])) {
    return "Collectibles";
  }
  if (hasWord(name, ["part", "plate", "joint", "base", "prototype", "shell", "panel"])) {
    return "Functional";
  }

  return "Student design";
}

function makePrintCard(print, inShop) {
  const card = document.createElement("article");
  card.className = "idea-card";

  const art = document.createElement("div");
  art.className = "idea-art print-art";

  const image = document.createElement("img");
  image.src = print.url;
  image.alt = "Photo of " + print.title;
  image.loading = "lazy";
  art.appendChild(image);
  card.appendChild(art);

  addText(card, "span", "idea-tag", print.category);

  let number = print.index + 1;
  if (number < 10) {
    number = "0" + number;
  }
  addText(card, "p", "idea-number", "PUEBLO PRINT / " + number);
  addText(card, "h3", "", print.title);
  addText(card, "p", "print-price", formatPrice(print.price));

  const button = document.createElement("button");
  button.type = "button";

  if (inShop) {
    button.className = "add-to-cart";
    button.textContent = "Add to cart";
    button.addEventListener("click", function () {
      addToCart(print);
    });
    card.appendChild(button);
  } else {
    button.className = "view-item-button";
    button.textContent = "View item";
    button.setAttribute("aria-label", "View details for " + print.title);
    button.addEventListener("click", function () {
      showDetails(print);
    });

    const addButton = document.createElement("button");
    addButton.className = "add-to-cart";
    addButton.type = "button";
    addButton.textContent = "Add to cart";
    addButton.addEventListener("click", function (event) {
      addToCart(print, event);
    });

    const actions = document.createElement("div");
    actions.className = "idea-card-actions";
    actions.appendChild(button);
    actions.appendChild(addButton);
    card.appendChild(actions);
  }

  return card;
}

function showDetails(print) {
  document.querySelector("#detail-image").src = print.url;
  document.querySelector("#detail-image").alt = "Photo of " + print.title;
  document.querySelector("#detail-category").textContent = print.category;
  document.querySelector("#detail-title").textContent = print.title;
  document.querySelector("#detail-price").textContent = formatPrice(print.price);
  document.querySelector("#detail-description").textContent =
    print.description || "Description not added yet.";

  document.querySelector("#detail-add-button").onclick = function () {
    addToCart(print);
    detailWindow.close();
  };

  openDialog(detailWindow);
}

function showShop() {
  if (prints.length === 0) {
    showMessage(shopProducts, "No prints are available to preview yet.");
    return;
  }

  shopProducts.textContent = "";
  for (let i = 0; i < prints.length; i++) {
    shopProducts.appendChild(makePrintCard(prints[i], true));
  }
}

function addToCart(print, clickEvent) {
  if (clickEvent && (!window.matchMedia || !window.matchMedia("(prefers-reduced-motion: reduce)").matches)) {
    animateCartAdd(clickEvent);
  }
  cart.push(print);
  showCart();
}

function animateCartAdd(clickEvent) {
  const cartButton = document.querySelector("[data-open-cart]");
  const sourceRect = clickEvent.currentTarget.getBoundingClientRect();
  const targetRect = cartButton.getBoundingClientRect();

  if (sourceRect.width === 0 || targetRect.width === 0) {
    return;
  }

  const startX = clickEvent.detail > 0 ? clickEvent.clientX : sourceRect.left + sourceRect.width / 2;
  const startY = clickEvent.detail > 0 ? clickEvent.clientY : sourceRect.top + sourceRect.height / 2;
  const ball = document.createElement("span");
  ball.className = "cart-flight-ball";
  ball.setAttribute("aria-hidden", "true");
  ball.style.left = startX - 14 + "px";
  ball.style.top = startY - 14 + "px";
  if (typeof ball.animate !== "function") {
    return;
  }
  document.body.appendChild(ball);

  const offsetX = targetRect.left + targetRect.width / 2 - startX;
  const offsetY = targetRect.top + targetRect.height / 2 - startY;
  const animation = ball.animate([
    { transform: "translate(0, 0) scale(1)", opacity: 1 },
    {
      transform: "translate(" + offsetX * 0.55 + "px, " + (offsetY * 0.55 - 48) + "px) scale(0.8)",
      opacity: 1,
      offset: 0.55
    },
    { transform: "translate(" + offsetX + "px, " + offsetY + "px) scale(0.12)", opacity: 0 }
  ], {
    duration: 750,
    easing: "cubic-bezier(0.22, 1, 0.36, 1)"
  });

  animation.finished.then(function () {
    ball.remove();
  }, function () {
    ball.remove();
  });
}

function updateDialogScrollLock() {
  document.documentElement.classList.toggle("dialog-open", dialogs.some(function (dialog) {
    return dialog.open;
  }));
}

for (let i = 0; i < dialogs.length; i++) {
  dialogs[i].addEventListener("close", updateDialogScrollLock);
}

function openDialog(dialog) {
  dialog.showModal();
  updateDialogScrollLock();
}

function showCart() {
  cartCount.textContent = cart.length;
  let itemWord = "items";
  if (cart.length === 1) {
    itemWord = "item";
  }
  document.querySelector("[data-open-cart]").setAttribute(
    "aria-label",
    "Open cart, " + cart.length + " " + itemWord
  );
  cartItems.textContent = "";
  cartTotal.hidden = true;

  if (cart.length === 0) {
    showMessage(cartItems, "Your cart is empty. Browse the student prints and save a few favorites!");
    return;
  }

  const cartGroups = new Map();
  for (let i = 0; i < cart.length; i++) {
    const print = cart[i];
    const group = cartGroups.get(print);
    if (group) {
      group.quantity++;
    } else {
      cartGroups.set(print, { print: print, quantity: 1 });
    }
  }

  for (const [print, group] of cartGroups) {
    const item = document.createElement("article");
    item.className = "cart-item";
    const thumbnail = document.createElement("img");
    thumbnail.className = "cart-item-thumbnail";
    thumbnail.src = print.url;
    thumbnail.alt = "";
    item.appendChild(thumbnail);

    const info = document.createElement("div");
    info.className = "cart-item-info";
    const heading = document.createElement("div");
    heading.className = "cart-item-heading";
    addText(heading, "h3", "", print.title);
    const quantity = addText(heading, "span", "cart-item-quantity", "× " + group.quantity);
    quantity.setAttribute("aria-label", "Quantity: " + group.quantity);
    info.appendChild(heading);
    addText(info, "p", "cart-item-price", formatPrice(print.price));
    item.appendChild(info);

    const removeButton = document.createElement("button");
    removeButton.className = "remove-from-cart";
    removeButton.type = "button";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", function () {
      cart.splice(cart.indexOf(print), 1);
      showCart();
    });

    item.appendChild(removeButton);
    cartItems.appendChild(item);
  }

  const allPricesSet = cart.every(function (item) {
    return item.price !== null;
  });
  if (allPricesSet) {
    let subtotal = 0;
    for (let i = 0; i < cart.length; i++) {
      subtotal += cart[i].price;
    }
    cartTotal.textContent = "Subtotal: " + currencyFormatter.format(subtotal);
  } else {
    cartTotal.textContent = "Set prices for all items to see the subtotal.";
  }
  cartTotal.hidden = false;
}

const shopButtons = document.querySelectorAll("[data-open-shop]");
for (let i = 0; i < shopButtons.length; i++) {
  shopButtons[i].addEventListener("click", function () {
    showShop();
    openDialog(shop);
  });
}

document.querySelector("[data-open-cart]").addEventListener("click", function () {
  showCart();
  openDialog(cartWindow);
});

document.querySelector("[data-browse-shop]").addEventListener("click", function () {
  cartWindow.close();
  showShop();
  openDialog(shop);
});

function showPrints() {
  gallery.textContent = "";
  gallery.scrollLeft = 0;
  let shown = 0;

  for (let i = 0; i < prints.length; i++) {
    if (selectedFilter === "all" || prints[i].category === selectedFilter) {
      gallery.appendChild(makePrintCard(prints[i], false));
      shown++;
    }
  }

  if (shown === 0) {
    showMessage(gallery, "No prints match that filter. Try another one.");
  }
  updateGalleryControls();
}

for (let i = 0; i < filterButtons.length; i++) {
  filterButtons[i].addEventListener("click", function () {
    selectedFilter = filterButtons[i].dataset.filter;

    for (let j = 0; j < filterButtons.length; j++) {
      const selected = filterButtons[j] === filterButtons[i];
      filterButtons[j].classList.toggle("is-active", selected);
      filterButtons[j].setAttribute("aria-pressed", selected);
    }

    showPrints();
  });
}

function loadPrints() {
  for (let i = 0; i < printFiles.length; i++) {
    const fileName = printFiles[i];
    let title = getTitle(fileName);
    if (title === "") {
      title = "Student print";
    }

    prints.push({
      url: new URL("prints/" + encodeURIComponent(fileName), document.baseURI).href,
      title: title,
      category: getCategory(fileName),
      price: getPrintPrice(fileName),
      description: printDescriptions[fileName],
      index: i
    });
  }

  showShop();
  showPrints();
}

loadPrints();
