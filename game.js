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
  { name: 'Macaron', emoji: '🩷', ingredients: ['Almond Flour', 'Filling'], price: 3.2 },
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
  return drinks[Math.floor(Math.random() * drinks.length)];
}

function pickRandomCustomerEmoji() {
  return customerEmojis[Math.floor(Math.random() * customerEmojis.length)];
}

function showMenu() {
  const menu = document.getElementById('drink-menu');
  menu.innerHTML = '<b>Drinks</b><br>' + drinks.map(d => `<div>${d.emoji} <b>${d.name}</b> <span style="font-size:0.9em;">(${d.ingredients.join(', ')})</span> <span style='color:#5a3e36;font-weight:bold;'>$${d.price.toFixed(2)}</span></div>`).join('');
  menu.innerHTML += '<br><b>Pastries</b><br>' + pastries.map(p => `<div>${p.emoji} <b>${p.name}</b> <span style="font-size:0.9em;">(${p.ingredients.join(', ')})</span> <span style='color:#5a3e36;font-weight:bold;'>$${p.price.toFixed(2)}</span></div>`).join('');
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
  document.getElementById('customer-order').innerHTML = `I'd like a <b>${currentOrder.emoji} ${currentOrder.name}</b>!`;
  document.getElementById('result').textContent = '';
  document.getElementById('serve-btn').disabled = true;
  madeDrink = null;
  document.getElementById('made-drink').textContent = '';
  document.getElementById('make-steps').style.display = 'none';
  stopSatisfactionBar();
  startSatisfactionBar(true); // Reset satisfaction for new customer
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
    stopSatisfactionBar();
    setTimeout(() => { stepsDiv.style.display = 'none'; }, 1000);
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
    } else {
      if (processDiv) processDiv.textContent = makingPastry.emoji;
      stepsDiv.innerHTML += `<span style="color:green;">All ingredients added!</span>`;
      document.getElementById('made-pastry').textContent = `You made a ${makingPastry.emoji} ${makingPastry.name}!`;
      setTimeout(() => { stepsDiv.style.display = 'none'; }, 1000);
    }
  }
}

function pauseGame() {
  isPaused = true;
  stopSatisfactionBar();
  document.getElementById('pause-btn').textContent = '▶️';
  document.getElementById('pause-btn').title = 'Resume Game';
}

function resumeGame() {
  isPaused = false;
  startSatisfactionBar(false); // Do not reset satisfaction on resume
  document.getElementById('pause-btn').textContent = '⏸️';
  document.getElementById('pause-btn').title = 'Pause Game';
}

document.getElementById('pause-btn').addEventListener('click', function() {
  if (isPaused) {
    resumeGame();
  } else {
    pauseGame();
  }
});

document.getElementById('start-make-btn').addEventListener('click', function() {
  const idx = document.getElementById('drink-select').value;
  const drink = drinks[idx];
  document.getElementById('made-drink').textContent = '';
  document.getElementById('serve-btn').disabled = true;
  showMakeSteps(drink);
});

document.getElementById('start-make-pastry-btn').addEventListener('click', function() {
  const idx = document.getElementById('pastry-select').value;
  const pastry = pastries[idx];
  document.getElementById('made-pastry').textContent = '';
  showMakePastrySteps(pastry);
});

document.getElementById('serve-btn').addEventListener('click', function() {
  if (!madeDrink || !currentOrder) return;
  stopSatisfactionBar();
  if (madeDrink.name === currentOrder.name) {
    document.getElementById('result').textContent = 'Yay! The customer is happy! 🎉';
    // Cute/happy responses
    const happyResponses = [
      "Yay! Thank you so much! 🥰",
      "This is perfect! You're the best! 😋",
      "Delicious! I'll come back soon! 🧁",
      "So cute and tasty! Thank you! 💖",
      "You made my day! ☀️"
    ];
    const response = happyResponses[Math.floor(Math.random() * happyResponses.length)];
    document.getElementById('customer-order').innerHTML = `<span style='color:#ff8fab;'>${response}</span>`;
    // Add money for correct drink
    money += currentOrder.price;
    document.getElementById('money').textContent = money.toFixed(2);
  } else {
    document.getElementById('result').textContent = 'Oops! That wasn\'t their order. 😢';
  }
  setTimeout(newCustomer, 2000);
});

// Initialize game
showMenu();
newCustomer();
