// Brand settings (BPAY-017 / RSW-001): every restaurant-specific name, picture,
// color and data name lives here, so one copy of the app can serve many
// restaurants. The setup wizard writes this file for each restaurant.
//
// Loaded as a plain script in <head> (before the page draws), so it also sets
// the page title, home-screen name and icons. The rest of the app reads it
// through BRAND in js/config.js.
//
// Keep index.html and manifest.webmanifest in step with these values: iPhone
// reads the home-screen name and icon from the page itself.

self.BRAND = {
  // Names
  appName: 'Bootleggers Kitchen',          // page title, About, startup screen, messages
  shortName: 'Bootleggers',                // name under the home-screen icon
  restaurant: 'Bootleggers Bar & Grill',   // printed footers, notices
  location: 'Augusta',
  tagline: 'Recipes and kitchen notes for Bootleggers Bar & Grill, Augusta.',
  credit: '',                              // © line in About, e.g. '© 2026 Your Brand'. Empty = hidden.

  // Pictures and video (paths inside the app folder)
  logo: 'assets/bootleggers-logo.png',     // pinned header logo
  icon180: 'assets/app-icon-180.png',      // iPhone home-screen icon
  icon192: 'assets/app-icon-192.png',
  icon512: 'assets/app-icon-512.png',
  favicon: 'assets/favicon-32.png',
  introVideo: 'assets/intro.mp4',          // startup clip; '' = skip straight to the card

  // Look. null keeps the Apple / Android system colors from css/app.css.
  accent: null,                            // e.g. '#c8102e'

  // Data space. Every restaurant needs its own, never shared or reused.
  // Changing these on a live app makes phones start empty.
  dataPrefix: 'blg.',                      // saved settings on the phone
  dbName: 'bootleggers',                   // encrypted on-phone database
  teamId: 'bootleggers',                   // shared data folder: teams/<teamId> in Firebase
  reportPrefix: 'Bootleggers —',           // subject start for Report a problem emails

  // Menu (RRA-108): sections, dish names and prices, as sent by the Admin on
  // 2026-11-19. The Recipe archive and the Point of sale are filled from it.
  // Change MENU_VERSION in js/menu.js after editing so phones pick it up.
  menu: [
    { section: 'Appetizers', items: [
      ['Fried Mushrooms', '7.99'], ['Fried Pickles', '7.99'], ['Mozzarella Sticks', '7.99'], ['Tots', '6.49'], ['Fries', '5.50'],
      ['Nachos (Half)', '6.99'], ['Nachos (Full)', '10.99'], ['Quesadilla', '11.99'], ['Single Taco (No Side)', '5.99'],
      ['Tortilla Chips & Salsa', '4.49'],
    ] },
    { section: 'Baskets', items: [
      ['Chicken Finger Basket with Fries', '14.49'], ['Hot Dog Basket with Side', '6.99'], ['Taco Basket with Side', '11.99'], ['Wing Basket', '14.99'],
    ] },
    { section: 'Jumbo Wings', items: [
      ['5 Jumbo Wings (Bone-In)', '9.99'], ['10 Jumbo Wings (Bone-In)', '17.99'], ['15 Jumbo Wings (Bone-In)', '25.99'],
      ['20 Jumbo Wings (Bone-In)', '33.99'], ['30 Jumbo Wings (Bone-In)', '48.99'], ['50 Jumbo Wings (Bone-In)', '80.99'],
    ] },
    { section: 'Burgers', items: [
      ['Black & Blue with Fries', '14.99'], ['Classic Burger with Fries', '11.99'], ['Farmhouse Burger with Fries', '15.99'],
      ['Quesadilla Burger with Fries', '15.99'], ['Some Like it Hot with Fries', '14.99'], ['The Bootlegger with Fries', '17.49'],
      ['Veggie Burger with Fries', '13.99'],
    ] },
    { section: 'Sandwiches', items: [
      ['Bacon Ranch Chicken Sandwich with Fries', '14.99'], ['BLT with Fries', '10.99'], ['Buffalo Chicken Sandwich (or Wrap) with Fries', '15.99'],
      ['Chicken Sandwich with Fries', '14.99'], ['Grilled Cheese with Fries', '9.99'], ['Grilled Cheese Club with Fries', '13.99'],
      ['Mile High Club with Fries', '15.49'], ['Philly Melt with Fries', '13.99'], ['The Grilled Cheese Incident with Fries', '14.49'],
    ] },
    { section: 'Salads', items: [
      ['Buffalo Salad', '15.59'], ['Caesar Salad', '9.99'], ['Chef Salad', '15.99'], ['House Salad', '10.99'], ['Side Salad', '6.99'], ['Tex Mex Salad', '15.99'],
    ] },
    { section: 'Extra Sauce', items: [
      ['Ranch Small', '0.50'], ['Ranch Large', '1.00'], ['Blue Cheese Small', '0.50'], ['Blue Cheese Large', '1.00'],
      ['BBQ Sauce Small', '0.50'], ['BBQ Sauce Large', '1.00'], ['Honey Mustard Small', '0.50'], ['Honey Mustard Large', '1.00'],
      ['Honey Sriracha Small', '0.50'], ['Honey Sriracha Large', '1.00'], ['Mild Buffalo Small', '0.50'], ['Mild Buffalo Large', '1.00'],
      ['Med Buffalo Small', '0.50'], ['Med Buffalo Large', '1.00'], ['Hot Buffalo Small', '0.50'], ['Hot Buffalo Large', '1.00'],
      ['Italian Dressing Small', '0.50'], ['Italian Dressing Large', '1.00'], ['Ketchup Small', '0.50'], ['Ketchup Large', '1.00'],
      ['Mayo Small', '0.50'], ['Mayo Large', '1.00'], ['Mustard Small', '0.50'], ['Sour Cream Small', '0.50'], ['Sour Cream Large', '1.00'],
    ] },
    { section: 'N/A Beverages', items: [
      ['Bottle Water', '2.00'], ['Coca-Cola', '2.75'], ['Cranberry Juice', '2.75'], ['Diet Coke', '2.75'], ['Ginger Ale', '2.75'],
      ['Orange Juice', '2.75'], ['Pineapple Juice', '2.75'], ['Red Bull', '4.25'], ['Red Bull Sugar Free', '4.25'], ['Sprite', '2.75'],
      ['Sweet Tea', '2.75'], ['Unsweet Tea', '2.75'],
    ] },
  ],

  // Point of sale choices asked for when a dish is added (RRA-108).
  posChoices: {
    wings: { title: 'Sauce', options: ['Mild Buffalo', 'Med Buffalo', 'Hot Buffalo', 'BBQ', 'Honey Sriracha', 'Honey Mustard', 'Plain'] },
    burger: { title: 'Temperature', options: ['Medium rare', 'Medium', 'Medium well', 'Well done'] },
    salad: { title: 'Dressing', options: ['Ranch', 'Blue Cheese', 'Honey Mustard', 'Italian', 'None'] },
  },
  // Words left off the POS tiles and tickets to keep them short.
  posTrim: [' with Fries', ' with Side'],

  // Dish pictures for the POS tiles (RRA-108). A photo added to a dish in
  // Recipes wins; otherwise the file named here (dish name → path inside the
  // app folder, e.g. 'assets/menu/classic-burger.jpg'). Dishes with neither
  // show a colored tile with their name. Pictures come from the restaurant's
  // own website (websiteUrl).
  websiteUrl: 'https://bootleggersaugusta.com/',
  menuPhotoDir: 'assets/menu/',
  menuPhotos: {},

  // Gift cards (RRA-111): the restaurant's online gift card shop (Shift4 Shop).
  giftCards: {
    url: 'https://313b30113192392.s4shops.com/giftcard.html',
    label: 'Bootleggers gift cards',
    provider: 'Shift4',
    note: 'Buy a gift card online. It is emailed or mailed to you or the person you pick.',
  },

  // Music (RRA-109): internet radio stations shown in the Music area. Only
  // stations that offer a public https stream. Add local AM/FM stations with
  // Find a station in the app, or list them here: { name, url, genre }.
  radio: [
    { name: 'Boot Liquor (SomaFM)', genre: 'Americana and roots', url: 'https://ice1.somafm.com/bootliquor-128-mp3' },
    { name: 'Left Coast 70s (SomaFM)', genre: '70s rock', url: 'https://ice1.somafm.com/seventies-128-mp3' },
    { name: 'Underground 80s (SomaFM)', genre: '80s', url: 'https://ice1.somafm.com/u80s-128-mp3' },
    { name: 'Groove Salad (SomaFM)', genre: 'Chill', url: 'https://ice1.somafm.com/groovesalad-128-mp3' },
    { name: 'Secret Agent (SomaFM)', genre: 'Lounge', url: 'https://ice1.somafm.com/secretagent-128-mp3' },
  ],
  radioSearchArea: 'Augusta',              // Find a station starts with this
  radioSearchState: 'Georgia',
};

// Apply what the page head needs before first paint.
(function (B) {
  if (typeof document === 'undefined') return;
  var d = document;
  d.title = B.appName;
  var set = function (sel, attr, v) { var el = d.querySelector(sel); if (el && v) el.setAttribute(attr, v); };
  set('meta[name="apple-mobile-web-app-title"]', 'content', B.shortName);
  set('link[rel="apple-touch-icon"]', 'href', B.icon180);
  set('link[rel="icon"]', 'href', B.favicon);
  if (B.accent) {
    // Pick white or black text on the accent, whichever reads better.
    var h = B.accent.replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&');
    var n = parseInt(h, 16), lum = (0.299 * (n >> 16 & 255) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) / 255;
    var s = d.createElement('style');
    s.textContent = ':root,:root[data-theme],.android,.android[data-theme]{--accent:' + B.accent + ' !important;--on-accent:' + (lum > 0.6 ? '#000' : '#fff') + ' !important}';
    d.head.appendChild(s);
  }
})(self.BRAND);
