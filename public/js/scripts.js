"use strict";
let btnPrecedent;
let btnSuivant;
let btnEnvoyer;
let noEtape = 0;
let etapes = document.querySelectorAll('[name="etape"]');
let messagesJson;
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
    if (btnPrecedent) {
        btnPrecedent.addEventListener('click', revenirEtape);
    }
    if (btnSuivant) {
        btnSuivant.addEventListener('click', changerEtape);
    }
    afficherEtape(0);
    obtenirMessages();
}
async function obtenirMessages() {
    const reponse = await fetch('objJSONMessages.json');
    messagesJson = await reponse.json();
    console.log(messagesJson);
}
function validerChamp(champ) {
    let valide = false;
    const id = champ.id;
    const idMessageErreur = "err_" + id;
    console.log(idMessageErreur);
    const errElement = document.getElementById(idMessageErreur);
    console.log('valider champ', champ.validity);
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
    }
    return valide;
}
function validerEtape(etape) {
    let valide = false;
    switch (etape) {
        case 0:
            valide = true;
            break;
        case 1:
            const nomElement = document.getElementById('nom');
            const prenomElement = document.getElementById('prenom');
            const emailElement = document.getElementById('email');
            const telElement = document.getElementById('tel');
            const nomValide = validerChamp(nomElement);
            const prenomValide = validerChamp(prenomElement);
            const emailValide = validerChamp(emailElement);
            const telValide = validerChamp(telElement);
            if (!nomValide && !prenomValide && !emailValide && !telValide) {
                valide = true;
            }
            // ajouter les autres cas avec les nouveaux champs
            break;
        case 2:
            valide = true;
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
    }
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
            console.log(noEtape);
            afficherEtape(noEtape);
        }
    }
}
function cacherFieldsets() {
    etapes.forEach((section) => {
        section.classList.add('cacher');
    });
}
