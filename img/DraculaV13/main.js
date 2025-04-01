// main.js - Fichier principal du Château de Dracula
console.log(gameData.locations.portail.title);
// Version 2.0 - Code consolidé et amélioré

// ==============================================
// GESTION DES LOCATIONS
// ==============================================

/**
 * Charge une location spécifique et met à jour l'interface
 * @param {string} locationId - Identifiant de la location à charger
 */
function loadLocation(locationId) {
  console.log(`Chargement de la location: ${locationId}`);
  
  // Vérifier si les données de la location sont disponibles
  if (!window.gameData || !window.gameData.locations || !window.gameData.locations[locationId]) {
    console.error(`Données de la location '${locationId}' non trouvées`);
    return false;
  }
  
  const locationData = window.gameData.locations[locationId];
  
  // Mettre à jour l'état du jeu
  window.gameState.previousLocation = window.gameState.currentLocation;
  window.gameState.currentLocation = locationId;
  
  // Ajouter à la liste des lieux visités si ce n'est pas déjà le cas
  if (!window.gameState.visitedLocations.includes(locationId)) {
    window.gameState.visitedLocations.push(locationId);
  }
  
  // Mettre à jour l'interface utilisateur
  updateLocationDisplay(locationData);
  
  // Effets de visite (gains/pertes de santé, etc.)
  applyVisitEffects(locationData);
  
  // Gérer les rencontres aléatoires
  checkRandomEncounter(locationData);
  
  // Déclencher des événements aléatoires d'ambiance
  triggerRandomEvent();
  
  // Jouer les sons d'ambiance associés à cette location
  playLocationAmbience(locationData);
  
  // Sauvegarder l'état du jeu
  saveGameState();
  
  return true;
}

/**
 * Met à jour l'affichage de la location actuelle
 * @param {Object} locationData - Données de la location à afficher
 */
function updateLocationDisplay(locationData) {
  // Mettre à jour le titre
  const titleElement = document.getElementById('locations-title');
  if (titleElement) {
    titleElement.textContent = locationData.title || "Location inconnue";
  }
  
  // Mettre à jour la description
  const descriptionElement = document.getElementById('locations-description');
  if (descriptionElement) {
    descriptionElement.textContent = locationData.description || "Pas de description disponible.";
  }
  
  // Mettre à jour l'image de fond
  const backgroundElement = document.getElementById('locations-background');
  if (backgroundElement && locationData.background) {
    backgroundElement.style.backgroundImage = `url('${locationData.background}')`;
  }
  
  // Mettre à jour les choix disponibles
  updateChoicesDisplay(locationData.choices || []);
}

/**
 * Met à jour l'affichage des choix disponibles
 * @param {Array} choices - Liste des choix disponibles
 */
function updateChoicesDisplay(choices) {
  const choicesContainer = document.getElementById('choices-container');
  if (!choicesContainer) return;
  
  // Vider le conteneur
  choicesContainer.innerHTML = '';
  
  // Si aucun choix n'est disponible
  if (!choices || choices.length === 0) {
    const noChoiceMessage = document.createElement('p');
    noChoiceMessage.textContent = "Aucun choix disponible.";
    noChoiceMessage.className = 'no-choices';
    choicesContainer.appendChild(noChoiceMessage);
    return;
  }
  
  // Ajouter chaque choix
  choices.forEach(choice => {
    const button = document.createElement('button');
    button.className = 'choice';
    button.textContent = choice.text;
    
    // Vérifier si le choix doit être désactivé
    let isDisabled = false;
    
    // Vérifier les conditions de personnage
    if (choice.requiredCharacter && choice.requiredCharacter !== window.gameState.character) {
      isDisabled = true;
    }
    
    // Vérifier les conditions de statistiques
    if (choice.requiredStat) {
      const statName = choice.requiredStat.stat;
      const minValue = choice.requiredStat.minValue;
      
      if (window.gameState.stats[statName] < minValue) {
        isDisabled = true;
        
        // Utiliser le texte conditionnel si disponible
        if (choice.conditionalText) {
          button.textContent = choice.conditionalText;
        }
      }
    }
    
    // Vérifier les conditions d'objet
    if (choice.requiredItem && !hasItem(choice.requiredItem)) {
      isDisabled = true;
    }
    
    // Appliquer la classe 'disabled' si nécessaire
    if (isDisabled) {
      button.classList.add('disabled');
      button.disabled = true;
    } else {
      // Ajouter l'action correspondante
      if (choice.destination) {
        // Navigation vers une autre location
        button.onclick = () => loadLocation(choice.destination);
      } else if (choice.action) {
        // Action spéciale (fonction JavaScript)
        button.onclick = () => {
          if (typeof window[choice.action] === 'function') {
            window[choice.action](choice);
          } else {
            console.error(`Action '${choice.action}' non définie`);
          }
        };
      }
    }
    
    choicesContainer.appendChild(button);
  });
}

/**
 * Applique les effets liés à la visite d'une location
 * @param {Object} locationData - Données de la location
 */
function applyVisitEffects(locationData) {
  if (!locationData.visitEffects || locationData.visitEffects.length === 0) {
    return;
  }
  
  locationData.visitEffects.forEach(effect => {
    // Vérifier si l'effet est conditionnel
    if (effect.condition) {
      // Condition basée sur le personnage
      if (effect.condition === 'character' && effect.conditionValue !== window.gameState.character) {
        return;
      }
      
      // Condition basée sur un objet
      if (effect.condition === 'item' && !hasItem(effect.conditionValue)) {
        return;
      }
      
      // Condition basée sur une statistique
      if (effect.condition === 'stat' && 
          window.gameState.stats[effect.conditionStat] < effect.conditionValue) {
        return;
      }
    }
    
    // Appliquer l'effet
    switch (effect.type) {
      case 'health':
        // Modifier les points de vie
        window.gameState.stats.health = Math.min(
          window.gameState.stats.maxHealth,
          Math.max(0, window.gameState.stats.health + effect.value)
        );
        
        // Afficher un message si fourni
        if (effect.message) {
          showMessage(effect.message, effect.value > 0 ? 'success' : 'warning');
        }
        
        // Mettre à jour l'affichage des statistiques
        updateStatsDisplay();
        break;
        
      case 'psi':
        // Modifier les points PSI
        window.gameState.stats.psi = Math.min(
          window.gameState.stats.psiMax,
          Math.max(0, window.gameState.stats.psi + effect.value)
        );
        
        // Afficher un message si fourni
        if (effect.message) {
          showMessage(effect.message, effect.value > 0 ? 'success' : 'warning');
        }
        
        // Mettre à jour l'affichage des statistiques
        updateStatsDisplay();
        break;
        
      case 'item':
        // Ajouter un objet à l'inventaire
        addItemToInventory(effect.itemId);
        
        // Afficher un message si fourni
        if (effect.message) {
          showMessage(effect.message, 'success');
        }
        break;
    }
  });
}

/**
 * Vérifie si une rencontre aléatoire doit se produire
 * @param {Object} locationData - Données de la location
 */
function checkRandomEncounter(locationData) {
  if (!locationData.encounterChance || !locationData.possibleEncounters) {
    return;
  }
  
  // Déterminer si une rencontre se produit
  if (Math.random() < locationData.encounterChance) {
    // Choisir un ennemi au hasard parmi les rencontres possibles
    const enemyId = getRandomElement(locationData.possibleEncounters);
    
    if (!enemyId || !window.gameData.enemies[enemyId]) {
      console.warn(`Ennemi '${enemyId}' non trouvé dans les données du jeu`);
      return;
    }
    
    // Démarrer le combat
    startCombat(enemyId);
  }
}

/**
 * Déclenche un événement aléatoire d'ambiance
 */
function triggerRandomEvent() {
  if (!window.gameData.randomEvents || window.gameData.randomEvents.length === 0) {
    return;
  }
  
  // Parcourir tous les événements et tester leur probabilité de déclenchement
  for (const event of window.gameData.randomEvents) {
    if (Math.random() < event.probability) {
      // Afficher la description de l'événement
      if (event.description) {
        showMessage(event.description, 'info');
      }
      
      // Jouer le son associé
      if (event.sound && typeof playSound === 'function') {
        playSound(event.sound);
      }
      
      // Exécuter l'effet spécial
      if (event.effect && typeof event.effect === 'function') {
        event.effect();
      }
      
      // Ne déclencher qu'un seul événement à la fois
      break;
    }
  }
}

/**
 * Joue les sons d'ambiance associés à une location
 * @param {Object} locationData - Données de la location
 */
function playLocationAmbience(locationData) {
  // Arrêter les sons d'ambiance précédents
  if (typeof stopAllAmbientSounds === 'function') {
    stopAllAmbientSounds();
  }
  
  // Jouer les nouveaux sons d'ambiance
  if (locationData.ambientSounds && locationData.ambientSounds.length > 0) {
    locationData.ambientSounds.forEach(soundId => {
      if (typeof loopSound === 'function') {
        loopSound(soundId, 0.3);
      }
    });
  }
}

// ==============================================
// INITIALISATION ET CONFIGURATION GLOBALE
// ==============================================

// Gamedata est déjà inclus dans ce fichier
console.log("Initialisation du Château de Dracula...");

// État global du jeu (défini ici pour être facilement accessible)
window.gameState = {
  stats: { 
    rapidite: 0, 
    courage: 0, 
    force: 0, 
    habilete: 0, 
    psi: 0, 
    psiMax: 0, 
    health: 100, 
    maxHealth: 100, 
    money: 0 
  },
  inventory: [],
  activeEffects: {},
  character: null,
  currentLocation: null,
  previousLocation: null,
  visitedLocations: [],
  diceRolled: {},
  combat: {
    inCombat: false,
    enemy: null,
    turn: null
  },
  gameTime: 0, // Compteur de temps de jeu (en tours)
  questFlags: {}, // Pour suivre la progression des quêtes
  version: "2.0.0"
};

// Configuration audio
window.audioEnabled = true;

// ==============================================
// GESTION DE L'ÉTAT DU JEU
// ==============================================

/**
 * Sauvegarde l'état du jeu dans localStorage
 * @returns {boolean} Succès de la sauvegarde
 */
function saveGameState() {
  try {
    localStorage.setItem('chateauDraculaState', JSON.stringify(window.gameState));
    console.log("État du jeu sauvegardé avec succès");
    return true;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de l'état:", error);
    return false;
  }
}

/**
 * Charge l'état du jeu depuis localStorage
 * @returns {boolean} Succès du chargement
 */
function loadGameState() {
  try {
    const savedState = localStorage.getItem('chateauDraculaState');
    if (savedState) {
      window.gameState = JSON.parse(savedState);
      console.log("État du jeu chargé avec succès");
      return true;
    }
    console.warn("Aucun état de jeu sauvegardé trouvé");
    return false;
  } catch (error) {
    console.error("Erreur lors du chargement de l'état:", error);
    return false;
  }
}

/**
 * Réinitialise complètement l'état du jeu
 */
function resetGameState() {
  window.gameState = {
    stats: { 
      rapidite: 0, 
      courage: 0, 
      force: 0, 
      habilete: 0, 
      psi: 0, 
      psiMax: 0, 
      health: 100, 
      maxHealth: 100, 
      money: 0 
    },
    inventory: [],
    activeEffects: {},
    character: null,
    currentLocation: null,
    previousLocation: null,
    visitedLocations: [],
    diceRolled: {},
    combat: {
      inCombat: false,
      enemy: null,
      turn: null
    },
    gameTime: 0,
    questFlags: {},
    version: "2.0.0"
  };
  
  // Supprimer également la sauvegarde existante
  localStorage.removeItem('chateauDraculaState');
  console.log("État du jeu réinitialisé");
}

// ==============================================
// GESTION DES PERSONNAGES
// ==============================================

/**
 * Initialise les statistiques du personnage sélectionné
 * @param {string} character - Identifiant du personnage ('jonathan' ou 'dracula')
 */
function initializeCharacter(character) {
  console.log(`Initialisation du personnage: ${character}`);
  
  // Normaliser le nom du personnage (minuscules)
  character = character.toLowerCase();
  
  // Vérifier si les données du personnage sont disponibles
  if (!window.gameData || !window.gameData.characters || !window.gameData.characters[character]) {
    console.error(`Données du personnage '${character}' non trouvées`);
    return false;
  }
  
  const characterData = window.gameData.characters[character];
  
  // Initialiser les statistiques de base
  window.gameState.character = character;
  window.gameState.stats = { ...window.gameData.config.baseStats };
  
  // Appliquer les modificateurs spécifiques au personnage
  if (characterData.statModifiers) {
    for (const [stat, modifier] of Object.entries(characterData.statModifiers)) {
      if (window.gameState.stats[stat] !== undefined) {
        window.gameState.stats[stat] += modifier;
      }
    }
  }
  
  // Initialiser l'inventaire
  window.gameState.inventory = [...(characterData.initialInventory || [])];
  
  // Initialiser la position de départ
  window.gameState.currentLocation = characterData.startLocation;
  window.gameState.previousLocation = null;
  window.gameState.visitedLocations = [characterData.startLocation];
  
  // Initialiser le PSI Max
  if (window.gameState.stats.psi) {
    window.gameState.stats.psiMax = window.gameState.stats.psi;
  }
  
  // Sauvegarder l'état initial
  saveGameState();
  
  return true;
}

/**
 * Applique les statistiques du personnage depuis la création
 * @param {string} character - Identifiant du personnage
 */
function finalizeCharacterCreation(character) {
  character = character.toLowerCase();
  
  // Vérifier si les statistiques ont été définies
  const requiredStats = ['rapidite', 'courage', 'force', 'habilete', 'psi'];
  const allStatsSet = requiredStats.every(stat => 
    window.gameState.stats[stat] !== undefined && window.gameState.stats[stat] > 0
  );
  
  if (!allStatsSet) {
    console.error("Toutes les statistiques n'ont pas été définies");
    return false;
  }
  
  // Définir la localisation initiale en fonction du personnage
  const startLocation = character === 'jonathan' ? 'portail' : 'crypte-dracula';
  window.gameState.currentLocation = startLocation;
  window.gameState.previousLocation = null;
  window.gameState.visitedLocations = [startLocation];
  
  // Sauvegarder l'état
  saveGameState();
  
  return true;
}



// ==============================================
// GESTION DES OBJETS ET DE L'INVENTAIRE
// ==============================================

/**
 * Vérifie si le joueur possède un objet spécifique
 * @param {string} itemId - Identifiant de l'objet
 * @returns {boolean} - True si l'objet est dans l'inventaire
 */
function hasItem(itemId) {
  if (!window.gameState.inventory) {
    return false;
  }
  
  return window.gameState.inventory.some(item => {
    if (typeof item === 'string') {
      return item === itemId;
    } else if (typeof item === 'object') {
      return item.id === itemId || item.name === itemId;
    }
    return false;
  });
}

/**
 * Ajoute un objet à l'inventaire du joueur
 * @param {string|Object} item - Identifiant ou objet à ajouter
 */
function addItemToInventory(item) {
  if (!window.gameState.inventory) {
    window.gameState.inventory = [];
  }
  
  // Si l'item est un ID, récupérer les données complètes
  if (typeof item === 'string' && window.gameData && window.gameData.items && window.gameData.items[item]) {
    const itemData = { ...window.gameData.items[item] };
    itemData.id = item; // Ajouter l'ID à l'objet
    window.gameState.inventory.push(itemData);
  } else {
    // Sinon ajouter directement
    window.gameState.inventory.push(item);
  }
  
  // Mettre à jour l'affichage de l'inventaire
  updateInventoryDisplay();
  
  // Sauvegarder l'état du jeu
  saveGameState();
}

/**
 * Retire un objet de l'inventaire du joueur
 * @param {string} itemId - Identifiant de l'objet à retirer
 * @returns {boolean} - True si l'objet a été retiré
 */
function removeItemFromInventory(itemId) {
  if (!window.gameState.inventory) {
    return false;
  }
  
  const initialLength = window.gameState.inventory.length;
  
  window.gameState.inventory = window.gameState.inventory.filter(item => {
    if (typeof item === 'string') {
      return item !== itemId;
    } else if (typeof item === 'object') {
      return item.id !== itemId && item.name !== itemId;
    }
    return true;
  });
  
  // Si l'inventaire a changé, mettre à jour l'affichage
  if (initialLength !== window.gameState.inventory.length) {
    updateInventoryDisplay();
    saveGameState();
    return true;
  }
  
  return false;
}

/**
 * Utilise un objet de l'inventaire
 * @param {string} itemId - Identifiant de l'objet à utiliser
 * @returns {boolean} - True si l'objet a été utilisé
 */
function useItem(itemId) {
  // Trouver l'objet dans l'inventaire
  let item = null;
  let itemIndex = -1;
  
  for (let i = 0; i < window.gameState.inventory.length; i++) {
    const invItem = window.gameState.inventory[i];
    
    if ((typeof invItem === 'string' && invItem === itemId) || 
        (typeof invItem === 'object' && (invItem.id === itemId || invItem.name === itemId))) {
      item = invItem;
      itemIndex = i;
      break;
    }
  }
  
  if (!item) {
    console.warn(`Objet '${itemId}' non trouvé dans l'inventaire`);
    return false;
  }
  
  // Récupérer les données complètes de l'objet si nécessaire
  if (typeof item === 'string' && window.gameData && window.gameData.items && window.gameData.items[item]) {
    item = window.gameData.items[item];
  }
  
  // Appliquer l'effet de l'objet
  if (item.effect) {
    switch (item.effect.type) {
      case 'health':
        // Récupération de points de vie
        window.gameState.stats.health = Math.min(
          window.gameState.stats.maxHealth,
          window.gameState.stats.health + item.effect.value
        );
        showMessage(`Vous avez utilisé ${item.name} et récupéré ${item.effect.value} points de vie.`, 'success');
        updateStatsDisplay();
        break;
        
      case 'psi':
        // Récupération de points PSI
        window.gameState.stats.psi = Math.min(
          window.gameState.stats.psiMax,
          window.gameState.stats.psi + item.effect.value
        );
        showMessage(`Vous avez utilisé ${item.name} et récupéré ${item.effect.value} points de PSI.`, 'success');
        updateStatsDisplay();
        break;
        
      case 'unlock':
        // Déverrouillage de location(s)
        if (item.effect.location) {
          const locations = Array.isArray(item.effect.location) ? item.effect.location : [item.effect.location];
          showMessage(`Vous avez utilisé ${item.name} pour déverrouiller un nouvel accès.`, 'success');
        }
        break;
        
      default:
        console.warn(`Type d'effet d'objet non reconnu: ${item.effect.type}`);
        return false;
    }
  }
  
  // Si l'objet est à usage unique, le retirer de l'inventaire
  if (item.singleUse) {
    window.gameState.inventory.splice(itemIndex, 1);
    updateInventoryDisplay();
  }
  
  // Sauvegarder l'état du jeu
  saveGameState();
  
  return true;
}

/**
 * Met à jour l'affichage de l'inventaire
 */
function updateInventoryDisplay() {
  const inventoryList = document.getElementById('player-inventory');
  if (!inventoryList) return;
  
  // Vider la liste actuelle
  inventoryList.innerHTML = '';
  
  // Si l'inventaire est vide
  if (!window.gameState.inventory || window.gameState.inventory.length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.textContent = 'Aucun objet';
    inventoryList.appendChild(emptyItem);
    return;
  }
  
  // Ajouter chaque objet à la liste
  window.gameState.inventory.forEach(item => {
    const listItem = document.createElement('li');
    
    if (typeof item === 'string') {
      // Si c'est juste un ID, essayer de récupérer le nom depuis les données du jeu
      if (window.gameData && window.gameData.items && window.gameData.items[item]) {
        const itemData = window.gameData.items[item];
        listItem.textContent = itemData.name || item;
        
        // Ajouter une infobulle avec la description
        if (itemData.description) {
          listItem.setAttribute('data-tooltip', itemData.description);
        }
      } else {
        listItem.textContent = item;
      }
    } else if (typeof item === 'object') {
      // Si c'est un objet complet
      listItem.textContent = item.name || 'Objet inconnu';
      
      // Ajouter une infobulle avec la description
      if (item.description) {
        listItem.setAttribute('data-tooltip', item.description);
      }
    }
    
    // Rendre l'élément cliquable pour utiliser l'objet
    if (typeof item === 'object' && item.type !== 'knowledge') {
      listItem.style.cursor = 'pointer';
      listItem.addEventListener('click', () => {
        useItem(item.id || item.name);
      });
    }
    
    inventoryList.appendChild(listItem);
  });
}

// ==============================================
// GESTION DU SYSTÈME DE COMBAT
// ==============================================

/**
 * Démarre un combat avec un ennemi spécifique
 * @param {string} enemyId - Identifiant de l'ennemi
 */
function startCombat(enemyId) {
  // Vérifier si les données de l'ennemi sont disponibles
  if (!window.gameData || !window.gameData.enemies || !window.gameData.enemies[enemyId]) {
    console.error(`Données de l'ennemi '${enemyId}' non trouvées`);
    return false;
  }
  
  const enemyData = { ...window.gameData.enemies[enemyId] };
  
  // Mettre à jour l'état du jeu
  window.gameState.combat.inCombat = true;
  window.gameState.combat.enemy = enemyData;
  window.gameState.combat.turn = 'player'; // Le joueur commence
  
  // Afficher l'interface de combat
  showCombatInterface(enemyData);
  
  // Jouer la musique de combat
  if (typeof playMusic === 'function') {
    playMusic('combat');
  }
  
  showMessage(`Un combat commence contre ${enemyData.name}!`, 'warning');
  
  return true;
}

/**
 * Affiche l'interface de combat
 * @param {Object} enemy - Données de l'ennemi
 */
function showCombatInterface(enemy) {
  // Rechercher l'élément d'interface de combat
  let combatInterface = document.getElementById('combat-interface');
  
  if (!combatInterface) {
    // Créer l'interface si elle n'existe pas
    combatInterface = document.createElement('div');
    combatInterface.id = 'combat-interface';
    combatInterface.className = 'combat-interface';
    
    // Appliquer les styles
    Object.assign(combatInterface.style, {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '80%',
      maxWidth: '800px',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      border: '2px solid #600',
      borderRadius: '10px',
      padding: '20px',
      zIndex: '1000',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      boxShadow: '0 0 30px rgba(0, 0, 0, 0.7)'
    });
    
    // Contenu de l'interface
    combatInterface.innerHTML = `
      <div class="combat-header">
        <div class="combatant player">
          <h3>${window.gameState.character === 'jonathan' ? 'Jonathan Harker' : 'Comte Dracula'}</h3>
          <div class="health-bar">
            <div class="health-bar-bg">
              <div id="player-health-fill" class="health-bar-fill" style="width: ${(window.gameState.stats.health / window.gameState.stats.maxHealth) * 100}%"></div>
            </div>
            <span id="player-combat-health">${window.gameState.stats.health}</span>/<span id="player-combat-max-health">${window.gameState.stats.maxHealth}</span>
          </div>
        </div>
        
        <div class="vs">VS</div>
        
        <div class="combatant enemy">
          <h3 id="enemy-combat-name">${enemy.name}</h3>
          <div class="health-bar">
            <div class="health-bar-bg">
              <div id="enemy-health-fill" class="health-bar-fill" style="width: ${(enemy.health / enemy.maxHealth) * 100}%"></div>
            </div>
            <span id="enemy-combat-health">${enemy.health}</span>/<span id="enemy-combat-max-health">${enemy.maxHealth}</span>
          </div>
        </div>
      </div>
      
      <div class="combat-dice">
        <div id="combat-die-1" class="die">?</div>
        <div id="combat-die-2" class="die">?</div>
        <div id="combat-roll-result" class="dice-result">Lancez les dés</div>
      </div>
      
      <div class="combat-log-container">
        <div id="combat-log" class="combat-log">
          <div class="log-entry">Le combat commence !</div>
        </div>
      </div>
      
      <div class="combat-actions">
        <button id="attack-button" class="combat-button">Attaquer</button>
        <button id="use-psi-button" class="combat-button">Pouvoir PSI</button>
        <button id="flee-button" class="combat-button">Fuir</button>
      </div>
    `;
    
    // Ajouter l'interface au document
    document.body.appendChild(combatInterface);
    
    // Ajouter des styles spécifiques pour le combat
    const combatStyles = document.createElement('style');
    combatStyles.textContent = `
      .combat-interface {
        font-family: 'Georgia', serif;
        color: #ddd;
      }
      
      .combat-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .combatant {
        text-align: center;
        flex: 1;
      }
      
      .combatant h3 {
        margin-top: 0;
        margin-bottom: 10px;
        color: #f44;
      }
      
      .vs {
        font-size: 2em;
        color: #800;
        margin: 0 15px;
      }
      
      .health-bar-bg {
        height: 20px;
        background-color: #222;
        border-radius: 10px;
        overflow: hidden;
        margin-bottom: 5px;
      }
      
      .health-bar-fill {
        height: 100%;
        background: linear-gradient(to right, #600, #f00);
        transition: width 0.5s;
      }
      
      .enemy .health-bar-fill {
        background: linear-gradient(to right, #060, #0f0);
      }
      
      .combat-dice {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 20px;
      }
      
      .die {
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #400, #800);
        color: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 2em;
        font-weight: bold;
        border-radius: 10px;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
      }
      
      .dice-result {
        margin-left: 20px;
        font-size: 1.2em;
        min-width: 150px;
      }
      
      .combat-log-container {
        max-height: 150px;
        overflow-y: auto;
        padding: 10px;
        background-color: rgba(0, 0, 0, 0.5);
        border-radius: 5px;
        border: 1px solid #600;
      }
      
      .combat-log {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      
      .log-entry {
        font-size: 0.9em;
        padding: 5px;
        border-radius: 3px;
      }
      
      .log-entry.player {
        background-color: rgba(128, 0, 0, 0.3);
      }
      
      .log-entry.enemy {
        background-color: rgba(0, 128, 0, 0.3);
      }
      
      .combat-actions {
        display: flex;
        justify-content: center;
        gap: 15px;
      }
      
      .combat-button {
        padding: 10px 20px;
        background: linear-gradient(to bottom, #600, #300);
        color: #fff;
        border: 1px solid #800;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1.1em;
        min-width: 120px;
        transition: all 0.3s;
      }
      
      .combat-button:hover {
        background: linear-gradient(to bottom, #800, #500);
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
      }
      
      .rolling {
        animation: diceRoll 0.5s ease-in-out;
      }
      
      @keyframes diceRoll {
        0% { transform: rotate(0) scale(1); }
        25% { transform: rotate(-10deg) scale(1.1); }
        75% { transform: rotate(10deg) scale(1.1); }
        100% { transform: rotate(0) scale(1); }
      }
    `;
    
    document.head.appendChild(combatStyles);
  } else {
    // Mettre à jour l'interface existante
    const playerNameEl = combatInterface.querySelector('.player h3');
    if (playerNameEl) {
      playerNameEl.textContent = window.gameState.character === 'jonathan' ? 'Jonathan Harker' : 'Comte Dracula';
    }
    
    const playerHealthEl = document.getElementById('player-combat-health');
    if (playerHealthEl) {
      playerHealthEl.textContent = window.gameState.stats.health;
    }
    
    const playerMaxHealthEl = document.getElementById('player-combat-max-health');
    if (playerMaxHealthEl) {
      playerMaxHealthEl.textContent = window.gameState.stats.maxHealth;
    }
    
    const playerHealthFillEl = document.getElementById('player-health-fill');
    if (playerHealthFillEl) {
      playerHealthFillEl.style.width = `${(window.gameState.stats.health / window.gameState.stats.maxHealth) * 100}%`;
    }
    
    const enemyNameEl = document.getElementById('enemy-combat-name');
    if (enemyNameEl) {
      enemyNameEl.textContent = enemy.name;
    }
    
    const enemyHealthEl = document.getElementById('enemy-combat-health');
    if (enemyHealthEl) {
      enemyHealthEl.textContent = enemy.health;
    }
    
    const enemyMaxHealthEl = document.getElementById('enemy-combat-max-health');
    if (enemyMaxHealthEl) {
      enemyMaxHealthEl.textContent = enemy.maxHealth;
    }
    
    const enemyHealthFillEl = document.getElementById('enemy-health-fill');
    if (enemyHealthFillEl) {
      enemyHealthFillEl.style.width = `${(enemy.health / enemy.maxHealth) * 100}%`;
    }
    
    // Réinitialiser le journal de combat
    const combatLog = document.getElementById('combat-log');
    if (combatLog) {
      combatLog.innerHTML = '<div class="log-entry">Le combat commence !</div>';
    }
  }
  
  // Afficher l'interface
  combatInterface.style.display = 'flex';
  
  // Connecter les boutons
  connectCombatButtons();
}

/**
 * Connecte les boutons de l'interface de combat
 */
function connectCombatButtons() {
  const attackButton = document.getElementById('attack-button');
  const psiButton = document.getElementById('use-psi-button');
  const fleeButton = document.getElementById('flee-button');
  
  if (attackButton) {
    attackButton.onclick = () => playerAttack();
  }
  
  if (psiButton) {
    // Vérifier si le joueur a assez de PSI
    if (window.gameState.stats.psi <= 0) {
      psiButton.disabled = true;
      psiButton.style.opacity = '0.5';
      psiButton.style.cursor = 'not-allowed';
    } else {
      psiButton.disabled = false;
      psiButton.style.opacity = '1';
      psiButton.style.cursor = 'pointer';
      psiButton.onclick = () => useCombatPsiPower();
    }
  }
  
  if (fleeButton) {
    fleeButton.onclick = () => attemptToFlee();
  }
}

/**
 * Gère l'attaque du joueur
 */
function playerAttack() {
  if (!window.gameState.combat.inCombat || !window.gameState.combat.enemy) {
    console.error("Aucun combat en cours");
    return;
  }
  
  // Désactiver les boutons pendant l'action
  toggleCombatButtons(false);
  
  // Lancer les dés (2d6)
  const roll = rollCombatDice();
  
  // Récupérer les données de l'ennemi
  const enemy = window.gameState.combat.enemy;
  
  // Vérifier si l'attaque réussit (si le lancer est supérieur à la rapidité de l'ennemi)
  let success = roll > enemy.stats.rapidite;
  let damage = 0;
  let criticalHit = false;
  
  // Ajouter l'entrée au journal de combat
  const combatLog = document.getElementById('combat-log');
  
  if (success) {
    // Calculer les dégâts (base = force du joueur)
    damage = window.gameState.stats.force;
    
    // Bonus pour les lancers élevés
    if (roll >= 10) {
      damage += 2;
    }
    
    // Coup critique sur double 6
    if (roll === 12) {
      criticalHit = true;
      damage *= 2;
    }
    
    // Appliquer les effets actifs du joueur
    if (window.gameState.activeEffects.damageMod) {
      damage += window.gameState.activeEffects.damageMod.value;
    }
    
    // Appliquer les dégâts à l'ennemi
    enemy.health = Math.max(0, enemy.health - damage);
    
    // Mettre à jour l'affichage de la santé de l'ennemi
    const enemyHealthEl = document.getElementById('enemy-combat-health');
    if (enemyHealthEl) {
      enemyHealthEl.textContent = enemy.health;
    }
    
    const enemyHealthFillEl = document.getElementById('enemy-health-fill');
    if (enemyHealthFillEl) {
      enemyHealthFillEl.style.width = `${(enemy.health / enemy.maxHealth) * 100}%`;
    }
    
    // Ajouter l'entrée au journal de combat
    if (combatLog) {
      const hitText = criticalHit ? 
        `<div class="log-entry player">COUP CRITIQUE ! Vous infligez ${damage} points de dégâts à ${enemy.name}.</div>` :
        `<div class="log-entry player">Votre attaque touche ! Vous infligez ${damage} points de dégâts à ${enemy.name}.</div>`;
      
      combatLog.innerHTML += hitText;
      combatLog.scrollTop = combatLog.scrollHeight;
    }
    
    // Jouer le son d'impact
    if (typeof playSound === 'function') {
      playSound('combat-hit');
    }
  } else {
    // L'attaque a échoué
    if (combatLog) {
      combatLog.innerHTML += `<div class="log-entry player">Votre attaque manque...</div>`;
      combatLog.scrollTop = combatLog.scrollHeight;
    }
    
    // Jouer le son d'échec
    if (typeof playSound === 'function') {
      playSound('combat-miss');
    }
  }
  
  // Vérifier si l'ennemi est vaincu
  if (enemy.health <= 0) {
    endCombat(true);
    return;
  }
  
  // Tour de l'ennemi après un délai
  setTimeout(() => {
    enemyAttack();
  }, 1000);
}

/**
 * Gère l'attaque de l'ennemi
 */
function enemyAttack() {
  if (!window.gameState.combat.inCombat || !window.gameState.combat.enemy) {
    console.error("Aucun combat en cours");
    return;
  }
  
  // Récupérer les données de l'ennemi
  const enemy = window.gameState.combat.enemy;
  
  // Lancer les dés (2d6)
  const roll = rollCombatDice(true);
  
  // Vérifier si l'attaque réussit (si le lancer est supérieur à la rapidité du joueur)
  let success = roll > window.gameState.stats.rapidite;
  let damage = 0;
  let specialEffect = null;
  
  // Ajouter l'entrée au journal de combat
  const combatLog = document.getElementById('combat-log');
  
  if (success) {
    // Calculer les dégâts (base = force de l'ennemi)
    damage = enemy.stats.force;
    
    // Bonus pour les lancers élevés
    if (roll >= 10) {
      damage += 2;
    }
    
    // Vérifier les effets spéciaux
    if (enemy.specialEffects) {
      for (const effect of enemy.specialEffects) {
        if (effect.trigger === 'roll' && effect.value.includes(roll)) {
          specialEffect = effect;
          break;
        }
      }
    }
    
    // Réduire les dégâts grâce aux effets actifs du joueur
    if (window.gameState.activeEffects.defenseMod) {
      damage = Math.max(1, damage - window.gameState.activeEffects.defenseMod.value);
    }
    
    // Appliquer les dégâts au joueur
    window.gameState.stats.health = Math.max(0, window.gameState.stats.health - damage);
    
    // Mettre à jour l'affichage de la santé du joueur
    const playerHealthEl = document.getElementById('player-combat-health');
    if (playerHealthEl) {
      playerHealthEl.textContent = window.gameState.stats.health;
    }
    
    const playerHealthFillEl = document.getElementById('player-health-fill');
    if (playerHealthFillEl) {
      playerHealthFillEl.style.width = `${(window.gameState.stats.health / window.gameState.stats.maxHealth) * 100}%`;
    }
    
    // Ajouter l'entrée au journal de combat
    if (combatLog) {
      let hitText = `<div class="log-entry enemy">${enemy.name} vous touche ! Vous subissez ${damage} points de dégâts.</div>`;
      
      if (specialEffect) {
        hitText += `<div class="log-entry enemy">${specialEffect.description}</div>`;
        
        // Dégâts supplémentaires de l'effet spécial
        if (specialEffect.damage) {
          const extraDamage = specialEffect.damage;
          window.gameState.stats.health = Math.max(0, window.gameState.stats.health - extraDamage);
          
          // Mettre à jour l'affichage de la santé du joueur
          if (playerHealthEl) {
            playerHealthEl.textContent = window.gameState.stats.health;
          }
          
          if (playerHealthFillEl) {
            playerHealthFillEl.style.width = `${(window.gameState.stats.health / window.gameState.stats.maxHealth) * 100}%`;
          }
        }
      }
      
      combatLog.innerHTML += hitText;
      combatLog.scrollTop = combatLog.scrollHeight;
    }
    
    // Jouer le son d'impact
    if (typeof playSound === 'function') {
      playSound('combat-hit');
    }
    
    // Effet visuel de dégâts
    visualizeDamage();
  } else {
    // L'attaque a échoué
    if (combatLog) {
      combatLog.innerHTML += `<div class="log-entry enemy">${enemy.name} rate son attaque.</div>`;
      combatLog.scrollTop = combatLog.scrollHeight;
    }
    
    // Jouer le son d'échec
    if (typeof playSound === 'function') {
      playSound('combat-miss');
    }
  }
  
  // Vérifier si le joueur est vaincu
  if (window.gameState.stats.health <= 0) {
    endCombat(false);
    return;
  }
  
  // Réactiver les boutons après un délai
  setTimeout(() => {
    toggleCombatButtons(true);
  }, 500);
}

/**
 * Lance les dés de combat (2d6)
 * @param {boolean} isEnemy - Si c'est l'ennemi qui lance les dés
 * @returns {number} - Résultat du lancer (2-12)
 */
function rollCombatDice(isEnemy = false) {
  // Générer deux valeurs aléatoires entre 1 et 6
  const die1 = Math.floor(Math.random() * 6) + 1;
  const die2 = Math.floor(Math.random() * 6) + 1;
  const total = die1 + die2;
  
  // Mettre à jour l'affichage des dés
  const dieElements = [
    document.getElementById('combat-die-1'),
    document.getElementById('combat-die-2')
  ];
  
  const resultElement = document.getElementById('combat-roll-result');
  
  // Animer les dés
  if (dieElements[0] && dieElements[1]) {
    dieElements.forEach(die => {
      die.classList.add('rolling');
      die.textContent = '?';
    });
    
    // Jouer le son des dés
    if (typeof playSound === 'function') {
      playSound('dice');
    }
    
    // Afficher le résultat après l'animation
    setTimeout(() => {
      dieElements[0].textContent = die1;
      dieElements[1].textContent = die2;
      
      dieElements.forEach(die => {
        die.classList.remove('rolling');
      });
      
      if (resultElement) {
        resultElement.textContent = `Total: ${total}`;
      }
    }, 500);
  }
  
  return total;
}

/**
 * Active/désactive les boutons de combat
 * @param {boolean} enabled - Si les boutons doivent être activés
 */
function toggleCombatButtons(enabled) {
  const buttons = document.querySelectorAll('.combat-button');
  
  buttons.forEach(button => {
    button.disabled = !enabled;
    button.style.opacity = enabled ? '1' : '0.5';
    button.style.cursor = enabled ? 'pointer' : 'not-allowed';
  });
}

/**
 * Gère l'utilisation des pouvoirs PSI en combat
 */
function useCombatPsiPower() {
  if (!window.gameState.combat.inCombat || !window.gameState.combat.enemy) {
    console.error("Aucun combat en cours");
    return;
  }
  
  if (window.gameState.stats.psi <= 0) {
    showMessage("Vous n'avez pas assez de points PSI!", 'warning');
    return;
  }
  
  // Désactiver les boutons pendant l'action
  toggleCombatButtons(false);
  
  // Récupérer les pouvoirs disponibles selon le personnage
  let powers = [];
  
  if (window.gameState.character === 'jonathan') {
    powers = [
      { name: "Béatification", effect: "damageMod", value: 5, cost: 1, description: "Vous bénissez votre arme, augmentant vos dégâts." },
      { name: "Sanctification", effect: "defenseMod", value: 5, cost: 1, description: "Vous créez une aura protectrice qui réduit les dégâts reçus." },
      { name: "Empalement", effect: "instakill", targetType: "vampire", cost: 2, description: "Vous préparez un pieu qui peut tuer instantanément un vampire (sur un 6 ou 12)." }
    ];
  } else if (window.gameState.character === 'dracula') {
    powers = [
      { name: "Domination des Petits Animaux", effect: "summon", value: "bats", cost: 1, description: "Vous invoquez des chauves-souris qui attaquent votre ennemi." },
      { name: "Brume Vampirique", effect: "defenseMod", value: 5, cost: 1, description: "Vous vous transformez partiellement en brume, réduisant les dégâts reçus." },
      { name: "Soif de Sang", effect: "lifesteal", value: 10, cost: 2, description: "Vous récupérez de la vie en buvant le sang de votre ennemi." }
    ];
  }
  
  // Créer une boîte de dialogue pour choisir le pouvoir
  showPowerSelectionDialog(powers, (selectedPower) => {
    // Appliquer le coût en PSI
    window.gameState.stats.psi -= selectedPower.cost;
    
    // Mettre à jour l'affichage du PSI
    updateStatsDisplay();
    
    // Effet visuel de PSI
    visualizePsiUse();
    
    // Ajouter l'entrée au journal de combat
    const combatLog = document.getElementById('combat-log');
    if (combatLog) {
      combatLog.innerHTML += `<div class="log-entry player">Vous utilisez ${selectedPower.name} ! ${selectedPower.description}</div>`;
      combatLog.scrollTop = combatLog.scrollHeight;
    }
    
    // Appliquer les effets du pouvoir
    applyPsiEffect(selectedPower);
    
    // Tour de l'ennemi après un délai
    setTimeout(() => {
      enemyAttack();
    }, 1500);
  });
}

/**
 * Affiche une boîte de dialogue pour choisir un pouvoir PSI
 * @param {Array} powers - Liste des pouvoirs disponibles
 * @param {Function} callback - Fonction à appeler avec le pouvoir sélectionné
 */
function showPowerSelectionDialog(powers, callback) {
  // Créer la boîte de dialogue
  const dialog = document.createElement('div');
  dialog.className = 'power-selection-dialog';
  dialog.style.position = 'fixed';
  dialog.style.top = '50%';
  dialog.style.left = '50%';
  dialog.style.transform = 'translate(-50%, -50%)';
  dialog.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
  dialog.style.padding = '20px';
  dialog.style.borderRadius = '10px';
  dialog.style.border = '2px solid #600';
  dialog.style.zIndex = '2000';
  dialog.style.width = '400px';
  dialog.style.maxWidth = '90%';
  dialog.style.boxShadow = '0 0 30px rgba(0, 0, 0, 0.7)';
  
  // Titre
  const title = document.createElement('h3');
  title.textContent = 'Choisissez un pouvoir PSI';
  title.style.textAlign = 'center';
  title.style.marginBottom = '20px';
  title.style.color = '#f00';
  
  dialog.appendChild(title);
  
  // Liste des pouvoirs
  powers.forEach(power => {
    // Vérifier si le joueur a assez de PSI
    const isDisabled = power.cost > window.gameState.stats.psi;
    
    const powerButton = document.createElement('button');
    powerButton.className = 'power-button';
    powerButton.disabled = isDisabled;
    powerButton.style.display = 'block';
    powerButton.style.width = '100%';
    powerButton.style.textAlign = 'left';
    powerButton.style.margin = '10px 0';
    powerButton.style.padding = '10px 15px';
    powerButton.style.backgroundColor = isDisabled ? '#333' : '#400';
    powerButton.style.color = '#fff';
    powerButton.style.border = `1px solid ${isDisabled ? '#555' : '#700'}`;
    powerButton.style.borderRadius = '5px';
    powerButton.style.cursor = isDisabled ? 'not-allowed' : 'pointer';
    powerButton.style.opacity = isDisabled ? '0.7' : '1';
    
    // Contenu du bouton
    powerButton.innerHTML = `
      <div style="font-weight: bold;">${power.name} (${power.cost} PSI)</div>
      <div style="font-size: 0.9em; margin-top: 5px;">${power.description}</div>
    `;
    
    // Effet de survol
    if (!isDisabled) {
      powerButton.onmouseover = function() {
        this.style.backgroundColor = '#600';
      };
      
      powerButton.onmouseout = function() {
        this.style.backgroundColor = '#400';
      };
      
      // Action au clic
      powerButton.onclick = function() {
        // Fermer la boîte de dialogue
        document.body.removeChild(dialog);
        
        // Appeler le callback avec le pouvoir sélectionné
        callback(power);
      };
    }
    
    dialog.appendChild(powerButton);
  });
  
  // Bouton d'annulation
  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Annuler';
  cancelButton.style.display = 'block';
  cancelButton.style.width = '100%';
  cancelButton.style.margin = '20px 0 10px';
  cancelButton.style.padding = '10px';
  cancelButton.style.backgroundColor = '#333';
  cancelButton.style.color = '#ccc';
  cancelButton.style.border = '1px solid #555';
  cancelButton.style.borderRadius = '5px';
  cancelButton.style.cursor = 'pointer';
  
  cancelButton.onclick = function() {
    // Fermer la boîte de dialogue
    document.body.removeChild(dialog);
    
    // Réactiver les boutons de combat
    toggleCombatButtons(true);
  };
  
  dialog.appendChild(cancelButton);
  
  // Ajouter la boîte de dialogue au document
  document.body.appendChild(dialog);
}

/**
 * Applique l'effet d'un pouvoir PSI
 * @param {Object} power - Pouvoir PSI sélectionné
 */
function applyPsiEffect(power) {
  if (!window.gameState.combat.inCombat || !window.gameState.combat.enemy) {
    console.error("Aucun combat en cours");
    return;
  }
  
  const enemy = window.gameState.combat.enemy;
  const combatLog = document.getElementById('combat-log');
  
  switch (power.effect) {
    case 'damageMod':
      // Augmenter les dégâts
      if (!window.gameState.activeEffects) {
        window.gameState.activeEffects = {};
      }
      
      window.gameState.activeEffects.damageMod = {
        name: power.name,
        description: "Augmente les dégâts infligés",
        value: power.value,
        duration: 3,
        type: 'buff'
      };
      
      // Mettre à jour l'affichage des effets actifs
      updateActiveEffectsDisplay();
      break;
      
    case 'defenseMod':
      // Réduire les dégâts reçus
      if (!window.gameState.activeEffects) {
        window.gameState.activeEffects = {};
      }
      
      window.gameState.activeEffects.defenseMod = {
        name: power.name,
        description: "Réduit les dégâts reçus",
        value: power.value,
        duration: 3,
        type: 'buff'
      };
      
      // Mettre à jour l'affichage des effets actifs
      updateActiveEffectsDisplay();
      break;
      
    case 'instakill':
      // Possibilité de tuer instantanément
      if (!window.gameState.activeEffects) {
        window.gameState.activeEffects = {};
      }
      
      window.gameState.activeEffects.instakill = {
        name: power.name,
        description: "Peut tuer instantanément un vampire",
        targetType: power.targetType,
        duration: 2,
        type: 'buff'
      };
      
      // Mettre à jour l'affichage des effets actifs
      updateActiveEffectsDisplay();
      break;
      
    case 'summon':
      // Invoquer des créatures pour attaquer
      const damage = Math.floor(Math.random() * 6) + 5; // 5-10 points de dégâts
      
      // Infliger des dégâts à l'ennemi
      enemy.health = Math.max(0, enemy.health - damage);
      
      // Mettre à jour l'affichage de la vie de l'ennemi
      const enemyHealthEl = document.getElementById('enemy-combat-health');
      const enemyHealthFillEl = document.getElementById('enemy-health-fill');
      
      if (enemyHealthEl) {
        enemyHealthEl.textContent = enemy.health;
      }
      
      if (enemyHealthFillEl) {
        enemyHealthFillEl.style.width = `${(enemy.health / enemy.maxHealth) * 100}%`;
      }
      
      // Ajouter une entrée au journal de combat
      if (combatLog) {
        combatLog.innerHTML += `<div class="log-entry player">Les ${power.value === 'bats' ? 'chauves-souris' : 'créatures'} infligent ${damage} points de dégâts à ${enemy.name}.</div>`;
        combatLog.scrollTop = combatLog.scrollHeight;
      }
      
      // Vérifier si l'ennemi est vaincu
      if (enemy.health <= 0) {
        endCombat(true);
      }
      break;
      
    case 'lifesteal':
      // Voler de la vie à l'ennemi
      const stealAmount = Math.min(power.value, enemy.health);
      
      // Infliger des dégâts à l'ennemi
      enemy.health = Math.max(0, enemy.health - stealAmount);
      
      // Récupérer de la vie
      window.gameState.stats.health = Math.min(
        window.gameState.stats.maxHealth,
        window.gameState.stats.health + stealAmount
      );
      
      // Mettre à jour l'affichage de la vie
      const playerHealthEl = document.getElementById('player-combat-health');
      const playerHealthFillEl = document.getElementById('player-health-fill');
      
      if (playerHealthEl) {
        playerHealthEl.textContent = window.gameState.stats.health;
      }
      
      if (playerHealthFillEl) {
        playerHealthFillEl.style.width = `${(window.gameState.stats.health / window.gameState.stats.maxHealth) * 100}%`;
      }
      
      // Mettre à jour l'affichage de la vie de l'ennemi
      const enemyHealthEl = document.getElementById('enemy-combat-health');
      const enemyHealthFillEl = document.getElementById('enemy-health-fill');
      
      if (enemyHealthEl) {
        enemyHealthEl.textContent = enemy.health;
      }
      
      if (enemyHealthFillEl) {
        enemyHealthFillEl.style.width = `${(enemy.health / enemy.maxHealth) * 100}%`;
      }
      
      // Ajouter une entrée au journal de combat
      if (combatLog) {
        combatLog.innerHTML += `<div class="log-entry player">Vous absorbez ${stealAmount} points de vie de ${enemy.name}.</div>`;
        combatLog.scrollTop = combatLog.scrollHeight;
      }
      
      // Vérifier si l'ennemi est vaincu
      if (enemy.health <= 0) {
        endCombat(true);
      }
      break;
  }
}

/**
 * Tente de fuir le combat
 */
function attemptToFlee() {
  if (!window.gameState.combat.inCombat || !window.gameState.combat.enemy) {
    console.error("Aucun combat en cours");
    return;
  }
  
  const enemy = window.gameState.combat.enemy;
  
  // Désactiver les boutons pendant la tentative
  toggleCombatButtons(false);
  
  // Lancer les dés
  const roll = rollCombatDice();
  
  // La fuite réussit si le lancer est supérieur au courage de l'ennemi
  const success = roll > enemy.stats.courage;
  
  // Ajouter l'entrée au journal de combat
  const combatLog = document.getElementById('combat-log');
  if (combatLog) {
    if (success) {
      combatLog.innerHTML += `<div class="log-entry player">Vous parvenez à fuir le combat !</div>`;
    } else {
      combatLog.innerHTML += `<div class="log-entry player">Tentative de fuite échouée !</div>`;
    }
    
    combatLog.scrollTop = combatLog.scrollHeight;
  }
  
  if (success) {
    // Terminer le combat avec fuite réussie
    endCombat(false, true);
  } else {
    // Tour de l'ennemi après un délai
    setTimeout(() => {
      enemyAttack();
    }, 1000);
  }
}

/**
 * Termine le combat
 * @param {boolean} victory - Si le joueur a gagné
 * @param {boolean} fled - Si le joueur a fui
 */
function endCombat(victory, fled = false) {
  if (!window.gameState.combat.inCombat || !window.gameState.combat.enemy) {
    console.error("Aucun combat en cours");
    return;
  }
  
  const enemy = window.gameState.combat.enemy;
  
  // Mettre à jour le journal de combat
  const combatLog = document.getElementById('combat-log');
  if (combatLog) {
    if (victory) {
      combatLog.innerHTML += `<div class="log-entry player">Vous avez vaincu ${enemy.name} !</div>`;
    } else if (fled) {
      combatLog.innerHTML += `<div class="log-entry player">Vous avez fui le combat.</div>`;
    } else {
      combatLog.innerHTML += `<div class="log-entry enemy">Vous avez été vaincu par ${enemy.name}...</div>`;
    }
    
    combatLog.scrollTop = combatLog.scrollHeight;
  }
  
  // Désactiver les boutons
  toggleCombatButtons(false);
  
  // Créer le message de résultat
  let message = '';
  let resultType = '';
  
  if (victory) {
    message = `Vous avez vaincu ${enemy.name} !`;
    resultType = 'success';
    
    // Accorder des récompenses
    if (enemy.rewards) {
      // Gain d'XP ou d'objets
      if (enemy.rewards.xp) {
        message += ` Vous gagnez ${enemy.rewards.xp} points d'expérience.`;
      }
      
      // Gain d'objet(s)
      if (enemy.rewards.items && enemy.rewards.items.length > 0) {
        const randomItemIndex = Math.floor(Math.random() * enemy.rewards.items.length);
        const itemId = enemy.rewards.items[randomItemIndex];
        
        // Ajouter l'objet à l'inventaire
        addItemToInventory(itemId);
        
        // Récupérer le nom de l'objet
        let itemName = itemId;
        if (window.gameData && window.gameData.items && window.gameData.items[itemId]) {
          itemName = window.gameData.items[itemId].name;
        }
        
        message += ` Vous avez obtenu : ${itemName}.`;
      }
    }
    
    // Marquer l'ennemi comme vaincu
    if (!window.gameState.enemyDefeated) {
      window.gameState.enemyDefeated = {};
    }
    window.gameState.enemyDefeated[enemy.id] = true;
  } else if (fled) {
    message = `Vous avez fui le combat contre ${enemy.name}.`;
    resultType = 'info';
  } else {
    message = `Vous avez été vaincu par ${enemy.name}...`;
    resultType = 'error';
  }
  
  // Afficher le message de résultat dans une boîte de dialogue
  const dialog = document.createElement('div');
  dialog.className = 'combat-result-dialog';
  dialog.style.position = 'fixed';
  dialog.style.top = '50%';
  dialog.style.left = '50%';
  dialog.style.transform = 'translate(-50%, -50%)';
  dialog.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
  dialog.style.padding = '20px';
  dialog.style.borderRadius = '10px';
  dialog.style.border = `2px solid ${
    resultType === 'success' ? '#060' :
    resultType === 'error' ? '#800' : '#555'
  }`;
  dialog.style.zIndex = '2001';
  dialog.style.width = '400px';
  dialog.style.maxWidth = '90%';
  dialog.style.boxShadow = '0 0 30px rgba(0, 0, 0, 0.7)';
  
  // Titre
  const title = document.createElement('h3');
  title.textContent = victory ? 'Victoire !' : fled ? 'Fuite réussie' : 'Défaite...';
  title.style.textAlign = 'center';
  title.style.marginBottom = '20px';
  title.style.color = 
    resultType === 'success' ? '#0f0' :
    resultType === 'error' ? '#f00' : '#fff';
  
  dialog.appendChild(title);
  
  // Message
  const messageElement = document.createElement('p');
  messageElement.textContent = message;
  messageElement.style.textAlign = 'center';
  messageElement.style.marginBottom = '30px';
  
  dialog.appendChild(messageElement);
  
  // Bouton pour continuer
  const continueButton = document.createElement('button');
  continueButton.textContent = 'Continuer';
  continueButton.style.display = 'block';
  continueButton.style.width = '180px';
  continueButton.style.margin = '0 auto';
  continueButton.style.padding = '10px 15px';
  continueButton.style.backgroundColor = '#400';
  continueButton.style.color = '#fff';
  continueButton.style.border = '1px solid #700';
  continueButton.style.borderRadius = '5px';
  continueButton.style.cursor = 'pointer';
  continueButton.style.fontSize = '1.1em';
  
  // Effet de survol
  continueButton.onmouseover = function() {
    this.style.backgroundColor = '#600';
    this.style.transform = 'translateY(-2px)';
    this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
  };
  
  continueButton.onmouseout = function() {
    this.style.backgroundColor = '#400';
    this.style.transform = '';
    this.style.boxShadow = '';
  };
  
  // Action du bouton
  continueButton.onclick = () => {
    // Fermer la boîte de dialogue
    document.body.removeChild(dialog);
    
    // Masquer l'interface de combat
    const combatInterface = document.getElementById('combat-interface');
    if (combatInterface) {
      combatInterface.style.display = 'none';
    }
    
    // Si le joueur est vaincu
    if (!victory && !fled) {
      handlePlayerDefeat();
    }
    
    // Mettre à jour l'état du combat
    window.gameState.combat.inCombat = false;
    window.gameState.combat.enemy = null;
    
    // Remettre la musique d'ambiance
    if (typeof playMusic === 'function') {
      playMusic('main-theme');
    }
    
    // Sauvegarder l'état du jeu
    saveGameState();
    
    // Mettre à jour l'interface
    updateStatsDisplay();
    updateInventoryDisplay();
  };
  
  dialog.appendChild(continueButton);
  
  // Ajouter au document
  document.body.appendChild(dialog);
}

/**
 * Gère la défaite du joueur
 */
function handlePlayerDefeat() {
  // Ramener le joueur à la moitié de sa vie
  window.gameState.stats.health = Math.ceil(window.gameState.stats.maxHealth / 2);
  
  // Message de défaite
  showMessage("Vous avez été vaincu, mais vous êtes parvenu à vous échapper avec la moitié de votre santé.", "warning", 5000);
  
  // Mettre à jour l'affichage des statistiques
  updateStatsDisplay();
}

/**
 * Visualise des dégâts reçus avec un effet visuel
 */
function visualizeDamage() {
  // Créer un overlay rouge pour simuler des dégâts
  const damageOverlay = document.createElement('div');
  damageOverlay.style.position = 'fixed';
  damageOverlay.style.top = '0';
  damageOverlay.style.left = '0';
  damageOverlay.style.width = '100%';
  damageOverlay.style.height = '100%';
  damageOverlay.style.backgroundColor = '#a00';
  damageOverlay.style.opacity = '0';
  damageOverlay.style.pointerEvents = 'none';
  damageOverlay.style.zIndex = '1500';
  damageOverlay.style.transition = 'opacity 0.1s';
  
  document.body.appendChild(damageOverlay);
  
  // Animer l'overlay
  setTimeout(() => {
    damageOverlay.style.opacity = '0.4';
  }, 10);
  
  setTimeout(() => {
    damageOverlay.style.opacity = '0';
  }, 150);
  
  // Supprimer l'overlay après l'animation
  setTimeout(() => {
    if (damageOverlay.parentNode) {
      damageOverlay.parentNode.removeChild(damageOverlay);
    }
  }, 300);
  
  // Effet de secousse de l'écran
  const gameContainer = document.getElementById('ui-container') || document.body;
  const originalTransform = gameContainer.style.transform || '';
  
  // Séquence de secousses
  setTimeout(() => { gameContainer.style.transform = `translate(${Math.random()*10-5}px, ${Math.random()*10-5}px)`; }, 50);
  setTimeout(() => { gameContainer.style.transform = `translate(${Math.random()*10-5}px, ${Math.random()*10-5}px)`; }, 100);
  setTimeout(() => { gameContainer.style.transform = `translate(${Math.random()*10-5}px, ${Math.random()*10-5}px)`; }, 150);
  setTimeout(() => { gameContainer.style.transform = originalTransform; }, 200);
}

/**
 * Visualise l'utilisation de PSI avec un effet visuel
 */
function visualizePsiUse() {
  // Créer un overlay violet pour simuler l'utilisation de PSI
  const psiOverlay = document.createElement('div');
  psiOverlay.style.position = 'fixed';
  psiOverlay.style.top = '0';
  psiOverlay.style.left = '0';
  psiOverlay.style.width = '100%';
  psiOverlay.style.height = '100%';
  psiOverlay.style.backgroundColor = '#8a2be2'; // Violet
  psiOverlay.style.opacity = '0';
  psiOverlay.style.pointerEvents = 'none';
  psiOverlay.style.zIndex = '1500';
  psiOverlay.style.transition = 'opacity 0.3s';
  
  document.body.appendChild(psiOverlay);
  
  // Animer l'overlay
  setTimeout(() => {
    psiOverlay.style.opacity = '0.3';
  }, 10);
  
  setTimeout(() => {
    psiOverlay.style.opacity = '0';
  }, 400);
  
  // Supprimer l'overlay après l'animation
  setTimeout(() => {
    if (psiOverlay.parentNode) {
      psiOverlay.parentNode.removeChild(psiOverlay);
    }
  }, 700);
  
  // Effet visuel supplémentaire sur le personnage et l'ennemi
  const gameContainer = document.getElementById('ui-container') || document.body;
  gameContainer.style.filter = 'hue-rotate(60deg) brightness(1.2)';
  
  // Restaurer après un délai
  setTimeout(() => {
    gameContainer.style.filter = '';
  }, 500);
}


// ==============================================
// GESTION DES POUVOIRS SPÉCIAUX
// ==============================================

/**
 * Utilise un pouvoir spécial (hors combat)
 * @param {Object} choice - Données du choix associé au pouvoir
 */
function usePsiPower(choice) {
  // Vérifier si le joueur a assez de points PSI
  if (window.gameState.stats.psi < 1) {
    showMessage("Vous n'avez pas assez de points PSI pour utiliser ce pouvoir!", "warning");
    return;
  }
  
  // Pouvoirs disponibles selon le personnage
  const powers = window.gameState.character === 'jonathan' ? 
    [
      { name: "Béatification", action: "beatify", cost: 1, description: "Bénit votre arme pour augmenter vos dégâts." },
      { name: "Sanctification", action: "sanctify", cost: 1, description: "Crée une aura protectrice qui réduit les dégâts reçus." },
      { name: "Vision", action: "vision", cost: 1, description: "Vous permet de percevoir des choses normalement invisibles." }
    ] : 
    [
      { name: "Téléportation", action: "teleport", cost: 1, description: "Vous téléporte vers un lieu connu." },
      { name: "Transmutation en chauve-souris", action: "transformBat", cost: 1, description: "Vous transforme en chauve-souris, permettant d'explorer des passages étroits." },
      { name: "Appel des créatures de la nuit", action: "summonCreatures", cost: 2, description: "Invoque des créatures pour vous aider." }
    ];
  
  // Si le choix spécifie déjà quel pouvoir utiliser
  if (choice && choice.power) {
    const power = powers.find(p => p.action === choice.power);
    if (power) {
      executePsiPower(power);
      return;
    }
  }
  
  // Sinon, afficher une boîte de dialogue pour choisir le pouvoir
  showPowerSelectionDialog(powers, (selectedPower) => {
    executePsiPower(selectedPower);
  });
}

/**
 * Exécute un pouvoir PSI spécifique
 * @param {Object} power - Pouvoir PSI à exécuter
 */
function executePsiPower(power) {
  // Déduire le coût en PSI
  window.gameState.stats.psi -= power.cost;
  updateStatsDisplay();
  
  // Effet visuel du pouvoir
  visualizePsiUse();
  
  // Exécuter l'action spécifique
  switch (power.action) {
    case 'teleport':
      showTeleportOptions();
      break;
      
    case 'transformBat':
      transformIntoBat();
      break;
      
    case 'vision':
      activateVision();
      break;
      
    case 'beatify':
      beatifyWeapon();
      break;
      
    case 'sanctify':
      createProtectiveAura();
      break;
      
    case 'summonCreatures':
      summonCreatures();
      break;
      
    default:
      console.error(`Action de pouvoir non reconnue: ${power.action}`);
      break;
  }
}

/**
 * Affiche les options de téléportation
 */
function showTeleportOptions() {
  // Récupérer les lieux visités
  const visitedLocations = window.gameState.visitedLocations || [];
  
  // Préparer les options de téléportation
  let teleportOptions = [];
  
  // Toujours ajouter la crypte pour Dracula
  if (window.gameState.character === 'dracula') {
    teleportOptions.push({ id: 'crypte-dracula', name: 'Crypte de Dracula' });
  }
  
  // Ajouter les autres lieux visités
  visitedLocations.forEach(locationId => {
    // Éviter les doublons
    if (!teleportOptions.some(opt => opt.id === locationId)) {
      let locationName = locationId;
      
      // Récupérer le vrai nom du lieu si disponible
      if (window.gameData && window.gameData.locations && window.gameData.locations[locationId]) {
        locationName = window.gameData.locations[locationId].title || locationId;
      }
      
      teleportOptions.push({ id: locationId, name: locationName });
    }
  });
  
  // Créer la boîte de dialogue
  const dialog = document.createElement('div');
  dialog.style.position = 'fixed';
  dialog.style.top = '50%';
  dialog.style.left = '50%';
  dialog.style.transform = 'translate(-50%, -50%)';
  dialog.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
  dialog.style.padding = '20px';
  dialog.style.borderRadius = '10px';
  dialog.style.border = '2px solid #600';
  dialog.style.zIndex = '1000';
  dialog.style.maxWidth = '400px';
  dialog.style.maxHeight = '80vh';
  dialog.style.overflowY = 'auto';
  
  // Titre
  const title = document.createElement('h3');
  title.textContent = 'Où souhaitez-vous vous téléporter ?';
  title.style.color = '#f00';
  title.style.textAlign = 'center';
  title.style.marginBottom = '20px';
  
  dialog.appendChild(title);
  
  // Liste des options
  teleportOptions.forEach(location => {
    const button = document.createElement('button');
    button.textContent = location.name;
    button.style.display = 'block';
    button.style.width = '100%';
    button.style.padding = '10px';
    button.style.margin = '10px 0';
    button.style.backgroundColor = '#400';
    button.style.color = '#fff';
    button.style.border = '1px solid #700';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.transition = 'all 0.3s';
    
    button.onmouseover = function() {
      this.style.backgroundColor = '#600';
      this.style.transform = 'translateY(-2px)';
    };
    
    button.onmouseout = function() {
      this.style.backgroundColor = '#400';
      this.style.transform = '';
    };
    
    button.onclick = function() {
      document.body.removeChild(dialog);
      loadLocation(location.id);
      showMessage(`Vous vous êtes téléporté vers ${location.name}.`, 'success');
    };
    
    dialog.appendChild(button);
  });
  
  // Bouton d'annulation
  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Annuler';
  cancelButton.style.display = 'block';
  cancelButton.style.width = '100%';
  cancelButton.style.padding = '10px';
  cancelButton.style.margin = '20px 0 0';
  cancelButton.style.backgroundColor = '#333';
  cancelButton.style.color = '#ccc';
  cancelButton.style.border = '1px solid #555';
  cancelButton.style.borderRadius = '5px';
  cancelButton.style.cursor = 'pointer';
  
  cancelButton.onclick = function() {
    document.body.removeChild(dialog);
    
    // Rembourser le point PSI
    window.gameState.stats.psi += 1;
    updateStatsDisplay();
    
    showMessage("Téléportation annulée.", 'info');
  };
  
  dialog.appendChild(cancelButton);
  
  // Ajouter la boîte de dialogue au document
  document.body.appendChild(dialog);
}

/**
 * Transformation en chauve-souris (pour Dracula)
 */
function transformIntoBat() {
  if (window.gameState.character !== 'dracula') {
    showMessage("Seul Dracula peut se transformer en chauve-souris!", 'error');
    return;
  }
  
  // Activer l'effet de transformation
  if (!window.gameState.activeEffects) {
    window.gameState.activeEffects = {};
  }
  
  window.gameState.activeEffects.batForm = {
    name: "Forme de chauve-souris",
    description: "Vous êtes transformé en chauve-souris, ce qui vous permet d'accéder à des passages étroits et d'éviter certains dangers.",
    duration: 3,
    type: 'buff'
  };
  
  // Mettre à jour l'affichage
  updateActiveEffectsDisplay();
  
  // Effet visuel de transformation
  // (simple animation pour montrer la transformation)
  const portraitElement = document.getElementById('player-portrait');
  if (portraitElement) {
    // Sauvegarder l'image actuelle
    const originalImage = portraitElement.style.backgroundImage;
    
    // Animer la transformation
    const fadeOut = () => {
      let opacity = 1;
      const fadeOutInterval = setInterval(() => {
        opacity -= 0.1;
        portraitElement.style.opacity = opacity;
        
        if (opacity <= 0) {
          clearInterval(fadeOutInterval);
          
          // Changer l'image
          portraitElement.style.backgroundImage = `url('https://fluffy-kashata-47db51.netlify.app/img/chauve-souris.png')`;
          
          // Faire apparaître la nouvelle image
          fadeIn();
        }
      }, 50);
    };
    
    const fadeIn = () => {
      let opacity = 0;
      const fadeInInterval = setInterval(() => {
        opacity += 0.1;
        portraitElement.style.opacity = opacity;
        
        if (opacity >= 1) {
          clearInterval(fadeInInterval);
          
          // Restaurer l'image d'origine après la durée de l'effet
          setTimeout(() => {
            // Si l'effet est toujours actif à la fin du timer
            if (window.gameState.activeEffects && window.gameState.activeEffects.batForm) {
              // Faire disparaître l'image de chauve-souris
              let opacity = 1;
              const finalFadeOut = setInterval(() => {
                opacity -= 0.1;
                portraitElement.style.opacity = opacity;
                
                if (opacity <= 0) {
                  clearInterval(finalFadeOut);
                  
                  // Restaurer l'image originale
                  portraitElement.style.backgroundImage = originalImage;
                  
                  // Faire apparaître l'image originale
                  let finalOpacity = 0;
                  const finalFadeIn = setInterval(() => {
                    finalOpacity += 0.1;
                    portraitElement.style.opacity = finalOpacity;
                    
                    if (finalOpacity >= 1) {
                      clearInterval(finalFadeIn);
                      
                      // Supprimer l'effet
                      delete window.gameState.activeEffects.batForm;
                      updateActiveEffectsDisplay();
                    }
                  }, 50);
                }
              }, 50);
            }
          }, 3 * 60 * 1000); // 3 minutes (simulation de 3 tours)
        }
      }, 50);
    };
    
    // Lancer l'animation
    fadeOut();
  }
  
  // Mettre à jour les lieux accessibles en fonction de la transformation
  updateChoicesDisplay(window.gameData.locations[window.gameState.currentLocation].choices || []);
  
  showMessage("Vous vous êtes transformé en chauve-souris!", 'success');
}

/**
 * Activer la vision spéciale (pour Jonathan)
 */
function activateVision() {
  if (window.gameState.character !== 'jonathan') {
    showMessage("Seul Jonathan peut utiliser ce pouvoir!", 'error');
    return;
  }
  
  // Activer l'effet de vision
  if (!window.gameState.activeEffects) {
    window.gameState.activeEffects = {};
  }
  
  window.gameState.activeEffects.vision = {
    name: "Vision mystique",
    description: "Vous pouvez percevoir des choses normalement invisibles.",
    duration: 3,
    type: 'buff'
  };
  
  // Mettre à jour l'affichage
  updateActiveEffectsDisplay();
  
  // Effet visuel de vision améliorée
  const gameContainer = document.getElementById('ui-container') || document.body;
  gameContainer.style.filter = 'sepia(0.5) hue-rotate(200deg)';
  
  // Restaurer après un délai
  setTimeout(() => {
    gameContainer.style.filter = '';
  }, 3000);
  
  // Vérifier s'il y a des éléments cachés à révéler dans la location actuelle
  const currentLocation = window.gameState.currentLocation;
  if (window.gameData.locations[currentLocation] && window.gameData.locations[currentLocation].hiddenElements) {
    // Révéler des éléments cachés dans la description
    const descriptionElement = document.getElementById('locations-description');
    if (descriptionElement) {
      descriptionElement.innerHTML += `<p class="hidden-revelation"><em>${window.gameData.locations[currentLocation].hiddenElements}</em></p>`;
    }
    
    // Ajouter des choix supplémentaires si nécessaire
    if (window.gameData.locations[currentLocation].hiddenChoices) {
      updateChoicesDisplay([
        ...(window.gameData.locations[currentLocation].choices || []),
        ...window.gameData.locations[currentLocation].hiddenChoices
      ]);
    }
  } else {
    showMessage("Votre vision s'améliore, mais vous ne remarquez rien de particulier ici.", 'info');
  }
}

/**
 * Bénir une arme pour augmenter les dégâts (pour Jonathan)
 */
function beatifyWeapon() {
  if (window.gameState.character !== 'jonathan') {
    showMessage("Seul Jonathan peut bénir des armes!", 'error');
    return;
  }
  
  // Vérifier si le joueur possède une arme
  let hasWeapon = false;
  
  if (window.gameState.inventory) {
    for (const item of window.gameState.inventory) {
      let itemData = null;
      
      if (typeof item === 'string' && window.gameData.items[item]) {
        itemData = window.gameData.items[item];
      } else if (typeof item === 'object') {
        itemData = item;
      }
      
      if (itemData && itemData.type === 'weapon') {
        hasWeapon = true;
        break;
      }
    }
  }
  
  if (!hasWeapon) {
    showMessage("Vous n'avez pas d'arme à bénir!", 'warning');
    
    // Rembourser le point PSI
    window.gameState.stats.psi += 1;
    updateStatsDisplay();
    
    return;
  }
  
  // Activer l'effet de bénédiction
  if (!window.gameState.activeEffects) {
    window.gameState.activeEffects = {};
  }
  
  window.gameState.activeEffects.beatifiedWeapon = {
    name: "Arme bénite",
    description: "Votre arme est bénie, ce qui augmente ses dégâts de 5 points.",
    value: 5,
    duration: 3,
    type: 'buff'
  };
  
  // Mettre à jour l'affichage
  updateActiveEffectsDisplay();
  
  showMessage("Votre arme brille maintenant d'une lueur sacrée, augmentant ses dégâts!", 'success');
}

/**
 * Créer une aura protectrice (pour Jonathan)
 */
function createProtectiveAura() {
  if (window.gameState.character !== 'jonathan') {
    showMessage("Seul Jonathan peut créer une aura protectrice!", 'error');
    return;
  }
  
  // Activer l'effet de protection
  if (!window.gameState.activeEffects) {
    window.gameState.activeEffects = {};
  }
  
  window.gameState.activeEffects.protectiveAura = {
    name: "Aura protectrice",
    description: "Une aura divine vous protège, réduisant les dégâts reçus de 3 points.",
    value: 3,
    duration: 3,
    type: 'buff'
  };
  
  // Mettre à jour l'affichage
  updateActiveEffectsDisplay();
  
  // Effet visuel
  const auraEffect = document.createElement('div');
  auraEffect.style.position = 'fixed';
  auraEffect.style.top = '0';
  auraEffect.style.left = '0';
  auraEffect.style.width = '100%';
  auraEffect.style.height = '100%';
  auraEffect.style.background = 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.3) 100%)';
  auraEffect.style.pointerEvents = 'none';
  auraEffect.style.zIndex = '10';
  auraEffect.style.opacity = '0';
  auraEffect.style.transition = 'opacity 1s';
  
  document.body.appendChild(auraEffect);
  
  // Animer l'aura
  setTimeout(() => {
    auraEffect.style.opacity = '1';
    
    setTimeout(() => {
      auraEffect.style.opacity = '0';
      
      setTimeout(() => {
        if (auraEffect.parentNode) {
          auraEffect.parentNode.removeChild(auraEffect);
        }
      }, 1000);
    }, 3000);
  }, 10);
  
  showMessage("Une aura divine vous entoure, réduisant les dégâts que vous recevez!", 'success');
}

/**
 * Invoquer des créatures (pour Dracula)
 */
function summonCreatures() {
  if (window.gameState.character !== 'dracula') {
    showMessage("Seul Dracula peut invoquer des créatures de la nuit!", 'error');
    return;
  }
  
  // Déterminer les créatures disponibles
  const creatures = [
    { name: "Chauve-souris", effect: "scout", description: "Une nuée de chauves-souris qui explorera les environs pour vous." },
    { name: "Loups", effect: "protect", description: "Une meute de loups qui vous protégera contre les dangers." },
    { name: "Rats", effect: "distract", description: "Un essaim de rats qui distraira vos ennemis." }
  ];
  
  // Créer la boîte de dialogue
  const dialog = document.createElement('div');
  dialog.style.position = 'fixed';
  dialog.style.top = '50%';
  dialog.style.left = '50%';
  dialog.style.transform = 'translate(-50%, -50%)';
  dialog.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
  dialog.style.padding = '20px';
  dialog.style.borderRadius = '10px';
  dialog.style.border = '2px solid #600';
  dialog.style.zIndex = '1000';
  dialog.style.width = '400px';
  dialog.style.maxWidth = '90%';
  dialog.style.color = '#fff';
  
  // Titre
  const title = document.createElement('h3');
  title.textContent = 'Quelles créatures souhaitez-vous invoquer ?';
  title.style.color = '#f00';
  title.style.textAlign = 'center';
  title.style.marginBottom = '20px';
  
  dialog.appendChild(title);
  
  // Liste des créatures
  creatures.forEach(creature => {
    const button = document.createElement('button');
    button.textContent = creature.name;
    button.style.display = 'block';
    button.style.width = '100%';
    button.style.padding = '10px';
    button.style.margin = '10px 0';
    button.style.backgroundColor = '#400';
    button.style.color = '#fff';
    button.style.border = '1px solid #700';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.textAlign = 'left';
    
    // Ajouter la description
    const description = document.createElement('div');
    description.textContent = creature.description;
    description.style.fontSize = '0.9em';
    description.style.marginTop = '5px';
    description.style.opacity = '0.8';
    
    button.appendChild(description);
    
    // Action au clic
    button.onclick = function() {
      document.body.removeChild(dialog);
      
      // Appliquer l'effet de la créature
      if (!window.gameState.activeEffects) {
        window.gameState.activeEffects = {};
      }
      
      window.gameState.activeEffects[creature.effect] = {
        name: creature.name,
        description: creature.description,
        duration: 5,
        type: 'buff'
      };
      
      // Mettre à jour l'affichage
      updateActiveEffectsDisplay();
      
      // Effet spécial selon la créature
      switch (creature.effect) {
        case 'scout':
          // Révéler des passages secrets ou informations
          const currentLocation = window.gameState.currentLocation;
          if (window.gameData.locations[currentLocation] && window.gameData.locations[currentLocation].secrets) {
            showMessage(`Vos chauves-souris ont découvert un secret : ${window.gameData.locations[currentLocation].secrets}`, 'success');
          } else {
            showMessage("Vos chauves-souris s'envolent pour explorer les environs.", 'info');
          }
          break;
          
        case 'protect':
          // Ajouter une protection contre les dégâts
          window.gameState.activeEffects.wolfProtection = {
            name: "Protection des loups",
            description: "Les loups vous protègent, réduisant les dégâts reçus de 2 points.",
            value: 2,
            duration: 5,
            type: 'buff'
          };
          updateActiveEffectsDisplay();
          showMessage("Une meute de loups se matérialise et vous entoure, prête à vous défendre.", 'success');
          break;
          
        case 'distract':
          // Rendre la fuite plus facile
          window.gameState.activeEffects.ratDistraction = {
            name: "Distraction des rats",
            description: "Les rats distraient vos ennemis, rendant la fuite plus facile.",
            value: 3,
            duration: 5,
            type: 'buff'
          };
          updateActiveEffectsDisplay();
          showMessage("Un essaim de rats se répand autour de vous, prêt à distraire vos ennemis.", 'success');
          break;
      }
    };
    
    dialog.appendChild(button);
  });
  
  // Bouton d'annulation
  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Annuler';
  cancelButton.style.display = 'block';
  cancelButton.style.width = '100%';
  cancelButton.style.padding = '10px';
  cancelButton.style.margin = '20px 0 0';
  cancelButton.style.backgroundColor = '#333';
  cancelButton.style.color = '#ccc';
  cancelButton.style.border = '1px solid #555';
  cancelButton.style.borderRadius = '5px';
  cancelButton.style.cursor = 'pointer';
  
  cancelButton.onclick = function() {
    document.body.removeChild(dialog);
    
    // Rembourser le point PSI
    window.gameState.stats.psi += 2; // Le coût de l'invocation est de 2 PSI
    updateStatsDisplay();
    
    showMessage("Invocation annulée.", 'info');
  };
  
  dialog.appendChild(cancelButton);
  
  // Ajouter la boîte de dialogue au document
  document.body.appendChild(dialog);
}

/**
 * Recherche un passage secret dans la location actuelle
 * @param {Object} choice - Données du choix associé à la recherche
 */
function searchSecret(choice) {
  const currentLocation = window.gameState.currentLocation;
  
  // Vérifier si la location a des passages secrets
  if (!window.gameData.locations[currentLocation].secretPassages) {
    showMessage("Vous ne trouvez aucun passage secret ici.", 'info');
    return;
  }
  
  // Calculer les chances de succès (basées sur l'habileté)
  const baseChance = 0.3; // 30% de base
  const skillBonus = window.gameState.stats.habilete * 0.1; // +10% par point d'habileté
  const totalChance = Math.min(0.9, baseChance + skillBonus); // Maximum 90%
  
  // Déterminer si la recherche est un succès
  if (Math.random() < totalChance) {
    // Passage secret trouvé !
    const secretDestination = window.gameData.locations[currentLocation].secretPassages;
    
    showMessage("Vous avez trouvé un passage secret !", 'success');
    
    // Proposer d'emprunter le passage
    const confirmDialog = document.createElement('div');
    confirmDialog.style.position = 'fixed';
    confirmDialog.style.top = '50%';
    confirmDialog.style.left = '50%';
    confirmDialog.style.transform = 'translate(-50%, -50%)';
    confirmDialog.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    confirmDialog.style.padding = '20px';
    confirmDialog.style.borderRadius = '10px';
    confirmDialog.style.border = '2px solid #070';
    confirmDialog.style.zIndex = '1000';
    confirmDialog.style.width = '400px';
    confirmDialog.style.maxWidth = '90%';
    confirmDialog.style.textAlign = 'center';
    confirmDialog.style.color = '#fff';
    
    // Message
    const message = document.createElement('p');
    message.textContent = "Voulez-vous emprunter ce passage ?";
    message.style.marginBottom = '20px';
    
    confirmDialog.appendChild(message);
    
    // Boutons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'center';
    buttonContainer.style.gap = '20px';
    
    // Bouton Oui
    const yesButton = document.createElement('button');
    yesButton.textContent = 'Oui';
    yesButton.style.padding = '10px 20px';
    yesButton.style.backgroundColor = '#070';
    yesButton.style.color = '#fff';
    yesButton.style.border = '1px solid #090';
    yesButton.style.borderRadius = '5px';
    yesButton.style.cursor = 'pointer';
    
    yesButton.onclick = function() {
      document.body.removeChild(confirmDialog);
      loadLocation(secretDestination);
    };
    
    // Bouton Non
    const noButton = document.createElement('button');
    noButton.textContent = 'Non';
    noButton.style.padding = '10px 20px';
    noButton.style.backgroundColor = '#700';
    noButton.style.color = '#fff';
    noButton.style.border = '1px solid #900';
    noButton.style.borderRadius = '5px';
    noButton.style.cursor = 'pointer';
    
    noButton.onclick = function() {
      document.body.removeChild(confirmDialog);
    };
    
    buttonContainer.appendChild(yesButton);
    buttonContainer.appendChild(noButton);
    
    confirmDialog.appendChild(buttonContainer);
    
    // Ajouter au document
    document.body.appendChild(confirmDialog);
  } else {
    // Échec
    showMessage("Vous cherchez un passage secret, mais vous ne trouvez rien.", 'info');
  }
}

// ==============================================
// HELPERS ET UTILITAIRES
// ==============================================

/**
 * Obtient un élément aléatoire dans un tableau
 * @param {Array} array - Tableau source
 * @returns {*} - Élément aléatoire
 */
function getRandomElement(array) {
  if (!array || array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Met à jour tous les compteurs d'effets actifs (réduction de la durée)
 */
function updateActiveEffects() {
  if (!window.gameState.activeEffects) return;
  
  const effectsToRemove = [];
  
  // Parcourir tous les effets actifs
  for (const [effectId, effectData] of Object.entries(window.gameState.activeEffects)) {
    // Si l'effet a une durée
    if (effectData.duration) {
      // Réduire la durée
      effectData.duration--;
      
      // Si la durée est épuisée, marquer pour suppression
      if (effectData.duration <= 0) {
        effectsToRemove.push(effectId);
      }
    }
  }
  
  // Supprimer les effets expirés
  effectsToRemove.forEach(effectId => {
    delete window.gameState.activeEffects[effectId];
  });
  
  // Mettre à jour l'affichage si des effets ont été supprimés
  if (effectsToRemove.length > 0) {
    updateActiveEffectsDisplay();
  }
}

/**
 * Convertit un nombre en chiffres romains
 * @param {number} num - Nombre à convertir
 * @returns {string} - Représentation en chiffres romains
 */
function toRomanNumeral(num) {
  const romanNumerals = [
    { value: 1000, numeral: 'M' },
    { value: 900, numeral: 'CM' },
    { value: 500, numeral: 'D' },
    { value: 400, numeral: 'CD' },
    { value: 100, numeral: 'C' },
    { value: 90, numeral: 'XC' },
    { value: 50, numeral: 'L' },
    { value: 40, numeral: 'XL' },
    { value: 10, numeral: 'X' },
    { value: 9, numeral: 'IX' },
    { value: 5, numeral: 'V' },
    { value: 4, numeral: 'IV' },
    { value: 1, numeral: 'I' }
  ];
  
  let result = '';
  
  for (const { value, numeral } of romanNumerals) {
    while (num >= value) {
      result += numeral;
      num -= value;
    }
  }
  
  return result;
}


// ==============================================
// GESTION DE L'INTERFACE UTILISATEUR
// ==============================================

/**
 * Met à jour l'affichage des statistiques
 */
function updateStatsDisplay() {
  // Statistiques principales
  const stats = ['rapidite', 'courage', 'force', 'habilete', 'psi'];
  
  stats.forEach(stat => {
    const element = document.getElementById(`stat-${stat}`);
    if (element && window.gameState.stats[stat] !== undefined) {
      element.textContent = window.gameState.stats[stat];
    }
  });
  
  // Santé
  const healthEl = document.getElementById('health-value');
  const maxHealthEl = document.getElementById('max-health-value');
  
  if (healthEl && window.gameState.stats.health !== undefined) {
    healthEl.textContent = window.gameState.stats.health;
  }
  
  if (maxHealthEl && window.gameState.stats.maxHealth !== undefined) {
    maxHealthEl.textContent = window.gameState.stats.maxHealth;
  }
  
  // PSI Max
  const psiMaxEl = document.getElementById('stat-psiMax');
  if (psiMaxEl && window.gameState.stats.psiMax !== undefined) {
    psiMaxEl.textContent = window.gameState.stats.psiMax;
  }
}

/**
 * Met à jour l'affichage des effets actifs
 */
function updateActiveEffectsDisplay() {
  const effectsList = document.getElementById('active-effects');
  if (!effectsList) return;
  
  // Vider la liste actuelle
  effectsList.innerHTML = '';
  
  // Si aucun effet actif
  if (!window.gameState.activeEffects || Object.keys(window.gameState.activeEffects).length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.textContent = 'Aucun effet';
    effectsList.appendChild(emptyItem);
    return;
  }
  
  // Ajouter chaque effet actif
  for (const [effectId, effectData] of Object.entries(window.gameState.activeEffects)) {
    const listItem = document.createElement('li');
    
    // Nom de l'effet
    let effectName = effectId;
    if (typeof effectData === 'object' && effectData.name) {
      effectName = effectData.name;
    }
    
    // Durée restante
    let durationText = '';
    if (typeof effectData === 'object' && effectData.duration) {
      durationText = ` (${effectData.duration} tours)`;
    }
    
    listItem.textContent = effectName + durationText;
    
    // Ajouter un tooltip avec la description
    if (typeof effectData === 'object' && effectData.description) {
      listItem.setAttribute('data-tooltip', effectData.description);
    }
    
    // Ajouter une classe selon le type d'effet
    if (typeof effectData === 'object' && effectData.type) {
      const effectType = effectData.type === 'buff' ? 'positive' : 'negative';
      listItem.classList.add(`effect-${effectType}`);
    }
    
    effectsList.appendChild(listItem);
  }
}

/**
 * Met à jour l'affichage des lieux visités
 */
function updateVisitedLocationsDisplay() {
  const visitedList = document.getElementById('visited-locations');
  if (!visitedList) return;
  
  // Vider la liste actuelle
  visitedList.innerHTML = '';
  
  // Si aucun lieu visité
  if (!window.gameState.visitedLocations || window.gameState.visitedLocations.length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.textContent = 'Aucun lieu';
    visitedList.appendChild(emptyItem);
    return;
  }
  
  // Ajouter chaque lieu visité
  window.gameState.visitedLocations.forEach(locationId => {
    // Obtenir le nom du lieu
    let locationName = locationId;
    if (window.gameData && window.gameData.locations && window.gameData.locations[locationId]) {
      locationName = window.gameData.locations[locationId].title || locationId;
    }
    
    const listItem = document.createElement('li');
    listItem.textContent = locationName;
    
    // Rendre l'élément cliquable pour revisiter le lieu
    listItem.style.cursor = 'pointer';
    listItem.onclick = () => loadLocation(locationId);
    
    visitedList.appendChild(listItem);
  });
}

/**
 * Affiche un message temporaire à l'utilisateur
 * @param {string} message - Message à afficher
 * @param {string} type - Type de message ('info', 'success', 'warning', 'error')
 * @param {number} duration - Durée d'affichage en ms (0 pour permanent)
 */
function showMessage(message, type = 'info', duration = 3000) {
  // Vérifier si un conteneur de messages existe
  let messageContainer = document.getElementById('message-container');
  
  if (!messageContainer) {
    // Créer un conteneur de messages
    messageContainer = document.createElement('div');
    messageContainer.id = 'message-container';
    messageContainer.style.position = 'fixed';
    messageContainer.style.top = '20px';
    messageContainer.style.left = '50%';
    messageContainer.style.transform = 'translateX(-50%)';
    messageContainer.style.zIndex = '1000';
    messageContainer.style.display = 'flex';
    messageContainer.style.flexDirection = 'column';
    messageContainer.style.alignItems = 'center';
    messageContainer.style.gap = '10px';
    
    document.body.appendChild(messageContainer);
  }
  
  // Créer le message
  const messageElement = document.createElement('div');
  messageElement.className = `message message-${type}`;
  messageElement.textContent = message;
  
  // Styles du message
  messageElement.style.padding = '10px 20px';
  messageElement.style.borderRadius = '5px';
  messageElement.style.backgroundColor = type === 'error' ? '#900' : 
                                        type === 'warning' ? '#960' : 
                                        type === 'success' ? '#070' : '#333';
  messageElement.style.color = '#fff';
  messageElement.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.5)';
  messageElement.style.maxWidth = '400px';
  messageElement.style.opacity = '0';
  messageElement.style.transform = 'translateY(-20px)';
  messageElement.style.transition = 'opacity 0.3s, transform 0.3s';
  
  // Ajouter le message au conteneur
  messageContainer.appendChild(messageElement);
  
  // Animer l'apparition du message
  setTimeout(() => {
    messageElement.style.opacity = '1';
    messageElement.style.transform = 'translateY(0)';
  }, 10);
  
  // Supprimer le message après la durée spécifiée
  if (duration > 0) {
    setTimeout(() => {
      // Animer la disparition du message
      messageElement.style.opacity = '0';
      messageElement.style.transform = 'translateY(-20px)';
      
      // Supprimer le message après l'animation
      setTimeout(() => {
        if (messageElement.parentNode) {
          messageElement.parentNode.removeChild(messageElement);
        }
      }, 300);
    }, duration);
  } else {
    // Pour les messages permanents, ajouter un bouton de fermeture
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '5px';
    closeButton.style.right = '5px';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.color = '#fff';
    closeButton.style.fontSize = '1.2em';
    closeButton.style.cursor = 'pointer';
    
    closeButton.onclick = () => {
      // Animer la disparition du message
      messageElement.style.opacity = '0';
      messageElement.style.transform = 'translateY(-20px)';
      
      // Supprimer le message après l'animation
      setTimeout(() => {
        if (messageElement.parentNode) {
          messageElement.parentNode.removeChild(messageElement);
        }
      }, 300);
    };
    
    messageElement.appendChild(closeButton);
  }
}




// ==============================================
// GESTION AUDIO
// ==============================================

/**
 * Joue un effet sonore
 * @param {string} soundId - Identifiant du son à jouer
 * @param {number} volume - Volume (0-1)
 */
function playSound(soundId, volume = 0.5) {
  if (!window.audioEnabled) return;
  
  // Obtenir l'élément audio
  const audioElement = document.getElementById(soundId + '-sound') || 
                       document.getElementById('sound-' + soundId);
  
  if (audioElement) {
    // Réinitialiser la position de lecture
    audioElement.currentTime = 0;
    
    // Définir le volume
    audioElement.volume = volume;
    
    // Jouer le son
    audioElement.play().catch(error => {
      console.warn(`Lecture du son ${soundId} impossible:`, error);
    });
  } else {
    console.warn(`Élément audio ${soundId} non trouvé`);
  }
}

/**
 * Joue un son en boucle
 * @param {string} soundId - Identifiant du son à jouer
 * @param {number} volume - Volume (0-1)
 */
function loopSound(soundId, volume = 0.3) {
  if (!window.audioEnabled) return;
  
  // Obtenir l'élément audio
  const audioElement = document.getElementById(soundId + '-sound') || 
                       document.getElementById('sound-' + soundId);
  
  if (audioElement) {
    // Définir le mode boucle
    audioElement.loop = true;
    
    // Définir le volume
    audioElement.volume = volume;
    
    // Jouer le son
    audioElement.play().catch(error => {
      console.warn(`Lecture du son ${soundId} impossible:`, error);
    });
  } else {
    console.warn(`Élément audio ${soundId} non trouvé`);
  }
}

/**
 * Arrête un son
 * @param {string} soundId - Identifiant du son à arrêter
 */
function stopSound(soundId) {
  // Obtenir l'élément audio
  const audioElement = document.getElementById(soundId + '-sound') || 
                       document.getElementById('sound-' + soundId);
  
  if (audioElement) {
    // Arrêter la lecture
    audioElement.pause();
    audioElement.currentTime = 0;
  }
}

/**
 * Arrête tous les sons d'ambiance
 */
function stopAllAmbientSounds() {
  // Liste des sons d'ambiance
  const ambientSounds = ['rain', 'wind', 'crickets', 'heartbeat', 'whispers', 'creaking'];
  
  // Arrêter chaque son
  ambientSounds.forEach(soundId => {
    stopSound(soundId);
  });
}

/**
 * Joue une musique de fond
 * @param {string} musicId - Identifiant de la musique
 * @param {number} volume - Volume (0-1)
 */
function playMusic(musicId, volume = 0.3) {
  if (!window.audioEnabled) return;
  
  // Arrêter la musique actuelle si elle existe
  const currentMusic = document.querySelector('audio[data-music="current"]');
  if (currentMusic) {
    currentMusic.pause();
    currentMusic.currentTime = 0;
    currentMusic.removeAttribute('data-music');
  }
  
  // Obtenir l'élément de la nouvelle musique
  const musicElement = document.getElementById(musicId + '-music') || 
                       document.getElementById('music-' + musicId) ||
                       document.getElementById('background-music');
  
  if (musicElement) {
    // Marquer comme musique actuelle
    musicElement.setAttribute('data-music', 'current');
    
    // Définir le mode boucle
    musicElement.loop = true;
    
    // Définir le volume
    musicElement.volume = volume;
    
    // Jouer la musique
    musicElement.play().catch(error => {
      console.warn(`Lecture de la musique ${musicId} impossible:`, error);
    });
  } else {
    console.warn(`Élément musical ${musicId} non trouvé`);
  }
}

/**
 * Active/désactive l'audio
 */
function toggleAudio() {
  window.audioEnabled = !window.audioEnabled;
  
  // Mettre à jour le bouton audio
  const audioButton = document.getElementById('audio-toggle');
  if (audioButton) {
    audioButton.textContent = window.audioEnabled ? 'Son' : 'Son (off)';
  }
  
  // Activer/désactiver tous les sons
  const allAudio = document.querySelectorAll('audio');
  
  if (window.audioEnabled) {
    // Reprendre la lecture de la musique de fond
    const backgroundMusic = document.querySelector('audio[data-music="current"]') || 
                           document.getElementById('background-music');
    if (backgroundMusic) {
      backgroundMusic.play().catch(error => {
        console.warn('Impossible de reprendre la musique de fond:', error);
      });
    }
  } else {
    // Mettre en pause tous les sons
    allAudio.forEach(audio => {
      audio.pause();
    });
  }
  
  return window.audioEnabled;
}

// ==============================================
// INITIALISATION ET ÉVÉNEMENTS
// ==============================================

/**
 * Initialise le jeu
 */
function initGame() {
  console.log("Initialisation du jeu Château de Dracula...");
  
  // Charger l'état sauvegardé, s'il existe
  const savedGame = loadGameState();
  
  // Si aucune sauvegarde n'est trouvée, rediriger vers l'écran de création de personnage
  if (!savedGame && window.location.pathname.includes('improved-ui')) {
    console.log("Aucune sauvegarde trouvée, redirection vers l'écran d'accueil");
    window.location.href = 'index-html.html';
    return;
  }
  
  // Mettre à jour l'interface
  updateStatsDisplay();
  updateInventoryDisplay();
  updateActiveEffectsDisplay();
  updateVisitedLocationsDisplay();
  
  // Charger la location actuelle
  if (window.gameState.currentLocation) {
    loadLocation(window.gameState.currentLocation);
  }
  
  // Installer les gestionnaires d'événements
  setupEventListeners();
  
  // Démarrer la musique de fond
  if (window.audioEnabled && typeof playMusic === 'function') {
    playMusic('main-theme');
  }
  
  console.log("Initialisation terminée");
}

/**
 * Configure les écouteurs d'événements
 */
function setupEventListeners() {
  // Bouton de sauvegarde
  const saveButton = document.getElementById('save-button');
  if (saveButton) {
    saveButton.onclick = function() {
      const saved = saveGameState();
      if (saved) {
        showMessage("Partie sauvegardée avec succès", "success");
      } else {
        showMessage("Erreur lors de la sauvegarde", "error");
      }
    };
  }
  
  // Bouton de chargement
  const loadButton = document.getElementById('load-button');
  if (loadButton) {
    loadButton.onclick = function() {
      const loaded = loadGameState();
      if (loaded) {
        showMessage("Partie chargée avec succès", "success");
        
        // Recharger la location actuelle
        if (window.gameState.currentLocation) {
          loadLocation(window.gameState.currentLocation);
        }
      } else {
        showMessage("Aucune sauvegarde trouvée ou erreur de chargement", "error");
      }
    };
  }
  
  // Bouton audio
  const audioButton = document.getElementById('audio-toggle');
  if (audioButton) {
    audioButton.onclick = function() {
      toggleAudio();
    };
  }
  
  // Bouton retour à la création
  const backToCreationButton = document.getElementById('back-to-creation');
  if (backToCreationButton) {
    backToCreationButton.onclick = function() {
      if (confirm("Voulez-vous vraiment revenir à l'écran de création ? Votre progression actuelle sera perdue si elle n'est pas sauvegardée.")) {
        window.location.href = 'index-html.html';
      }
    };
  }
  
  // Gestion des touches clavier
  document.addEventListener('keydown', function(event) {
    // Touche 'Échap' pour fermer les boîtes de dialogue
    if (event.key === 'Escape') {
      // Fermer les boîtes de dialogue ouvertes
      const dialogs = document.querySelectorAll('.power-selection-dialog, .combat-result-dialog');
      dialogs.forEach(dialog => {
        if (dialog.parentNode) {
          dialog.parentNode.removeChild(dialog);
        }
      });
    }
    
    // Touche 'S' pour sauvegarder
    if (event.key === 's' && event.ctrlKey) {
      event.preventDefault();
      saveGameState();
      showMessage("Partie sauvegardée", "success");
    }
    
    // Touche 'L' pour charger
    if (event.key === 'l' && event.ctrlKey) {
      event.preventDefault();
      loadGameState();
      
      // Recharger la location actuelle
      if (window.gameState.currentLocation) {
        loadLocation(window.gameState.currentLocation);
      }
      
      showMessage("Partie chargée", "success");
    }
    
    // Touche 'M' pour activer/désactiver le son
    if (event.key === 'm') {
      toggleAudio();
    }
    
    // Touches numériques pour les choix rapides
    if (event.key >= '1' && event.key <= '9') {
      const index = parseInt(event.key) - 1;
      const choiceButtons = document.querySelectorAll('#choices-container .choice:not(.disabled)');
      
      if (choiceButtons[index]) {
        choiceButtons[index].click();
      }
    }
  });
  
  // Initialiser les infobulles
  setupTooltips();
}

/**
 * Configure les infobulles
 */
function setupTooltips() {
  // Observer le DOM pour détecter les nouveaux éléments avec l'attribut data-tooltip
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element node
            // Vérifier l'élément lui-même
            if (node.hasAttribute('data-tooltip')) {
              addTooltipListeners(node);
            }
            
            // Vérifier les enfants
            const tooltipElements = node.querySelectorAll('[data-tooltip]');
            tooltipElements.forEach(element => {
              addTooltipListeners(element);
            });
          }
        });
      }
    });
  });
  
  // Observer tout le document
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Vérifier les éléments existants
  const tooltipElements = document.querySelectorAll('[data-tooltip]');
  tooltipElements.forEach(element => {
    addTooltipListeners(element);
  });
}

/**
 * Ajoute des écouteurs d'événements pour les infobulles
 * @param {HTMLElement} element - Élément avec l'attribut data-tooltip
 */
function addTooltipListeners(element) {
  element.addEventListener('mouseenter', showTooltip);
  element.addEventListener('mouseleave', hideTooltip);
}

/**
 * Affiche une infobulle
 * @param {Event} event - Événement de survol
 */
function showTooltip(event) {
  // Récupérer le contenu de l'infobulle
  const tooltip = event.target.getAttribute('data-tooltip');
  if (!tooltip) return;
  
  // Créer l'élément d'infobulle
  const tooltipElement = document.createElement('div');
  tooltipElement.className = 'tooltip';
  tooltipElement.textContent = tooltip;
  
  // Styles de l'infobulle
  Object.assign(tooltipElement.style, {
    position: 'absolute',
    zIndex: '1000',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    color: '#fff',
    padding: '8px 12px',
    borderRadius: '4px',
    fontSize: '0.9em',
    maxWidth: '250px',
    pointerEvents: 'none',
    opacity: '0',
    transition: 'opacity 0.3s'
  });
  
  // Ajouter au document
  document.body.appendChild(tooltipElement);
  
  // Positionner l'infobulle
  const targetRect = event.target.getBoundingClientRect();
  const tooltipRect = tooltipElement.getBoundingClientRect();
  
  let left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
  let top = targetRect.bottom + 10;
  
  // S'assurer que l'infobulle reste dans la fenêtre
  if (left < 10) left = 10;
  if (left + tooltipRect.width > window.innerWidth - 10) {
    left = window.innerWidth - tooltipRect.width - 10;
  }
  
  if (top + tooltipRect.height > window.innerHeight - 10) {
    top = targetRect.top - tooltipRect.height - 10; // Afficher au-dessus
  }
  
  tooltipElement.style.left = `${left}px`;
  tooltipElement.style.top = `${top}px`;
  
  // Afficher l'infobulle
  setTimeout(() => {
    tooltipElement.style.opacity = '1';
  }, 10);
  
  // Stocker l'élément pour pouvoir le supprimer
  event.target._tooltipElement = tooltipElement;
}

/**
 * Cache une infobulle
 * @param {Event} event - Événement de sortie
 */
function hideTooltip(event) {
  const tooltipElement = event.target._tooltipElement;
  if (!tooltipElement) return;
  
  // Masquer l'infobulle
  tooltipElement.style.opacity = '0';
  
  // Supprimer l'élément après la transition
  setTimeout(() => {
    if (tooltipElement.parentNode) {
      tooltipElement.parentNode.removeChild(tooltipElement);
    }
    delete event.target._tooltipElement;
  }, 300);
}

/**
 * Fonction principale pour démarrer l'aventure
 * @param {string} character - Personnage choisi ('jonathan' ou 'dracula')
 */
function startAdventure(character) {
  console.log(`Démarrage de l'aventure avec ${character}`);
  
  // Initialiser les statistiques du personnage
  initializeCharacter(character);
  
  // Rediriger vers l'interface principale
  window.location.href = 'improved-ui-v2.html';
}

// ==============================================
// GESTION DU TEMPS ET DES ÉVÉNEMENTS PÉRIODIQUES
// ==============================================

/**
 * Avance d'un tour de jeu
 * Appliqué automatiquement lors des déplacements
 */
function advanceGameTime() {
  // Incrémenter le compteur de temps
  window.gameState.gameTime++;
  
  // Réduire la durée des effets actifs
  updateActiveEffects();
  
  // Appliquer les effets de la progression du temps
  // Dracula perd de la vie pendant la journée
  if (window.gameState.character === 'dracula') {
    // Simuler le cycle jour/nuit (1 tour = 4 heures)
    const hourOfDay = (window.gameState.gameTime * 4) % 24;
    
    // Pendant la journée (6h-18h)
    if (hourOfDay >= 6 && hourOfDay < 18) {
      // Perte de points de vie si Dracula est à l'extérieur
      const currentLocation = window.gameState.currentLocation;
      const locationData = window.gameData.locations[currentLocation];
      
      if (locationData && locationData.isExterior) {
        const damage = 2;
        window.gameState.stats.health = Math.max(0, window.gameState.stats.health - damage);
        showMessage("La lumière du jour vous affaiblit. Vous perdez 2 points de vie.", "warning");
        
        // Effet visuel
        visualizeDamage();
        
        // Mettre à jour l'affichage des statistiques
        updateStatsDisplay();
      }
    }
  }
  
  // Vérifier les événements périodiques
  triggerTimeEvents();
}

/**
 * Déclenche des événements basés sur le temps de jeu
 */
function triggerTimeEvents() {
  // Événements basés sur le temps de jeu
  if (window.gameData.timeEvents) {
    window.gameData.timeEvents.forEach(event => {
      if (event.trigger === window.gameState.gameTime) {
        // Afficher un message
        if (event.message) {
          showMessage(event.message, 'info');
        }
        
        // Déclencher un effet spécial
        if (event.effect === 'spawn-enemy' && event.enemyId) {
          startCombat(event.enemyId);
        } else if (event.effect === 'add-item' && event.itemId) {
          addItemToInventory(event.itemId);
        } else if (event.effect === 'change-location' && event.locationId) {
          loadLocation(event.locationId);
        }
      }
    });
  }
}

// Initialiser le jeu au chargement de la page
document.addEventListener('DOMContentLoaded', initGame);

// Exposer les fonctions globalement pour l'accès depuis le HTML
window.startAdventure = startAdventure;
window.saveGameState = saveGameState;
window.loadGameState = loadGameState;
window.loadLocation = loadLocation;
window.visualizeDamage = visualizeDamage;
window.visualizePsiUse = visualizePsiUse;
window.playSound = playSound;
window.loopSound = loopSound;
window.stopSound = stopSound;
window.playMusic = playMusic;
window.toggleAudio = toggleAudio;
window.usePsiPower = usePsiPower;
window.searchSecret = searchSecret;
	