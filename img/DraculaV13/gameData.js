// gamedata.js - Contient toutes les données du jeu (version corrigée)
console.log("gamedata.js chargé avec succès !");

window.gameData = {
	characters: {
    dracula: {
      name: "Dracula",
      startLocation: "cryptedracula"
    },
    jonathan: {
      name: "Jonathan Harker",
      startLocation: "allee"
    }
  },
	  // Lieux du jeu basés sur le livre original
  locations: {

    'campanile-ruine': {
      title: "Campanile en ruine",
      description: "Une clairière abrite les vestiges d’un campanile frappé par la foudre, à demi dissimulée par les broussailles. Jadis abri du bourdon du château, il n’en reste plus qu’une tour croulante envahie par la végétation.",
      background: "https://exemple.com/img/campanile.jpg",
      choices: [
        { text: "Explorer l’intérieur", destination: "interieur-campanile" },
        { text: "Retourner sur vos pas", destination: "sentier-est" },
        { text: "Rechercher un passage secret", action: "searchSecret" }
      ]
    },
    'interieur-campanile': {
      title: "Intérieur du campanile",
      description: "Les murs sont lézardés et recouverts de lierre. Le dallage disloqué laisse apparaître des racines. Un escalier en colimaçon s’élève péniblement sur trois mètres avant de s’effondrer en gravats.",
      background: "https://exemple.com/img/interieur-campanile.jpg",
      choices: [
        { text: "Revenir à l’extérieur", destination: "campanile-ruine" },
        { text: "Rechercher un passage secret", action: "searchSecret" }
      ]
    },
    'boudoir-mortuaire': {
      title: "Boudoir mortuaire",
      description: "Une pièce élégante et raffinée, pleine de parfums, d’onguents et de vêtements de bal… mais sans lit. À la place, trois cercueils noirs sont alignés le long des murs pastel.",
      background: "https://exemple.com/img/boudoir.jpg",
      choices: [
        { text: "Examiner les cercueils", destination: "examiner-cercueils" },
        { text: "Revenir dans le couloir", destination: "couloir-superieur" },
        { text: "Rechercher un passage secret", action: "searchSecret" }
      ]
    },
    'chapelle-chateau': {
      title: "Chapelle du Château",
      description: "Une ravissante chapelle parfumée d’encens. L’autel, les statues de saints, les croix d’argent et les lampes votives rayonnent d’une lumière sacrée, inattendue dans un tel lieu.",
      background: "https://exemple.com/img/chapelle.jpg",
      choices: [
        { text: "S’approcher de l’autel", destination: "examiner-autel" },
        { text: "Retourner dans le couloir", destination: "couloir-superieur" },
        { text: "Rechercher un passage secret", action: "searchSecret" }
      ]
    },
    'dedale-necrophages': {
      title: "Dédale des Nécrophages",
      description: "Un réseau de tunnels creusés à même la terre. Les parois sont naturelles, semblables à des galeries animales, mais l’ambiance y est oppressante et malsaine.",
      background: "https://exemple.com/img/dedale.jpg",
      choices: [
        { text: "Explorer un tunnel au hasard", destination: "explorer-dedale" },
        { text: "Tenter de revenir sur ses pas", destination: "crypte-dracula" },
        { text: "Rechercher un passage secret", action: "searchSecret" }
      ]
    },


    'cabinet-cire': {
      title: "Cabinet des Figures de cire",
      description: "Cet endroit est empli de mannequins d’un réalisme glaçant. Une jeune femme à la gorge tranchée, un pendu grimaçant, un militaire empalé… figés à jamais dans l’horreur. Au centre, un énorme chaudron de cire fondue bouillonne doucement, répandant une odeur âcre. Plus loin, d’autres scènes encore plus macabres défilent dans une galerie morbide qui semble respirer la souffrance.",
      background: "https://exemple.com/img/cabinet-cire.jpg",
      choices: [
        { text: "Examiner les mannequins", destination: "examiner-mannequins" },
        { text: "Inspecter le chaudron de cire", destination: "examiner-chaudron" },
        { text: "Retourner sur vos pas", destination: "galerie-est" },
        { text: "Rechercher un passage secret", action: "searchSecret" }
      ]
    },

    'portail': {
      title: "Portail du Château",
      description: "Vous êtes devant les hautes grilles de fer forgé du Château de Dracula. Vers le nord, une allée creusée d'ornières conduit à la grande forteresse de pierre tapie au sommet du monticule. Dans toutes les autres directions, les immenses forêts de sapins de la Transylvanie se déroulent à perte de vue.",
	  background: "https://raw.githubusercontent.com/brizoss/chateau-dracula-assets/4212d6845a41c07b62959c93f1031dfb97680410/img/porte_du_chateau1.jpg",
      choices: [
        { text: 'Prendre l\'allée vers le nord', destination: 'allee' },
        { text: 'Examiner les alentours', destination: 'examiner-portail' },
        { text: 'Rechercher un passage secret', action: 'searchSecret' }
      ]
    },
    'allee': {
      title: 'Allée du Château',
      description: "L'allée carrossable qui relie le portail à la cour d'honneur du Château de Dracula est creusée de profondes ornières et si mal entretenue qu'elle semble inutilisée depuis des générations. Elle est bordée de hautes haies	dont les ifs centenaires sont si touffus qu'ils cachent complètement les paysages de cauchemar qui doivent s'étendre de chaque côté.",
	  background: "https://raw.githubusercontent.com/brizoss/chateau-dracula-assets/4212d6845a41c07b62959c93f1031dfb97680410/img/allée_du_chateau4.jpg",
      choices: [
        { text: 'Continuer vers le nord', destination: 'cour-honneur' },
        { text: 'Explorer le sentier à l\'ouest', destination: 'sentier-ouest' },
        { text: 'Explorer le sentier à l\'est', destination: 'sentier-est' },
        { text: 'Retourner au portail', destination: 'portail' },
        { text: 'Rechercher un passage secret', action: 'bibliotheque' }
		
      ]
    },
    'cour-honneur': {
      title: "Cour d'honneur",
      description: "Une étroite cour pavée, dominée par la sombre masse du Château.",
      choices: [
        { text: "Aller vers la porte du Château (nord)", destination: "porte-chateau" },
        { text: "Descendre vers le jardin (est)", destination: "jardin-contrebas" },
        { text: "Visiter les dépendances (ouest)", destination: "dependances" },
        { text: "Emprunter le passage voûté (nord-ouest)", destination: "cour-ecuries" },
        { text: "Retourner vers l'allée (sud)", destination: "allee" },
        { text: "Rechercher un passage secret", action: "searchSecret" }
      ]
    },
    'porte-chateau': {
      title: "Porte d'entrée du Château",
      description: "La grande porte du Château, ornée de gros clous de bronze, s'ouvre sur une épaisse voussure de pierre.",
      choices: [
        { text: "Frapper à la porte", destination: "frapper-porte" },
        { text: "Tenter d'ouvrir la porte", destination: "ouvrir-porte" },
        { text: "Retourner dans la cour d'honneur", destination: "cour-honneur" },
        { text: "Rechercher un passage secret", action: "searchSecret" }
      ]
    },
    'cimetiere': {
      title: "Cimetière familial",
      description: "Des pierres tombales se dressent tout autour, envahies par une végétation sauvage.",
      choices: [
        { text: "Examiner les pierres tombales", destination: "examiner-tombes" },
        { text: "Explorer le caveau au sud-ouest", destination: "caveau-famille" },
        { text: "Retourner à l'allée (est)", destination: "allee" },
        { text: "Prendre le sentier vers le nord", destination: "sentier-nord" },
        { text: "Rechercher un passage secret", action: "searchSecret" }
      ]
    },
    'crypte-dracula': {
      title: "Crypte de Dracula",
      description: "Une petite crypte lugubre, reliée à la surface par un escalier en spirale.",
	  background: "https://fluffy-kashata-47db51.netlify.app/img/crypte.jpg",
      choices: [
        { text: "Utiliser Téléportation (coûte 1 PSI)", destination: "teleport-options", requiredCharacter: "dracula" },
        { text: "Examiner le sarcophage", destination: "examiner-sarcophage" },
        { text: "Rechercher un passage secret", action: "searchSecret" }
      ]
    },
    'jardin-contrebas': {
      title: "Jardin en contrebas",
      description: "Un jardin envahi par des végétaux toxiques et des champignons vénéneux.",
      choices: [
        { text: "Cueillir des plantes", destination: "cueillir-plantes" },
        { text: "Remonter vers la cour d'honneur", destination: "cour-honneur" },
        { text: "Rechercher un passage secret", action: "searchSecret" }
      ]
    },
    'caveau-famille': {
      title: "Caveau de famille",
      description: "Un petit caveau dissimulé derrière une grille en fer forgé.",
      choices: [
        { text: "Ouvrir la grille et entrer", destination: "combat-zombie" },
        { text: "Retourner au cimetière", destination: "cimetiere" },
        { text: "Rechercher un passage secret", action: "searchSecret" }
      ]
    },
    'vestibule': {
      title: "Vestibule",
      description: "Le vestibule du Château, décoré de torches et d'une table de chêne imposante.",
      choices: [
        { text: "Ouvrir la porte à deux battants", destination: "galerie-ouest" },
        { text: "Examiner la table", destination: "examiner-table-vestibule" },
        { text: "Retourner vers la porte d'entrée", destination: "porte-chateau" },
        { text: "Rechercher un passage secret", action: "searchSecret" }
      ]
    },
    'galerie-ouest': {
      title: "Galerie (partie ouest)",
      description: "Un long couloir traversant le Château, avec une porte menant à une galerie.",
      choices: [
        { text: "Aller vers la galerie est", destination: "galerie-est" },
        { text: "Prendre l'escalier en colimaçon", destination: "couloir-superieur" },
        { text: "Ouvrir la porte nord", destination: "fumoir" },
        { text: "Retourner vers le vestibule (porte sud)", destination: "vestibule" },
        { text: "Emprunter le passage étroit (est)", destination: "salle-musique" },
        { text: "Rechercher un passage secret", action: "searchSecret" }
      ]
    },
    'galerie-est': {
      title: "Galerie (partie est)",
      description: "Une galerie menant à des pièces secondaires du Château.",
      choices: [
        { text: "Aller vers la bibliothèque", destination: "bibliotheque" },
        { text: "Retourner vers la galerie ouest", destination: "galerie-ouest" },
        { text: "Rechercher un passage secret", action: "searchSecret" }
      ]
    },
    'fumoir': {
      title: "Fumoir",
      description: "Une pièce ornée d'une cheminée imposante et de trophées macabres.",
      choices: [
        { text: "Examiner la vitrine d'armes", destination: "examiner-vitrine" },
        { text: "Aller vers la porte ouest", destination: "salle-manger" },
        { text: "Aller vers la porte sud", destination: "galerie-ouest" },
        { text: "Aller vers la porte est", destination: "salon" },
        { text: "Rechercher un passage secret", action: "searchSecret" }
      ]
    },
    'salle-musique': {
      title: "Salle de musique",
      description: "Une pièce étroite avec un piano à queue et plusieurs chaises disposées le long des murs.",
      choices: [
        { text: "Examiner le piano", destination: "examiner-piano" },
        { text: "Aller vers la porte nord du mur ouest", destination: "salon" },
        { text: "Aller vers la porte sud du mur ouest", destination: "galerie-ouest" },
        { text: "Rechercher un passage secret", action: "searchSecret" }
      ]
    },
    // Lieux ajoutés pour assurer la cohérence des choix
	
	
	
	
	
	
	
    'jardin-clos': {
      title: "Jardin clos",
      description: "Un jardin fermé et mystérieux, différent du jardin en contrebas.",
      choices: [
        { text: "Retourner à la crypte", destination: "crypte-dracula" },
        { text: "Rechercher un passage secret", action: "searchSecret" }
      ]
    },
    'cour-interieure': {
      title: "Cour intérieure",
      description: "Une cour cachée à l'intérieur du Château, paisible et secrète.",
      choices: [
        { text: "Explorer la cour", destination: "vestibule" },
        { text: "Rechercher un passage secret", action: "searchSecret" }
      ]
    },
    'cuisine': {
      title: "Cuisine",
      description: "Une cuisine animée, emplie d'ustensiles anciens et d'arômes de repas passés.",
      choices: [
        { text: "Examiner les ustensiles", destination: "examiner-cuisine" },
        { text: "Retourner au fumoir", destination: "fumoir" },
        { text: "Rechercher un passage secret", action: "searchSecret" }
      ]
    },
    'bibliotheque': {
      title: "Bibliothèque",
      description: "Cette pièce est à la fois une bibliothèque et un bureau. Son unique"
"fenêtre — une ouverture assez étroite, située tout en haut du mur nord —"
"est fermée par un volet de bois et condamnée ; aussi les seules sources"
"d'éclairage se réduisent-elles aux lueurs tamisées des lampes à pétrole"
"disposées dans toute la pièce, sur des supports de cuivre poli. Us livres"
"alignés sur les rayonnages comme les soldats d'une antique armée sont"
"principalement des ouvrages historiques consacrés au passé tumultueux"
"de la Transylvanie. Sur un bureau et une table voisine sont éparpillés des"
"journaux et des magazines ; en les examinant de plus près, on s'aperçoit"
"qu'ils sont tous écrits en anglais : London Illustrated News... Times..."
"Manchester Guardian... Sporting Life... Rod and Gun... Tatler..."
"Punch... London Charivari..."
"On ne peut pénétrer dans cette pièce ou en sortir que par une seule issue"
": la porte aménagée dans le mur sud. ","
background:"https://fluffy-kashata-47db51.netlify.app/img/bibliotheque"
      choices: [
        { text: "Examiner les livres", destination: "examiner-bibliotheque" },
        { text: "Retourner à la galerie est", destination: "galerie-est" },
        { text: "Rechercher un passage secret", action: "searchSecret" }
      ]
    },
    'salle-manger': {
      title: "Salle à manger",
      description: "Une grande salle à manger avec une table imposante et de nombreuses chaises.",
      choices: [
        { text: "Examiner la table", destination: "examiner-table-manger" },
        { text: "Retourner au fumoir", destination: "fumoir" },
        { text: "Rechercher un passage secret", action: "searchSecret" }
      ]
    },
    'salon': {
      title: "Salon",
      description: "Un salon élégant avec des fauteuils confortables et des décorations raffinées.",
      choices: [
        { text: "Discuter avec les invités", destination: "examiner-salon" },
        { text: "Retourner à la salle de musique", destination: "salle-musique" },
        { text: "Rechercher un passage secret", action: "searchSecret" }
      ]
    },
    'cour-ecuries': {
      title: "Cour des écuries",
      description: "Une cour imprégnée de l'odeur du foin et du bruit des chevaux.",
      choices: [
        { text: "Explorer les écuries", destination: "examiner-ecuries" },
        { text: "Retourner à la cour d'honneur", destination: "cour-honneur" },
        { text: "Rechercher un passage secret", action: "searchSecret" }
      ]
    },
    'chemin-ronde': {
      title: "Chemin Ronde",
      description: "Un chemin sinueux traversant des parties isolées du domaine.",
      choices: [
        { text: "Continuer sur le chemin", destination: "examiner-chemin" },
        { text: "Retourner au couloir supérieur", destination: "couloir-superieur" },
        { text: "Rechercher un passage secret", action: "searchSecret" }
      ]
    },
    'antre-pretre': {
      title: "Antre du Prêtre",
      description: "Un recoin sombre où réside un prêtre oublié, gardien de secrets religieux.",
      choices: [
        { text: "Approcher le prêtre", destination: "examiner-pretre" },
        { text: "Retourner à la crypte", destination: "crypte-dracula" },
        { text: "Rechercher un passage secret", action: "searchSecret" }
      ]
    },
    'galerie-glaces': {
      title: "Galerie des Glaces",
      description: "Une galerie ornée de miroirs anciens reflétant des images troublantes.",
      choices: [
        { text: "Regarder dans les miroirs", destination: "examiner-glaces" },
        { text: "Retourner à la salle de musique", destination: "salle-musique" },
        { text: "Rechercher un passage secret", action: "searchSecret" }
      ]
    }
  },
  
  // Narrations additionnelles hors des lieux
  narratives: {

    'examiner-cercueils': {
      text: "Vous vous penchez sur les cercueils : ils semblent vides… sauf un, où vous trouvez une mèche de cheveux encore tiède. Quelqu’un (ou quelque chose) était ici récemment.",
      choices: [
        { text: "Retourner dans le boudoir", destination: "boudoir-mortuaire" }
      ]
    },
    'examiner-autel': {
      text: "L’autel est orné de symboles religieux puissants. Vous ressentez un malaise profond. Un tiroir secret s’ouvre et révèle un petit flacon de parfum béni.",
      choices: [
        { text: "Prendre le flacon et retourner à la chapelle", destination: "chapelle-chateau" }
      ],
      itemGained: { name: "Parfum sacré", type: "potion", effect: { type: "repel-undead", value: 3 }, singleUse: true }
    },
    'explorer-dedale': {
      text: "Les tunnels se ressemblent tous. Après plusieurs minutes, vous trouvez une dent humaine incrustée dans la paroi. Elle semble… récente.",
      choices: [
        { text: "Continuer malgré tout", destination: "dedale-necrophages" },
        { text: "Faire demi-tour", destination: "crypte-dracula" }
      ]
    },


    'examiner-mannequins': {
      text: "En vous approchant, vous réalisez à quel point chaque scène semble figée dans la douleur. Une étiquette sur l’un des mannequins indique ‘La trahison de la comtesse Carmilla, 1482’. L’illusion est si parfaite que vous jurez avoir vu un œil bouger.",
      choices: [
        { text: "Examiner le chaudron de cire", destination: "examiner-chaudron" },
        { text: "Retourner au Cabinet", destination: "cabinet-cire" }
      ]
    },
    'examiner-chaudron': {
      text: "La cire fond lentement. Quelque chose brille au fond… Vous plongez un bâton et en ressortez une clé rougie par la chaleur. Une clé ancienne, portant le numéro 7.",
      choices: [
        { text: "Prendre la clé et retourner au Cabinet", destination: "cabinet-cire" }
      ],
      itemGained: { name: "Clé n°7", type: "key", number: 7 }
    },

    'examiner-portail': {
      text: "Vous examinez attentivement les grilles. Elles sont massives et couvertes de symboles mystérieux.",
      choices: [
        { text: "Pousser la grille et prendre l'allée", destination: "allee" },
        { text: "Retourner sur la route", destination: "portail" }
      ]
    },
    'examiner-tombes': {
      text: "Vous examinez les pierres tombales. Une inscription à peine lisible mentionne Vlad l'Empaleur.",
      choices: [
        { text: "Retourner au cimetière", destination: "cimetiere" }
      ]
    },
    'examiner-sarcophage': {
      text: "Le sarcophage contient un cercueil d'ébène, un lieu de repos éternel pour le vampire.",
      choices: [
        { text: "Retourner à la crypte", destination: "crypte-dracula" }
      ],
      requiredCharacter: "dracula"
    },
    'teleport-options': {
      text: "Où souhaitez-vous vous téléporter ?",
      choices: [
        { text: "Salle de musique", destination: "salle-musique" },
        { text: "Jardin clos", destination: "jardin-clos" },
        { text: "Cour intérieure", destination: "cour-interieure" },
        { text: "Annuler", destination: "crypte-dracula" }
      ]
    },
    'frapper-porte': {
      text: "Vous frappez à la porte. Un silence oppressant s'installe.",
      choices: [
        { text: "Tenter d'ouvrir la porte", destination: "ouvrir-porte" },
        { text: "Retourner dans la cour d'honneur", destination: "cour-honneur" }
      ]
    },
    'ouvrir-porte': {
      text: "La porte s'ouvre lentement en grinçant. Vous entrez prudemment.",
      choices: [
        { text: "Entrer dans le château", destination: "vestibule" }
      ]
    },
    'cueillir-plantes': {
      text: "Vous cueillez quelques plantes aux propriétés médicinales, mais potentiellement toxiques.",
      choices: [
        { text: "Retourner au jardin", destination: "jardin-contrebas" }
      ],
      itemGained: { name: "Plantes médicinales", type: "potion", effect: { type: "health", value: 20 }, singleUse: true }
    },
    'examiner-piano': {
      text: "Vous vous approchez du piano à queue. Une note résonne, et un compartiment secret s'ouvre.",
      choices: [
        { text: "Examiner le compartiment", destination: "compartiment-piano" },
        { text: "Retourner à la salle de musique", destination: "salle-musique" }
      ]
    },
    'jouer-piano': {
      text: "Vous jouez quelques notes hésitantes. Un mécanisme se déclenche, ouvrant un compartiment secret.",
      choices: [
        { text: "Examiner le compartiment", destination: "compartiment-piano" },
        { text: "Retourner à la salle de musique", destination: "salle-musique" }
      ]
    },
    'compartiment-piano': {
      text: "Dans le compartiment, vous trouvez une petite clé en argent avec le numéro 3 gravé dessus.",
      choices: [
        { text: "Prendre la clé et retourner à la salle de musique", destination: "salle-musique" }
      ],
      itemGained: { name: "Clé n°3", type: "key", number: 3 }
    },
    'examiner-vitrine': {
      text: "La vitrine expose plusieurs armes anciennes. Un poignard orné attire particulièrement votre attention.",
      choices: [
        { text: "Prendre le poignard", destination: "prendre-poignard" },
        { text: "Retourner au fumoir", destination: "fumoir" }
      ]
    },
    'prendre-poignard': {
      text: "Vous prenez le poignard orné, une arme redoutable contre les créatures des ténèbres.",
      choices: [
        { text: "Retourner au fumoir", destination: "fumoir" }
      ],
      itemGained: { name: "Poignard orné", type: "weapon", damage: 5 }
    }
    // Autres narrations à ajouter selon vos besoins...
  },
  
  // Ennemis du jeu
  enemies: {
    'zombie': {
      name: "Zombie",
      health: 25,
      maxHealth: 25,
      stats: {
        rapidite: 1,
        courage: 6,
        force: 3,
        habilete: 2,
        psi: 0
      },
      specialEffects: [
        { trigger: "roll", value: [11, 12], effect: "mycose", damage: 5 }
      ],
      loot: { name: "Élixir de Régénération", type: "potion", effect: { type: "health", value: 50 }, singleUse: true }
    },
    'loup': {
      name: "Loup",
      health: 25,
      maxHealth: 25,
      stats: {
        rapidite: 5,
        courage: 5,
        force: 4,
        habilete: 5,
        psi: 0
      }
    },
    'chauve-souris-vampire': {
      name: "Chauve-souris vampire",
      health: 10,
      maxHealth: 10,
      stats: {
        rapidite: 4,
        courage: 3,
        force: 2,
        habilete: 1,
        psi: 0
      }
    },
    'main-diable': {
      name: "Main du Diable",
      health: 44,
      maxHealth: 44,
      stats: {
        rapidite: 6,
        courage: 6,
        force: 6,
        habilete: 6,
        psi: 0
      },
      specialEffects: [
        { trigger: "roll", value: [3, 6, 9, 12], effect: "strangulation", damage: 10 }
      ]
    },
    'fille-dracula': {
      name: "Fille de Dracula",
      health: 25,
      maxHealth: 25,
      stats: {
        rapidite: 4,
        courage: 5,
        force: 2,
        habilete: 3,
        psi: 2
      },
      specialEffects: [
        { trigger: "roll", value: [5, 6], effect: "rayon-refrigerant", damage: "half" }
      ]
    },
    'van-helsing': {
      name: "Dr. Abraham van Helsing",
      health: 100,
      maxHealth: 100,
      stats: {
        rapidite: 4,
        courage: 6,
        force: 3,
        habilete: 5,
        psi: 6
      },
      specialEffects: [
        { trigger: "psi", effect: "foudre", damage: 20, condition: "roll-6" },
        { trigger: "psi", effect: "caducee", heal: true },
        { trigger: "psi", effect: "souleve-coeur", skipTurn: true },
        { trigger: "psi", effect: "empaleur", damage: 5, extraCondition: "double-6-death" }
      ]
    }
    // Autres ennemis à ajouter...
  },
  
  // Événements aléatoires pour l'ambiance
  randomEvents: [
    {
      name: "Tonnerre",
      description: "Un violent coup de tonnerre retentit, faisant trembler les murs du château.",
      effect: function() {
        showLightning();
        playSound("thunder-sound");
      },
      probability: 0.1
    },
    {
      name: "Grincement",
      description: "Un grincement inquiétant se fait entendre dans le château.",
      effect: function() {
        // Effet atmosphérique uniquement
      },
      probability: 0.15
    },
    {
      name: "Chauve-souris",
      description: "Une chauve-souris traverse soudainement la pièce.",
      effect: function() {
        // Effet atmosphérique uniquement
      },
      probability: 0.1
    },
    {
      name: "Chuchotements",
      description: "Des chuchotements semblent émaner des murs, mais aucun mot n'est discernable.",
      effect: function() {
        // Effet atmosphérique uniquement
      },
      probability: 0.08
    },
    {
      name: "Hurlement de loup",
      description: "Au loin, un loup hurle à la lune, rejoint par un choeur d'autres loups.",
      effect: function() {
        playSound("wolf-sound");
      },
      probability: 0.12
    }
  ],
  
  // Table des passages secrets
  secretPassages: {
    "portail": "cour-honneur",
    "allee": "cimetiere",
    "cour-honneur": "jardin-clos",
    "cimetiere": "caveau-famille",
    "vestibule": "crypte-dracula",
    "galerie-ouest": "cuisine",
    "galerie-est": "bibliotheque",
    "fumoir": "salle-manger",
    "salon": "galerie-est",
    "cour-ecuries": "verger",
    "jardin-contrebas": "cour-honneur",
    "couloir-superieur": "chemin-ronde",
    "crypte-dracula": "antre-pretre",
    "salle-musique": "galerie-glaces",
    "salle-manger": "cuisine"
  },
  
  // Table des objets trouvables
  items: {
    "pieu": {
      name: "Pieu en bois de pommier",
      description: "Un pieu taillé dans du bois de pommier, parfait pour embrocher un vampire.",
      type: "weapon",
      damage: 10,
      specialEffect: { type: "vampire-kill", condition: "double-6" }
    },
    "crucifix": {
      name: "Crucifix en argent",
      description: "Un crucifix en argent béni, efficace contre les créatures des ténèbres.",
      type: "protection",
      effect: { type: "reduce-damage", value: 5, againstType: "undead" }
    },
    "ail": {
      name: "Gousse d'ail",
      description: "Une gousse d'ail fraîche qui repousse les vampires.",
      type: "protection",
      effect: { type: "repel", againstType: "vampire" }
    },
    "eau-benite": {
      name: "Fiole d'eau bénite",
      description: "Une petite fiole d'eau bénite, pouvant être jetée sur un adversaire non-mort.",
      type: "weapon",
      damage: 15,
      singleUse: true,
      validTargets: ["undead", "vampire"]
    },
    "elixir-nostradamus": {
      name: "Panacée de Nostradamus",
      description: "Un liquide mystérieux créé par le célèbre prophète, à n'utiliser qu'en dernier recours.",
      type: "potion",
      effect: { type: "health", value: "full" },
      singleUse: true
    },
    "cle-cuivre": {
      name: "Clé en cuivre",
      description: "Une ancienne clé en cuivre.",
      type: "key"
    },
    "cle-argent": {
      name: "Clé en argent",
      description: "Une clé finement ciselée en argent.",
      type: "key"
    },
    "cle-or": {
      name: "Clé en or",
      description: "Une clé magnifiquement ciselée en or pur.",
      type: "key"
    }
  },
  
  // Table de correspondance des clés numérotées
  numberedKeys: {
    1: "chambre-1",
    2: "chambre-2",
    3: "chambre-3",
    4: "chambre-4",
    5: "chambre-5",
    6: "chambre-6",
    7: "chambre-7",
    8: "chambre-8",
    9: "chambre-9",
    10: "chambre-10",
    11: "chambre-11",
    12: "chambre-12"
  }
};
