let btnPrecedent: HTMLButtonElement | null;
let btnSuivant: HTMLButtonElement | null;
let btnEnvoyer: HTMLButtonElement | null;
let champEmail;
let noEtape: number = 0;
let etapes: NodeListOf<HTMLFieldSetElement> = document.querySelectorAll('[name="etape"]');
let messagesJson: ErreurJSON;

interface messageErreur {
    vide?:string;
    pattern?:string;
    type?:string;
}
interface ErreurJSON{
    [fieldname:string]:messageErreur;
}

let paysJson: paysProvinces;
interface paysRegion {
    name:string;
    code:string;
}
interface paysProvinces {
    pays:string;
    provinces:string;
    etats:string;
}

initialiser();

function initialiser(){

        const formulaire: HTMLFormElement | null = document.getElementById('formulaire') as HTMLFormElement;
        if (formulaire){
            formulaire.noValidate = true;
        }
        cacherFieldsets();
        btnPrecedent = document.getElementById('btn-precedent') as HTMLButtonElement;
        btnSuivant = document.getElementById('btn-suivant') as HTMLButtonElement;
        btnEnvoyer = document.getElementById ('btn-envoyer') as HTMLButtonElement;
        champEmail = document.getElementById ('email') as HTMLButtonElement;
        if(btnPrecedent) {
            btnPrecedent.addEventListener('click', revenirEtape);
        }
        if(btnSuivant){
            btnSuivant.addEventListener('click', changerEtape);
        }
        if(champEmail){
            champEmail.addEventListener('change', faireValiderEmail);
        }

        afficherEtape(0);
        obtenirMessages();
        obtenirPays();
}

async function obtenirMessages(): Promise<void> {
    const reponse = await fetch('objJSONMessages.json');
    messagesJson = await reponse.json();
    console.log(messagesJson);
}

async function obtenirPays(): Promise<void> {
    const reponse = await fetch('pays_prov_etats.json');
    paysJson = await reponse.json();
    console.log(paysJson);

    const inputPays = document.getElementById('country') as HTMLSelectElement;
    const provinceConteneur = document.getElementById('provinceConteneur');

    paysJson.pays.forEach((region: paysRegion) => {
        const elementRegion = document.createElement('option');
        elementRegion.value = region.code;
        elementRegion.textContent = region.name;
        inputPays.appendChild(elementRegion);
    });

    // afficher liste provinces seulement si canada est selectionné
    inputPays.addEventListener('change', () => {
        if(inputPays.value == 'CA'){
            
        }
    })
}

function validerChamp(champ:HTMLInputElement): boolean {
    let valide = false;

    const id = champ.id;
    const idMessageErreur = "err_" + id;
    console.log(idMessageErreur);
    const errElement:HTMLElement | null = document.getElementById(idMessageErreur);

    console.log('valider champ', champ.validity);
    
    if (champ.validity.valueMissing && messagesJson[id].vide) {
        valide = false;
        errElement!.innerText = messagesJson[id].vide;
    } else if (champ.validity.typeMismatch && messagesJson[id].type) {
        valide = false;
        errElement!.innerText = messagesJson[id].type;
    } else if (champ.validity.patternMismatch && messagesJson[id].pattern) {
        valide = false;
        errElement!.innerText = messagesJson[id].pattern;
        console.log(champ.pattern);
    }
    else {
        valide = true;
        errElement!.innerText = '';
    }

    return valide;
}

function validerEmail(champ:HTMLInputElement):boolean{
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
    }

    let valide = false;

    const id = champ.id;
    const idMessageErreur = "err_" + id;
    const errElement:HTMLElement | null = document.getElementById(idMessageErreur);
    const leEmail = champ.value;
    const expRegEmail = new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$");
    
    if(!expRegEmail.test(leEmail) && messagesJson[id].pattern){
        valide = false;
        errElement!.innerText = messagesJson[id].pattern;
    }
    else if (champ.validity.valueMissing && messagesJson[id].vide) {
        valide = false;
        errElement!.innerText = messagesJson[id].vide;
    } else if (champ.validity.typeMismatch && messagesJson[id].type) {
        valide = false;
        errElement!.innerText = messagesJson[id].type;
    } 
    else if(tldSuspicieux.some(
        (tld) => leEmail.toLowerCase().endsWith(tld)) && messagesJson[id].suspicieux){
            valide = false;
            errElement!.innerText = messagesJson[id].suspicieux;
        }
    else{
        const valeursCles = Object.keys(erreursCommunes);
        const erreurCle = valeursCles.find((domaine: string) => {
            return leEmail.toLowerCase().includes(domaine);
        });
        if (erreurCle) {
            const domaineCorrect = erreursCommunes[erreurCle];
            const monMessage = messagesJson[id].erreursCommunes?.replace('{domaine}', domaineCorrect);
            valide = false; 
            errElement!.innerText = monMessage;
        } else {
            valide = true;
            errElement!.innerText = '';
        }
    }

    return valide;
}

function faireValiderEmail(event: Event){
    const monInput = event.currentTarget as HTMLInputElement;
    validerEmail(monInput);
}

function validerEtape(etape: number):boolean{
    let valide = false;

    switch(etape){
        case 0:
            const typeDonElement = document.querySelector('[name=typeDon]:checked') as HTMLInputElement;
            const errElementDon = document.getElementById("err_typeDon");
            if(typeDonElement != null){
                errElementDon!.innerText = '';
            }
            else{
                valide = false;
                errElementDon!.innerText = messagesJson["typeDon"].vide;
            }

            const montantElement = document.querySelector('[name=montant]:checked') as HTMLInputElement;
            const errElementMontant = document.getElementById("err_montant");
            if(montantElement != null){
                errElementMontant!.innerText = '';
            }
            else{
                valide = false;
                errElementMontant!.innerText = messagesJson["montant"].vide;
            }

            if(typeDonElement != null && montantElement != null){
                valide = true;
            }
            
        break;
        case 1:
            const nomElement = document.getElementById('nom') as HTMLInputElement;
            const prenomElement = document.getElementById('prenom')  as HTMLInputElement;
            const emailElement = document.getElementById('email')  as HTMLInputElement;
            const telElement = document.getElementById('tel')  as HTMLInputElement;
            const adresseElement = document.getElementById('adresse')  as HTMLInputElement;
            const villeElement = document.getElementById('ville')  as HTMLInputElement;
            const postalElement = document.getElementById('postalcode')  as HTMLInputElement;

            const nomValide  = validerChamp(nomElement);
            const prenomValide = validerChamp(prenomElement);
            // const emailValide = validerEmail(emailElement);
            const emailValide = validerChamp(emailElement);
            const telValide = validerChamp(telElement);
            const adresseValide = validerChamp(adresseElement);
            const villeValide = validerChamp(villeElement);
            const postalValide = validerChamp(postalElement);

            if(nomValide && prenomValide && emailValide && telValide && adresseValide && villeValide && postalValide){
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


function afficherEtape(etape: number){

    cacherFieldsets ();
    if (etape >= 0 && etape < etapes. length) {
        etapes[etape].classList.remove('cacher');
        if (etape == 0) {
        btnPrecedent?.classList.add('cacher'); 
        btnSuivant?.classList.remove('cacher'); 
        btnEnvoyer?.classList.add ('cacher');
        } else if (etape == 1) {
        btnPrecedent?.classList.remove('cacher'); 
        btnSuivant?. classList.remove('cacher'); 
        btnEnvoyer?.classList.add ('cacher');
        } else if (etape == 2) {
        btnPrecedent?.classList.remove('cacher');
        btnSuivant?. classList.add('cacher'); 
        btnEnvoyer?.classList.remove ('cacher');
        }
    }
}

function revenirEtape(event: MouseEvent){
        if (noEtape > 0) {
            noEtape--;
        console.log (noEtape); 
        afficherEtape (noEtape);
        }
}

function changerEtape(event: MouseEvent){
    const etapeValide = validerEtape(noEtape);
    if(etapeValide == true){
        if (noEtape < 3) {
            noEtape++;
        console.log(noEtape); 
        afficherEtape(noEtape);
        }
    }
    

}

function cacherFieldsets(){
    etapes.forEach((section: any) => {
        section.classList.add('cacher');
    }) ; 
}

// carte credit mousedown
// titre change couleur selon étape sélectionnée
// message erreur en rouge
// au moins une validation au change ou input
// validation différente selon si visa ou mastercard
