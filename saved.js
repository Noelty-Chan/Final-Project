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
const imageUrl = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=90`;
const imageSettingsKey = "inspo-quote:image-settings";
let currentUser = null;

function getSaved() {
  if (!currentUser) return [];
  try { return JSON.parse(localStorage.getItem(`stillword:saved:${currentUser.uid}`) || "[]"); }
  catch { return []; }
}
function renderSaved() {
  const items = getSaved();
  $("saved-grid").replaceChildren();
  $("saved-grid").classList.toggle("hidden", !currentUser || items.length === 0);
  $("saved-empty").classList.toggle("hidden", currentUser && items.length > 0);
  $("saved-total").textContent = currentUser ? `${items.length} SAVED` : "";
  $("saved-subtitle").textContent = currentUser ? `${items.length} reminder${items.length === 1 ? "" : "s"} you’ve saved along the way.` : "Sign in to see your saved quote images.";

  if (!currentUser) {
    $("empty-title").textContent = "Your collection is waiting.";
    $("empty-copy").textContent = "Sign in to see the quotes you’ve saved.";
    $("empty-link").href = "signin.html?mode=signin&return=saved.html";
    $("empty-link").textContent = "Sign in to your account";
    return;
  }
  $("empty-title").textContent = "Your collection starts here.";
  $("empty-copy").textContent = "When a quote speaks to you, save it here for another day.";
  $("empty-link").href = "index.html";
  $("empty-link").textContent = "Find your first quote";

  items.forEach((quote) => {
    const card = document.createElement("article");
    card.className = "saved-card";
    card.style.backgroundImage = `linear-gradient(180deg,rgba(17,25,29,.04),rgba(17,25,29,.72)),url("${imageUrl(quote.image)}")`;
    const copy = document.createElement("div"); copy.className = "saved-card-copy";
    const mood = document.createElement("span"); mood.className = "saved-mood"; mood.textContent = `${quote.mood} · SAVED QUOTE`;
    const text = document.createElement("blockquote"); text.textContent = `“${quote.text}”`;
    const author = document.createElement("p"); author.textContent = `— ${quote.author}`;
    const actions = document.createElement("div"); actions.className = "saved-card-actions";
    const download = document.createElement("button"); download.type = "button"; download.textContent = "Download image"; download.addEventListener("click", () => downloadQuote(quote));
    const remove = document.createElement("button"); remove.type = "button"; remove.textContent = "Remove"; remove.addEventListener("click", () => {
      localStorage.setItem(`stillword:saved:${currentUser.uid}`, JSON.stringify(getSaved().filter((item) => item.text !== quote.text)));
      renderSaved();
    });
    actions.append(download, remove); copy.append(mood, text, author, actions); card.append(copy); $("saved-grid").append(card);
  });
}

function downloadQuote(quote) {
  const image = new Image(); image.crossOrigin = "anonymous"; image.src = imageUrl(quote.image);
  image.onload = () => {
    let settings = {};
    try { settings = JSON.parse(localStorage.getItem(imageSettingsKey) || "{}"); } catch { /* Use defaults. */ }
    const ratio = [0.8, 1, 0.5625, 1.7778].includes(Number(settings.ratio)) ? Number(settings.ratio) : 0.8;
    const longEdge = [1080, 2048, 3840].includes(Number(settings.resolution)) ? Number(settings.resolution) : 1080;
    const canvas = document.createElement("canvas");
    canvas.width = ratio >= 1 ? longEdge : Math.round(longEdge * ratio);
    canvas.height = ratio >= 1 ? Math.round(longEdge / ratio) : longEdge;
    const ctx = canvas.getContext("2d");
    const scale = Math.max(canvas.width / image.width, canvas.height / image.height);
    const width = image.width * scale, height = image.height * scale;
    ctx.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
    const shade = ctx.createLinearGradient(0, 0, 0, canvas.height); shade.addColorStop(0, "rgba(13,22,27,.2)"); shade.addColorStop(.38, "rgba(13,22,27,.18)"); shade.addColorStop(1, "rgba(13,22,27,.68)"); ctx.fillStyle = shade; ctx.fillRect(0, 0, canvas.width, canvas.height);
    const shortEdge = Math.min(canvas.width, canvas.height);
    const margin = Math.round(shortEdge * .095);
    const quoteFontSize = Math.round(shortEdge * .042);
    ctx.fillStyle = "#fff"; ctx.font = `500 ${quoteFontSize}px Georgia`;
    const lines = []; let line = "";
    const textWidth = canvas.width - margin * 2;
    `“${quote.text}”`.split(" ").forEach((word) => { const next = line ? `${line} ${word}` : word; if (ctx.measureText(next).width > textWidth && line) { lines.push(line); line = word; } else line = next; });
    if (line) lines.push(line);
    const lineHeight = Math.round(quoteFontSize * 1.38); let y = canvas.height * .53 - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((row) => { ctx.fillText(row, margin, y, textWidth); y += lineHeight; });
    ctx.fillStyle = "rgba(255,255,255,.76)"; ctx.font = `500 ${Math.round(shortEdge * .023)}px Arial`; ctx.fillText(`— ${quote.author}`, margin, y + Math.round(quoteFontSize * .95));
    ctx.fillStyle = "rgba(255,255,255,.7)"; ctx.font = `600 ${Math.round(shortEdge * .014)}px Arial`; ctx.letterSpacing = `${Math.round(shortEdge * .0025)}px`; ctx.fillText("INSPO QUOTE  ·  A MOMENT FOR YOU", margin, canvas.height - Math.round(margin * .58));
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
  $("saved-signout").classList.toggle("hidden", !user);
  renderSaved();
});
