// dice-button-fix.js - Correctif pour les boutons "Continuer" et le blocage des dés
// Ce script corrige deux problèmes précis:
// 1. Le bouton "Continuer" qui n'apparaît pas pour Dracula après le lancer de fortune
// 2. La possibilité de lancer les dés plusieurs fois

// dice-button-fix.js - Correctif complet pour les boutons de dés et les lancers

(function() {
  console.log("Application du correctif avancé pour les boutons et les lancers de dés");

  // Objet pour suivre l'état des dés de manière plus robuste
  if (!window.diceState) {
    window.diceState = {
      stats: {}, // Pour suivre quels dés ont été lancés
      money: {}  // Pour suivre quelles fortunes ont été lancées
    };
  }

  // Fonction utilitaire pour normaliser les noms de personnages
  function normalizeCharacter(character) {
    return character.charAt(0).toUpperCase() + character.slice(1).toLowerCase();
  }

  // Fonction avancée pour vérifier si tous les dés de statistiques ont été lancés
  function checkAllStatsRolled(character) {
    // Normaliser le nom du personnage
    const normalizedCharacter = normalizeCharacter(character);

    // Liste des statistiques à vérifier
    const stats = ['rapidite', 'courage', 'force', 'habilete', 'psi'];
    
    // Vérifier tous les formats possibles d'ID de dés
    return stats.every(stat => {
      // Formats à tester : 'Jonathan-rapidite', 'jonathan-rapidite', 'dracula-rapidite'
      const possibleStatIds = [
        `${normalizedCharacter}-${stat}`,     // Jonathan-rapidite ou Dracula-rapidite
        `${character.toLowerCase()}-${stat}`  // jonathan-rapidite ou dracula-rapidite
      ];
      
      // Vérifier si l'un des ID existe et a été lancé
      return possibleStatIds.some(statId => 
        window.diceState.stats[statId] === true
      );
    });
  }

  // Fonction de débogage pour comprendre les problèmes de lancer de dés
  function debugDiceRoll(character) {
    console.log(`🔍 Débogage des lancers de dés pour ${character}`);
    
    const stats = ['rapidite', 'courage', 'force', 'habilete', 'psi'];
    
    stats.forEach(stat => {
      const possibleIds = [
        `${character}-${stat}`,
        `${character.toLowerCase()}-${stat}`,
        `${normalizeCharacter(character)}-${stat}`
      ];
      
      possibleIds.forEach(statId => {
        const element = document.getElementById(statId);
        const rolledState = window.diceState.stats[statId];
        
        console.log(`
          🎲 Diagnostic pour ${statId}:
          - Élément HTML trouvé: ${!!element}
          - Valeur de l'élément: ${element ? element.textContent : 'N/A'}
          - État du lancer: ${rolledState}
        `);
      });
    });
  }

  // Remplacement complet de la fonction rollStat
  window.rollStat = function(statId) {
    console.log(`🎲 Tentative de lancer pour ${statId}`);
    
    // Extraire le personnage et le nom de la stat
    const parts = statId.split('-');
    const character = parts[0]; 
    const statName = parts[1];  
    
    // Vérifier si ce dé a déjà été lancé (en utilisant tous les formats possibles)
    const possibleStatIds = [
      statId,
      `${character.toLowerCase()}-${statName}`,
      `${normalizeCharacter(character)}-${statName}`
    ];

    if (possibleStatIds.some(id => window.diceState.stats[id])) {
      console.log(`❌ Le dé ${statId} a déjà été lancé, on ignore`);
      return false;
    }
    
    // Trouver l'élément du dé (tester différents formats)
    const possibleElements = possibleStatIds.map(id => document.getElementById(id)).filter(el => el);
    const dieElement = possibleElements[0];

    if (!dieElement) {
      console.error(`❌ Élément ${statId} non trouvé`);
      return false;
    }
    
    // Lancer le dé (1-6)
    const value = Math.floor(Math.random() * 6) + 1;
    
    // Mettre à jour l'affichage
    dieElement.textContent = value;
    
    // Ajouter une animation
    dieElement.classList.add('dice-rolling');
    setTimeout(() => {
      dieElement.classList.remove('dice-rolling');
    }, 500);
    
    // Marquer ce dé comme lancé (pour tous les formats possibles)
    possibleStatIds.forEach(id => {
      window.diceState.stats[id] = true;
    });
    
    // Mettre à jour gameState si disponible
    if (window.gameState) {
      if (!window.gameState.stats) window.gameState.stats = {};
      window.gameState.stats[statName] = value;
    }
    
    // Mettre à jour l'affichage dans la barre latérale
    const sidebarElement = document.getElementById(`stat-${statName}`);
    if (sidebarElement) {
      sidebarElement.textContent = value;
    }
    
    // Vérifier si tous les dés du personnage ont été lancés
    checkAllDiceRolled(character);
    
    return true;
  };

  // Remplacement complet de la fonction rollMoney
  window.rollMoney = function(character) {
    console.log(`💰 Tentative de lancer de fortune pour ${character}`);
    
    // Normaliser le nom du personnage
    const normalizedCharacter = normalizeCharacter(character);

    // Vérifier si la fortune a déjà été lancée
    const possibleMoneyKeys = [
      character,
      character.toLowerCase(),
      normalizedCharacter
    ];

    if (possibleMoneyKeys.some(key => window.diceState.money[key])) {
      console.log(`❌ La fortune pour ${character} a déjà été lancée, on ignore`);
      return false;
    }
    
    // Vérifier si tous les dés de statistiques ont été lancés
    const allStatsRolled = checkAllStatsRolled(character);
    
    if (!allStatsRolled) {
      alert("Vous devez d'abord lancer tous les dés de caractéristiques!");
      return false;
    }
    
    // Trouver l'élément d'affichage de la fortune (tester différents formats)
    const possibleMoneyElements = [
      `${character}-money-value`,
      `${character.toLowerCase()}-money-value`,
      `${normalizedCharacter}-money-value`
    ].map(id => document.getElementById(id)).filter(el => el);

    const moneyValueElement = possibleMoneyElements[0];
    
    if (!moneyValueElement) {
      console.error(`❌ Élément de fortune pour ${character} non trouvé`);
      return false;
    }
    
    // Lancer 2d6 * 4 pour la fortune
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const total = (die1 + die2) * 4;
    
    // Mettre à jour l'affichage
    moneyValueElement.textContent = total;
    
    // Marquer la fortune comme lancée (pour tous les formats)
    possibleMoneyKeys.forEach(key => {
      window.diceState.money[key] = true;
    });
    
    // Mettre à jour gameState si disponible
    if (window.gameState) {
      if (!window.gameState.stats) window.gameState.stats = {};
      window.gameState.stats.money = total;
      window.gameState.character = character.toLowerCase();
    }
    
    // Afficher le bouton de continuation
    showContinueButton(character);
    
    // Sauvegarder l'état si possible
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('diceState', JSON.stringify(window.diceState));
        if (window.gameState) {
          localStorage.setItem('chateauDraculaState', JSON.stringify(window.gameState));
        }
      } catch (e) {
        console.error("Erreur lors de la sauvegarde de l'état:", e);
      }
    }
    
    return true;
  };

  // Fonctions existantes restent les mêmes (showContinueButton, etc.)
  function showContinueButton(character) {
    console.log(`🚀 Affichage du bouton continuer pour ${character}`);
    
    // Rechercher le bouton avec différents formats d'ID
    const possibleButtonIds = [
      `${character}-continue`,
      `${character.toLowerCase()}-continue`,
      `${normalizeCharacter(character)}-continue`
    ];

    const continueButton = possibleButtonIds
      .map(id => document.getElementById(id))
      .find(btn => btn);
    
    if (continueButton) {
      // Afficher le bouton
      continueButton.style.display = 'block';
      continueButton.classList.remove('hidden');
      
      // S'assurer que le onclick est correct
      continueButton.onclick = function() {
        startAdventure(character);
      };
      
      console.log(`✅ Bouton continuer configuré pour ${character}`);
    } else {
      console.error(`❌ Bouton continuer non trouvé pour ${character}`);
    }
  }

  // Le reste des fonctions existantes restent identiques
  function startAdventure(character) {
    console.log(`🌟 Démarrage de l'aventure avec ${character}`);
    
    // Mettre à jour gameState avec toutes les statistiques
    if (!window.gameState) window.gameState = {};
    if (!window.gameState.stats) window.gameState.stats = {};
    
    // Définir le personnage
    window.gameState.character = character.toLowerCase();
    
    // Récupérer toutes les statistiques
    const stats = ['rapidite', 'courage', 'force', 'habilete', 'psi'];
    stats.forEach(stat => {
      // Tester différents formats d'ID
      const possibleIds = [
        `${character}-${stat}`,
        `${character.toLowerCase()}-${stat}`,
        `${normalizeCharacter(character)}-${stat}`
      ];

      const statElement = possibleIds
        .map(id => document.getElementById(id))
        .find(el => el);

      if (statElement) {
        const value = parseInt(statElement.textContent);
        if (!isNaN(value)) {
          window.gameState.stats[stat] = value;
        }
      }
    });
    
    // Récupérer la fortune
    const possibleMoneyIds = [
      `${character}-money-value`,
      `${character.toLowerCase()}-money-value`,
      `${normalizeCharacter(character)}-money-value`
    ];

    const moneyElement = possibleMoneyIds
      .map(id => document.getElementById(id))
      .find(el => el);

    if (moneyElement) {
      const money = parseInt(moneyElement.textContent);
      if (!isNaN(money)) {
        window.gameState.stats.money = money;
      }
    }
    
    // Initialiser les autres valeurs
    window.gameState.stats.psiMax = window.gameState.stats.psi || 0;
    window.gameState.stats.health = 100;
    window.gameState.stats.maxHealth = 100;
    window.gameState.inventory = [];
    
    // Sauvegarder l'état
    try {
      localStorage.setItem('chateauDraculaState', JSON.stringify(window.gameState));
    } catch (e) {
      console.error("Erreur lors de la sauvegarde de l'état:", e);
    }
    
    // Naviguer vers l'interface améliorée
    window.location.href = 'improved-ui-v2.html';
  }

  // Le reste du code d'initialisation reste identique

  // Initialiser
  function initialize() {
    connectAllDiceButtons();
    loadDiceState();
    
    // Ajouter un gestionnaire d'événements global pour les boutons
    document.addEventListener('click', function(event) {
      // Vérifier si c'est un bouton de dés
      if (event.target.matches('button[onclick*="rollStat"], button[onclick*="rollMoney"]')) {
        // Vérifier l'attribut onclick
        const onclickAttr = event.target.getAttribute('onclick') || '';
        
        if (onclickAttr.includes('rollStat')) {
          const match = onclickAttr.match(/rollStat\(['"]?([^'"]+)['"]?\)/);
          if (match && match[1]) {
            event.preventDefault();
            window.rollStat(match[1]);
            return false;
          }
        } else if (onclickAttr.includes('rollMoney')) {
          const match = onclickAttr.match(/rollMoney\(['"]?([^'"]+)['"]?\)/);
          if (match && match[1]) {
            event.preventDefault();
            window.rollMoney(match[1]);
            return false;
          }
        }
      }
    });
    
    console.log("🎲 Initialisation du correctif des dés terminée");
  }

  // Lancer l'initialisation
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
  
  // Réessayer la connexion des boutons plusieurs fois pour s'assurer que tout fonctionne
  setTimeout(connectAllDiceButtons, 500);
  setTimeout(connectAllDiceButtons, 1000);
})();