// Preinstalled starter stock list for Bootleggers Augusta (RRA-024).
// DRAFT from the menu (updated 2026-11-19 from the Host's full menu); ingredients are inferred from item names and
// wait for chef review. Par levels are left for the manager (RRA-006 hook).

export const STOCK_STATUS = 'Draft from the online menu. Waiting for chef review.';

export const STARTER_STOCK = [
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
    ['Squeeze bottles', 'each'], ['Food storage containers and lids', 'each'], ['Food thermometers', 'each'], ['Measuring cups and spoons', 'set'],
  ] },
  { group: 'Linens and uniforms', items: [
    ['Bar towels', 'bundle'], ['Kitchen side towels', 'bundle'], ['Aprons', 'each'], ['Chef coats', 'each'], ['Staff shirts', 'each'],
    ['Hats and hair nets', 'box'], ['Oven mitts', 'pair'], ['Cut-resistant gloves', 'each'], ['Floor mats', 'each'],
  ] },
];

// Tabs at the top of Stock (RRA-058). Food covers every group not listed here.
export const NON_FOOD = ['Cleaning and chemicals', 'Paper and to-go', 'Smallwares', 'Linens and uniforms'];
export const STOCK_TABS = [['all', 'All'], ['food', 'Food and bar'], ['Cleaning and chemicals', 'Cleaning'], ['Paper and to-go', 'Paper and to-go'], ['Smallwares', 'Smallwares'], ['Linens and uniforms', 'Linens and uniforms']];
export const isFood = (group) => !NON_FOOD.includes(group);

// Starter items the 2026-11-19 menu update split or renamed. applyMenu()
// removes them from a phone's list only while they are still untouched.
export const REPLACED_STOCK = ['Buffalo base (mild/medium/hot)', 'Unsweet tea (tea bags and sugar)', 'Sauce cups and lids', 'Sweet tea'];
