# Layer & Form

A single-page site for Layer & Form, a 3D-printing project made by Pueblo High School students.

## What the files do

- `index.html` has the words, sections, and buttons that make up the page.
- `styles.css` controls how the page looks, including the mobile layout.
- `script.js` loads the print photos, makes the gallery and shop preview cards, and handles the category filters and preview cart.
- `prints/` is where the print photos go.

## Add your prints

1. Open this project folder in VS Code and start the Live Server extension from `index.html`.
2. Add or copy your print photos into the `prints` folder.
3. Use JPG, JPEG, PNG, WebP, GIF, or AVIF images. Name each photo after the print, such as `blue-dragon.jpg`.
4. To set a price, open `script.js` and add the exact image filename and price to `printPrices`, for example:

   ```js
   const printPrices = {
     "blue-dragon.jpg": 4.99,
     "keychain.png": 2.5
   };
   ```

   Prices are in US dollars. Use a number without a `$` sign. Prints without a price show “Price not set.”
5. To add a description, open `script.js` and add the exact image filename and description to `printDescriptions`, for example:

   ```js
   const printDescriptions = {
     "blue-dragon.jpg": "A small dragon figure with a flexible tail.",
     "keychain.png": "A lightweight keychain with a custom design."
   };
   ```

   The description appears when someone opens that print’s details. Prints without a description show “Description not added yet.”
6. Refresh the page. Each image appears as a card, with its filename used as the title and its price shown in the gallery, details, and cart.

Use simple filenames with hyphens or underscores between words. Live Server must be running from this project folder so the page can read the folder listing. The shop popup and cart are for browsing and saving items of interest only; prices and subtotals are informational and the site does not offer checkout or payment.

^
|
|
this is to change when it gets set up when real money is involved for now the prices are for show 
 
ps gl if it breaks dario- :P