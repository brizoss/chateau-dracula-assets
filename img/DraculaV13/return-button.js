// return-button.js - Gestion dynamique du bouton de retour

(function() {
  // Fonction pour créer le bouton de retour
  function createReturnButton() {
    // Ne pas recréer si le bouton existe déjà
    if (document.getElementById('bouton-revenir')) return;

    // Créer l'élément bouton
    const returnButton = document.createElement('button');
    returnButton.id = 'bouton-revenir';
    returnButton.textContent = 'Retour';

    // Styles de base
    Object.assign(returnButton.style, {
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      zIndex: '9999',
      padding: '10px 15px',
      backgroundColor: '#600',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
      transition: 'background-color 0.2s ease-in-out'
    });

    // Gestion des événements visuels
    returnButton.addEventListener('mouseenter', () => {
      returnButton.style.backgroundColor = '#900';
    });
    returnButton.addEventListener('mouseleave', () => {
      returnButton.style.backgroundColor = '#600';
    });

    // Logique de navigation
    returnButton.addEventListener('click', navigateBack);

    // Ajouter au document
    document.body.appendChild(returnButton);

    // Gérer la visibilité initiale
    updateReturnButtonVisibility();
  }

  // Fonction de navigation intelligente
  function navigateBack() {
    // Mapping des pages de retour
    const navigationMap = {
      'creation-jonathan': 'character-choice',
      'creation-dracula': 'character-choice',
      'character-choice': 'passage-2',
      'passage-2': 'passage-1'
    };

    // Trouver la page courante
    const currentPage = findCurrentVisiblePassage();

    // Naviguer en utilisant le mapping ou un retour par défaut
    if (currentPage && navigationMap[currentPage]) {
      if (typeof window.showPassage === 'function') {
        window.showPassage(navigationMap[currentPage]);
      } else {
        console.warn('Méthode showPassage non disponible');
      }
    } else {
      // Fallback
      window.history.back();
    }
  }

  // Trouver la page actuellement visible
  function findCurrentVisiblePassage() {
    const passages = [
      'passage-1', 'passage-2', 'character-choice', 
      'creation-jonathan', 'creation-dracula'
    ];

    for (const passageId of passages) {
      const passage = document.getElementById(passageId);
      if (passage && !passage.classList.contains('hidden')) {
        return passageId;
      }
    }

    return null;
  }

  // Mettre à jour la visibilité du bouton
  function updateReturnButtonVisibility() {
    const returnButton = document.getElementById('bouton-revenir');
    if (!returnButton) return;

    const currentPage = findCurrentVisiblePassage();
    
    // Cacher sur l'écran titre ou si aucune page n'est visible
    if (currentPage === 'passage-1' || !currentPage) {
      returnButton.style.display = 'none';
    } else {
      returnButton.style.display = 'block';
    }
  }

  // Observer les changements de page
  function setupPageObserver() {
    const observer = new MutationObserver(updateReturnButtonVisibility);
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
  }

  // Initialisation
  function initializeReturnButton() {
    // Attendre un court instant pour s'assurer que le DOM est prêt
    setTimeout(() => {
      createReturnButton();
      setupPageObserver();
    }, 100);
  }

  // Lancement
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeReturnButton);
  } else {
    initializeReturnButton();
  }
})();
