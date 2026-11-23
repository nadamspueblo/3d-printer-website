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
  } else {
    button.className = "view-item-button";
    button.textContent = "View item";
    button.setAttribute("aria-label", "View details for " + print.title);
    button.addEventListener("click", function () {
      showDetails(print);
    });
  }

  card.appendChild(button);
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

  detailWindow.showModal();
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

function addToCart(print) {
  cart.push(print);
  showCart();
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

  for (let i = 0; i < cart.length; i++) {
    const item = document.createElement("article");
    item.className = "cart-item";
    const thumbnail = document.createElement("img");
    thumbnail.className = "cart-item-thumbnail";
    thumbnail.src = cart[i].url;
    thumbnail.alt = "";
    item.appendChild(thumbnail);

    const info = document.createElement("div");
    info.className = "cart-item-info";
    addText(info, "h3", "", cart[i].title);
    addText(info, "p", "cart-item-price", formatPrice(cart[i].price));
    item.appendChild(info);

    const removeButton = document.createElement("button");
    removeButton.className = "remove-from-cart";
    removeButton.type = "button";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", function () {
      cart.splice(i, 1);
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
    shop.showModal();
  });
}

document.querySelector("[data-open-cart]").addEventListener("click", function () {
  showCart();
  cartWindow.showModal();
});

document.querySelector("[data-browse-shop]").addEventListener("click", function () {
  cartWindow.close();
  showShop();
  shop.showModal();
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
