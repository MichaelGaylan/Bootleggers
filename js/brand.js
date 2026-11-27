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
  iconMaskable: 'assets/app-icon-maskable-512.png', // Android round/shaped icon
  iconSource: 'assets/app-icon.png',       // original icon art (not loaded by the app)
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
  reportKey: '003383c6-4896-4f71-bdec-f7ada99ae0ec', // Web3Forms key for this restaurant's report inbox (public; never put the inbox address here)

  // Shared team data (RRA-031): this restaurant's Firebase web config (Firebase
  // console → Project settings → Your apps → Web). Public by design; records are
  // encrypted with the team key first. null = data stays on each phone only.
  // After a changeout, run `node tools/changeout.mjs sync` to rewrite firestore.rules.
  firebase: {
    apiKey: 'AIzaSyDXZuUDplTUfzB1WN58Qk5mE2TVf4Q_aPU',
    authDomain: 'bootleggers-kitchen.firebaseapp.com',
    projectId: 'bootleggers-kitchen',
    storageBucket: 'bootleggers-kitchen.firebasestorage.app',
    messagingSenderId: '49283173779',
    appId: '1:49283173779:web:9193c90d1cb752fdfc2c66',
  },

  // Menu (RRA-108): sections, dish names and prices, as sent by the Admin on
  // 2026-11-19. The Recipe archive and the Point of sale are filled from it.
  // Change menuVersion after editing so phones pick it up.
  menuVersion: '2026-11-26b',               // change after editing the menu so phones pick it up
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
    // Bar sections (RRA-135). Add each beer, wine and liquor in Recipes with
    // its price. The starter cocktails have their pours but no price yet, so
    // they only show in Orders once a price is added. [name, price, extras].
    { section: 'Draft Beer', items: [] },
    // Ten starter beers (RRA-144) and wines (RRA-145), Gaylan 2026-11-26. Prices
    // are typical bar prices less 1%. Each counts down its own Stock item.
    { section: 'Bottles & Cans', items: [
      ['Michelob Ultra', '4.46', { drink: 'beer', desc: 'Low-carb light lager' }],
      ['Modelo Especial', '4.95', { drink: 'beer', desc: 'Mexican lager' }],
      ['Bud Light', '3.96', { drink: 'beer', desc: 'Classic American light lager' }],
      ['Coors Light', '3.96', { drink: 'beer', desc: 'Light lager' }],
      ['Miller Lite', '3.96', { drink: 'beer', desc: 'American-style light lager' }],
      ['Corona Extra', '4.95', { drink: 'beer', desc: 'Mexican pale lager' }],
      ['Budweiser', '3.96', { drink: 'beer', desc: 'American pale lager' }],
      ['Busch Light', '3.47', { drink: 'beer', desc: 'Budget-friendly light lager' }],
      ['Natural Light', '2.97', { drink: 'beer', desc: 'Light lager' }],
      ['Miller High Life', '3.47', { drink: 'beer', desc: 'Classic American lager' }],
    ] },
    { section: 'Wine', items: [
      ['Kim Crawford Sauv Blanc (glass)', '9.90', { drink: 'wine', desc: 'Crisp New Zealand Sauvignon Blanc, 5 oz glass', ingredients: [['5 oz', 'Kim Crawford Sauvignon Blanc']] }],
      ['Kim Crawford Sauv Blanc (bottle)', '37.62', { drink: 'wine', desc: 'Crisp New Zealand Sauvignon Blanc, 750 ml bottle', ingredients: [['1 bottle', 'Kim Crawford Sauvignon Blanc']] }],
      ['Bogle Essential Red (glass)', '7.92', { drink: 'wine', desc: 'Smooth everyday California red blend, 5 oz glass', ingredients: [['5 oz', 'Bogle Vineyards Essential Red']] }],
      ['Bogle Essential Red (bottle)', '29.70', { drink: 'wine', desc: 'Smooth everyday California red blend, 750 ml bottle', ingredients: [['1 bottle', 'Bogle Vineyards Essential Red']] }],
      ['Decoy Cabernet (glass)', '12.87', { drink: 'wine', desc: 'Rich Sonoma County Cabernet, 5 oz glass', ingredients: [['5 oz', 'Decoy Sonoma Cabernet Sauvignon']] }],
      ['Decoy Cabernet (bottle)', '49.50', { drink: 'wine', desc: 'Rich Sonoma County Cabernet, 750 ml bottle', ingredients: [['1 bottle', 'Decoy Sonoma Cabernet Sauvignon']] }],
      ['Barefoot White Zin (glass)', '5.94', { drink: 'wine', desc: 'Sweet, light pink wine, 5 oz glass', ingredients: [['5 oz', 'Barefoot White Zinfandel']] }],
      ['Barefoot White Zin (bottle)', '21.78', { drink: 'wine', desc: 'Sweet, light pink wine, 750 ml bottle', ingredients: [['1 bottle', 'Barefoot White Zinfandel']] }],
      ['Bonanza Cabernet (glass)', '10.89', { drink: 'wine', desc: 'Juicy California Cabernet from Caymus, 5 oz glass', ingredients: [['5 oz', 'Bonanza Cabernet Sauvignon Lot 9']] }],
      ['Bonanza Cabernet (bottle)', '41.58', { drink: 'wine', desc: 'Juicy California Cabernet from Caymus, 750 ml bottle', ingredients: [['1 bottle', 'Bonanza Cabernet Sauvignon Lot 9']] }],
      ['Oyster Bay Sauv Blanc (glass)', '8.91', { drink: 'wine', desc: 'Zesty New Zealand Sauvignon Blanc, 5 oz glass', ingredients: [['5 oz', 'Oyster Bay Sauvignon Blanc']] }],
      ['Oyster Bay Sauv Blanc (bottle)', '33.66', { drink: 'wine', desc: 'Zesty New Zealand Sauvignon Blanc, 750 ml bottle', ingredients: [['1 bottle', 'Oyster Bay Sauvignon Blanc']] }],
      ['Apothic Red (glass)', '7.92', { drink: 'wine', desc: 'Bold, smooth red blend, 5 oz glass', ingredients: [['5 oz', 'Apothic Red']] }],
      ['Apothic Red (bottle)', '27.72', { drink: 'wine', desc: 'Bold, smooth red blend, 750 ml bottle', ingredients: [['1 bottle', 'Apothic Red']] }],
      ['Santa Margherita Pinot Grigio (glass)', '12.87', { drink: 'wine', desc: 'Dry, crisp Italian Pinot Grigio, 5 oz glass', ingredients: [['5 oz', 'Santa Margherita Pinot Grigio']] }],
      ['Santa Margherita Pinot Grigio (bottle)', '47.52', { drink: 'wine', desc: 'Dry, crisp Italian Pinot Grigio, 750 ml bottle', ingredients: [['1 bottle', 'Santa Margherita Pinot Grigio']] }],
      ['Josh Pinot Noir (glass)', '9.90', { drink: 'wine', desc: 'Light, fruity California Pinot Noir, 5 oz glass', ingredients: [['5 oz', 'Josh Cellars Pinot Noir']] }],
      ['Josh Pinot Noir (bottle)', '35.64', { drink: 'wine', desc: 'Light, fruity California Pinot Noir, 750 ml bottle', ingredients: [['1 bottle', 'Josh Cellars Pinot Noir']] }],
      ['La Crema Chardonnay (glass)', '11.88', { drink: 'wine', desc: 'Creamy California Chardonnay, 5 oz glass', ingredients: [['5 oz', 'La Crema Sonoma Coast Chardonnay']] }],
      ['La Crema Chardonnay (bottle)', '44.55', { drink: 'wine', desc: 'Creamy California Chardonnay, 750 ml bottle', ingredients: [['1 bottle', 'La Crema Sonoma Coast Chardonnay']] }],
    ] },
    { section: 'Liquor', items: [] },
    { section: 'Cocktails', items: [
      ['Margarita', '', { drink: 'cocktail', ingredients: [['1.5 oz', 'Well tequila'], ['0.75 oz', 'Triple sec'], ['3 oz', 'Sour mix'], ['1 wedge', 'Lemons/limes']] }],
      ['Long Island Iced Tea', '', { drink: 'cocktail', ingredients: [['0.5 oz', 'Well vodka'], ['0.5 oz', 'Well gin'], ['0.5 oz', 'Well rum'], ['0.5 oz', 'Well tequila'], ['0.5 oz', 'Triple sec'], ['2 oz', 'Sour mix'], ['1 splash', 'Coca-Cola']] }],
      ['Rum & Coke', '', { drink: 'cocktail', ingredients: [['1.5 oz', 'Well rum'], ['4 oz', 'Coca-Cola']] }],
      ['Vodka Cranberry', '', { drink: 'cocktail', ingredients: [['1.5 oz', 'Well vodka'], ['4 oz', 'Cranberry juice']] }],
      ['Screwdriver', '', { drink: 'cocktail', ingredients: [['1.5 oz', 'Well vodka'], ['4 oz', 'Orange juice']] }],
      ['Whiskey & Coke', '', { drink: 'cocktail', ingredients: [['1.5 oz', 'Well whiskey'], ['4 oz', 'Coca-Cola']] }],
      // Six classic cocktails (RRA-143): standard bar recipes in our own words. No price yet.
      ['Old Fashioned', '', { drink: 'cocktail', desc: 'Bourbon, a little sugar and bitters, stirred', ingredients: [['2 oz', 'Well whiskey'], ['0.25 oz', 'Simple syrup'], ['2 dashes', 'Angostura bitters'], ['1 peel', 'Oranges']],
        steps: ['Add the syrup and bitters to a mixing glass, then the whiskey.', 'Fill with ice and stir for about 20 seconds until cold.', 'Strain into a rocks glass over one large cube.', 'Squeeze the orange peel over the top, rub it on the rim and drop it in.'] }],
      ['Moscow Mule', '', { drink: 'cocktail', desc: 'Vodka, lime and ginger beer in a copper mug', ingredients: [['1.5 oz', 'Well vodka'], ['0.5 oz', 'Lime juice'], ['4 oz', 'Ginger beer'], ['1 wedge', 'Lemons/limes']],
        steps: ['Fill a copper mug with ice.', 'Add the vodka and lime juice.', 'Top with ginger beer and give it one gentle stir.', 'Garnish with a lime wedge.'] }],
      ['Mojito', '', { drink: 'cocktail', desc: 'Rum, fresh mint, lime and soda', ingredients: [['1.5 oz', 'Well rum'], ['0.75 oz', 'Lime juice'], ['0.5 oz', 'Simple syrup'], ['8 leaves', 'Fresh mint'], ['2 oz', 'Club soda']],
        steps: ['Put the mint leaves, syrup and lime juice in a tall glass.', 'Press the mint gently a few times to wake it up; don\'t shred it.', 'Add the rum and fill with crushed or cubed ice.', 'Top with club soda, stir from the bottom and garnish with a mint sprig.'] }],
      ['Whiskey Sour', '', { drink: 'cocktail', desc: 'Whiskey, lemon and sugar, shaken', ingredients: [['2 oz', 'Well whiskey'], ['0.75 oz', 'Lemon juice'], ['0.75 oz', 'Simple syrup'], ['1', 'Cocktail cherries']],
        steps: ['Add the whiskey, lemon juice and syrup to a shaker with ice.', 'Shake hard for about 10 seconds.', 'Strain into a rocks glass over fresh ice.', 'Garnish with a cherry and an orange slice.'] }],
      ['Cosmopolitan', '', { drink: 'cocktail', desc: 'Vodka, orange liqueur, lime and cranberry', ingredients: [['1.5 oz', 'Well vodka'], ['0.75 oz', 'Triple sec'], ['0.5 oz', 'Lime juice'], ['1 oz', 'Cranberry juice']],
        steps: ['Chill a martini glass with ice water.', 'Add everything to a shaker with ice and shake until very cold.', 'Empty the glass and strain the drink into it.', 'Garnish with a lime wheel or orange twist.'] }],
      ['Paloma', '', { drink: 'cocktail', desc: 'Tequila, lime and grapefruit soda', ingredients: [['1.5 oz', 'Well tequila'], ['0.5 oz', 'Lime juice'], ['4 oz', 'Grapefruit soda'], ['1 pinch', 'Salt']],
        steps: ['Salt half the rim of a tall glass and fill it with ice.', 'Add the tequila and lime juice.', 'Top with grapefruit soda and stir once.', 'Garnish with a lime wedge.'] }],
    ] },
  ],

  // Drinks (RRA-135). Which kind of drink each menu section holds; a dish can
  // also be set on its own in Recipes. Every alcoholic drink goes to the bar
  // ticket and asks for a 21+ ID check on its seat.
  drinks: {
    kinds: { na: 'Non-alcoholic', beer: 'Beer', wine: 'Wine', liquor: 'Liquor / shot', cocktail: 'Cocktail / mixed drink' },
    sections: { 'N/A Beverages': 'na', 'Draft Beer': 'beer', 'Bottles & Cans': 'beer', 'Wine': 'wine', 'Liquor': 'liquor', 'Cocktails': 'cocktail' },
    legalAge: 21,
    // Pour sizes in ounces, used when a drink has no pours written in Recipes
    // but its name matches a Stock item (e.g. a bottle of Jack Daniel's).
    pourOz: { liquor: 1.5, wine: 5, beer: 16 },
    // Choices asked for when a liquor or cocktail is added. [name, pours ×, price ×]
    choices: {
      liquor: { title: 'How', options: [['Rocks'], ['Neat'], ['Up'], ['Shot'], ['Double', 2, 2]] },
      cocktail: { title: 'How', options: [['Rocks'], ['Up'], ['Double', 2, 2]] },
    },
  },

  // Example dish name shown in the Recipes "Name" box.
  dishExample: 'The Bootlegger',

  // Starter stock list (RRA-024, moved here in RRA-123): groups and items
  // added once on the Admin phone. [name, unit, what it's for].
  stockStatus: 'Draft from the online menu. Waiting for chef review.',
  starterStock: [
    { group: 'Proteins', items: [
      ['Jumbo chicken wings, bone-in', 'case (40 lb)', 'Almost Famous Jumbo Wings, Wing Basket, Buffalo Salad'],
      ['Chicken tenders/fingers', 'case', 'Chicken Finger Basket, Buffalo Chicken Sandwich/Wrap, salads'],
      ['Chicken breast, boneless', 'case', 'Chicken Sandwich, Bacon Ranch Chicken, Quesadilla, Tex Mex Salad'],
      ['Ground beef burger patties', 'case', 'All burgers'],
      ['Veggie burger patties', 'case', 'Veggie Burger'],
      ['Taco meat (ground beef)', 'lb', 'Tacos, Nachos, Tex Mex Salad'],
      ['Hot dogs', 'pack', 'Hot Dog Basket'],
      ['Bacon', 'case', 'Black & Blue, Farmhouse, The Bootlegger, BLT, Bacon Ranch, clubs'],
      ['Shaved steak (Philly)', 'lb', 'Philly Melt'],
      ['Deli turkey', 'lb', 'Mile High Club, Grilled Cheese Club, Chef Salad'],
      ['Deli ham', 'lb', 'Mile High Club, Chef Salad'],
      ['Eggs', 'flat', 'Farmhouse Burger (likely), Chef Salad'],
    ] },
    { group: 'Dairy and cheese', items: [
      ['American cheese, sliced', 'case'], ['Cheddar, shredded', 'bag'], ['Blue cheese crumbles', 'tub'],
      ['Pepper jack, sliced', 'case'], ['Provolone or Swiss, sliced', 'case'], ['Mozzarella sticks, frozen breaded', 'case'],
      ['Nacho cheese sauce', 'can/bag'], ['Shredded Parmesan', 'bag'], ['Sour cream', 'tub'], ['Butter / butter blend', 'case'],
    ] },
    { group: 'Frozen and fried', items: [
      ['French fries', 'case'], ['Tater tots', 'case'], ['Breaded mushrooms', 'case'],
      ['Breaded/battered pickle chips', 'case'], ['Fryer oil', 'jug (35 lb)'],
    ] },
    { group: 'Produce', items: [
      ['Iceberg / romaine lettuce', 'case'], ['Romaine (Caesar)', 'case'], ['Tomatoes', 'case'], ['Red/yellow onions', 'bag'],
      ['Jalapeños', 'lb'], ['Pickles (sliced)', 'pail'], ['Celery and carrots (wing sides)', 'case'], ['Cucumbers', 'case'], ['Lemons/limes', 'case'],
    ] },
    { group: 'Bakery and dry goods', items: [
      ['Burger buns', 'case'], ['Hoagie rolls (Philly)', 'case'], ['Sandwich bread (white/Texas toast)', 'case'], ['Hot dog buns', 'case'],
      ['Flour tortillas (quesadilla, wrap)', 'case'], ['Taco shells', 'case'], ['Tortilla chips', 'case'], ['Croutons', 'bag'],
      ['Wing breading/flour, seasonings, salt, pepper', 'each'],
    ] },
    { group: 'Sauces and dressings', items: [
      ['Ranch', 'jug'], ['Blue Cheese', 'jug'], ['BBQ', 'jug'], ['Honey Mustard', 'jug'], ['Honey Sriracha', 'jug'],
      ['Mild Buffalo', 'jug'], ['Medium Buffalo', 'jug'], ['Hot Buffalo', 'jug'],
      ['Italian', 'jug'], ['Caesar dressing', 'jug'], ['Ketchup', 'case'], ['Mayo', 'jug'], ['Mustard', 'jug'], ['Salsa', 'jug'], ['House wing sauces', '', 'See House recipes'],
    ] },
    { group: 'Non-alcoholic beverages', items: [
      ['Bottled water', ''], ['Coca-Cola', ''], ['Diet Coke', ''], ['Sprite', ''], ['Ginger Ale', ''], ['Cranberry juice', ''],
      ['Orange juice', ''], ['Pineapple juice', ''], ['Red Bull', 'case'], ['Red Bull Sugar Free', 'case'], ['Iced tea bags', 'box'], ['Sugar', 'bag'],
    ] },
    { group: 'Bar', items: [
      ['Draft beer, bottles and cans, liquor, wine, mixers, garnishes', '', 'To fill in: not on the website'],
      // Well liquor and mixers for the starter cocktails (RRA-135). The size in
      // the unit lets each pour count the bottle down.
      ['Well vodka', 'bottle (1 L)'], ['Well gin', 'bottle (1 L)'], ['Well rum', 'bottle (1 L)'], ['Well tequila', 'bottle (1 L)'],
      ['Well whiskey', 'bottle (1 L)'], ['Triple sec', 'bottle (1 L)'], ['Sour mix', 'bottle (1 L)'],
      // Mixers for the classic cocktails (RRA-143), the starter beers (RRA-144) and wines (RRA-145).
      ['Simple syrup', 'bottle (1 L)'], ['Angostura bitters', 'bottle (4 oz)'], ['Lime juice', 'bottle (1 L)'], ['Lemon juice', 'bottle (1 L)'],
      ['Ginger beer', 'bottle (1 L)'], ['Club soda', 'bottle (1 L)'], ['Grapefruit soda', 'bottle (1 L)'], ['Fresh mint', 'bunch'], ['Cocktail cherries', 'jar'], ['Oranges', 'case'],
      ['Michelob Ultra', 'case (24)'], ['Modelo Especial', 'case (24)'], ['Bud Light', 'case (24)'], ['Coors Light', 'case (24)'], ['Miller Lite', 'case (24)'], ['Corona Extra', 'case (24)'], ['Budweiser', 'case (24)'], ['Busch Light', 'case (24)'], ['Natural Light', 'case (24)'], ['Miller High Life', 'case (24)'],
      ['Kim Crawford Sauvignon Blanc', 'bottle (750 ml)'], ['Bogle Vineyards Essential Red', 'bottle (750 ml)'], ['Decoy Sonoma Cabernet Sauvignon', 'bottle (750 ml)'], ['Barefoot White Zinfandel', 'bottle (750 ml)'], ['Bonanza Cabernet Sauvignon Lot 9', 'bottle (750 ml)'], ['Oyster Bay Sauvignon Blanc', 'bottle (750 ml)'], ['Apothic Red', 'bottle (750 ml)'], ['Santa Margherita Pinot Grigio', 'bottle (750 ml)'], ['Josh Cellars Pinot Noir', 'bottle (750 ml)'], ['La Crema Sonoma Coast Chardonnay', 'bottle (750 ml)'],
    ] },
    // Non-food supplies (RRA-058): each has its own tab at the top of Stock.
    { group: 'Cleaning and chemicals', items: [
      ['Dish machine detergent', 'jug'], ['Dish machine rinse aid', 'jug'], ['Sanitizer (quat)', 'jug'], ['Sanitizer test strips', 'pack'],
      ['Degreaser', 'jug'], ['Floor cleaner', 'jug'], ['Glass cleaner', 'bottle'], ['Oven and grill cleaner', 'can'], ['Fryer boil-out', 'pack'],
      ['Bleach', 'jug'], ['Hand soap refill', 'each'], ['Scrub pads and sponges', 'pack'], ['Trash bags, large', 'case'],
    ] },
    { group: 'Paper and to-go', items: [
      ['To-go clamshells', ''], ['Sauce cups, small', 'sleeve'], ['Sauce cups, large', 'sleeve'], ['Sauce cup lids, small', 'sleeve'], ['Sauce cup lids, large', 'sleeve'], ['Foil', ''], ['Napkins', ''], ['Wet wipes', ''],
      ['To-go bags', ''], ['Gloves', ''], ['Deli paper', ''],
      ['To-go cups and lids', 'sleeve'], ['Straws', 'box'], ['Plastic cutlery kits', 'case'], ['Food boats and basket liners', 'case'],
      ['Plastic wrap', 'roll'], ['Paper towels', 'case'], ['Toilet paper', 'case'],
    ] },
    { group: 'Smallwares', items: [
      ['Hotel pans (1/3, 1/6, 1/9)', 'each'], ['Sheet pans', 'each'], ['Ramekins', 'each'], ['Serving baskets', 'each'], ['Fryer baskets', 'each'],
      ['Tongs', 'each'], ['Spatulas', 'each'], ['Ladles and portion scoops', 'each'], ['Knives', 'each'], ['Cutting boards', 'each'],
      ['Squeeze bottles', 'each'], ['Food storage containers and lids', 'each'], ['Food thermometers', 'each'], ['Measuring cups and spoons', 'set'], ['Copper mugs', 'each'],
    ] },
    { group: 'Linens and uniforms', items: [
      ['Bar towels', 'bundle'], ['Kitchen side towels', 'bundle'], ['Aprons', 'each'], ['Chef coats', 'each'], ['Staff shirts', 'each'],
      ['Hats and hair nets', 'box'], ['Oven mitts', 'pair'], ['Cut-resistant gloves', 'each'], ['Floor mats', 'each'],
    ] },
  ],
  // Starter items a menu update split or renamed; removed from a phone's
  // list only while still untouched. [] for a new restaurant.
  replacedStock: ['Buffalo base (mild/medium/hot)', 'Unsweet tea (tea bags and sugar)', 'Sauce cups and lids', 'Sweet tea'],

  // Preset vendors (RRA-044, moved here in RRA-123): [name, what they carry].
  presetVendors: [
    ['Sysco', 'Broadline: proteins, frozen, dairy, produce, dry goods, paper'],
    ['US Foods', 'Broadline: proteins, frozen, dairy, produce, dry goods, paper'],
    ['Performance Foodservice (PFG)', 'Broadline: wings, burgers, fryer items, paper'],
    ['Gordon Food Service', 'Broadline and Gordon stores: frozen, dairy, dry goods'],
    ["Restaurant Depot", 'Cash and carry: anything short between deliveries'],
    ["Sam's Club", 'Cash and carry: drinks, snacks, paper, cleaning'],
    ['Coca-Cola bottler', 'Coca-Cola, Diet Coke, Sprite, Ginger Ale, juices'],
    ['Red Bull distributor', 'Red Bull, Red Bull Sugar Free'],
    ['Ecolab', 'Dish machine chemicals, sanitizer, cleaning'],
    ['Cintas', 'Linens, towels, aprons, mats, first aid'],
  ],

  // Point of sale choices asked for when a dish is added (RRA-108).
  posChoices: {
    wings: { title: 'Sauce', options: ['Mild Buffalo', 'Med Buffalo', 'Hot Buffalo', 'BBQ', 'Honey Sriracha', 'Honey Mustard', 'Plain'] },
    burger: { title: 'Temperature', options: ['Medium rare', 'Medium', 'Medium well', 'Well done'] },
    salad: { title: 'Dressing', options: ['Ranch', 'Blue Cheese', 'Honey Mustard', 'Italian', 'None'] },
  },
  // Job titles (RRA-160): the 25 most common restaurant jobs, offered in
  // Settings → People → Job titles and when adding staff. The team's own list
  // (settings.positions) keeps any custom titles; these are merged in once,
  // with no duplicates. Names on the right of jobTitleAliases count as the same
  // job as the name on the left, so Host and Host stand never both show.
  jobTitles: [
    'General manager', 'Assistant manager', 'Manager', 'Kitchen manager', 'Bar manager',
    'Shift lead', 'Executive chef', 'Chef', 'Sous chef', 'Line cook',
    'Grill cook', 'Fry cook', 'Prep cook', 'Dishwasher', 'Porter',
    'Server', 'Bartender', 'Barback', 'Busser', 'Host stand',
    'Food runner', 'Expo', 'Cashier', 'Delivery driver', 'Event coordinator',
  ],
  jobTitleAliases: {
    'Host stand': ['Host', 'Hostess', 'Host/Hostess'], 'Busser': ['Bus person', 'Busboy', 'Bus boy', 'Bus girl'], 'Server': ['Waiter', 'Waitress', 'Wait staff'],
    'Chef': ['Head chef'], 'Food runner': ['Runner'], 'Expo': ['Expediter', 'Expeditor'], 'Dishwasher': ['Dish washer', 'Dishwasher/Porter'], 'Barback': ['Bar back'],
    'General manager': ['GM'], 'Assistant manager': ['AM', 'Asst manager'], 'Line cook': ['Cook'], 'Delivery driver': ['Driver'], 'Event coordinator': ['Events coordinator'],
  },
  // My job duties (RRA-159): starter duties for each job, shown in the
  // Employee lounge. o = opening, s = during the shift, c = closing, w = side
  // work. The Admin and managers can rewrite any job's list in the app.
  jobDuties: {
    'General manager': {
      o: ['Walk the whole building: dining room, bar, kitchen, restrooms and outside.', "Check the schedule, call-outs and reservations, and set the day's staffing.", "Read yesterday's sales, labor and waste, and the manager log."],
      s: ['Lead the pre-shift meeting: specials, 86 items, goals and events.', 'Watch labor against sales and cut or call in staff as needed.', "Handle guest complaints, comps and anything a manager can't solve."],
      c: ["Approve the time sheets, tip pool and the day's sales report.", 'Make sure the safe, cash drawers and doors are locked and the alarm is set.'],
      w: ['Hire, train and coach the managers and team.', 'Own food cost, labor cost, inventory and vendor orders.', 'Keep health, alcohol and safety rules met and paperwork current.'],
    },
    'Assistant manager': {
      o: ['Count the opening cash drawers and check the safe.', 'Check that every station is set and staffed before doors open.'],
      s: ['Run the floor: help seat, run food and bus when it gets busy.', 'Approve voids, comps and discounts on the POS.', 'Cover breaks and step in for the manager when needed.'],
      c: ['Check side work before anyone clocks out.', 'Close out the drawers and write the manager log.'],
      w: ['Help with the schedule, ordering and new-hire training.'],
    },
    'Manager': {
      o: ['Unlock, turn off the alarm and check the building is safe and clean.', 'Count the cash drawers and check the schedule and reservations.', 'Hold the pre-shift meeting: specials, 86 items and section assignments.'],
      s: ['Touch every table, watch ticket times and help where the floor needs it.', 'Approve voids, comps and discounts, and handle guest problems.', 'Watch labor and send people home when it slows down.'],
      c: ['Check every closing checklist and side work before people clock out.', 'Close the drawers, run the sales report and lock up.'],
      w: ['Keep the schedule, time sheets and stock counts up to date.'],
    },
    'Kitchen manager': {
      o: ['Check the walk-in, freezer and line temperatures and write them down.', 'Check deliveries against the invoice: count, quality and temperature.', 'Set the prep list for each station.'],
      s: ['Watch ticket times and plate quality on the line.', 'Keep the 86 list current on the kitchen screen.'],
      c: ['Check the line is broken down, labeled and stored.', 'Count stock and build the next order.'],
      w: ['Track food cost and waste, and train the cooks.', 'Keep the kitchen ready for a health inspection every day.'],
    },
    'Bar manager': {
      o: ['Count the bar drawer and check the liquor, beer and wine stock.', 'Check the draft lines, ice and garnishes are ready.'],
      s: ['Run the bar: pour, check IDs and keep drinks moving.', 'Watch for guests who have had too much and stop service when needed.'],
      c: ['Count the bar stock and log empty bottles.', 'Close the bar drawer and lock the liquor up.'],
      w: ['Build the drink menu, set pours and track pour cost.', 'Place liquor, beer and wine orders and train bartenders.'],
    },
    'Shift lead': {
      o: ['Open with the manager and check every station is staffed.'],
      s: ['Lead the team on the floor and answer questions first.', 'Fill gaps: run food, bus, seat or cover a section.', 'Tell the manager about problems right away.'],
      c: ['Check side work and closing lists before people leave.'],
      w: ['Help train new team members on the floor.'],
    },
    'Executive chef': {
      o: ['Check deliveries, temperatures and the walk-in.', 'Taste the sauces and specials before service.'],
      s: ['Expedite or work the line on busy nights.', 'Check every plate looks like the recipe.'],
      c: ['Check the kitchen is clean and food is labeled, dated and stored.'],
      w: ['Write the menu, recipes and specials, and set plate costs.', 'Hire and train the kitchen team and run the kitchen schedule.', 'Keep food cost, waste and the health score where they should be.'],
    },
    'Chef': {
      o: ["Check the walk-in, temperatures and today's prep list.", 'Taste the sauces and check the line is stocked.'],
      s: ['Run the line: call tickets, watch times and check every plate.', 'Keep the 86 list current.'],
      c: ['Check the line is cleaned, food is wrapped, labeled and dated.', "Approve the cooks' hours and write the next prep list."],
      w: ['Keep recipes current and train cooks on them.', 'Count stock and help with orders.'],
    },
    'Sous chef': {
      o: ['Check the prep list and set up the line with the cooks.', 'Check temperatures and write them down.'],
      s: ['Work the busiest station or expedite.', 'Run the kitchen when the chef is off.'],
      c: ['Check the line breakdown and cleaning.'],
      w: ['Train cooks on recipes and plating.', 'Help with stock counts and ordering.'],
    },
    'Line cook': {
      o: ['Set up your station: fill the cold well, check sauces and tools.', "Check your station's temperatures and what you need from prep."],
      s: ['Cook every ticket to the recipe and the right temperature.', 'Call out when something is running low or out.', 'Keep your station clean as you go.'],
      c: ['Wrap, label and date everything and put it away.', 'Clean the grill, fryer or flat top and your station.'],
      w: ['Restock your station for the next shift.'],
    },
    'Grill cook': {
      o: ['Light and scrape the grill and set up burgers, chicken and buns.'],
      s: ['Cook burgers and meats to the temperature on the ticket.', 'Use a thermometer on chicken and anything ordered well done.'],
      c: ['Scrape, oil and clean the grill and empty the grease tray.'],
      w: ['Keep raw meat below ready-to-eat food in the cooler.'],
    },
    'Fry cook': {
      o: ['Turn on the fryers, check the oil level and quality.', 'Set up wings, fries, tots, tenders and sauces.'],
      s: ['Fry to the right time and shake and drain every basket.', 'Toss wings in the right sauce and call out when sauces run low.'],
      c: ['Filter or change the oil and clean the fryers.'],
      w: ['Keep the fry station floor dry and safe.'],
    },
    'Prep cook': {
      o: ["Read today's prep list and start with what the line needs first."],
      s: ['Cut, portion and make sauces to the recipe.', 'Label and date everything you make.', 'Use the oldest food first (first in, first out).'],
      c: ['Mark finished items done on the prep list.', 'Clean your boards, knives and prep area.'],
      w: ['Help put away deliveries and keep the walk-in organized.'],
    },
    'Dishwasher': {
      o: ['Fill the dish machine and check the soap, rinse and sanitizer.'],
      s: ['Keep plates, glasses and pans coming back to the line and bar.', 'Check the water temperature or sanitizer level during the shift.', 'Take out trash and keep the dish area dry.'],
      c: ['Drain and clean the dish machine and sinks.', 'Sweep and mop the kitchen floor.'],
      w: ['Put clean dishes where they belong.'],
    },
    'Porter': {
      o: ['Check the restrooms, entry and parking lot are clean.'],
      s: ['Empty trash and recycling and keep the dumpster area clean.', 'Check and restock the restrooms every hour.', 'Help carry deliveries and move heavy items.'],
      c: ['Deep clean floors, mats and drains.'],
      w: ['Report anything broken or unsafe to a manager.'],
    },
    'Server': {
      o: ['Set your section: tables, silverware, menus and condiments.', 'Learn the specials and the 86 list at the pre-shift meeting.'],
      s: ['Greet each table within a minute, take orders by seat and send them right away.', 'Check ID for every alcoholic drink when the app asks.', 'Pick up food when the app says Pick up, and check back after two bites.'],
      c: ['Close your checks and hand in your cash.', 'Clean and reset your section.'],
      w: ['Roll silverware, fill condiments and restock your station.'],
    },
    'Bartender': {
      o: ['Count your drawer and set up the bar: ice, garnishes, juices and glasses.', 'Check the draft lines and the bar stock.'],
      s: ['Check ID for every guest who looks under 40.', 'Pour to the recipe and measure every drink.', 'Make the bar tickets from servers in order.', 'Watch for guests who have had too much and tell a manager.'],
      c: ['Close your tabs and count your drawer.', 'Clean the bar, wash the mats and lock up the liquor.'],
      w: ['Cut garnishes and restock beer, wine and glasses.'],
    },
    'Barback': {
      o: ['Fill the ice bins and stock beer, wine and liquor.'],
      s: ['Keep the bartenders stocked with ice, glasses and garnishes.', 'Change kegs and bring up cases when the app counts them down.', 'Clear empty glasses and wipe the bar top.'],
      c: ['Wash glassware, empty the trash and wash the floor mats.'],
      w: ['Help count the bar stock.'],
    },
    'Busser': {
      o: ['Fill water pitchers, set tables and check the dining room is clean.'],
      s: ['Clear plates as guests finish and refill water.', 'Clear and reset tables right after guests leave, then tap Cleared.', 'Help run food when servers are busy.'],
      c: ['Wipe chairs and booths, and sweep the dining room.'],
      w: ['Restock napkins, silverware and to-go boxes.'],
    },
    'Host stand': {
      o: ['Check reservations, the waitlist and the seating layout.', 'Clean menus and the host stand.'],
      s: ['Greet every guest at the door with a smile.', "Seat guests evenly across the servers' sections.", 'Quote honest wait times and keep the waitlist current.'],
      c: ['Wipe the menus, stock the host stand and tidy the entry.'],
      w: ['Answer the phone and take to-go orders.'],
    },
    'Food runner': {
      o: ['Set up trays, stands and the pass with plates and tickets.'],
      s: ["Run food to the right seat as soon as it's up.", 'Check every plate against the ticket before it leaves.', 'Bring back dirty plates on the way.'],
      c: ['Clean trays and the pass.'],
      w: ['Restock sauce cups, napkins and silverware at the pass.'],
    },
    'Expo': {
      o: ['Set up the pass with ramekins, garnishes and tickets.'],
      s: ['Call tickets to the line and watch the timers.', 'Check every plate is complete and right before it leaves.', 'Bump tickets so the server gets Pick up.'],
      c: ['Clean the pass and heat lamps.'],
      w: ['Tell the chef about plates that came back.'],
    },
    'Cashier': {
      o: ['Count your drawer with a manager.'],
      s: ['Ring up to-go and counter orders and take payments.', 'Check every to-go order before it goes out the door.', 'Answer the phone and take orders.'],
      c: ['Count your drawer and hand in the cash with a manager.'],
      w: ['Restock to-go bags, boxes, cups and napkins.'],
    },
    'Delivery driver': {
      o: ['Check your car, phone and delivery bags.'],
      s: ['Check every order against the ticket before you leave.', 'Keep hot food hot and cold food cold on the way.', 'Drive safely and be polite at the door.'],
      c: ['Hand in cash and tips with a manager.'],
      w: ['Clean the delivery bags.'],
    },
    'Event coordinator': {
      o: ['Check upcoming events in Events (BEOs) and confirm details with the guest.'],
      s: ['Share the event sheet with the kitchen, bar and managers.', 'Set up the room and check the timeline during the event.'],
      c: ['Make sure the room is reset and the event check is closed.'],
      w: ['Book new parties and take deposits.'],
    },
  },
  // Dish changes (RRA-149): condiments and toppings a server can mark NO, ADD
  // or EXTRA on a dish, with each one's price (0 = free): ADD and EXTRA add it
  // to the dish, NO takes it off. Starter prices only: the Admin changes the
  // list and prices in Settings → Point of sale → Toppings.
  posToppings: [
    // [English name, price, Spanish name (RRA-157, optional)]
    ['Cheese', 1.00, 'Queso'], ['Bacon', 2.00, 'Tocino'], ['Mushrooms', 1.00, 'Champiñones'], ['Jalapeños', 0.75, 'Jalapeños'], ['Onions', 0.50, 'Cebolla'],
    ['Grilled onions', 0.75, 'Cebolla asada'], ['Tomato', 0.50, 'Tomate'], ['Lettuce', 0, 'Lechuga'], ['Pickles', 0, 'Pepinillos'], ['Sour cream', 0.75, 'Crema agria'],
    ['Salsa', 0.50, 'Salsa'], ['Guacamole', 1.50, 'Guacamole'], ['Mayo', 0, 'Mayonesa'], ['Mustard', 0, 'Mostaza'], ['Ketchup', 0, 'Kétchup'],
  ],
  // What comes on each dish: only these can be marked NO (or EXTRA); anything
  // else can only be ADDed (Gaylan, 2026-11-26). Dish name → toppings; a dish
  // not listed uses its menu section below. Toppings named in a dish's
  // ingredients in Recipes count too. Starter guesses: edit freely.
  posToppingsOn: {
    'Black & Blue with Fries': ['Cheese', 'Lettuce', 'Tomato', 'Onions'],
    'Veggie Burger with Fries': ['Cheese', 'Lettuce', 'Tomato', 'Onions', 'Pickles'],
    'Hot Dog Basket with Side': [],
    'BLT with Fries': ['Bacon', 'Lettuce', 'Tomato', 'Mayo'],
    'Grilled Cheese with Fries': ['Cheese'],
    'Grilled Cheese Club with Fries': ['Cheese', 'Bacon', 'Lettuce', 'Tomato', 'Mayo'],
    'The Grilled Cheese Incident with Fries': ['Cheese'],
    'Philly Melt with Fries': ['Cheese', 'Grilled onions'],
    'Bacon Ranch Chicken Sandwich with Fries': ['Bacon', 'Cheese', 'Lettuce', 'Tomato'],
    'Quesadilla': ['Cheese', 'Sour cream', 'Salsa'],
    'Single Taco (No Side)': ['Cheese', 'Lettuce', 'Tomato', 'Sour cream'],
    'Taco Basket with Side': ['Cheese', 'Lettuce', 'Tomato', 'Sour cream'],
    'Nachos (Half)': ['Cheese', 'Jalapeños', 'Sour cream', 'Salsa'],
    'Nachos (Full)': ['Cheese', 'Jalapeños', 'Sour cream', 'Salsa'],
    'Classic Burger with Fries': ['Cheese', 'Lettuce', 'Tomato', 'Onions', 'Pickles'],
  },
  // Menu section → what usually comes on its dishes, for dishes not listed above.
  posToppingsBySection: {
    Burgers: ['Cheese', 'Lettuce', 'Tomato', 'Onions', 'Pickles'],
    Sandwiches: ['Lettuce', 'Tomato', 'Mayo'],
    Salads: ['Cheese', 'Tomato', 'Onions'],
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
  // Dish pictures sent by Gaylan (2026-11-24), in assets/menu/. Key = menu name.
  menuPhotos: {
    "10 Jumbo Wings (Bone-In)": "10-jumbo-wings-bone-in.jpg",
    "15 Jumbo Wings (Bone-In)": "15-jumbo-wings-bone-in.jpg",
    "20 Jumbo Wings (Bone-In)": "20-jumbo-wings-bone-in.jpg",
    "30 Jumbo Wings (Bone-In)": "30-jumbo-wings-bone-in.jpg",
    "5 Jumbo Wings (Bone-In)": "5-jumbo-wings-bone-in.jpg",
    "50 Jumbo Wings (Bone-In)": "50-jumbo-wings-bone-in.jpg",
    "BBQ Sauce Large": "bbq-sauce-cup.jpg",
    "BBQ Sauce Small": "bbq-sauce-cup.jpg",
    "BLT with Fries": "blt-with-fries.jpg",
    "Bacon Ranch Chicken Sandwich with Fries": "bacon-ranch-chicken-sandwich-with-fries.jpg",
    "Black & Blue with Fries": "black-blue-with-fries.jpg",
    "Blue Cheese Large": "blue-cheese-sauce-cup.jpg",
    "Blue Cheese Small": "blue-cheese-sauce-cup.jpg",
    "Bottle Water": "bottle-water.jpg",
    "Buffalo Chicken Sandwich (or Wrap) with Fries": "buffalo-chicken-sandwich-or-wrap-with-fries.jpg",
    "Buffalo Salad": "buffalo-salad.jpg",
    "Caesar Salad": "caesar-salad.jpg",
    "Chef Salad": "chef-salad.jpg",
    "Chicken Finger Basket with Fries": "chicken-finger-basket-with-fries.jpg",
    "Classic Burger with Fries": "classic-burger-with-fries.jpg",
    "Coca-Cola": "coca-cola.jpg",
    "Cranberry Juice": "cranberry-juice.jpg",
    "Diet Coke": "diet-coke.jpg",
    "Farmhouse Burger with Fries": "farmhouse-burger-with-fries.jpg",
    "Fried Mushrooms": "fried-mushrooms.jpg",
    "Fried Pickles": "fried-pickles.jpg",
    "Fries": "fries.jpg",
    "Ginger Ale": "ginger-ale.jpg",
    "Grilled Cheese Club with Fries": "grilled-cheese-club-with-fries.jpg",
    "Grilled Cheese with Fries": "grilled-cheese-with-fries.jpg",
    "Honey Mustard Large": "honey-mustard-sauce-cup.jpg",
    "Honey Mustard Small": "honey-mustard-sauce-cup.jpg",
    "Honey Sriracha Large": "honey-sriracha-sauce-cup.jpg",
    "Honey Sriracha Small": "honey-sriracha-sauce-cup.jpg",
    "Hot Buffalo Large": "hot-buffalo-sauce-cup.jpg",
    "Hot Buffalo Small": "hot-buffalo-sauce-cup.jpg",
    "Hot Dog Basket with Side": "hot-dog-basket-with-side.jpg",
    "House Salad": "house-salad.jpg",
    "Italian Dressing Large": "italian-dressing-cup.jpg",
    "Italian Dressing Small": "italian-dressing-cup.jpg",
    "Ketchup Large": "ketchup-cup.jpg",
    "Ketchup Small": "ketchup-cup.jpg",
    "Mayo Large": "mayo-cup.jpg",
    "Mayo Small": "mayo-cup.jpg",
    "Med Buffalo Large": "buffalo-sauce-cup.jpg",
    "Med Buffalo Small": "buffalo-sauce-cup.jpg",
    "Mild Buffalo Large": "buffalo-sauce-cup.jpg",
    "Mild Buffalo Small": "buffalo-sauce-cup.jpg",
    "Mile High Club with Fries": "mile-high-club-with-fries.jpg",
    "Mozzarella Sticks": "mozzarella-sticks.jpg",
    "Mustard Small": "mustard-cup.jpg",
    "Nachos (Full)": "nachos-full.jpg",
    "Nachos (Half)": "nachos-half.jpg",
    "Orange Juice": "orange-juice.jpg",
    "Philly Melt with Fries": "philly-melt-with-fries.jpg",
    "Pineapple Juice": "pineapple-juice.jpg",
    "Quesadilla": "quesadilla.jpg",
    "Quesadilla Burger with Fries": "quesadilla-burger-with-fries.jpg",
    "Ranch Large": "ranch-sauce-cup.jpg",
    "Ranch Small": "ranch-sauce-cup.jpg",
    "Red Bull": "red-bull.jpg",
    "Red Bull Sugar Free": "red-bull-sugar-free.jpg",
    "Side Salad": "side-salad.jpg",
    "Single Taco (No Side)": "single-taco-no-side.jpg",
    "Some Like it Hot with Fries": "some-like-it-hot-with-fries.jpg",
    "Sour Cream Large": "sour-cream-cup.jpg",
    "Sour Cream Small": "sour-cream-cup.jpg",
    "Sprite": "sprite.jpg",
    "Sweet Tea": "sweet-tea.jpg",
    "Taco Basket with Side": "taco-basket-with-side.jpg",
    "Tex Mex Salad": "tex-mex-salad.jpg",
    "The Bootlegger with Fries": "the-bootlegger-with-fries.jpg",
    "The Grilled Cheese Incident with Fries": "the-grilled-cheese-incident-with-fries.jpg",
    "Tortilla Chips & Salsa": "tortilla-chips-salsa.jpg",
    "Tots": "tots.jpg",
    "Unsweet Tea": "unsweet-tea.jpg",
    "Veggie Burger with Fries": "veggie-burger-with-fries.jpg",
    "Wing Basket": "wing-basket.jpg",
    // Cocktails (RRA-143): drawn pictures made for the app (no outside photos), until
    // Gaylan replaces them with photos of Bootleggers' own drinks in Recipes.
    "Margarita": "margarita.jpg",
    "Long Island Iced Tea": "long-island-iced-tea.jpg",
    "Rum & Coke": "rum-and-coke.jpg",
    "Vodka Cranberry": "vodka-cranberry.jpg",
    "Screwdriver": "screwdriver.jpg",
    "Whiskey & Coke": "whiskey-and-coke.jpg",
    "Old Fashioned": "old-fashioned.jpg",
    "Moscow Mule": "moscow-mule.jpg",
    "Mojito": "mojito.jpg",
    "Whiskey Sour": "whiskey-sour.jpg",
    "Cosmopolitan": "cosmopolitan.jpg",
    "Paloma": "paloma.jpg",
  },

  // Coupons (RRA-122): the name on top of the coupon picture, the line under
  // it, and the short tag inside every coupon's QR code or barcode. The tag
  // must be different for every restaurant, so their coupons can't be swapped.
  coupon: { title: 'Bootleggers', tagline: 'Bar and Grill', tag: 'BLG' },

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
  // Radio stations (RRA-109). alts: backup addresses tried when the first won't play.
  radio: [
    { name: 'Boot Liquor (SomaFM)', genre: 'Americana and roots', url: 'https://ice1.somafm.com/bootliquor-128-mp3', alts: ['https://ice2.somafm.com/bootliquor-128-mp3', 'https://ice4.somafm.com/bootliquor-128-mp3', 'https://ice6.somafm.com/bootliquor-128-mp3'] },
    { name: 'Left Coast 70s (SomaFM)', genre: '70s rock', url: 'https://ice1.somafm.com/seventies-128-mp3', alts: ['https://ice2.somafm.com/seventies-128-mp3', 'https://ice4.somafm.com/seventies-128-mp3', 'https://ice6.somafm.com/seventies-128-mp3'] },
    { name: 'Underground 80s (SomaFM)', genre: '80s', url: 'https://ice1.somafm.com/u80s-128-mp3', alts: ['https://ice2.somafm.com/u80s-128-mp3', 'https://ice4.somafm.com/u80s-128-mp3', 'https://ice6.somafm.com/u80s-128-mp3'] },
    { name: 'Groove Salad (SomaFM)', genre: 'Chill', url: 'https://ice1.somafm.com/groovesalad-128-mp3', alts: ['https://ice2.somafm.com/groovesalad-128-mp3', 'https://ice4.somafm.com/groovesalad-128-mp3', 'https://ice6.somafm.com/groovesalad-128-mp3'] },
    { name: 'Secret Agent (SomaFM)', genre: 'Lounge', url: 'https://ice1.somafm.com/secretagent-128-mp3', alts: ['https://ice2.somafm.com/secretagent-128-mp3', 'https://ice4.somafm.com/secretagent-128-mp3', 'https://ice6.somafm.com/secretagent-128-mp3'] },
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
