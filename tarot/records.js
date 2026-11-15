const readingStoragePrefix = "flower-court-tarot.reading.v1.";
const unsavedReadings = new Map();
const historyCardsById = new Map(tarotDeck.map((card) => [card.id, card]));

const recordContext = document.querySelector("#record-context");
const recordHome = document.querySelector(".reading-layout");
const recordForm = document.querySelector("#record-form");
const recordSummary = document.querySelector("#record-summary");
const recordNote = document.querySelector("#record-note");
const historyDialog = document.querySelector("#history-dialog");
const historyList = document.querySelector("#history-list");
const historyEmpty = document.querySelector("#history-empty");
let activeReadingRecord = null;

function resetReadingRecord() {
  if (activeReadingRecord) recordHome.before(recordContext);
  activeReadingRecord = null;
  recordForm.reset();
  recordContext.open = true;
  recordSummary.textContent = "选择主题，填写地点与问题";
  recordNote.textContent = "翻完第三张牌时自动记录本地日期和时间。";
}

function completeReadingRecord(picks) {
  const now = new Date();
  activeReadingRecord = {
    id: crypto.randomUUID?.() ?? now.getTime() + "-" + Math.random().toString(36).slice(2),
    completedAt: now.toISOString(),
    localTime: new Intl.DateTimeFormat("zh-CN", {
      year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).format(now),
    cards: picks.map(({ card, reversed }) => ({ id: card.id, reversed })),
  };
  saveReadingRecord();
  document.querySelector("#reading-list").before(recordContext);
  recordContext.open = false;
}

function saveReadingRecord() {
  if (!activeReadingRecord) return;
  const fields = new FormData(recordForm);
  Object.assign(activeReadingRecord, {
    topic: fields.get("topic"),
    location: fields.get("location").trim(),
    question: fields.get("question").trim(),
  });
  const { id, topic, location, localTime } = activeReadingRecord;
  let status = "已保存在此浏览器，修改会自动保存。";
  let summary = [topic, localTime, location].filter(Boolean).join(" · ");
  try {
    localStorage.setItem(readingStoragePrefix + id, JSON.stringify(activeReadingRecord));
    unsavedReadings.delete(id);
  } catch {
    unsavedReadings.set(id, activeReadingRecord);
    status = "此浏览器无法保存，记录仅保留在当前页面。";
    summary = "仅当前页面 · " + summary;
  }
  recordSummary.textContent = summary;
  if (recordNote.textContent !== status) recordNote.textContent = status;
}

function readStoredReading(key) {
  try {
    const record = JSON.parse(localStorage.getItem(key));
    if (record && key === readingStoragePrefix + record.id &&
        Number.isFinite(Date.parse(record.completedAt)) &&
        [record.localTime, record.topic, record.location, record.question].every((value) => typeof value === "string") &&
        Array.isArray(record.cards) && record.cards.length === 3 &&
        record.cards.every((card) => historyCardsById.has(card?.id) && typeof card.reversed === "boolean")) {
      return record;
    }
  } catch {
    return null;
  }
  return null;
}

function readReadingHistory() {
  const records = new Map();
  try {
    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index);
      if (!key?.startsWith(readingStoragePrefix)) continue;
      const record = readStoredReading(key);
      if (record) records.set(record.id, record);
    }
  } catch {
    // The current page can still show readings kept in memory.
  }
  for (const [id, record] of unsavedReadings) records.set(id, record);
  return [...records.values()].sort((first, second) => second.completedAt.localeCompare(first.completedAt));
}

function renderHistoryEntry(record) {
  const entry = makeElement("details", "history-entry");
  const summary = makeElement("summary", "history-entry-summary");
  const metadata = makeElement("span", "history-entry-meta");
  const time = makeElement("time", "history-time", record.localTime);
  time.dateTime = record.completedAt;
  metadata.append(
    makeElement("strong", "history-topic", record.topic),
    time,
    makeElement("span", "history-location", record.location || "地点未填写"),
  );
  summary.append(metadata);

  const body = makeElement("div", "history-entry-body");
  const question = makeElement("div", "history-question");
  question.append(makeElement("strong", "", "本轮问题"), makeElement("p", "", record.question || "未填写"));
  body.append(question);
  entry.append(summary, body);
  entry.addEventListener("toggle", () => {
    if (!entry.open || body.querySelector(".history-cards")) return;
    const results = makeElement("ol", "reading-list history-cards");
    results.setAttribute("aria-label", "当时翻开的三张牌");
    results.append(...record.cards.map(({ id, reversed }, index) =>
      createResult({ card: historyCardsById.get(id), reversed, order: index + 1 }, reversed ? "逆位" : "正位", record.topic),
    ));
    body.append(results);
  });
  return entry;
}

recordForm.addEventListener("input", saveReadingRecord);
recordForm.addEventListener("submit", (event) => {
  event.preventDefault();
  saveReadingRecord();
});

document.querySelector("#history-button").addEventListener("click", () => {
  const records = readReadingHistory();
  historyList.replaceChildren(...records.map(renderHistoryEntry));
  historyEmpty.hidden = records.length !== 0;
  historyDialog.showModal();
  historyDialog.scrollTop = 0;
});
