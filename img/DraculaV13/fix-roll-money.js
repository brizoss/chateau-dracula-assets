// fix-roll-money.js – Lancer fortune + lieu initial

(function () {
  console.log("✅ Correction rollMoney + startAdventure");

  // 🎲 Lancer la fortune (2D6 × 4)
  window.rollMoney = function (character) {
    console.log("🎲 Lancer de fortune pour", character);

    const moneyEl = document.getElementById(`${character}-money-value`);
    if (!moneyEl) {
      console.error(`❌ Élément ${character}-money-value introuvable`);
      return;
    }

    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const total = (d1 + d2) * 4;

    moneyEl.textContent = total;

    if (!window.gameState) window.gameState = {};
    if (!window.gameState.stats) window.gameState.stats = {};
    window.gameState.stats.money = total;

    const continueBtn = document.getElementById(`${character}-continue`);
    if (continueBtn) {
      continueBtn.style.display = 'block';
      continueBtn.classList.remove('hidden');
    }

    try {
      localStorage.setItem('chateauDraculaState', JSON.stringify(window.gameState));
    } catch (e) {
      console.error("❌ Erreur sauvegarde fortune :", e);
    }
  };

  window.startAdventure = function (character) {
  console.log("🚀 Démarrage avec", character);
  const char = character.toLowerCase();

  if (!window.gameState) window.gameState = {};
  if (!window.gameState.stats) window.gameState.stats = {};

  const stats = ['rapidite', 'courage', 'force', 'habilete', 'psi'];
  stats.forEach(stat => {
    const el = document.getElementById(`${character}-${stat}`);
    if (el) {
      const val = parseInt(el.textContent, 10);
      if (!isNaN(val)) {
        window.gameState.stats[stat] = val;
      }
    }
  });

  const moneyEl = document.getElementById(`${character}-money-value`);
  if (moneyEl) {
    const money = parseInt(moneyEl.textContent, 10);
    if (!isNaN(money)) {
      window.gameState.stats.money = money;
    }
  }

  window.gameState.character = char;
  window.gameState.stats.health = 100;
  window.gameState.stats.maxHealth = 100;
  window.gameState.stats.psiMax = window.gameState.stats.psi ?? 0;

  // 🎯 Correction ultime : Lieu initial absolument forcé avant sauvegarde.
  const startLocation = char === 'jonathan' ? 'allee' : 'crypte-dracula';
  window.gameState.currentLocation = startLocation;
  window.gameState.previousLocation = null;
  window.gameState.visitedLocations = [startLocation];

  try {
    localStorage.setItem('chateauDraculaState', JSON.stringify(window.gameState));
  } catch (e) {
    console.error("Erreur sauvegarde état complet :", e);
  }

  window.location.href = 'improved-ui-v2.html'; // <- ton nouveau fichier renommé
};
