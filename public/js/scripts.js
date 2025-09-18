"use strict";
let btnPrecedent;
let btnSuivant;
let btnEnvoyer;
let champEmail;
let noEtape = 0;
let etapes = document.querySelectorAll('[name="etape"]');
let messagesJson;
const provinceConteneur = document.getElementById('provinceConteneur');
const inputPays = document.getElementById('country');
const inputProvince = document.getElementById('province');
const autreMontant = document.getElementById('autreMontant');
const inputMontant = document.getElementById('montantPerso');
const radioMontant = document.querySelectorAll('input[name="montant"]');
const liensEtapes = document.querySelectorAll('a');
// la date d'aujourd'hui a été trouvée à l'aide de chat GPT
const today = new Date();
const dateAuj = today.toLocaleDateString("fr-CA");
let paysJson;
initialiser();
function initialiser() {
    const formulaire = document.getElementById('formulaire');
    if (formulaire) {
        formulaire.noValidate = true;
    }
    cacherFieldsets();
    btnPrecedent = document.getElementById('btn-precedent');
    btnSuivant = document.getElementById('btn-suivant');
    btnEnvoyer = document.getElementById('btn-envoyer');
    champEmail = document.getElementById('email');
    if (btnPrecedent) {
        btnPrecedent.addEventListener('click', revenirEtape);
    }
    if (btnSuivant) {
        btnSuivant.addEventListener('click', changerEtape);
    }
    if (btnEnvoyer) {
        btnEnvoyer.addEventListener('click', changerEtape);
    }
    if (liensEtapes) {
        liensEtapes.forEach(etapeElement => {
            const etapeChoisie = parseInt(etapeElement.dataset.etape);
            etapeElement.addEventListener('click', () => {
                if (etapeChoisie <= noEtape + 1) {
                    afficherEtape(etapeChoisie - 1);
                    noEtape = etapeChoisie - 1;
                }
            });
        });
    }
    if (champEmail) {
        champEmail.addEventListener('change', faireValiderEmail);
    }
    radioMontant.forEach(montant => {
        montant.addEventListener('change', ajouterChampMontant);
    });
    provinceConteneur.classList.add('cacher');
    inputMontant.classList.add('cacher');
    afficherEtape(0);
    obtenirMessages();
    obtenirPays();
}
function ajouterChampMontant() {
    if (autreMontant?.checked) {
        inputMontant?.classList.remove('cacher');
    }
    else {
        inputMontant?.classList.add('cacher');
    }
}
async function obtenirMessages() {
    const reponse = await fetch('objJSONMessages.json');
    messagesJson = await reponse.json();
}
async function obtenirPays() {
    const reponse = await fetch('pays_prov_etats.json');
    paysJson = await reponse.json();
    paysJson.pays.forEach((region) => {
        const elementRegion = document.createElement('option');
        elementRegion.value = region.code;
        elementRegion.textContent = region.name;
        inputPays.appendChild(elementRegion);
    });
    // afficher liste provinces seulement si canada est selectionné
    inputPays.addEventListener('change', () => {
        if (inputPays.value == 'CA') {
            obtenirProvince();
            provinceConteneur.classList.remove('cacher');
        }
        else {
            provinceConteneur.classList.add('cacher');
        }
    });
}
async function obtenirProvince() {
    const reponse = await fetch('pays_prov_etats.json');
    paysJson = await reponse.json();
    const inputProvince = document.getElementById('province');
    paysJson.provinces.forEach((region) => {
        const elementRegion = document.createElement('option');
        elementRegion.value = region.code;
        elementRegion.textContent = region.name;
        inputProvince.appendChild(elementRegion);
    });
}
function validerChamp(champ) {
    let valide = false;
    const id = champ.id;
    const idMessageErreur = "err_" + id;
    const errElement = document.getElementById(idMessageErreur);
    // console.log('valider champ', champ.validity);
    if (champ.validity.valueMissing && messagesJson[id].vide) {
        valide = false;
        errElement.innerText = messagesJson[id].vide;
    }
    else if (champ.validity.typeMismatch && messagesJson[id].type) {
        valide = false;
        errElement.innerText = messagesJson[id].type;
    }
    else if (champ.validity.patternMismatch && messagesJson[id].pattern) {
        valide = false;
        errElement.innerText = messagesJson[id].pattern;
        console.log(champ.pattern);
    }
    else {
        valide = true;
        errElement.innerText = '';
    }
    return valide;
}
// Démo du prof faite en classe
function validerEmail(champ) {
    const tldSuspicieux = [
        '.ru',
        '.cn',
        '.click',
        '.party'
    ];
    const erreursCommunes = {
        'hotnail': 'hotmail',
        'gnail': 'gmail',
        'yahooo': 'yahoo'
    };
    let valide = false;
    const id = champ.id;
    const idMessageErreur = "err_" + id;
    const errElement = document.getElementById(idMessageErreur);
    const leEmail = champ.value;
    const expRegEmail = new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$");
    if (champ.validity.valueMissing && messagesJson[id].vide) {
        valide = false;
        errElement.innerText = messagesJson[id].vide;
    }
    else if (!expRegEmail.test(leEmail) && messagesJson[id].pattern) {
        valide = false;
        errElement.innerText = messagesJson[id].pattern;
    }
    else if (champ.validity.typeMismatch && messagesJson[id].type) {
        valide = false;
        errElement.innerText = messagesJson[id].type;
    }
    else if (tldSuspicieux.some((tld) => leEmail.toLowerCase().endsWith(tld)) && messagesJson[id].suspicieux) {
        valide = false;
        errElement.innerText = messagesJson[id].suspicieux;
    }
    else {
        const valeursCles = Object.keys(erreursCommunes);
        const erreurCle = valeursCles.find((domaine) => {
            return leEmail.toLowerCase().includes(domaine);
        });
        if (erreurCle) {
            const domaineCorrect = erreursCommunes[erreurCle];
            const monMessage = messagesJson[id].erreursCommunes?.replace('{domaine}', domaineCorrect);
            valide = false;
            errElement.innerText = monMessage ?? "";
        }
        else {
            valide = true;
            errElement.innerText = '';
        }
    }
    return valide;
}
function faireValiderEmail(event) {
    const monInput = event.currentTarget;
    validerEmail(monInput);
}
function validerEtape(etape) {
    let valide = false;
    switch (etape) {
        case 0:
            const typeDonElement = document.querySelector('[name=typeDon]:checked');
            const errElementDon = document.getElementById("err_typeDon");
            if (typeDonElement != null) {
                errElementDon.innerText = '';
            }
            else {
                valide = false;
                errElementDon.innerText = messagesJson["typeDon"].vide ?? "";
            }
            const montantElement = document.querySelector('[name=montant]:checked');
            const errElementMontant = document.getElementById("err_montant");
            if (montantElement != null) {
                errElementMontant.innerText = '';
            }
            else {
                valide = false;
                errElementMontant.innerText = messagesJson["montant"].vide ?? "";
            }
            if (typeDonElement != null && montantElement != null) {
                valide = true;
            }
            break;
        case 1:
            const nomElement = document.getElementById('nom');
            const prenomElement = document.getElementById('prenom');
            const emailElement = document.getElementById('email');
            const telElement = document.getElementById('tel');
            const adresseElement = document.getElementById('adresse');
            const villeElement = document.getElementById('ville');
            const postalElement = document.getElementById('postalcode');
            const nomValide = validerChamp(nomElement);
            const prenomValide = validerChamp(prenomElement);
            const emailValide = validerEmail(emailElement);
            const telValide = validerChamp(telElement);
            const adresseValide = validerChamp(adresseElement);
            const villeValide = validerChamp(villeElement);
            const postalValide = validerChamp(postalElement);
            let paysValide = false;
            const errPays = document.getElementById("err_country");
            let provinceValide = false;
            const errProvince = document.getElementById("err_province");
            if (inputPays.value != "") {
                paysValide = true;
                errPays.innerText = '';
                if (inputPays.value == 'CA') {
                    if (inputProvince.value != "") {
                        provinceValide = true;
                        errProvince.innerText = '';
                    }
                    else {
                        errProvince.innerText = messagesJson["province"].vide ?? "";
                    }
                }
                else {
                    provinceValide = true;
                }
            }
            else {
                errPays.innerText = messagesJson["pays"].vide ?? "";
            }
            if (nomValide && prenomValide && emailValide && telValide && adresseValide && villeValide && postalValide && paysValide) {
                valide = true;
            }
            break;
        case 2:
            const titulaireElement = document.getElementById('titulaire');
            const titulaireValide = validerChamp(titulaireElement);
            const creditElement = document.getElementById('cc');
            const creditValide = validerChamp(creditElement);
            const codeElement = document.getElementById('securitycode');
            const codeValide = validerChamp(codeElement);
            const moisElement = document.getElementById('expiration');
            const errMois = document.getElementById("err_expiration");
            let moisValide = false;
            if (moisElement.value) {
                if (moisElement.value > dateAuj) {
                    moisValide = true;
                    errMois.innerText = "";
                }
                else {
                    moisValide = false;
                    errMois.innerText = messagesJson["expiration"].pattern ?? "";
                }
            }
            else {
                moisValide = false;
                errMois.innerText = messagesJson["expiration"].vide ?? "";
            }
            if (titulaireValide && creditValide && codeValide && moisValide) {
                valide = true;
            }
            break;
    }
    return valide;
}
function afficherEtape(etape) {
    cacherFieldsets();
    if (etape >= 0 && etape < etapes.length) {
        etapes[etape].classList.remove('cacher');
        if (etape == 0) {
            btnPrecedent?.classList.add('cacher');
            btnSuivant?.classList.remove('cacher');
            btnEnvoyer?.classList.add('cacher');
        }
        else if (etape == 1) {
            btnPrecedent?.classList.remove('cacher');
            btnSuivant?.classList.remove('cacher');
            btnEnvoyer?.classList.add('cacher');
        }
        else if (etape == 2) {
            btnPrecedent?.classList.remove('cacher');
            btnSuivant?.classList.add('cacher');
            btnEnvoyer?.classList.remove('cacher');
        }
        else if (etape == 3) {
            btnPrecedent?.classList.add('cacher');
            btnSuivant?.classList.add('cacher');
            btnEnvoyer?.classList.add('cacher');
        }
    }
    console.log("etape" + noEtape);
}
function revenirEtape(event) {
    if (noEtape > 0) {
        noEtape--;
        console.log(noEtape);
        afficherEtape(noEtape);
    }
}
function changerEtape(event) {
    const etapeValide = validerEtape(noEtape);
    if (etapeValide == true) {
        if (noEtape < 3) {
            noEtape++;
            console.log('#etape ' + noEtape);
            afficherEtape(noEtape);
        }
    }
}
function cacherFieldsets() {
    etapes.forEach((section) => {
        section.classList.add('cacher');
    });
}
// TO-DO
// DIMANCHE: Logo en SVG dans le html, commentaires, valider w3c
// carte credit mousedown
// titre change couleur selon étape sélectionnée
// au moins une validation au change ou input
// validation différente selon si visa ou mastercard
