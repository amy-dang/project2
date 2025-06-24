// Cute Cafe Game JavaScript
const drinks = [
  { name: 'Latte', emoji: '<img src="latte-removebg-preview.png" alt="Latte" style="height:1.4em;vertical-align:middle;">', ingredients: ['Espresso', 'Milk'], price: 3.5 },
  { name: 'Cappuccino', emoji: '☕', ingredients: ['Espresso', 'Milk Foam'], price: 4.0 },
  { name: 'Matcha Latte', emoji: '🍵', ingredients: ['Matcha', 'Milk'], price: 4.5 },
  { name: 'Strawberry Smoothie', emoji: '<img src="strawberry_smoothie-removebg-preview.png" alt="Strawberry Smoothie" style="height:1.4em;vertical-align:middle;">', ingredients: ['Strawberry', 'Milk', 'Ice'], price: 5.0 },
  { name: 'Hot Chocolate', emoji: '<img src="image-removebg-preview.png" alt="Hot Chocolate" style="height:1.4em;vertical-align:middle;">', ingredients: ['Cocoa', 'Milk'], price: 3.0 },
];

const pastries = [
  { name: 'Croissant', emoji: '🥐', ingredients: ['Dough', 'Butter'], price: 2.5 },
  { name: 'Cupcake', emoji: '🧁', ingredients: ['Batter', 'Frosting'], price: 3.0 },
  { name: 'Donut', emoji: '🍩', ingredients: ['Dough', 'Icing'], price: 2.8 },
  { name: 'Macaron', emoji: '<img src="macaron-removebg.png" alt="Macaron" style="height:1.4em;vertical-align:middle;">', ingredients: ['Almond Flour', 'Filling'], price: 3.2 },
];

const customerEmojis = ['🐰', '🐱', '🐻', '🦊', '🐥', '🐶', '🦄', '🐧'];

// Ingredient to emoji mapping for process visuals
const ingredientEmojis = {
  'Espresso': '☕',
  'Milk': '🥛',
  'Milk Foam': '🫧',
  'Matcha': '🍵',
  'Strawberry': '🍓',
  'Ice': '🧊',
  'Cocoa': '🍫'
};

// Ingredient emoji mapping for pastries
const pastryIngredientEmojis = {
  'Dough': '🥯',
  'Butter': '🧈',
  'Batter': '🥣',
  'Frosting': '🍥',
  'Icing': '🍥',
  'Almond Flour': '🌰',
  'Filling': '🍬'
};

let currentOrder = null;
let madeDrink = null;
let makeStep = 0;
let makingDrink = null;
let satisfaction = 1.0;
let satisfactionInterval = null;
let isPaused = false;
let money = 0;

function pickRandomOrder() {
  // 50% chance for drink, 50% for pastry
  if (Math.random() < 0.5) {
    const drink = drinks[Math.floor(Math.random() * drinks.length)];
    return { ...drink, type: 'drink' };
  } else {
    const pastry = pastries[Math.floor(Math.random() * pastries.length)];
    return { ...pastry, type: 'pastry' };
  }
}

function pickRandomCustomerEmoji() {
  return customerEmojis[Math.floor(Math.random() * customerEmojis.length)];
}

function showMenu() {
  const menu = document.getElementById('drink-menu');
  menu.innerHTML = '<b>Drinks</b><br>' + drinks.map(d => `<div>${d.emoji} <b>${d.name}</b> <span style="font-size:0.9em;">(${d.ingredients.join(', ')})</span> <span style='color:#5a3e36;font-weight:bold;'>$${d.price.toFixed(2)}</span></div>`).join('');
  // Add pastries to the new pastry-menu box
  const pastryMenu = document.getElementById('pastry-menu');
  if (pastryMenu) {
    pastryMenu.innerHTML = '<b>Pastries</b><br>' + pastries.map(p => `<div>${p.emoji} <b>${p.name}</b> <span style="font-size:0.9em;">(${p.ingredients.join(', ')})</span> <span style='color:#5a3e36;font-weight:bold;'>$${p.price.toFixed(2)}</span></div>`).join('');
  }
  const select = document.getElementById('drink-select');
  select.innerHTML = drinks.map((d, i) => `<option value="${i}">${d.name}</option>`).join('');
  const pastrySelect = document.getElementById('pastry-select');
  if (pastrySelect) {
    pastrySelect.innerHTML = pastries.map((p, i) => `<option value="${i}">${p.name}</option>`).join('');
  }
}

function startSatisfactionBar(reset = true) {
  if (reset) satisfaction = 1.0;
  updateSatisfactionBar();
  if (satisfactionInterval) clearInterval(satisfactionInterval);
  if (isPaused) return;
  satisfactionInterval = setInterval(() => {
    if (isPaused) return;
    satisfaction -= 0.01;
    if (satisfaction < 0) satisfaction = 0;
    updateSatisfactionBar();
    if (satisfaction === 0) {
      clearInterval(satisfactionInterval);
      document.getElementById('result').textContent = 'The customer left unhappy! 😢';
      document.getElementById('customer-order').innerHTML = '<span style="color:#ff6f61;">That took forever! I\'m never coming back! 😠</span>';
      setTimeout(newCustomer, 2000);
    }
  }, 150);
}

function updateSatisfactionBar() {
  const bar = document.getElementById('satisfaction-bar');
  bar.style.width = Math.round(satisfaction * 100) + '%';
  if (satisfaction > 0.6) {
    bar.style.background = 'linear-gradient(90deg, #ffb3c6 0%, #ff8fab 100%)';
  } else if (satisfaction > 0.3) {
    bar.style.background = 'linear-gradient(90deg, #ffe066 0%, #ffb347 100%)';
  } else {
    bar.style.background = 'linear-gradient(90deg, #ff8fab 0%, #ff6f61 100%)';
  }
}

function stopSatisfactionBar() {
  if (satisfactionInterval) clearInterval(satisfactionInterval);
}

function newCustomer() {
  currentOrder = pickRandomOrder();
  const emoji = pickRandomCustomerEmoji();
  document.getElementById('customer-emoji').textContent = emoji;
  let orderText = '';
  if (currentOrder.type === 'drink') {
    orderText = `I'd like a <b>${currentOrder.emoji} ${currentOrder.name}</b>!`;
  } else {
    // Fun pastry requests
    const pastryPhrases = [
      `Make me a <b>${currentOrder.emoji} ${currentOrder.name}</b>!`,
      `I'd love a <b>${currentOrder.emoji} ${currentOrder.name}</b>!`,
      `Can I get a <b>${currentOrder.emoji} ${currentOrder.name}</b>?`,
      `One <b>${currentOrder.emoji} ${currentOrder.name}</b>, please!`,
      `Could you bake a <b>${currentOrder.emoji} ${currentOrder.name}</b> for me?`
    ];
    orderText = pastryPhrases[Math.floor(Math.random() * pastryPhrases.length)];
  }
  document.getElementById('customer-order').innerHTML = orderText;
  document.getElementById('result').textContent = '';
  document.getElementById('serve-btn').disabled = true;
  document.getElementById('serve-pastry-btn').disabled = true; // Disable serve pastry button for new customers
  madeDrink = null;
  document.getElementById('make-steps').style.display = 'none';
  document.getElementById('make-pastry-steps').style.display = 'none';
  stopSatisfactionBar();
  startSatisfactionBar(true);

  // Highlight and enable only the relevant form
  const makeArea = document.getElementById('make-area');
  const makePastryArea = document.getElementById('make-pastry-area');
  if (currentOrder.type === 'drink') {
    makeArea.style.boxShadow = '0 0 0 4px #ffe066';
    makePastryArea.style.boxShadow = '';
    document.getElementById('drink-select').disabled = false;
    document.getElementById('start-make-btn').disabled = false;
    document.getElementById('pastry-select').disabled = true;
    document.getElementById('start-make-pastry-btn').disabled = true;
  } else {
    makeArea.style.boxShadow = '';
    makePastryArea.style.boxShadow = '0 0 0 4px #ffe066';
    document.getElementById('drink-select').disabled = true;
    document.getElementById('start-make-btn').disabled = true;
    document.getElementById('pastry-select').disabled = false;
    document.getElementById('start-make-pastry-btn').disabled = false;
  }
}

function showMakeSteps(drink) {
  const stepsDiv = document.getElementById('make-steps');
  stepsDiv.innerHTML = '';
  stepsDiv.style.display = 'block';
  makeStep = 0;
  makingDrink = drink;
  // Add a process visual area
  let processDiv = document.createElement('div');
  processDiv.id = 'process-visual';
  processDiv.style.fontSize = '3em';
  processDiv.style.margin = '16px 0';
  stepsDiv.appendChild(processDiv);
  showNextStep();
}

function showNextStep() {
  const stepsDiv = document.getElementById('make-steps');
  const processDiv = document.getElementById('process-visual');
  // Show current process as a cup with ingredients inside
  if (processDiv && makingDrink) {
    let visuals = '🥤'; // Use a cup as the base
    if (makeStep > 0) {
      visuals = '🥤';
      for (let i = 0; i < makeStep; i++) {
        const ing = makingDrink.ingredients[i];
        visuals += ' ' + (ingredientEmojis[ing] || '❓');
      }
    }
    if (makeStep === makingDrink.ingredients.length) {
      if (makingDrink.name === 'Strawberry Smoothie') {
        visuals = '<img src="strawberry_smoothie-removebg-preview.png" alt="Strawberry Smoothie" style="height:2.4em;vertical-align:middle;">';
      } else if (makingDrink.name === 'Hot Chocolate') {
        visuals = '<img src="image-removebg-preview.png" alt="Hot Chocolate" style="height:2.4em;vertical-align:middle;">';
      } else if (makingDrink.name === 'Latte') {
        visuals = '<img src="latte-removebg-preview.png" alt="Latte" style="height:2.4em;vertical-align:middle;">';
      } else {
        visuals = makingDrink.emoji;
      }
    }
    processDiv.innerHTML = visuals;
  }
  // Do not hide the make-steps area after making the drink
  stepsDiv.innerHTML = '';
  if (processDiv) stepsDiv.appendChild(processDiv);
  if (!makingDrink) return;
  if (makeStep < makingDrink.ingredients.length) {
    const ing = makingDrink.ingredients[makeStep];
    const stepDiv = document.createElement('div');
    stepDiv.innerHTML = `Add <b>${ing}</b> <span style="font-size:1.5em;">${ingredientEmojis[ing] || '❓'}</span> <button id="add-ing-btn">Add</button>`;
    stepsDiv.appendChild(stepDiv);
    document.getElementById('add-ing-btn').onclick = function() {
      makeStep++;
      showNextStep();
    };
  } else {
    if (processDiv) {
      if (makingDrink.name === 'Strawberry Smoothie') {
        processDiv.innerHTML = '<img src="strawberry_smoothie-removebg-preview.png" alt="Strawberry Smoothie" style="height:2.4em;vertical-align:middle;">';
      } else if (makingDrink.name === 'Hot Chocolate') {
        processDiv.innerHTML = '<img src="image-removebg-preview.png" alt="Hot Chocolate" style="height:2.4em;vertical-align:middle;">';
      } else if (makingDrink.name === 'Latte') {
        processDiv.innerHTML = '<img src="latte-removebg-preview.png" alt="Latte" style="height:2.4em;vertical-align:middle;">';
      } else {
        processDiv.textContent = makingDrink.emoji;
      }
    }
    stepsDiv.innerHTML += `<span style="color:green;">All ingredients added!</span>`;
    madeDrink = makingDrink; // Set the madeDrink to the drink that was just made
    document.getElementById('made-drink').innerHTML = `You made a ${makingDrink.name === 'Strawberry Smoothie' ? '<img src=\'strawberry_smoothie-removebg-preview.png\' alt=\'Strawberry Smoothie\' style=\'height:1.4em;vertical-align:middle;\'>' : makingDrink.name === 'Hot Chocolate' ? '<img src=\'image-removebg-preview.png\' alt=\'Hot Chocolate\' style=\'height:1.4em;vertical-align:middle;\'>' : makingDrink.name === 'Latte' ? '<img src=\'latte-removebg-preview.png\' alt=\'Latte\' style=\'height:1.4em;vertical-align:middle;\'>' : makingDrink.emoji} ${makingDrink.name}!`;
    document.getElementById('serve-btn').disabled = false;
    // Do not hide make-steps here; keep it open until served
  }
}

// PASTRY MAKING LOGIC
function showMakePastrySteps(pastry) {
  const stepsDiv = document.getElementById('make-pastry-steps');
  stepsDiv.innerHTML = '';
  stepsDiv.style.display = 'block';
  let makeStep = 0;
  let makingPastry = pastry;
  let processDiv = document.createElement('div');
  processDiv.id = 'process-pastry-visual';
  processDiv.style.fontSize = '3em';
  processDiv.style.margin = '16px 0';
  stepsDiv.appendChild(processDiv);
  showNextPastryStep();
  function showNextPastryStep() {
    if (processDiv && makingPastry) {
      let visuals = '🍽️';
      if (makeStep > 0) {
        visuals = '🍽️';
        for (let i = 0; i < makeStep; i++) {
          const ing = makingPastry.ingredients[i];
          visuals += ' ' + (pastryIngredientEmojis[ing] || '❓');
        }
      }
      if (makeStep === makingPastry.ingredients.length) {
        visuals = makingPastry.emoji;
      }
      processDiv.textContent = visuals;
    }
    stepsDiv.innerHTML = '';
    if (processDiv) stepsDiv.appendChild(processDiv);
    if (!makingPastry) return;
    if (makeStep < makingPastry.ingredients.length) {
      const ing = makingPastry.ingredients[makeStep];
      const stepDiv = document.createElement('div');
      stepDiv.innerHTML = `Add <b>${ing}</b> <span style="font-size:1.5em;">${pastryIngredientEmojis[ing] || '❓'}</span> <button id="add-pastry-ing-btn">Add</button>`;
      stepsDiv.appendChild(stepDiv);
      document.getElementById('add-pastry-ing-btn').onclick = function() {
        makeStep++;
        showNextPastryStep();
      };
      // Disable serve pastry button while making
      document.getElementById('serve-pastry-btn').disabled = true;
    } else {
      if (processDiv) processDiv.textContent = makingPastry.emoji;
      stepsDiv.innerHTML += `<span style="color:green;">All ingredients added!</span>`;
      document.getElementById('made-pastry').textContent = `You made a ${makingPastry.emoji} ${makingPastry.name}!`;
      madeDrink = makingPastry; // Set madeDrink to the pastry for serving
      document.getElementById('serve-pastry-btn').disabled = false;
    }
  }
}

// Add event listener for Serve Pastry button
// This is a copy of the serve drink logic, but for pastries
// It only works if the current order is a pastry

document.getElementById('serve-pastry-btn').addEventListener('click', function() {
  if (!madeDrink || !currentOrder || currentOrder.type !== 'pastry') return;
  stopSatisfactionBar();
  let correct = false;
  if (madeDrink.name === currentOrder.name) correct = true;
  if (correct) {
    document.getElementById('result-pastry').textContent = 'Yay! The customer is happy! 🎉';
    const happyResponses = [
      "Yay! Thank you so much! 🥰",
      "This is perfect! You're the best! 😋",
      "Delicious! I'll come back soon! 🧁",
      "So cute and tasty! Thank you! 💖",
      "You made my day! ☀️"
    ];
    const response = happyResponses[Math.floor(Math.random() * happyResponses.length)];
    document.getElementById('customer-order').innerHTML = `<span style='color:#ff8fab;'>${response}</span>`;
    money += currentOrder.price;
    document.getElementById('money').textContent = money.toFixed(2);
  } else {
    document.getElementById('result-pastry').textContent = 'Oops! That wasn\'t their order. 😢';
  }
  document.getElementById('made-drink').textContent = '';
  document.getElementById('made-pastry').textContent = '';
  document.getElementById('make-steps').style.display = 'none';
  document.getElementById('make-pastry-steps').style.display = 'none';
  setTimeout(newCustomer, 2000);
});

// Enable/disable serve-pastry-btn when pastry is made
function enableServePastryButton(enable) {
  document.getElementById('serve-pastry-btn').disabled = !enable;
}

// When a new customer arrives, disable the serve pastry button
const origNewCustomer = newCustomer;
newCustomer = function() {
  enableServePastryButton(false);
  document.getElementById('result-pastry').textContent = '';
  origNewCustomer();
};

// DEBUG: Test pickRandomOrder 100 times to see if pastries are picked
(function testRandomOrders() {
  let pastryCount = 0;
  let drinkCount = 0;
  for (let i = 0; i < 100; i++) {
    const order = (function() {
      const allItems = drinks.map(d => ({...d, type: 'drink'})).concat(pastries.map(p => ({...p, type: 'pastry'})));
      const pick = allItems[Math.floor(Math.random() * allItems.length)];
      return pick;
    })();
    if (order.type === 'pastry') pastryCount++;
    if (order.type === 'drink') drinkCount++;
  }
  console.log('Test: Pastry orders:', pastryCount, 'Drink orders:', drinkCount);
})();

// Initialize game
showMenu();
newCustomer();
