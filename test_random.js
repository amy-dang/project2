// Standalone test for pickRandomOrder logic
const drinks = [
  { name: 'Latte' },
  { name: 'Cappuccino' },
  { name: 'Matcha Latte' },
  { name: 'Strawberry Smoothie' },
  { name: 'Hot Chocolate' },
];
const pastries = [
  { name: 'Croissant' },
  { name: 'Cupcake' },
  { name: 'Donut' },
  { name: 'Macaron' },
];

let pastryCount = 0;
let drinkCount = 0;
for (let i = 0; i < 1000; i++) {
  const allItems = drinks.map(d => ({...d, type: 'drink'})).concat(pastries.map(p => ({...p, type: 'pastry'})));
  const pick = allItems[Math.floor(Math.random() * allItems.length)];
  if (pick.type === 'pastry') pastryCount++;
  if (pick.type === 'drink') drinkCount++;
}
console.log('Test: Pastry orders:', pastryCount, 'Drink orders:', drinkCount);
