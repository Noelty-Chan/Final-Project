import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

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
const imageUrl = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=90`;
let quoteIndex = Math.floor(Math.random() * quotes.length);
let activeMood = "All";
let user = null;
let authMode = "signup";
let toastTimer;
const $ = (id) => document.getElementById(id);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

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
  const quote = quotes[quoteIndex];
  $("quote-text").textContent = quote.text;
  $("quote-author").textContent = `— ${quote.author}`;
  $("quote-category").textContent = `${quote.mood.toUpperCase()} · A THOUGHT TO KEEP`;
  $("image-index").textContent = `${String(quoteIndex + 1).padStart(2, "0")} / ${String(quotes.length).padStart(2, "0")}`;
  $("quote-image").style.backgroundImage = `url("${imageUrl(quote.image)}")`;
  const saved = getSaved().some((item) => item.text === quote.text);
  $("favorite-button").classList.toggle("is-saved", saved);
  $("favorite-button").textContent = saved ? "♥" : "♡";
  $("favorite-button").setAttribute("aria-label", saved ? "Remove saved quote" : "Save this quote");
}
function nextQuote() {
  const options = quotes.map((q, i) => i).filter((i) => i !== quoteIndex && (activeMood === "All" || quotes[i].mood === activeMood));
  const pool = options.length ? options : quotes.map((_, i) => i).filter((i) => i !== quoteIndex);
  quoteIndex = pool[Math.floor(Math.random() * pool.length)];
  renderQuote();
}
function renderSaved() {
  const saved = getSaved();
  $("saved-count").textContent = saved.length;
  $("saved-grid").replaceChildren();
  $("empty-state").classList.toggle("hidden", saved.length > 0);
  $("saved-grid").classList.toggle("hidden", saved.length === 0);
  $("saved-subtitle").textContent = saved.length ? `${saved.length} reminder${saved.length === 1 ? "" : "s"} you’ve saved along the way.` : "The reminders you’ve saved along the way.";
  saved.forEach((item) => {
    const card = document.createElement("article");
    card.className = "saved-card";
    card.style.backgroundImage = `linear-gradient(180deg,rgba(17,25,29,.04),rgba(17,25,29,.69)),url("${imageUrl(item.image)}")`;
    const copy = document.createElement("div"); copy.className = "saved-card-copy";
    const mood = document.createElement("span"); mood.className = "saved-mood"; mood.textContent = item.mood.toUpperCase();
    const text = document.createElement("blockquote"); text.textContent = `“${item.text}”`;
    const author = document.createElement("p"); author.textContent = `— ${item.author}`;
    const actions = document.createElement("div"); actions.className = "saved-card-actions";
    const download = document.createElement("button"); download.textContent = "↓ Download"; download.addEventListener("click", () => downloadQuote(item));
    const remove = document.createElement("button"); remove.textContent = "♡ Remove"; remove.addEventListener("click", () => { setSaved(getSaved().filter((q) => q.text !== item.text)); showToast("Removed from your collection."); });
    actions.append(download, remove); copy.append(mood, text, author, actions); card.append(copy); $("saved-grid").append(card);
  });
}
function downloadQuote(quote) {
  const image = new Image(); image.crossOrigin = "anonymous"; image.src = imageUrl(quote.image);
  image.onload = () => {
    const canvas = document.createElement("canvas"); canvas.width = 1080; canvas.height = 1350;
    const ctx = canvas.getContext("2d");
    const scale = Math.max(canvas.width / image.width, canvas.height / image.height);
    const width = image.width * scale, height = image.height * scale;
    ctx.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
    const shade = ctx.createLinearGradient(0, 0, 0, canvas.height); shade.addColorStop(0, "rgba(13,22,27,.2)"); shade.addColorStop(.38, "rgba(13,22,27,.18)"); shade.addColorStop(1, "rgba(13,22,27,.68)"); ctx.fillStyle = shade; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff"; ctx.font = "500 45px Georgia";
    const words = `“${quote.text}”`.split(" "); const lines = []; let line = "";
    words.forEach((word) => { const test = line ? `${line} ${word}` : word; if (ctx.measureText(test).width > 870 && line) { lines.push(line); line = word; } else line = test; }); if (line) lines.push(line);
    const lineHeight = 62; let y = canvas.height * .53 - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((row) => { ctx.fillText(row, 105, y, 870); y += lineHeight; });
    ctx.fillStyle = "rgba(255,255,255,.72)"; ctx.font = "500 25px Arial"; ctx.fillText(`— ${quote.author}`, 105, y + 48);
    ctx.fillStyle = "rgba(255,255,255,.7)"; ctx.font = "600 15px Arial"; ctx.letterSpacing = "3px"; ctx.fillText("INSPO QUOTE  ·  A MOMENT FOR YOU", 105, canvas.height - 65);
    canvas.toBlob((blob) => { if (!blob) return showToast("That image couldn’t be downloaded. Try again in a moment."); const link = document.createElement("a"); link.download = `inspo-quote-${quote.author.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.jpg`; link.href = URL.createObjectURL(blob); link.click(); URL.revokeObjectURL(link.href); showToast("Your quote image is ready."); }, "image/jpeg", .94);
  };
  image.onerror = () => showToast("The wallpaper couldn’t load. Please try again.");
}
function setMode(mode) {
  authMode = mode;
  const signup = mode === "signup";
  $("auth-title").innerHTML = signup ? "Make room for<br><em>what moves you.</em>" : "Good to have<br><em>you back.</em>";
  $("auth-description").textContent = signup ? "Create a free account to keep your favorite words close." : "Sign in to find the words you’ve saved.";
  $("auth-password").autocomplete = signup ? "new-password" : "current-password";
  $("auth-password").placeholder = signup ? "At least 6 characters" : "Your password";
  $("auth-submit").innerHTML = signup ? "Create my account <span>↗</span>" : "Sign in to my account <span>↗</span>";
  $("auth-switch").innerHTML = signup ? 'Already have an account? <button id="switch-auth">Sign in</button>' : 'New to Inspo Quote? <button id="switch-auth">Create an account</button>';
  $("switch-auth").addEventListener("click", () => setMode(signup ? "signin" : "signup"));
  $("auth-error").textContent = "";
}
function openAuth(mode = "signup") { setMode(mode); $("auth-modal").classList.remove("hidden"); document.body.classList.add("modal-open"); setTimeout(() => $("auth-email").focus(), 50); }
function closeAuth() { $("auth-modal").classList.add("hidden"); document.body.classList.remove("modal-open"); }
function setUser(nextUser) {
  user = nextUser;
  const signedIn = Boolean(user);
  $("profile-name").textContent = signedIn ? (user.displayName || user.email.split("@")[0]) : "Your space";
  $("profile-email").textContent = signedIn ? user.email : "Sign in to save quotes";
  $("avatar").textContent = signedIn ? (user.displayName || user.email)[0].toUpperCase() : "G";
  $("account-action").textContent = signedIn ? "↗" : "↗";
  $("account-action").setAttribute("aria-label", signedIn ? "Sign out" : "Sign in");
  $("mobile-account").textContent = signedIn ? "Sign out" : "Sign in";
  renderQuote(); renderSaved();
}

$("today").textContent = new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date()).toUpperCase();
renderQuote(); renderSaved();
onAuthStateChanged(auth, setUser);
$("shuffle-button").addEventListener("click", nextQuote);
$("mood-list").addEventListener("click", (event) => { const chip = event.target.closest(".mood-chip"); if (!chip) return; activeMood = chip.dataset.mood; document.querySelectorAll(".mood-chip").forEach((item) => { item.classList.toggle("selected", item === chip); item.setAttribute("aria-pressed", item === chip ? "true" : "false"); }); if (activeMood !== "All" && quotes[quoteIndex].mood !== activeMood) nextQuote(); });
$("favorite-button").addEventListener("click", () => { if (!user) return openAuth("signup"); const quote = quotes[quoteIndex]; const saved = getSaved(); const exists = saved.some((item) => item.text === quote.text); setSaved(exists ? saved.filter((item) => item.text !== quote.text) : [{ ...quote }, ...saved]); renderQuote(); showToast(exists ? "Removed from your collection." : "Saved to your collection."); });
$("download-button").addEventListener("click", () => downloadQuote(quotes[quoteIndex]));
$("signup-button").addEventListener("click", () => openAuth("signup"));
$("signin-button").addEventListener("click", () => openAuth("signin"));
$("account-action").addEventListener("click", () => user ? signOut(auth).then(() => showToast("You’ve signed out.")) : openAuth("signin"));
$("mobile-account").addEventListener("click", () => user ? signOut(auth).then(() => showToast("You’ve signed out.")) : openAuth("signin"));
$("modal-close").addEventListener("click", closeAuth);
$("auth-modal").addEventListener("click", (event) => { if (event.target === $("auth-modal")) closeAuth(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeAuth(); });
$("auth-form").addEventListener("submit", async (event) => {
  event.preventDefault(); $("auth-error").textContent = "";
  const email = $("auth-email").value.trim(); const password = $("auth-password").value;
  const button = $("auth-submit"); button.disabled = true; button.innerHTML = "One moment…";
  try {
    if (authMode === "signup") await createUserWithEmailAndPassword(auth, email, password);
    else await signInWithEmailAndPassword(auth, email, password);
    closeAuth(); $("auth-form").reset(); showToast(authMode === "signup" ? "Your Inspo Quote space is ready." : "Welcome back to Inspo Quote.");
  } catch (error) {
    const messages = { "auth/email-already-in-use": "An account with this email already exists. Try signing in.", "auth/invalid-email": "Enter a valid email address.", "auth/weak-password": "Choose a password with at least 6 characters.", "auth/invalid-credential": "That email and password don’t match. Try again.", "auth/network-request-failed": "Couldn’t connect. Check your internet and try again." };
    $("auth-error").textContent = messages[error.code] || "We couldn’t complete that just now. Please try again.";
  } finally { button.disabled = false; setMode(authMode); }
});
function showView(view) {
  const saved = view === "saved";
  $("create-view").classList.toggle("hidden", saved); $("intro").classList.toggle("hidden", saved); $("saved-view").classList.toggle("hidden", !saved);
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === view));
  if (saved) renderSaved();
}
document.querySelectorAll(".nav-item").forEach((item) => item.addEventListener("click", () => showView(item.dataset.view)));
$("back-to-create").addEventListener("click", () => showView("create"));
$("empty-create").addEventListener("click", () => showView("create"));
