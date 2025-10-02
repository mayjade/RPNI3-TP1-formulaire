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
const nomEntreprise = document.getElementById('entreprise');
const inputEntreprise = document.getElementById('nomEntrep');
const radioTypeDonneur = document.querySelectorAll('input[name="typeDonneur"]');
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
    radioTypeDonneur.forEach(donneur => {
        donneur.addEventListener('change', ajouterChampEntreprise);
    });
    provinceConteneur.classList.add('cacher');
    inputMontant.classList.add('cacher');
    inputEntreprise.classList.add('cacher');
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
function ajouterChampEntreprise() {
    if (nomEntreprise?.checked) {
        inputEntreprise?.classList.remove('cacher');
    }
    else {
        inputEntreprise?.classList.add('cacher');
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
            const typeDonneurElement = document.querySelector('[name=typeDonneur]');
            const appbureauElement = document.getElementById('appbureau');
            const appbureauValide = validerChamp(appbureauElement);
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
            const typeDonneurCoche = document.querySelector('[name=typeDonneur]:checked');
            const errElementDonneur = document.getElementById("err_typeDonneur");
            if (typeDonneurCoche != null) {
                errElementDonneur.innerText = '';
                if (typeDonneurCoche.value == 'entreprise') {
                    const nomEntrepriseElement = document.getElementById('nomEntreprise');
                    const nomEntrepriseValide = validerChamp(nomEntrepriseElement);
                    if (nomEntrepriseValide) {
                        if (nomValide && prenomValide && emailValide && telValide && adresseValide && villeValide && postalValide && paysValide) {
                            if (appbureauElement.value != '') {
                                if (appbureauValide) {
                                    valide = true;
                                }
                                else {
                                    valide = false;
                                }
                            }
                            else {
                                valide = true;
                            }
                        }
                    }
                    else {
                        valide = false;
                    }
                }
                else {
                    if (nomValide && prenomValide && emailValide && telValide && adresseValide && villeValide && postalValide && paysValide) {
                        if (appbureauElement.value != '') {
                            if (appbureauValide) {
                                valide = true;
                            }
                            else {
                                valide = false;
                            }
                        }
                        else {
                            valide = true;
                        }
                    }
                }
            }
            else {
                valide = false;
                errElementDonneur.innerText = messagesJson["typeDonneur"].vide ?? "";
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
    const etatCourant = document.getElementById('etat' + etape);
    console.log(etatCourant);
    cacherFieldsets();
    if (etape >= 0 && etape < etapes.length) {
        etapes[etape].classList.remove('cacher');
        etatCourant?.classList.add('etatCourant');
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
    event.preventDefault();
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
/* Dans votre code JavaScript ou TypeScript, vous devrez :
 * 1. Désactiver les étapes au chargement de la page dans votre fonction "initialiser" (aria-disabled et classe "inactive") sauf l'étape 1.
 *    Note : en JavaScript, les attributs sont nommées en "camel case" - aria-disabled devient ariaDisabled. (ex.: monElement.ariaDisabled = true;)
 * 2. Quand l'étape est validée et que vous passez à la suivante, les liens des étapes valides peuvent devenir actifs
 * 3. Ne permettez la navigation que vers les étapes précédentes. Si on navigue à rebours, les liens des étapes suivantes doivent se désactiver.
 */
// <a class="etapes__item etapes__item--inactive" aria-disabled="true" href="#etape4">
