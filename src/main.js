/* ==================================== *
 *    Une application skelapp           *
 * ==================================== *
 * (c)2021 - Patrick Cardona       *
 * Licence GPL version 3 ou ultérieure  *
 * VOIR la licence complète à la racine *
 * ==================================== */

/* Script majeur en phase de développement : main.js
 * Compilé, il produit app.js dans le dossier 'build'
 *  --------------------------------
 * Appels des dépendances
 * Définiton du routage
 * Compilation des templates
 * --------------------------------
*/

"use strict";
/*jslint browser: true*/
/*global window*/

/* NOM et VERSION */
const versionApp = require('../package.json').version;
const app_name = require('../package.json').name;
const description = require('../package.json').description;

/* Crédit logo */
const origine_logo = require('../static/config/credit.json').origine;
const url_logo = require('../static/config/credit.json').url;
const credit_logo = require('../static/config/credit.json').credit;

/* Messages de l'interface */
const MSG = require('../static/config/messages.json').msg;

/* Modules locaux */
window.afficheRubrique = require('./lib/scripts/ongletModule.js').afficheRubrique;
/* window.exercice = require('./lib/scripts/exerciceModule.js').exercice; */
window.ojmemor = require('./lib/scripts/generateur_01.js').ojmemor;
window.ocarte = require('./lib/scripts/generateur_01.js').ocarte;
window.afficher_aide = require('./lib/scripts/aideModule.js').afficher_aide;
window.masquer_aide = require('./lib/scripts/aideModule.js').masquer_aide;
window.alterner_section_aide = require('./lib/scripts/aideModule.js').alterner_section_aide;
window.filtrer = require('./lib/scripts/filtre.js').filtrer;
window.derouler_navigation = require('./lib/scripts/navigation.js').derouler_navigation;
window.refermer_navigation = require('./lib/scripts/navigation.js').refermer_navigation;

/* Dépendances externes : frameworks & modules*/
/* Runtime de compilation des templates Handlebars avec le bundler Browserify */
const Handlebars = require('hbsfy/runtime');
/* Routeur : Navigo */
const Navigo = require('navigo/lib/navigo');
/* Fonctions de manipulation du DOM (un JQuery lite) */
const chibi = require('chibijs/chibi');

/* ========================================
 *          H e l p e r s
 *           Génériques
 * ========================================
 */
 
/* Passer en capitale la première lettre de la chaine */
Handlebars.registerHelper("capitalisePremiereLettre", function (sChaine) {
  if(typeof sChaine === 'string') {
    return sChaine.charAt(0).toUpperCase() + sChaine.slice(1);
    }
    return null;
});

/* Helper : encode HTML (entitie, etc.) */
Handlebars.registerHelper('encodeChaine',function(chaine){
    return new Handlebars.SafeString(chaine);
});

/* Helper : remplace un type par le champ de formulaire */
Handlebars.registerHelper('typeFormulaireTexte',function(chaine){
  if(chaine == "texte") {
    return true;
  }else{
    return false;
  }
});


/* ========================================
 *          Templates des menus
 * ========================================
 */

/* Modèle des menus : générique */
const menuTemplate = require("./menus/menuTemplate.hbs");

/* Modèle menu : contexte Dictée */
const menuExerciceTemplate = require("./menus/menuExerciceTemplate.hbs");

/* Modèle menu : contexte Liste */
const menuListeTemplate = require("./menus/menuListeTemplate.hbs");

/* ========================================
 *           Composants (Partials)
              et sections
              de l'Aide
 * ========================================
 */

/* Page Apropos */
Handlebars.registerPartial("apropos", require("./composants/aproposTemplate.hbs"));

/* Licence */
Handlebars.registerPartial("licence", require("./composants/licenceTemplate.hbs"));

/* Section de l'aide : prise en main */
Handlebars.registerPartial("prise_en_main", require("./aides/aidePriseEnMain.hbs"));


/* ========================================
 *          Templates des Pages
 * ========================================
 */

/* Gestion erreur de routage : 404 page not found */
const erreurTemplate = require("./pages/erreurTemplate.hbs");

/* Page d'accueil générale */
const accueilTemplate = require("./pages/accueilTemplate.hbs");

/* Liste des exercices */
const listeTemplate = require("./pages/listeTemplate.hbs");

/* Page d'accueil d'un exercice */
const accueilExerciceTemplate = require("./pages/accueilExerciceTemplate.hbs");

/* Page d'exécution d'un exercice */
/* const exerciceTemplate = require("./pages/exerciceTemplate.hbs"); */

/* Page d'exécution d'un générateur d'exercice de type 01 : ejMemor */
const exerciceTemplate_01 = require("./pages/exerciceTemplate_01.hbs");

/* Page d'affichage de l'information sur le génrateur de l'exercice */
const consigneExerciceTemplate = require("./pages/consigneExerciceTemplate.hbs");

/* Sommaire aide contexte dictée */
const aideTemplate = require("./pages/aideTemplate.hbs");

/* Pied de page */
const piedDePageTemplate = require("./composants/piedTemplate.hbs");

/* Zone de notification */
const notificationTemplate = require("./composants/notificationTemplate.hbs");
const zone_notification = notificationTemplate();

/* =========================================================
 *    On charge l'interface via un événement global load
 * =========================================================
 */

window.addEventListener("load", () => {
 /* Zones cibles */
const menu = $("#menu");
const app = $("#app");
const aide = $("#aide");
const notification = $("#notification"); 
const piedDePage = piedDePageTemplate({"version": versionApp});

/* ==================================================
 *                 * MENUS *
 * ==================================================
 */

/* On importe les données du menu dans le contexte Accueil */
const dataMenuAccueil = require("../static/config/menu_accueil.json").menu;
const menuAccueil = menuTemplate(dataMenuAccueil);

/* On importe les données du menu Liste */
/* Sera réutilisé de manière dynamique dans le template de menu de liste... */
const dataMenuListe = require("../static/config/menu_liste.json").menu;

/* On importe les données du menu Aide */
const dataMenuAide = require("../static/config/menu_aide.json").menu;
const menuAide = menuTemplate(dataMenuAide);

/*  On importe et on conserve les items des menus 
 *  dans le contexte d'exécution des exercices. 
 *  IMPORTANT ! Du fait de l'appel avec le contexte 'did' 
 *  supplémentaire, on importe 
 *  directement le tableau des items dans ce cas.
 */
const dataMenuAccueilExercice = require("../static/config/menu_accueil_exercice.json").menu;
const dataMenuExercice = require("../static/config/menu_exercice.json").menu;
const dataMenuConsigneExercice = require("../static/config/menu_consigne_exercice.json").menu;


/* ===========================
 *     A I D E
 *     Initialisation
 *     du contenu
 * ===========================
 */
 
 /* Données du modèle Apropos (partial appelé dans le template Aide) */
    let moduleJSONdata = require ("../static/config/apropos.json");
    let rubriquesJSONdataApropos = require ("../static/config/rubriques_apropos.json").rubriques;
    let modeleApropos = {
	  "app_name": app_name,
	  "description": description,
	  "module": moduleJSONdata,
	  "rubs": rubriquesJSONdataApropos,
	  "version": versionApp,
	  "credit": credit_logo,
	  "url": url_logo,
	  "origine": origine_logo
    };
/* Données du modèle Licence (partial appelé dans le template Aide) */
    let dataLicence = require("../static/config/licence.json").licence;
    let rubriquesJSONdataLicence = require ('../static/config/rubriques_licence.json').rubriques;
    let texte_page_1 = dataLicence.pages[0].texte;
    let texte_page_2 = dataLicence.pages[1].texte;
    let now = new Date();
	let actuel = now.getFullYear();
    let modeleLicence = {
      "debut": dataLicence.debut,
	  "actuel": actuel,
	  "auteur": dataLicence.auteur,
	  "texte_page_1": texte_page_1,
	  "texte_page_2": texte_page_2,
	  "rubs": rubriquesJSONdataLicence
    };
  let contenu = {
    "modeleApropos": modeleApropos,
    "modeleLicence": modeleLicence
  }
  const SommaireAide = aideTemplate(contenu);
  

 /*
  * ===========================
  *       *  ROUTAGE *
  * ===========================
  */

/* Déclaration du routage */
var root = "/" + app_name + "/";
var useHash = true;
var hash = '#!';
var router = new Navigo(root, useHash, hash);

/* =============================
 * ===   Route inconnue ===
 * ============================
 */
router.notFound(function () {
 const html = erreurTemplate({
 couleur: "yellow",
 titre: "Erreur 404 - Page introuvable !",
 message: "Ce chemin n\'existe pas."
    });
 menu.html(menuAccueil);
 app.html(html);
  });

/* Autres routes */
router.on({

 /* === Aide === */
 "aide": function () {
  app.html(SommaireAide);
  menu.html(menuAide);
  },

 /* === Liste des exercices === */
 "liste/exercices": function () {
	let JSONdata = require("../static/config/liste_exercices.json");
	let contenu = {
		"info": JSONdata,
		"exercice": "exercice",
		"cible": "exercice",
		};
	let html = listeTemplate(contenu);
	dataMenuListe.exercice = 'exercice';
	const menuListe = menuListeTemplate(dataMenuListe);
	menu.html(menuListe);
	app.html(html);
	},
/* =================================================
	=== Page du contexte Accueil Exercice 
   =================================================*/
    /* un exercice a été choisi => id -> did */
 "choix/exercice/:id": function (params) {
    fetch("./static/data/exercice" + params.id + ".json")
        .then((response) => {
          return response.json();
        })
        .then((data) => {
      /* On prépare le contenu du template 'accueil exercice...' */
      let contenu = {};
		    /* id de l'exercice : passé en paramètre de l'URL */
			contenu.did = params.id;
		    /* Les données récupérées à partir 
		     * du fichier exercice + id + .json :
		     */
			contenu.exercice = "exercice";
			contenu.cible = "exercice";
			contenu.consigne = data.consigne;
		    /* On crée le contenu de la zone de mentions */
		    let html = accueilExerciceTemplate(contenu);
		    /* On l'intègre dans le document */
		    app.html(html);

	/* On gère l'échec de la récupération des données. */
	}).catch((err) => {
		console.log("Erreur: "+ err);
    });

	dataMenuAccueilExercice.did = params.id;
	dataMenuAccueilExercice.exercice = "exercice";
	dataMenuAccueilExercice.actionsMobile = [].slice.call(dataMenuAccueilExercice.actions).reverse();
	let menuD = menuExerciceTemplate(dataMenuAccueilExercice);
	menu.html(menuD);
	},

/* =================================================
	=== Page du contexte Exécution du générateur de l'Exercice 
   =================================================*/
    /* Le type d'exercice choisi est exécuté => id -> did */
 "effectuer/exercice/:id": function (params) {
    fetch("./static/data/exercice" + params.id + ".json")
        .then((response) => {
          return response.json();
        })
        .then((data) => {
      /* On prépare le contenu du template 'exercice...' */
      let contenu = {};
		    /* id de l'exercice : passé en paramètre de l'URL */
			contenu.did = params.id;
		    /* Les données récupérées à partir 
		     * du fichier exercice + id + .json :
		     */
			contenu.exercice = "exercice";
			contenu.app_name = data.app_name;
			contenu.titre = data.titre;
			ojmemor.init();
			ocarte.init();

			/* On crée le contenu de la zone d'exécution 
			et on charge le formulaire en fonction du type d'exercice */
			let html;
			switch (contenu.did) {
				case "01":
					/* Type : ejMemor */	
					html = exerciceTemplate_01(contenu);
					break;
				default:
					/*html = exerciceTemplate(contenu);*/
					html = "<p>Erreur, contenu.did vaut : "+contenu.did+"</p>";
			}		    
		    /* On l'intègre dans le document */
		    app.html(html);
			notification.html(zone_notification);

	/* On gère l'échec de la récupération des données. */
	}).catch((err) => {
		console.log("Erreur: "+ err);
	});

	dataMenuExercice.did = params.id;
	dataMenuExercice.exercice = "exercice";
	dataMenuExercice.actionsMobile = [].slice.call(dataMenuExercice.actions).reverse();
	let menuD = menuExerciceTemplate(dataMenuExercice);
	menu.html(menuD);
	},

/* =================================================
	=== Page d'information sur le générateur de l'Exercice 
   =================================================*/
    /* L'exercice choisi => id -> did */
 "consigne/exercice/:id": function (params) {
    fetch("./static/data/exercice" + params.id + ".json")
        .then((response) => {
          return response.json();
        })
        .then((data) => {
      /* On prépare le contenu du template 'consigneExercice...' */
      let contenu = {};
		    /* id de l'exercice : passé en paramètre de l'URL */
			contenu.did = params.id;
		    /* Les données récupérées à partir 
		     * du fichier exercice + id + .json :
		     */
			contenu.exercice = "exercice";
			contenu.cible = "exercice";
			contenu.consigne = data.consigne;
		    /* On crée le contenu de la zone d'exécution */
		    let html = consigneExerciceTemplate(contenu);
		    /* On l'intègre dans le document */
		    app.html(html);

	/* On gère l'échec de la récupération des données. */
	}).catch((err) => {
		console.log("Erreur: "+ err);
	});
	
    dataMenuConsigneExercice.did = params.id;
    dataMenuConsigneExercice.exercice = "exercice";
    dataMenuConsigneExercice.actionsMobile = [].slice.call(dataMenuConsigneExercice.actions).reverse();
	let menuD = menuExerciceTemplate(dataMenuConsigneExercice);
	menu.html(menuD);
	},


  /* =========================
   * === home ===
   * =========================
   */

  "": function() {
  let html = accueilTemplate({"bienvenue": MSG.bienvenue});
  app.html(html);
  app.htmlAppend(piedDePage);
  menu.html(menuAccueil);
  menu.show();
  sessionStorage.clear();

  }
  /* Résolution de la route */
}).resolve();

/* Fin table de routage */

}); /* Fin de event load */

