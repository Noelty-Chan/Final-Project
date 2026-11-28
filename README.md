# INSPO QUOTE by Noel Chan

Inspo Quote is a responsive inspirational quote image generator. It allows you to choose a quote theme, image dimensions, resolution, font, and text color to preview and download a quote image. Sign in to save quotes in your collection, remove them, restore recently removed quotes, or download them later.

## FEATURES

- Built-in inspirational quotes with author and source information in `quotes.js`.
- Curated landscape, nature, architecture, building, and space wallpapers in `wallpapers.js`, served through Unsplash.
- Live preview updates when all customization options have been selected. The background stays fixed until you choose to change it.
- Image downloads with configurable aspect ratio, resolution, font, and quote color.
- Firebase Authentication for account creation and sign-in.
- Saved and recently removed quotes managed in browser local storage for each signed-in user.
- Responsive layouts for desktop, tablet, and mobile.

## CODEX PROMPTS

Here are the key prompts from the design and development conversation that capture the main product decisions and feature requests:

- “Create an inspirational quote image generator that pairs a thematically fitting wallpaper with a famous quote and allows you to create an account to save your favourites for later viewing or downloads.”
- “Have user account creation and login occur on separate page before redirecting back to main page.”
- “Create a new page to view all saved quote images & add the option to download them.”
- “Add option for users to decide the dimensions & resolution of the image alongside the quote theme.”
- “Include live image preview as user selects quote theme, dimensions & resolution.”
- “Modify javascript so that the accompanying background image for the quote does not update unless user manually refreshes the page or clicks the change background button.”
- “Add option to change quote font & colour to improve visual contrast.”
- “Adjust site so that it's responsive on both desktop and mobile.”
- “Modify styling so that it has a dark yet warm vintage aesthetic.”
- “Adjust colour styling so that it passes contrast checker test and is legible.”
- “Update font to old-fashioned serif font that remains legible.”
- “Increase built-in quotes from 35 to 200 verified inspirational quotes.”
- “Review wallpaper pool so that it excludes people and only consists of landscape, nature, architecture, building & space photography.”
- “Move quotes from main.js to extra-quotes.js & rename it to \"quotes.js\".”
- “Increase image wallpaper pool from 21 to 200 unique images.”
- “Give users the option to remove or recover saved quotes from their collection.”

## Run locally

The site is a static web app with ES modules. Serve the project directory over HTTP rather than opening the HTML files directly. For example, with Python installed:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

Firebase Authentication must be enabled for the configured Firebase project, and the local domain must be authorized in Firebase Authentication settings for sign-in and account creation to work.

## Deploy to Firebase Hosting

Install the Firebase CLI and sign in:

```sh
npm install -g firebase-tools
firebase login
```

Deploy Hosting from the project directory:

```sh
firebase deploy --only hosting --project final-term-project-ed2da
```

The Hosting configuration is in `firebase.json`; the default project is recorded in `.firebaserc`.

## PROJECT FILES BREAKDOWN

- `index.html`, `main.js` — quote generator and main-page behavior.
- `saved.html`, `saved.js` — saved collection, restore actions, and image downloads.
- `signin.html`, `signin.js` — account creation and sign-in page.
- `quotes.js` — built-in quote data.
- `wallpapers.js` — wallpaper metadata.
- `style.css` — shared responsive styling and visual theme.
