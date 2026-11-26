  import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";
  import { getAuth, createUserWithEmailAndPassword } from "firebase/https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

  const firebaseConfig = {
    apiKey: "AIzaSyDRAbvNSLTFN-vvdx9k27kPxsHl2BtBknA",
    authDomain: "final-term-project-ed2da.firebaseapp.com",
    projectId: "final-term-project-ed2da",
    storageBucket: "final-term-project-ed2da.firebasestorage.app",
    messagingSenderId: "412261597044",
    appId: "1:412261597044:web:5e709fdf45f40deac83621",
    measurementId: "G-0N4TVPW2Z1"
  };

  const app = initializeApp(firebaseConfig);
  const auth =getAuth(app);

  const submitBtn = document.getElementById("submit");

  submitBtn.addEventListener('click', function(event){
    event.preventDefault();

alert("hi");
// Retrieve Email & Password Values
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

const auth = getAuth();
createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed up 
    const user = userCredential.user;
    window.location.href = "signin.html"
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    // ..
  });
})