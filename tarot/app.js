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

const suitSymbols = {
  sun: '<path d="M40 35c0 10-6 17-16 17 10 0 16 7 16 17 0-10 6-17 16-17-10 0-16-7-16-17Z"/><circle cx="40" cy="52" r="3"/>',
  wand: '<path d="M32 68c2-11 9-24 17-33m-8 12c-6 0-9-5-9-8 6 0 9 2 9 8Zm1 6c5-5 10-5 13-4-3 5-8 7-13 4Z"/>',
  cup: '<path d="M28 41h24c0 10-5 16-12 16s-12-6-12-16Zm12 16v8m-7 0h14m-17-19h20"/>',
  sword: '<path d="M40 34 44 44 42 59h-4l-2-15 4-10Zm-7 25h14m-7 0v9m-2 0h4"/>',
  coin: '<circle cx="40" cy="52" r="13"/><path d="m40 43 5 15-12-9h14l-12 9Z"/>',
};
const rankMarks = { ace: "I", page: "P", knight: "N", queen: "Q", king: "K" };
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

function createPlaceholder(card) {
  const group = deckGroups[card.suit];
  const rank = rankMarks[card.rank] ?? Number(card.rank);
  const placeholder = makeElement("span", "placeholder-face");
  placeholder.style.setProperty("--suit-color", group.color);
  placeholder.innerHTML = `
    <svg viewBox="0 0 80 108" fill="none" aria-hidden="true">
      <g stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
        <rect x="4" y="4" width="72" height="100" rx="6"/>
        <rect x="8" y="8" width="64" height="92" rx="4" opacity=".55"/>
        <path d="M10 37c0-12 13-10 13-23m-13 23c4-10 12-8 17-17m43 17c0-12-13-10-13-23m13 23c-4-10-12-8-17-17M10 71c0 12 13 10 13 23m47-23c0 12-13 10-13 23"/>
        <circle cx="40" cy="52" r="21"/>
        <circle cx="40" cy="52" r="18" opacity=".5"/>
        ${suitSymbols[group.mark]}
      </g>
      <text x="40" y="91" text-anchor="middle" fill="currentColor" font-family="Georgia, serif" font-size="14">${rank}</text>
    </svg>`;
  return placeholder;
}

function createFace(card, reversed, lazy = false) {
  const face = makeElement("span", reversed ? "card-art is-reversed" : "card-art");
  face.setAttribute("aria-hidden", "true");
  const image = document.createElement("img");
  image.alt = "";
  image.decoding = "async";
  if (lazy) image.loading = "lazy";
  image.addEventListener("error", () => image.replaceWith(createPlaceholder(card)), { once: true });
  image.src = "art/titled/" + card.id + ".webp";
  face.append(image);
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
    artworkImage.replaceChildren(createFace(card, reversed));
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

function createGalleryGroup(name, cards) {
  const section = makeElement("section", "gallery-group");
  const grid = makeElement("div", "preview-grid");
  const figures = cards.map((card) => {
    const figure = document.createElement("figure");
    const caption = document.createElement("figcaption");
    caption.textContent = card ? card.name : "通用牌背";
    figure.append(card ? createFace(card, false, true) : createBack(), caption);
    return figure;
  });
  grid.append(...figures);
  section.append(makeElement("h3", "gallery-title", name), grid);
  return section;
}

document.querySelector("#preview-button").addEventListener("click", () => {
  const content = document.querySelector("#preview-content");
  if (!content.firstChild) {
    const groups = Object.entries(deckGroups).map(([suit, group]) =>
      createGalleryGroup(group.label, tarotDeck.filter((card) => card.suit === suit)),
    );
    content.append(...groups, createGalleryGroup("牌背", [null]));
  }
  previewDialog.showModal();
  previewDialog.scrollTop = 0;
});

artworkDialog.addEventListener("click", (event) => {
  if (event.target === artworkDialog) artworkDialog.close();
});

startRound();
