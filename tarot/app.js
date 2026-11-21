const maximumPicks = 3;
const pickLabels = ["第一张", "第二张", "第三张"];

const deckBoard = document.querySelector("#deck");
const deckSection = deckBoard.closest(".deck-section");
const shuffleButton = document.querySelector("#shuffle-button");
const deckActions = shuffleButton.parentElement;
const selectionCount = document.querySelector("#selection-count");
const selectedNumber = document.querySelector("#selected-number");
const readingPanel = document.querySelector("#reading");
const readingLayout = readingPanel.parentElement;
const readingHeader = readingPanel.querySelector(".reading-heading");
const readingHeading = document.querySelector("#reading-heading");
const emptyReading = document.querySelector("#empty-reading");
const readingList = document.querySelector("#reading-list");
const progressSlots = document.querySelectorAll("#reading-progress span");
const announcement = document.querySelector("#announcement");
const mobileResults = document.querySelector("#mobile-results");
const previewDialog = document.querySelector("#preview-dialog");
const artworkDialog = document.querySelector("#artwork-dialog");
const artworkHeading = document.querySelector("#artwork-heading");
const artworkDirection = document.querySelector("#artwork-direction");
const artworkImage = document.querySelector("#artwork-image");

let round = [];
let selectedCount = 0;

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function createBack() {
  const back = makeElement("span", "card-art card-back");
  back.setAttribute("aria-hidden", "true");
  return back;
}

// Upgrade only cards near the gallery's own scroll viewport.
const galleryArtworkObserver = typeof IntersectionObserver === "function"
  ? new IntersectionObserver((entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("show-preview");
        observer.unobserve(entry.target);
      }
    }, { root: previewDialog, rootMargin: "100px 0px" })
  : null;

function createFace(card, reversed, view = "preview") {
  const face = makeElement("span", "card-art card-face");
  face.dataset.card = card.id;
  face.classList.toggle("is-reversed", reversed);
  face.setAttribute("aria-hidden", "true");

  if (view === "gallery" && galleryArtworkObserver) {
    galleryArtworkObserver.observe(face);
  } else {
    face.classList.add("show-preview");
  }

  if (view === "zoom") {
    const image = document.createElement("img");
    image.alt = "";
    image.decoding = "async";
    image.addEventListener("error", () => image.remove(), { once: true });
    image.src = "art/titled/" + card.id + ".webp";
    face.append(image);
  }
  return face;
}

function showCount() {
  document.body.dataset.picks = selectedCount;
  selectedNumber.textContent = selectedCount;
  selectionCount.setAttribute("aria-label", "已选 " + selectedCount + " 张，共 3 张");
  progressSlots.forEach((slot, index) => slot.classList.toggle("is-filled", index < selectedCount));
  mobileResults.hidden = selectedCount === 0 || selectedCount === maximumPicks;
}

function startRound() {
  const cards = [...tarotDeck];
  for (let index = cards.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [cards[index], cards[other]] = [cards[other], cards[index]];
  }

  round = cards.map((card) => ({ card, reversed: Math.random() < 0.5, order: 0 }));
  selectedCount = 0;
  const buttons = round.map((entry, index) => {
    const button = makeElement("button", "deck-card");
    button.type = "button";
    button.dataset.position = index;
    button.setAttribute("aria-label", "翻开牌阵第 " + (index + 1) + " 张牌");
    button.append(createBack());
    return button;
  });
  deckBoard.replaceChildren(...buttons);
  readingList.replaceChildren();
  emptyReading.hidden = false;
  if (readingLayout.classList.contains("is-complete")) {
    readingLayout.classList.remove("is-complete");
    readingLayout.append(readingPanel);
    deckActions.append(shuffleButton);
  }
  resetReadingRecord();
  showCount();
}

function createThemedReading(card, reversed, topic) {
  const readings = themedReadings[card.id][Number(reversed)].split("|");
  const section = makeElement("div", "themed-reading");
  const label = makeElement("label", "themed-label", "按主题解读");
  const select = makeElement("select", "reading-topic");
  select.setAttribute("aria-label", card.name + "的解读主题");
  select.append(...readingTopics.map((name) => makeElement("option", "", name)));
  select.value = readingTopics.includes(topic) ? topic : "自我成长";
  const text = makeElement("p", "themed-text", readings[select.selectedIndex]);
  select.addEventListener("change", () => {
    text.textContent = readings[select.selectedIndex];
  });
  label.append(select);
  section.append(label, text);
  return section;
}

function createResult(entry, direction, topic) {
  const { card, reversed, order } = entry;
  const meaning = reversed ? card.reversed : card.upright;
  const result = makeElement("li", "reading-result");
  result.tabIndex = -1;
  const top = makeElement("div", "result-top");
  const artworkButton = makeElement("button", "result-art-button");
  artworkButton.type = "button";
  artworkButton.setAttribute("aria-label", "放大查看" + card.name + "（" + direction + "）");
  artworkButton.setAttribute("aria-haspopup", "dialog");
  artworkButton.innerHTML = `
    <svg class="artwork-zoom-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="6"/>
      <path d="m14.5 14.5 5 5M7.5 10h5m-2.5-2.5v5"/>
    </svg>`;
  artworkButton.prepend(createFace(card, reversed));
  artworkButton.addEventListener("click", () => {
    artworkHeading.textContent = card.name;
    artworkDirection.textContent = direction;
    artworkDirection.classList.toggle("reverse", reversed);
    artworkImage.replaceChildren(createFace(card, reversed, "zoom"));
    artworkDialog.showModal();
  });
  const heading = document.createElement("div");
  heading.append(
    makeElement("p", "result-index", pickLabels[order - 1]),
    makeElement("h3", "result-name", card.name),
    makeElement("span", reversed ? "orientation reverse" : "orientation", direction),
  );
  top.append(artworkButton, heading);
  result.append(top, makeElement("p", "keywords", meaning.keywords), makeElement("p", "meaning", meaning.text),
    createThemedReading(card, reversed, topic));
  return result;
}

deckBoard.addEventListener("click", (event) => {
  const button = event.target.closest(".deck-card");
  if (!button) return;
  const entry = round[Number(button.dataset.position)];
  if (entry.order) {
    readingList.children[entry.order - 1].focus();
    return;
  }
  if (selectedCount === maximumPicks) return;

  entry.order = ++selectedCount;
  const direction = entry.reversed ? "逆位" : "正位";
  const badge = makeElement("span", "pick-order", String(entry.order));
  badge.setAttribute("aria-hidden", "true");
  button.classList.add("is-revealed");
  button.setAttribute("aria-label", pickLabels[entry.order - 1] + "，" + entry.card.name + "，" + direction + "，查看牌义");
  button.replaceChildren(createFace(entry.card, entry.reversed), badge);
  emptyReading.hidden = true;
  readingList.append(createResult(entry, direction, recordForm.elements.topic.value));
  showCount();

  if (selectedCount === maximumPicks) {
    deckBoard.querySelectorAll(".deck-card:not(.is-revealed)").forEach((unselected) => {
      unselected.disabled = true;
    });
    readingLayout.classList.add("is-complete");
    readingLayout.prepend(readingPanel);
    readingHeader.append(shuffleButton);
    completeReadingRecord(round.filter((pick) => pick.order).sort((first, second) => first.order - second.order));
    readingHeading.focus({ preventScroll: true });
    readingPanel.scrollIntoView({ block: "start" });
  }
  const progress = selectedCount === maximumPicks ? "本轮已选完三张。" : "还可选择 " + (maximumPicks - selectedCount) + " 张。";
  announcement.textContent = pickLabels[entry.order - 1] + "，" + entry.card.name + "，" + direction + "。" + progress;
});

shuffleButton.addEventListener("click", () => {
  const roundWasComplete = selectedCount === maximumPicks;
  startRound();
  announcement.textContent = "已重新洗牌，可以从 78 张牌中选三张。";
  if (roundWasComplete) {
    shuffleButton.focus({ preventScroll: true });
    deckSection.scrollIntoView({ block: "start" });
  }
});

recordForm.elements.topic.addEventListener("change", (event) => {
  const topic = event.target.value;
  readingList.querySelectorAll(".reading-topic").forEach((select) => {
    select.value = readingTopics.includes(topic) ? topic : "自我成长";
    select.dispatchEvent(new Event("change"));
  });
});

const meaningDialog = document.querySelector("#meaning-dialog");
const cardSearch = document.querySelector("#card-search");
const galleryContent = document.querySelector("#preview-content");

function openCardMeaning(card) {
  document.querySelector("#meaning-group").textContent = deckGroups[card.suit].label;
  document.querySelector("#meaning-heading").textContent = card.name;
  document.querySelector("#meaning-image").replaceChildren(createFace(card, false));
  const sections = [false, true].map((reversed) => {
    const direction = reversed ? "逆位" : "正位";
    const meaning = reversed ? card.reversed : card.upright;
    const section = makeElement("section", "reading-result");
    const themed = createThemedReading(card, reversed, "自我成长");
    themed.querySelector("select").setAttribute("aria-label", card.name + direction + "的解读主题");
    section.append(makeElement("h3", "result-name", direction),
      makeElement("p", "keywords", meaning.keywords), makeElement("p", "meaning", meaning.text), themed);
    return section;
  });
  document.querySelector("#meaning-text").replaceChildren(...sections);
  meaningDialog.showModal();
  meaningDialog.scrollTop = 0;
}

function createGalleryGroup(name, cards) {
  const section = makeElement("section", "gallery-group");
  section.dataset.group = name;
  const grid = makeElement("div", "preview-grid");
  const figures = cards.map((card) => {
    const figure = document.createElement("figure");
    if (card) {
      const button = makeElement("button", "gallery-card");
      button.type = "button";
      button.setAttribute("aria-haspopup", "dialog");
      button.append(createFace(card, false, "gallery"), makeElement("span", "gallery-caption", card.name));
      button.addEventListener("click", () => openCardMeaning(card));
      figure.append(button);
    } else {
      figure.append(createBack(), makeElement("figcaption", "", "通用牌背"));
    }
    return figure;
  });
  grid.append(...figures);
  section.append(makeElement("h3", "gallery-title", name), grid);
  return section;
}

function filterGallery() {
  const query = cardSearch.value.trim();
  let anyVisible = false;
  for (const group of galleryContent.children) {
    let matches = false;
    for (const figure of group.querySelectorAll("figure")) {
      figure.hidden = !(group.dataset.group + figure.textContent).includes(query);
      if (!figure.hidden) matches = true;
    }
    group.hidden = !matches || (group.dataset.group === "牌背" && !cardSearch.closest("label").hidden);
    if (!group.hidden) anyVisible = true;
  }
  document.querySelector("#card-search-empty").hidden = anyVisible;
}

function openGallery(showMeanings) {
  if (!galleryContent.firstChild) {
    const groups = Object.entries(deckGroups).map(([suit, group]) =>
      createGalleryGroup(group.label, tarotDeck.filter((card) => card.suit === suit)),
    );
    galleryContent.append(...groups, createGalleryGroup("牌背", [null]));
  }
  document.querySelector("#preview-heading").textContent = showMeanings ? "牌面解读" : "牌面图鉴";
  previewDialog.querySelector(".close-button").setAttribute("aria-label", showMeanings ? "关闭牌面解读" : "关闭牌面图鉴");
  previewDialog.querySelector(".eyebrow").textContent = showMeanings ? "CARD MEANINGS" : "THE ART OF THE DECK";
  document.querySelector("#gallery-intro").textContent = showMeanings
    ? "选择一张牌，查看正逆位含义，再按爱情、事业等主题细读。"
    : "按牌组浏览插画。点击任一正面牌，查看它的含义。";
  document.querySelector("#card-search-label").hidden = !showMeanings;
  cardSearch.value = "";
  filterGallery();
  previewDialog.showModal();
  previewDialog.scrollTop = 0;
}

cardSearch.addEventListener("input", filterGallery);
document.querySelector("#preview-button").addEventListener("click", () => openGallery(false));
document.querySelector("#meanings-button").addEventListener("click", () => openGallery(true));

artworkDialog.addEventListener("click", (event) => {
  if (event.target === artworkDialog) artworkDialog.close();
});

startRound();
