let btnPrecedent: HTMLButtonElement | null;
let btnSuivant: HTMLButtonElement | null;
let btnEnvoyer: HTMLButtonElement | null;
let champEmail;
let noEtape: number = 0;
let etapes: NodeListOf<HTMLFieldSetElement> = document.querySelectorAll('[name="etape"]');
let messagesJson: ErreurJSON;
const provinceConteneur = document.getElementById('provinceConteneur') as HTMLSelectElement;
const inputPays = document.getElementById('country') as HTMLSelectElement;
const inputProvince = document.getElementById('province') as HTMLSelectElement;
const autreMontant = document.getElementById('autreMontant') as HTMLInputElement | null;
const inputMontant = document.getElementById('montantPerso') as HTMLSelectElement;
const nomEntreprise = document.getElementById('entreprise') as HTMLInputElement | null;
const inputEntreprise = document.getElementById('nomEntrep') as HTMLSelectElement;
const radioTypeDonneur = document.querySelectorAll<HTMLInputElement>('input[name="typeDonneur"]');
const radioMontant = document.querySelectorAll<HTMLInputElement>('input[name="montant"]');
const liensEtapes = document.querySelectorAll('a');

  // la date d'aujourd'hui a été trouvée à l'aide de chat GPT
  const today = new Date();
  const dateAuj = today.toLocaleDateString("fr-CA"); 

interface messageErreur {
    vide?:string;
    pattern?:string;
    type?:string;
    erreursCommunes?: string;
    suspicieux?: string;
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
    pays:paysRegion[];
    provinces:paysRegion[];
    etats:paysRegion[];
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
        if(btnEnvoyer){
            btnEnvoyer.addEventListener('click', changerEtape);
        }

        if (liensEtapes) {
            liensEtapes.forEach(etapeElement => {
            const etapeChoisie = parseInt(etapeElement.dataset.etape!);

            etapeElement.addEventListener('click', () => {
            if (etapeChoisie <= noEtape + 1) {
                afficherEtape(etapeChoisie - 1);
                noEtape = etapeChoisie - 1;
                }
            });
        });
        }
            
        if(champEmail){
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

function ajouterChampMontant(){
    if (autreMontant?.checked) {
        inputMontant?.classList.remove('cacher');
    } 
    else {
        inputMontant?.classList.add('cacher');
    }
}

function ajouterChampEntreprise(){
    if (nomEntreprise?.checked) {
        inputEntreprise?.classList.remove('cacher');
    } 
    else {
        inputEntreprise?.classList.add('cacher');
    }
}

async function obtenirMessages(): Promise<void> {
    const reponse = await fetch('objJSONMessages.json');
    messagesJson = await reponse.json();
}

async function obtenirPays(): Promise<void> {
    const reponse = await fetch('pays_prov_etats.json');
    paysJson = await reponse.json();

    paysJson.pays.forEach((region: paysRegion) => {
        const elementRegion = document.createElement('option');
        elementRegion.value = region.code;
        elementRegion.textContent = region.name;
        inputPays.appendChild(elementRegion);
    });

    // afficher liste provinces seulement si canada est selectionné
    inputPays.addEventListener('change', () => {
        if(inputPays.value == 'CA'){
            obtenirProvince();
            provinceConteneur.classList.remove('cacher');
        }
        else{
            provinceConteneur.classList.add('cacher');
        }
    })
}

async function obtenirProvince(): Promise<void> {
    const reponse = await fetch('pays_prov_etats.json');
    paysJson = await reponse.json();

    const inputProvince = document.getElementById('province') as HTMLSelectElement;

    paysJson.provinces.forEach((region: paysRegion) => {
        const elementRegion = document.createElement('option');
        elementRegion.value = region.code;
        elementRegion.textContent = region.name;
        inputProvince.appendChild(elementRegion);
    });
}

function validerChamp(champ:HTMLInputElement): boolean {
    let valide = false;

    const id = champ.id;
    const idMessageErreur = "err_" + id;
    const errElement:HTMLElement | null = document.getElementById(idMessageErreur);

    // console.log('valider champ', champ.validity);
    
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

    // aria-invalid sera modifié grâce à cette ligne de code fournie par chat GPT
    champ.setAttribute("aria-invalid", valide ? "false" : "true");

    return valide;
}

// Démo du prof faite en classe
function validerEmail(champ:HTMLInputElement):boolean{
    const tldSuspicieux = [
        '.ru',
        '.cn',
        '.click',
        '.party'
    ];

    const erreursCommunes: {[key: string]: string } = {
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
    
    if(champ.validity.valueMissing && messagesJson[id].vide){
        valide = false;
        errElement!.innerText = messagesJson[id].vide;
    }
    else if(!expRegEmail.test(leEmail) && messagesJson[id].pattern){
        valide = false;
        errElement!.innerText = messagesJson[id].pattern;
    }
    else if (champ.validity.typeMismatch && messagesJson[id].type) {
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
            errElement!.innerText = monMessage ?? "";
        } else {
            valide = true;
            errElement!.innerText = '';
        }
    }

    // aria-invalid sera modifié grâce à cette ligne de code fournie par chat GPT
    champ.setAttribute("aria-invalid", valide ? "false" : "true");

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
                errElementDon!.innerText = messagesJson["typeDon"].vide ?? "";
            }

            const montantElement = document.querySelector('[name=montant]:checked') as HTMLInputElement;
            const errElementMontant = document.getElementById("err_montant");
            if(montantElement != null){
                errElementMontant!.innerText = '';
            }
            else{
                valide = false;
                errElementMontant!.innerText = messagesJson["montant"].vide ?? "";
            }
            
            if(typeDonElement != null && montantElement != null){
                if (montantElement.value == 'autre') {
                        const montantPersoElement = document.getElementById("montantPersonnalise") as HTMLInputElement;
                        const montantPersoValide = validerChamp(montantPersoElement);
                        console.log(montantPersoElement);
                        console.log(montantPersoValide);
                        if(montantPersoValide){
                            
                            valide = true;
                        }
                }
                else{
                    valide = true;
                }
            }
            
        break;
        case 1:
            const typeDonneurElement = document.querySelector('[name=typeDonneur]') as HTMLInputElement;
            const appbureauElement = document.getElementById('appbureau') as HTMLInputElement;
            const appbureauValide = validerChamp(appbureauElement);

            const nomElement = document.getElementById('nom') as HTMLInputElement;
            const prenomElement = document.getElementById('prenom')  as HTMLInputElement;
            const emailElement = document.getElementById('email')  as HTMLInputElement;
            const telElement = document.getElementById('tel')  as HTMLInputElement;
            const adresseElement = document.getElementById('adresse')  as HTMLInputElement;
            const villeElement = document.getElementById('ville')  as HTMLInputElement;
            const postalElement = document.getElementById('postalcode')  as HTMLInputElement;

            const nomValide  = validerChamp(nomElement);
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

            if(inputPays.value != ""){
                paysValide = true;
                errPays!.innerText = '';

                if(inputPays.value == 'CA'){
                    if(inputProvince.value != ""){
                        provinceValide = true;
                        errProvince!.innerText = '';
                    }
                    else{
                        errProvince!.innerText = messagesJson["province"].vide ?? "";
                    }
                }
                else{
                    provinceValide = true;
                }
            }
            else{
                errPays!.innerText = messagesJson["pays"].vide ?? "";
            }

            const typeDonneurCoche = document.querySelector('[name=typeDonneur]:checked') as HTMLInputElement;
            const errElementDonneur = document.getElementById("err_typeDonneur");
            if(typeDonneurCoche != null){

                errElementDonneur!.innerText = '';

                if(typeDonneurCoche.value == 'entreprise'){
                    const nomEntrepriseElement = document.getElementById('nomEntreprise') as HTMLInputElement;
                    const nomEntrepriseValide  = validerChamp(nomEntrepriseElement);
                    if(nomEntrepriseValide){
                         if(nomValide && prenomValide && emailValide && telValide && adresseValide && villeValide && postalValide && paysValide){
                            if(appbureauElement.value != ''){
                                if(appbureauValide){
                                    valide = true;
                                }
                                else{
                                    valide = false;
                                }
                            }
                            else{
                                valide = true;
                            }
                        }
                    }
                else{
                    valide = false;
                }
                }
                else{
                    if(nomValide && prenomValide && emailValide && telValide && adresseValide && villeValide && postalValide && paysValide){
                            if(appbureauElement.value != ''){
                                if(appbureauValide){
                                    valide = true;
                                }
                                else{
                                    valide = false;
                                }
                            }
                            else{
                                valide = true;
                            }
                        }
                }
                
            }
            else{
                valide = false;
                errElementDonneur!.innerText = messagesJson["typeDonneur"].vide ?? "";
            }

        break;
        case 2:
            const titulaireElement = document.getElementById('titulaire')  as HTMLInputElement;
            const titulaireValide = validerChamp(titulaireElement);
            const creditElement = document.getElementById('cc')  as HTMLInputElement;
            const creditValide = validerChamp(creditElement);
            const codeElement = document.getElementById('securitycode')  as HTMLInputElement;
            const codeValide = validerChamp(codeElement);
            const moisElement = document.getElementById('expiration')  as HTMLInputElement;
            const errMois = document.getElementById("err_expiration");
            let moisValide = false;
            
            if(moisElement.value){
                if(moisElement.value > dateAuj){
                    moisValide = true;
                    errMois!.innerText = "";
                }
                else{
                    moisValide = false;
                    errMois!.innerText = messagesJson["expiration"].pattern ?? "";
                }
            }
            else{
                moisValide = false;
                errMois!.innerText = messagesJson["expiration"].vide ?? "";
            }
            if(titulaireValide && creditValide && codeValide && moisValide){
                valide = true;
            }
        break;
    }

    return valide;
}

function afficherEtape(etape: number){

    const etatCourant = document.getElementById('etat' + etape);
    console.log(etatCourant);

    const mySteps = document.querySelectorAll(".navigation li");
    mySteps.forEach(step => {
    step.removeAttribute("aria-current");
    });
    if (etatCourant) {
        etatCourant.setAttribute("aria-current", "page");
    }

    cacherFieldsets ();
    if (etape >= 0 && etape < etapes. length) {
        etapes[etape].classList.remove('cacher');
        etatCourant?.classList.add('etatCourant');
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
        else if (etape == 3) {
        btnPrecedent?.classList.add('cacher');
        btnSuivant?. classList.add('cacher'); 
        btnEnvoyer?.classList.add ('cacher');
        }
    }

    console.log("etape" + noEtape);
}

function revenirEtape(event: MouseEvent){
        if (noEtape > 0) {
            noEtape--;
        console.log (noEtape); 
        afficherEtape (noEtape);
        }
}

function changerEtape(event: MouseEvent){
    event.preventDefault();
    const etapeValide = validerEtape(noEtape);
    if(etapeValide == true){
        if (noEtape < 3) {
            noEtape++;
        console.log('#etape ' + noEtape); 
        afficherEtape(noEtape);
        }
    }
    

}

function cacherFieldsets(){
    etapes.forEach((section: any) => {
        section.classList.add('cacher');
    }) ; 
}

  /* Dans votre code JavaScript ou TypeScript, vous devrez : 
   * 1. Désactiver les étapes au chargement de la page dans votre fonction "initialiser" (aria-disabled et classe "inactive") sauf l'étape 1. 
   *    Note : en JavaScript, les attributs sont nommées en "camel case" - aria-disabled devient ariaDisabled. (ex.: monElement.ariaDisabled = true;)
   * 2. Quand l'étape est validée et que vous passez à la suivante, les liens des étapes valides peuvent devenir actifs
   * 3. Ne permettez la navigation que vers les étapes précédentes. Si on navigue à rebours, les liens des étapes suivantes doivent se désactiver.
   */
// <a class="etapes__item etapes__item--inactive" aria-disabled="true" href="#etape4">


