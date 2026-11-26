import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

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
const params = new URLSearchParams(window.location.search);
const returnTo = ["index.html", "saved.html"].includes(params.get("return")) ? params.get("return") : "index.html";
let mode = params.get("mode") === "signin" ? "signin" : "signup";
const $ = (id) => document.getElementById(id);

function renderMode() {
  const signup = mode === "signup";
  document.title = `${signup ? "Create account" : "Sign in"} · Inspo Quote`;
  $("page-auth-eyebrow").textContent = signup ? "YOUR PERSONAL COLLECTION" : "WELCOME BACK";
  $("page-auth-title").innerHTML = signup ? "Make room for<br><em>what moves you.</em>" : "Good to have<br><em>you back.</em>";
  $("page-auth-description").textContent = signup ? "Create a free account to keep your favorite words close." : "Sign in to find the words you’ve saved.";
  $("page-auth-password").autocomplete = signup ? "new-password" : "current-password";
  $("page-auth-password").placeholder = signup ? "At least 6 characters" : "Your password";
  $("page-auth-password").minLength = signup ? 6 : 1;
  $("page-auth-submit").textContent = signup ? "Create my account" : "Sign in to my account";
  $("page-auth-switch").innerHTML = signup
    ? 'Already have an account? <button type="button" id="page-switch-button">Sign in</button>'
    : 'New to Inspo Quote? <button type="button" id="page-switch-button">Create an account</button>';
  $("page-switch-button").addEventListener("click", () => {
    mode = signup ? "signin" : "signup";
    const next = new URL(window.location.href);
    next.searchParams.set("mode", mode);
    history.replaceState(null, "", next);
    renderMode();
  });
  $("page-auth-error").textContent = "";
}

onAuthStateChanged(auth, (user) => {
  if (user) window.location.replace(returnTo);
});
renderMode();

$("page-auth-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  $("page-auth-error").textContent = "";
  const button = $("page-auth-submit");
  button.disabled = true;
  button.textContent = mode === "signup" ? "Creating your account…" : "Signing you in…";
  try {
    const email = $("page-auth-email").value.trim();
    const password = $("page-auth-password").value;
    if (mode === "signup") await createUserWithEmailAndPassword(auth, email, password);
    else await signInWithEmailAndPassword(auth, email, password);
    window.location.replace(returnTo);
  } catch (error) {
    const messages = {
      "auth/email-already-in-use": "An account with this email already exists. Try signing in.",
      "auth/invalid-email": "Enter a valid email address.",
      "auth/weak-password": "Choose a password with at least 6 characters.",
      "auth/invalid-credential": "That email and password don’t match. Try again.",
      "auth/user-disabled": "This account is currently unavailable.",
      "auth/too-many-requests": "Too many attempts. Wait a moment and try again.",
      "auth/network-request-failed": "Couldn’t connect. Check your internet and try again."
    };
    const message = messages[error.code] || "We couldn’t complete that just now. Please try again.";
    button.disabled = false;
    renderMode();
    $("page-auth-error").textContent = message;
  }
});
