import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDRAbvNSLTFN-vvdx9k27kPxsHl2BtBknA",
  authDomain: "final-term-project-ed2da.firebaseapp.com",
  projectId: "final-term-project-ed2da",
  storageBucket: "final-term-project-ed2da.firebasestorage.app",
  messagingSenderId: "412261597044",
  appId: "1:412261597044:web:5e709fdf45f40deac83621",
  measurementId: "G-0N4TVPW2Z1"
};
const auth = getAuth(initializeApp(firebaseConfig));
const $ = (id) => document.getElementById(id);
const imageUrl = (id, width = 1600, height) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}${height ? `&h=${height}` : ""}&q=90`;
const imageSettingsKey = "inspo-quote:image-settings";
const savedKey = (uid) => `stillword:saved:${uid}`;
const removedKey = (uid) => `stillword:removed:${uid}`;
let currentUser = null;

function getSaved() {
  if (!currentUser) return [];
  try { return JSON.parse(localStorage.getItem(savedKey(currentUser.uid)) || "[]"); }
  catch { return []; }
}
function getRemoved() {
  if (!currentUser) return [];
  try { return JSON.parse(localStorage.getItem(removedKey(currentUser.uid)) || "[]"); }
  catch { return []; }
}
function setSaved(items) { localStorage.setItem(savedKey(currentUser.uid), JSON.stringify(items)); }
function setRemoved(items) { localStorage.setItem(removedKey(currentUser.uid), JSON.stringify(items)); }
function renderSaved() {
  const items = getSaved();
  const removedItems = getRemoved();
  $("saved-grid").replaceChildren();
  $("saved-grid").classList.toggle("hidden", !currentUser || items.length === 0);
  $("saved-empty").classList.toggle("hidden", currentUser && items.length > 0);
  $("saved-total").textContent = currentUser ? `${items.length} SAVED` : "";
  $("removed-quotes-section").classList.toggle("hidden", !currentUser || removedItems.length === 0);
  $("removed-quotes-list").replaceChildren();
  $("saved-subtitle").textContent = currentUser ? `${items.length} reminder${items.length === 1 ? "" : "s"} you’ve saved along the way.` : "Sign in to see your saved quote images.";

  if (!currentUser) {
    $("empty-title").textContent = "Your collection is waiting.";
    $("empty-copy").textContent = "Sign in to see the quotes you’ve saved.";
    $("empty-link").href = "../signin/?mode=signin&return=saved";
    $("empty-link").textContent = "Sign in to your account";
    return;
  }
  $("empty-title").textContent = "Your collection starts here.";
  $("empty-copy").textContent = "When a quote speaks to you, save it here for another day.";
  $("empty-link").href = "../create/";
  $("empty-link").textContent = "Find your first quote";

  items.forEach((quote) => {
    const card = document.createElement("article");
    card.className = "saved-card";
    card.style.backgroundImage = `linear-gradient(180deg,rgba(17,13,10,.5),rgba(17,13,10,.88)),url("${imageUrl(quote.image)}")`;
    const copy = document.createElement("div"); copy.className = "saved-card-copy";
    const mood = document.createElement("span"); mood.className = "saved-mood"; mood.textContent = `${quote.mood} · SAVED QUOTE`;
    const text = document.createElement("blockquote"); text.textContent = `“${quote.text}”`;
    const savedFonts = { script: "'Caveat', cursive", serif: "'Lora', Georgia, serif", sans: "'DM Sans', Arial, sans-serif" };
    text.style.fontFamily = savedFonts[quote.quoteFont] || savedFonts.serif;
    const savedColors = { white: "#fff", ivory: "#fff1d6", ink: "#292a25" };
    text.style.color = savedColors[quote.quoteColor] || savedColors.white;
    if (quote.quoteColor === "ink") card.classList.add("light-quote-panel");
    const author = document.createElement("p"); author.textContent = `— ${quote.author}`;
    const actions = document.createElement("div"); actions.className = "saved-card-actions";
    const download = document.createElement("button"); download.type = "button"; download.textContent = "Download image"; download.addEventListener("click", () => downloadQuote(quote));
    const remove = document.createElement("button"); remove.type = "button"; remove.textContent = "Remove"; remove.setAttribute("aria-label", `Remove quote by ${quote.author}`); remove.addEventListener("click", () => {
      const current = getSaved();
      const removedQuote = current.find((item) => item.text === quote.text && item.author === quote.author);
      if (!removedQuote) return;
      setSaved(current.filter((item) => item !== removedQuote));
      setRemoved([removedQuote, ...getRemoved().filter((item) => item.text !== quote.text || item.author !== quote.author)]);
      renderSaved();
    });
    actions.append(download, remove); copy.append(mood, text, author, actions); card.append(copy); $("saved-grid").append(card);
  });

  removedItems.forEach((quote) => {
    const row = document.createElement("div"); row.className = "removed-quote-row";
    const summary = document.createElement("p"); summary.textContent = `“${quote.text}” — ${quote.author}`;
    const restore = document.createElement("button"); restore.type = "button"; restore.textContent = "Restore";
    restore.setAttribute("aria-label", `Restore quote by ${quote.author}`);
    restore.addEventListener("click", () => {
      setRemoved(getRemoved().filter((item) => item.text !== quote.text || item.author !== quote.author));
      setSaved([quote, ...getSaved()]);
      renderSaved();
    });
    row.append(summary, restore); $("removed-quotes-list").append(row);
  });
}

function downloadQuote(quote) {
  let settings = {};
  try { settings = JSON.parse(localStorage.getItem(imageSettingsKey) || "{}"); } catch { /* Use defaults. */ }
  const ratio = [0.8, 1, 0.5625, 1.7778].includes(Number(settings.ratio)) ? Number(settings.ratio) : 0.8;
  const longEdge = [1080, 2048, 3840].includes(Number(settings.resolution)) ? Number(settings.resolution) : 1080;
  const outputWidth = ratio >= 1 ? longEdge : Math.round(longEdge * ratio);
  const outputHeight = ratio >= 1 ? Math.round(longEdge / ratio) : longEdge;
  const quoteFont = quote.quoteFont || settings.font || "serif";
  const quoteColor = quote.quoteColor || settings.color || "white";
  const image = new Image(); image.crossOrigin = "anonymous"; image.src = imageUrl(quote.image, outputWidth, outputHeight);
  image.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext("2d");
    const scale = Math.max(canvas.width / image.width, canvas.height / image.height);
    const width = image.width * scale, height = image.height * scale;
    ctx.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
    const shade = ctx.createLinearGradient(0, 0, 0, canvas.height); shade.addColorStop(0, "rgba(16,11,7,.68)"); shade.addColorStop(.38, "rgba(16,11,7,.58)"); shade.addColorStop(1, "rgba(16,11,7,.84)"); ctx.fillStyle = shade; ctx.fillRect(0, 0, canvas.width, canvas.height);
    const shortEdge = Math.min(canvas.width, canvas.height);
    const margin = Math.round(shortEdge * .095);
    const quoteFontSize = Math.round(shortEdge * .042);
    const fontFamily = { script: "'Caveat', cursive", serif: "'Lora', Georgia, serif", sans: "'DM Sans', Arial, sans-serif" }[quoteFont] || "'Lora', Georgia, serif";
    const textColor = { white: "#fff", ivory: "#fff1d6", ink: "#292a25" }[quoteColor] || "#fff";
    ctx.fillStyle = textColor; ctx.font = `500 ${quoteFontSize}px ${fontFamily}`;
    const lines = []; let line = "";
    const textWidth = canvas.width - margin * 2;
    `“${quote.text}”`.split(" ").forEach((word) => { const next = line ? `${line} ${word}` : word; if (ctx.measureText(next).width > textWidth && line) { lines.push(line); line = word; } else line = next; });
    if (line) lines.push(line);
    const lineHeight = Math.round(quoteFontSize * 1.38); let y = canvas.height * .53 - ((lines.length - 1) * lineHeight) / 2;
    const panelTop = y - Math.round(quoteFontSize * 1.25);
    const panelBottom = y + (lines.length - 1) * lineHeight + Math.round(quoteFontSize * 1.6);
    const panelX = Math.round(margin * .5);
    const panelWidth = canvas.width - panelX * 2;
    ctx.fillStyle = quoteColor === "ink" ? "rgba(248,247,240,.96)" : "rgba(22,15,10,.92)";
    ctx.beginPath(); ctx.roundRect(panelX, panelTop, panelWidth, panelBottom - panelTop, Math.round(shortEdge * .018)); ctx.fill();
    ctx.fillStyle = textColor;
    lines.forEach((row) => { ctx.fillText(row, margin, y, textWidth); y += lineHeight; });
    ctx.fillStyle = quoteColor === "ink" ? "rgba(41,42,37,.78)" : "rgba(255,255,255,.76)"; ctx.font = `500 ${Math.round(shortEdge * .023)}px Arial`; ctx.fillText(`— ${quote.author}`, margin, y + Math.round(quoteFontSize * .95));
    ctx.fillStyle = "rgba(255,255,255,.7)"; ctx.font = `600 ${Math.max(14, Math.round(shortEdge * .014))}px Arial`; ctx.letterSpacing = `${Math.round(shortEdge * .0025)}px`; ctx.fillText("INSPO QUOTE  ·  A MOMENT FOR YOU", margin, canvas.height - Math.round(margin * .58));
    canvas.toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement("a"); link.download = `inspo-quote-${quote.author.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.jpg`; link.href = URL.createObjectURL(blob); link.click(); URL.revokeObjectURL(link.href);
    }, "image/jpeg", .94);
  };
}

$("saved-signout").addEventListener("click", () => signOut(auth));
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  $("saved-user").textContent = user ? user.email : "";
  $("saved-signin").classList.toggle("hidden", Boolean(user));
  $("saved-signout").classList.toggle("hidden", !user);
  renderSaved();
});
