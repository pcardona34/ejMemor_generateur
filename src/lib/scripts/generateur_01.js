/* 
 * generateur.js
 * 
 * Fonctions du générateur d'exercice de jmemor 
 * jmemor
 * (c) 2012-2021 - Patrick Cardona
 * Version : 1.3.0
 * 
 * @source: https://github.com/pcardona34/ejmemor/
 * 
 */

const { exercice } = require("./exerciceModule");
const { Popup } = require("./messageModule");


/* ****************** */
/* Variables globales */
/* ****************** */

var ojmemor = {};
var popup = new Popup;

ojmemor.init = function () {
	this.app_name = "ejMemor";
	this.theme=""; // Theme de la série
	this.auteur =""; // Professeur auteur de l'exercice
	this.series = []; // Series avec un S final !!! Pour la sauvegarde de la série saisie
	this.code = "";
};

ojmemor.enregistrer_les_parametres = function (e) {
	let bonneSaisie = true;
				// Les données saisies sont-elles valides ?
				$("*[id*=edito_jmemor]").each(function(){
					if ( $(this).val().length == 0 ){ // Si une saisie est vide !
							bonneSaisie = false;
							popup.afficherMessage("1");
							return false;
					}
				}); // fin vérif saisie données édito

				if ( bonneSaisie == true ){ // La saisie est correcte
					
					// On stocke les données éditoriales
					
					ojmemor.theme = $("#edito_jmemor_0").val();
					ojmemor.auteur = $("#edito_jmemor_1").val();
					ojmemor.consigne = $("#edito_jmemor_2").val();
				
					// On affiche l'étape suivante
					
					$("#etape_Action_Saisie_Serie").show();
					$("#etape_Action_Nouveau").hide();
				
				}
	e.preventDefault();
};

var ocarte = {};

ocarte.init = function () {
	this.paire = [];  // Carte : recto + verso
	this.serie = []; // Serie : sans S !!! Stockage intermédiaire des cartes
};

ocarte.ajouter_carte = function () {
	var bonneSaisie = true;
				// Les données saisies sont-elles valides ?
				$("*[id*=carte_]").each(function(){
					if ( $(this).val().length == 0 ){ // Si une saisie est vide !
						bonneSaisie = false;
						popup.afficherMessage("1");
						return false;
					}
				}); // fin vérif saisie des mots et indices

				if ( bonneSaisie == true ){ // La saisie est correcte
					
					ocarte.paire = [];
					// On stocke la carte (recto + verso) :
					
					ocarte.paire = [ $("#carte_1").val(), $("#carte_2").val() ];
					ocarte.serie.push( ocarte.paire );
					
					// On actualise le tableau des cartes saisies :
					ocarte.tableau();
					// ON applique les actions possibles aux cartes saisies
					ocarte.actionsTableauCartes();
					
					// On alterne la couleur pour les lignes paires :
					$(".carte tr:nth-child(even)").addClass("gris");
					// On vide le formulaire pour la saisie suivante :
					$("*[id*=carte_]").each(function(){
						$(this).val("");
					}); // fin effacement
					
					// On rend le tableau visible :
					$("#cartes_saisies").show();
					
				} // Fin if bonne saisie
};

ocarte.tableau = function(){
	
	var tab = "<table class='carte'>";
		tab += "<thead><tr><th>#</th><th>Recto</th><th>Verso</th><th class='action' colspan='2'>Actions</th></tr></thead>";
		tab += "<tbody>";
	if (this.serie.length > 0){
		for (var i=0; i < this.serie.length; i++){
			tab+= "<tr id='ligne_"+ i + "'>";
			tab+= "<td>"+ (i + 1) +"</td>";
			tab+= "<td>"+ this.serie[i][0] +"</td>";
			tab+= "<td>"+ this.serie[i][1] +"</td>";
			tab+= "<td class='editer_carte'><i class='icon-editer'></i></td>";
			tab+= "<td class='supprimer_carte'><i class='icon-corbeille'></td>";
			tab+= "</tr>";
		}
		
	}
	tab+= "</tbody></table>";
	
	$("#cartes_saisies").html( tab );	
}

ocarte.actionsTableauCartes = function(){
	$("td.editer_carte").on("click", function(){
						// On récupère l'index
						var cle = $(this.parentNode).attr("id");
						var x = parseInt(cle.charAt(6));
		  				
		  				// On édite la carte de la série
		  				ocarte.editeCarte(x);
		  				// On actualise le tableau
		  				ocarte.tableau();
		  				ocarte.actionsTableauCartes(); // Appel récursif
		  			});
		  					
	$("td.editer_carte").on("mouseover", function(){
		  					$(this).css("cursor","pointer");
		  			});
		  		
	$("td.editer_carte").on("mouseout", function(){
		  					$(this).css("cursor","default");
		  			});
					
					
	$("td.supprimer_carte").on("click", function(){
						// On récupère l'index
						var cle = $(this.parentNode).attr("id");
		  				var x = parseInt(cle.charAt(6));
		  				
		  				// On efface la carte de la série
		  				ocarte.supprimeCarte(x);
		  				// On actualise le tableau
		  				ocarte.tableau();
		  				ocarte.actionsTableauCartes(); // Appel récursif
		  				
					});

	$("td.supprimer_carte").on("mouseover", function(){
		  					$(this).css("cursor","pointer");
		  					$(this).addClass("rouge");
		  					
		  			});
		  		
	$("td.supprimer_carte").on("mouseout", function(){
		  					$(this).css("cursor","default");
		  					$(this).removeClass("rouge");
		  			});
};

/*
 * Méthode Suppression d'une carte
 */
ocarte.supprimeCarte = function(_idx){
	ocarte.serie.splice(_idx,1);
}

/*
 * Méthode Edition d'une carte
 */
ocarte.editeCarte = function(_idx){
	// On propage les données dans le formulaire pour édition :
	var recto = this.serie[_idx][0];
	var verso = this.serie[_idx][1];
	$("#carte_1").val(recto);
	$("#carte_2").val(verso);
	// On supprime cet enregistrement
	this.serie.splice(_idx,1);
};

ojmemor.enregistrer_cet_exercice = function(){
		
			if(ocarte.serie.length == 0){
				popup.afficherMessage("2");
				return false;
			}
			
			// On génère et on stocke le code JSON des données de l'exercice
			if(ojmemor.code != undefined){
				delete ojmemor.code;
			}
			
			ojmemor.genereCode(ocarte.serie);
			
			$("#zonecode").val(ojmemor.code);
			
			$("#etape_Action_Saisie_Serie").hide();
			$("#etape_Action_Code").show();
			
			ocarte.serie = new Array();
			$("#cartes_saisies").html("<p>...</p>");
};

ojmemor.toJSON = function(_obj){
	return obj_json = JSON.stringify(_obj);
};

/*
 * Génération du code de l'exercice jmemor
 */
ojmemor.genereCode = function(_serie){ // On passe en paramètre le tableau provisoire des cartes saisies
	
	for(var i = 0;i < _serie.length;i++){
		ojmemor.series.push({"ques":_serie[i][0],"ans":_serie[i][1]});
		}
	var code = ojmemor.toJSON(ojmemor.series);

	ojmemor.code = "{ \"app_name\": \""+ ojmemor.app_name +"\", \"prof\": \""+ ojmemor.auteur +"\", \"titre\": \""+ ojmemor.theme + "\", \"consigne\": \""+ ojmemor.consigne +"\"," 
	ojmemor.code += "\"series\": "+ code +"}"
};

ojmemor.selectionner_le_code = function() {
		document.getElementById("zonecode").select();
};



/* Exportations */
exports.ojmemor = ojmemor;
exports.ocarte = ocarte;

