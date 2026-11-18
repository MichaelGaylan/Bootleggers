// Preinstalled starter stock list for Bootleggers Augusta (RRA-024).
// DRAFT from the online menu; ingredients are inferred from item names and
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
    ['Ranch', ''], ['Blue Cheese', ''], ['BBQ', ''], ['Honey Mustard', ''], ['Honey Sriracha', ''], ['Buffalo base (mild/medium/hot)', ''],
    ['Italian', ''], ['Caesar dressing', ''], ['Ketchup', ''], ['Mayo', ''], ['Mustard', ''], ['Salsa', ''], ['House wing sauces', '', 'See House recipes'],
  ] },
  { group: 'Non-alcoholic beverages', items: [
    ['Bottled water', ''], ['Coca-Cola', ''], ['Diet Coke', ''], ['Sprite', ''], ['Ginger Ale', ''], ['Cranberry juice', ''],
    ['Orange juice', ''], ['Pineapple juice', ''], ['Red Bull', ''], ['Red Bull Sugar Free', ''], ['Sweet tea', ''], ['Unsweet tea (tea bags and sugar)', ''],
  ] },
  { group: 'Bar', items: [
    ['Draft beer, bottles and cans, liquor, wine, mixers, garnishes', '', 'To fill in: not on the website'],
  ] },
  { group: 'Paper and to-go', items: [
    ['To-go clamshells', ''], ['Sauce cups and lids', ''], ['Foil', ''], ['Napkins', ''], ['Wet wipes', ''],
    ['To-go bags', ''], ['Gloves', ''], ['Deli paper', ''],
  ] },
];
