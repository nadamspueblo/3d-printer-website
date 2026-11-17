// Update the year in the footer.
document.querySelector("#year").textContent = new Date().getFullYear();

// Get the gallery and its filter buttons from the page.
const gallery = document.querySelector("#print-gallery");
const filterButtons = document.querySelectorAll(".filter-button");
const imageFilePattern = /\.(avif|gif|jpe?g|png|webp)$/i;

// Keep the full list so the filters can use it.
let prints = [];
let selectedFilter = "all";

// Turn "blue-dragon.jpg" into "Blue dragon".
function getTitle(fileName) {
  return fileName
    .replace(imageFilePattern, "")
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/^./, (letter) => letter.toUpperCase());
}

// Guess the category by looking for words in the file name.
function getCategory(fileName) {
  const name = fileName.toLowerCase();

  const categories = [
    { name: "Accessories", words: /(key|ring|brace|clip|holder|case|stand|tag)/ },
    { name: "Tools", words: /(tool|wrench|adapter|bracket|mount|guide|drive)/ },
    { name: "Desk items", words: /(tray|organizer|desk|pen|lamp|holder|stand)/ },
    { name: "Collectibles", words: /(dragon|mini|toy|figure|robot|mask|character|ornament|creature)/ },
    { name: "Functional", words: /(part|plate|joint|base|prototype|shell|panel)/ }
  ];

  for (const category of categories) {
    if (category.words.test(name)) {
      return category.name;
    }
  }

  return "Student design";
}

// Show a message in the gallery when there are no prints to display.
function showMessage(message) {
  const paragraph = document.createElement("p");
  paragraph.className = "gallery-message";
  paragraph.textContent = message;
  gallery.replaceChildren(paragraph);
}

// Make one gallery card for a print.
function makePrintCard(print) {
  const card = document.createElement("article");
  card.className = "idea-card";

  const art = document.createElement("div");
  art.className = "idea-art print-art";

  const image = document.createElement("img");
  image.src = print.url;
  image.alt = `Photo of ${print.title}`;
  image.loading = "lazy";
  art.append(image);

  const tag = document.createElement("span");
  tag.className = "idea-tag";
  tag.textContent = print.category;

  const number = document.createElement("p");
  number.className = "idea-number";
  number.textContent = `PUEBLO PRINT / ${String(print.index + 1).padStart(2, "0")}`;

  const title = document.createElement("h3");
  title.textContent = print.title;

  const description = document.createElement("p");
  description.textContent = "Designed and made by Pueblo High School students.";

  card.append(art, tag, number, title, description);
  return card;
}

// Show the prints that match the selected filter.
function showPrints() {
  let visiblePrints = prints;

  if (selectedFilter !== "all") {
    visiblePrints = prints.filter((print) => print.category === selectedFilter);
  }

  if (visiblePrints.length === 0) {
    showMessage("No prints match that filter yet. Try another category or add a new design to the gallery.");
    return;
  }

  gallery.replaceChildren();

  for (const print of visiblePrints) {
    gallery.append(makePrintCard(print));
  }
}

// Update the selected filter when someone clicks a button.
function chooseFilter(filterName) {
  selectedFilter = filterName;

  for (const button of filterButtons) {
    const isSelected = button.dataset.filter === filterName;
    button.classList.toggle("is-active", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  }

  showPrints();
}

for (const button of filterButtons) {
  button.addEventListener("click", () => {
    chooseFilter(button.dataset.filter);
  });
}

// Find image files in the prints folder.
async function loadPrints() {
  const folderUrl = new URL("prints/", window.location.href);
  const response = await fetch(folderUrl);

  if (!response.ok) {
    throw new Error(`Could not read ${folderUrl.pathname} (${response.status})`);
  }

  const folderPage = new DOMParser().parseFromString(
    await response.text(),
    "text/html"
  );
  const links = folderPage.querySelectorAll("a[href]");
  const imageUrls = [];

  for (const link of links) {
    const url = new URL(link.getAttribute("href"), folderUrl);
    const fileName = url.pathname.slice(folderUrl.pathname.length);
    const isInPrintsFolder =
      url.origin === folderUrl.origin &&
      url.pathname.startsWith(folderUrl.pathname) &&
      fileName.length > 0 &&
      !fileName.includes("/");

    if (isInPrintsFolder && imageFilePattern.test(fileName)) {
      imageUrls.push(url);
    }
  }

  imageUrls.sort((first, second) => first.pathname.localeCompare(second.pathname));

  if (imageUrls.length === 0) {
    showMessage("No prints yet. Add JPG, PNG, or WebP photos to the prints folder, then refresh Live Server.");
    return;
  }

  prints = imageUrls.map((url, index) => {
    const fileName = decodeURIComponent(url.pathname.slice(folderUrl.pathname.length));

    return {
      url: url.href,
      title: getTitle(fileName) || "Student print",
      category: getCategory(fileName),
      index
    };
  });

  showPrints();
}

// Show an error message if the prints folder could not be loaded.
loadPrints().catch((error) => {
  console.error("Unable to load student prints.", error);
  showMessage("Couldn’t load the prints folder. Start Live Server from the project folder and refresh.");
});
