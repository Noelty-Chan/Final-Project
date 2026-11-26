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

const quotes = [
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela", mood: "Courage", image: "photo-1470770841072-f978cf4d019e" },
  { text: "You do not have to see the whole staircase, just take the first step.", author: "Martin Luther King Jr.", mood: "Courage", image: "photo-1500530855697-b586d89ba3ee" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain", mood: "Growth", image: "photo-1470252649378-9c29740c9fa8" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein", mood: "Courage", image: "photo-1464822759023-fed622ff2c3b" },
  { text: "Nothing can bring you peace but yourself.", author: "Ralph Waldo Emerson", mood: "Calm", image: "photo-1470770841072-f978cf4d019e" },
  { text: "There is no way to happiness. Happiness is the way.", author: "Thich Nhat Hanh", mood: "Joy", image: "photo-1470252649378-9c29740c9fa8" },
  { text: "The best way out is always through.", author: "Robert Frost", mood: "Courage", image: "photo-1441974231531-c6227db76b6e" },
  { text: "Adopt the pace of nature: her secret is patience.", author: "Ralph Waldo Emerson", mood: "Calm", image: "photo-1448375240586-882707db888b" },
  { text: "What we think, we become.", author: "Buddha", mood: "Growth", image: "photo-1500534623283-312aade485b7" },
  { text: "Wherever you go, go with all your heart.", author: "Confucius", mood: "Joy", image: "photo-1470770841072-f978cf4d019e" },
  { text: "You are never too old to set another goal or to dream a new dream.", author: "C. S. Lewis", mood: "Growth", image: "photo-1500530855697-b586d89ba3ee" },
  { text: "Keep your face always toward the sunshine, and shadows will fall behind you.", author: "Walt Whitman", mood: "Joy", image: "photo-1500534623283-312aade485b7" }
];
const imageUrl = (id, width = 1600, height) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}${height ? `&h=${height}` : ""}&q=90`;
const bookmarkIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 4.75A1.75 1.75 0 0 1 8.25 3h7.5a1.75 1.75 0 0 1 1.75 1.75V21l-6-3.8L5.5 21V4.75z"/></svg>';
const imageSettingsKey = "inspo-quote:image-settings";
const ollamaModel = "hf.co/Qwen/Qwen3-4B-GGUF:Q4_K_M";
const backgroundImages = [...new Set(quotes.map((quote) => quote.image))];
let quoteIndex = Math.floor(Math.random() * quotes.length);
let activeMood = "All";
let generatedQuote = null;
let currentBackgroundImage = backgroundImages[Math.floor(Math.random() * backgroundImages.length)];
let user = null;
let toastTimer;
const $ = (id) => document.getElementById(id);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const currentQuote = () => generatedQuote || quotes[quoteIndex];

function getSaved() {
  if (!user) return [];
  try { return JSON.parse(localStorage.getItem(`stillword:saved:${user.uid}`) || "[]"); } catch { return []; }
}
function setSaved(items) {
  if (!user) return;
  localStorage.setItem(`stillword:saved:${user.uid}`, JSON.stringify(items));
  renderSaved();
}
function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 2600);
}
function renderQuote() {
  const quote = currentQuote();
  $("quote-text").textContent = quote.text;
  $("quote-author").textContent = `— ${quote.author}`;
  $("quote-category").textContent = `${quote.mood.toUpperCase()} · A THOUGHT TO KEEP`;
  $("image-index").textContent = generatedQuote ? "AI ORIGINAL" : `${String(quoteIndex + 1).padStart(2, "0")} / ${String(quotes.length).padStart(2, "0")}`;
  updateQuoteAppearance();
  updatePreview(quote);
  const saved = getSaved().some((item) => item.text === quote.text);
  $("favorite-button").classList.toggle("is-saved", saved);
  $("favorite-button").innerHTML = bookmarkIcon;
  $("favorite-button").setAttribute("aria-label", saved ? "Remove saved quote" : "Save this quote");
}
function updateQuoteAppearance() {
  const fonts = { serif: "'Playfair Display', Georgia, serif", sans: "Arial, Helvetica, sans-serif", mono: "'Courier New', monospace" };
  const colors = { white: "#ffffff", ivory: "#fff1d6", ink: "#292a25" };
  const font = $("font-select").value;
  const color = $("quote-color-select").value;
  $("quote-text").style.fontFamily = fonts[font] || fonts.serif;
  $("quote-text").style.color = colors[color] || colors.white;
  $("quote-copy").classList.toggle("has-light-panel", color === "ink");
}
function updatePreview(quote = currentQuote()) {
  const ratio = Number($("dimension-select").value);
  const longEdge = Number($("resolution-select").value);
  const width = ratio >= 1 ? longEdge : Math.round(longEdge * ratio);
  const height = ratio >= 1 ? Math.round(longEdge / ratio) : longEdge;
  const frame = $("quote-image");
  frame.style.setProperty("--preview-ratio", ratio);
  frame.classList.toggle("is-landscape", ratio > 1.2);
  frame.style.backgroundImage = `url("${imageUrl(currentBackgroundImage, width, height)}")`;
  $("preview-size").textContent = `${width} × ${height} PX`;
}
function nextQuote() {
  generatedQuote = null;
  const pool = quotes.map((quote, i) => ({ quote, i })).filter(({ quote, i }) => i !== quoteIndex && (activeMood === "All" || quote.mood === activeMood)).map(({ i }) => i);
  if (!pool.length) return renderQuote();
  quoteIndex = pool[Math.floor(Math.random() * pool.length)];
  renderQuote();
}
function renderSaved() {
  const saved = getSaved();
  $("saved-count").textContent = saved.length;
}
function downloadQuote(quote) {
  const ratio = Number($("dimension-select").value);
  const longEdge = Number($("resolution-select").value);
  const outputWidth = ratio >= 1 ? longEdge : Math.round(longEdge * ratio);
  const outputHeight = ratio >= 1 ? Math.round(longEdge / ratio) : longEdge;
  const image = new Image(); image.crossOrigin = "anonymous"; image.src = imageUrl(quote.image, outputWidth, outputHeight);
  image.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext("2d");
    const scale = Math.max(canvas.width / image.width, canvas.height / image.height);
    const width = image.width * scale, height = image.height * scale;
    ctx.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
    const shade = ctx.createLinearGradient(0, 0, 0, canvas.height); shade.addColorStop(0, "rgba(13,22,27,.2)"); shade.addColorStop(.38, "rgba(13,22,27,.18)"); shade.addColorStop(1, "rgba(13,22,27,.68)"); ctx.fillStyle = shade; ctx.fillRect(0, 0, canvas.width, canvas.height);
    const shortEdge = Math.min(canvas.width, canvas.height);
    const margin = Math.round(shortEdge * .095);
    const quoteFontSize = Math.round(shortEdge * .042);
    const quoteFont = quote.quoteFont || $("font-select").value;
    const quoteColor = quote.quoteColor || $("quote-color-select").value;
    const fontFamily = { serif: "'Playfair Display', Georgia, serif", sans: "Arial, Helvetica, sans-serif", mono: "'Courier New', monospace" }[quoteFont] || "'Playfair Display', Georgia, serif";
    const textColor = { white: "#ffffff", ivory: "#fff1d6", ink: "#292a25" }[quoteColor] || "#ffffff";
    ctx.fillStyle = textColor; ctx.font = `500 ${quoteFontSize}px ${fontFamily}`;
    const words = `“${quote.text}”`.split(" "); const lines = []; let line = "";
    const textWidth = canvas.width - margin * 2;
    words.forEach((word) => { const test = line ? `${line} ${word}` : word; if (ctx.measureText(test).width > textWidth && line) { lines.push(line); line = word; } else line = test; }); if (line) lines.push(line);
    const lineHeight = Math.round(quoteFontSize * 1.38); let y = canvas.height * .53 - ((lines.length - 1) * lineHeight) / 2;
    if (quoteColor === "ink") {
      const panelTop = y - Math.round(quoteFontSize * 1.25);
      const panelBottom = y + (lines.length - 1) * lineHeight + Math.round(quoteFontSize * 1.6);
      const panelX = Math.round(margin * .5);
      const panelWidth = canvas.width - panelX * 2;
      ctx.fillStyle = "rgba(248,247,240,.94)";
      ctx.beginPath(); ctx.roundRect(panelX, panelTop, panelWidth, panelBottom - panelTop, Math.round(shortEdge * .018)); ctx.fill();
      ctx.fillStyle = textColor;
    }
    lines.forEach((row) => { ctx.fillText(row, margin, y, textWidth); y += lineHeight; });
    ctx.fillStyle = quoteColor === "ink" ? "rgba(41,42,37,.78)" : "rgba(255,255,255,.76)"; ctx.font = `500 ${Math.round(shortEdge * .023)}px Arial`; ctx.fillText(`— ${quote.author}`, margin, y + Math.round(quoteFontSize * .95));
    ctx.fillStyle = "rgba(255,255,255,.7)"; ctx.font = `600 ${Math.round(shortEdge * .014)}px Arial`; ctx.letterSpacing = `${Math.round(shortEdge * .0025)}px`; ctx.fillText("INSPO QUOTE  ·  A MOMENT FOR YOU", margin, canvas.height - Math.round(margin * .58));
    canvas.toBlob((blob) => { if (!blob) return showToast("That image couldn’t be downloaded. Try again in a moment."); const link = document.createElement("a"); link.download = `inspo-quote-${quote.author.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.jpg`; link.href = URL.createObjectURL(blob); link.click(); URL.revokeObjectURL(link.href); showToast("Your quote image is ready."); }, "image/jpeg", .94);
  };
  image.onerror = () => showToast("The wallpaper couldn’t load. Please try again.");
}
async function generateAIQuote() {
  const button = $("ai-quote-button");
  const status = $("ai-status");
  button.disabled = true;
  button.textContent = "Generating…";
  status.textContent = "Asking your local Ollama model for an original quote…";
  try {
    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: ollamaModel,
        stream: false,
        format: "json",
        options: { temperature: 0.85 },
        messages: [
          { role: "system", content: "Write original inspirational one-line quotes. Never imitate or attribute words to real people. Return only valid JSON with one string field named quote. Keep the quote under 22 words." },
          { role: "user", content: `Write one fresh inspirational quote about ${activeMood === "All" ? "everyday courage, patience, or growth" : activeMood.toLowerCase()}. Do not add an author or explanation.` }
        ]
      })
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      if (response.status === 404) throw new Error(`The model is not installed. Run: ollama run ${ollamaModel}`);
      throw new Error(error.error || `Ollama returned status ${response.status}.`);
    }
    const payload = await response.json();
    const result = JSON.parse(payload.message?.content || "{}");
    const text = typeof result.quote === "string" ? result.quote.trim().replace(/^["“]|["”]$/g, "") : "";
    if (!text || text.length > 220) throw new Error("The model returned an unexpected response. Please try again.");
    const mood = activeMood === "All" ? quotes[quoteIndex].mood : activeMood;
    const matchingQuotes = quotes.filter((quote) => quote.mood === mood);
    const wallpaper = matchingQuotes[Math.floor(Math.random() * matchingQuotes.length)] || quotes[quoteIndex];
    generatedQuote = { text, author: "An original reflection", mood, image: wallpaper.image };
    renderQuote();
    status.textContent = "Created locally with Hugging Face Qwen3 via Ollama.";
  } catch (error) {
    const message = error instanceof TypeError
      ? "Couldn’t reach Ollama. Start Ollama, install the model, and allow this site’s origin if prompted."
      : error.message;
    status.textContent = message;
  } finally {
    button.disabled = false;
    button.textContent = "Generate with AI";
  }
}
function openAuth(mode = "signup") { window.location.href = `signin.html?mode=${encodeURIComponent(mode)}&return=index.html`; }
function setUser(nextUser) {
  user = nextUser;
  const signedIn = Boolean(user);
  $("profile-name").textContent = signedIn ? (user.displayName || user.email.split("@")[0]) : "Your space";
  $("profile-email").textContent = signedIn ? user.email : "Sign in to save quotes";
  $("avatar").textContent = signedIn ? (user.displayName || user.email)[0].toUpperCase() : "G";
  $("account-action").textContent = signedIn ? "Sign out" : "Sign in";
  $("account-action").setAttribute("aria-label", signedIn ? "Sign out" : "Sign in");
  $("top-account-actions").classList.toggle("hidden", signedIn);
  $("top-account-user").classList.toggle("hidden", !signedIn);
  $("top-account-email").textContent = signedIn ? user.email : "";
  renderQuote(); renderSaved();
}

renderQuote(); renderSaved();
onAuthStateChanged(auth, setUser);
$("shuffle-button").addEventListener("click", nextQuote);
try {
  const settings = JSON.parse(localStorage.getItem(imageSettingsKey) || "{}");
  if (["0.8", "1", "0.5625", "1.7778"].includes(String(settings.ratio))) $("dimension-select").value = String(settings.ratio);
  if (["1080", "2048", "3840"].includes(String(settings.resolution))) $("resolution-select").value = String(settings.resolution);
  if (["serif", "sans", "mono"].includes(settings.font)) $("font-select").value = settings.font;
  if (["white", "ivory", "ink"].includes(settings.color)) $("quote-color-select").value = settings.color;
} catch { /* Use the default image settings. */ }
updatePreview();
updateQuoteAppearance();
function saveImageSettings() {
  localStorage.setItem(imageSettingsKey, JSON.stringify({ ratio: $("dimension-select").value, resolution: $("resolution-select").value, font: $("font-select").value, color: $("quote-color-select").value }));
}
$("dimension-select").addEventListener("change", saveImageSettings);
$("resolution-select").addEventListener("change", saveImageSettings);
$("dimension-select").addEventListener("change", () => updatePreview());
$("resolution-select").addEventListener("change", () => updatePreview());
$("font-select").addEventListener("change", () => { saveImageSettings(); updateQuoteAppearance(); });
$("quote-color-select").addEventListener("change", () => { saveImageSettings(); updateQuoteAppearance(); });
$("theme-select").addEventListener("change", (event) => {
  activeMood = event.target.value;
  nextQuote();
});
$("favorite-button").addEventListener("click", () => { if (!user) return openAuth("signup"); const quote = { ...currentQuote(), image: currentBackgroundImage, quoteFont: $("font-select").value, quoteColor: $("quote-color-select").value }; const saved = getSaved(); const exists = saved.some((item) => item.text === quote.text); setSaved(exists ? saved.filter((item) => item.text !== quote.text) : [quote, ...saved]); renderQuote(); showToast(exists ? "Removed from your collection." : "Saved to your collection."); });
$("download-button").addEventListener("click", () => downloadQuote({ ...currentQuote(), image: currentBackgroundImage }));
$("change-background-button").addEventListener("click", () => {
  const choices = backgroundImages.filter((image) => image !== currentBackgroundImage);
  currentBackgroundImage = choices[Math.floor(Math.random() * choices.length)] || currentBackgroundImage;
  updatePreview();
});
$("ai-quote-button").addEventListener("click", generateAIQuote);
$("top-signin").addEventListener("click", () => openAuth("signin"));
$("top-signup").addEventListener("click", () => openAuth("signup"));
$("top-signout").addEventListener("click", () => signOut(auth).then(() => showToast("You’ve signed out.")));
$("account-action").addEventListener("click", () => user ? signOut(auth).then(() => showToast("You’ve signed out.")) : openAuth("signin"));
