// Variables et constantes globales
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
    vide?: string;
    pattern?: string;
    type?: string;
    erreursCommunes?: string;
    suspicieux?: string;
}
interface ErreurJSON {
    [fieldname: string]: messageErreur;
}

let paysJson: paysProvinces;
interface paysRegion {
    name: string;
    code: string;
}
interface paysProvinces {
    pays: paysRegion[];
    provinces: paysRegion[];
    etats: paysRegion[];
}

initialiser();

// Fonction qui affiche l'étape 0 avec le bon bouton et cache les autres champs
function initialiser() {

    const formulaire: HTMLFormElement | null = document.getElementById('formulaire') as HTMLFormElement;
    if (formulaire) {
        formulaire.noValidate = true;
    }
    cacherFieldsets();
    // appelle les fonctions pour naviguer entre les étapes
    btnPrecedent = document.getElementById('btn-precedent') as HTMLButtonElement;
    btnSuivant = document.getElementById('btn-suivant') as HTMLButtonElement;
    btnEnvoyer = document.getElementById('btn-envoyer') as HTMLButtonElement;
    champEmail = document.getElementById('email') as HTMLButtonElement;
    if (btnPrecedent) {
        btnPrecedent.addEventListener('click', revenirEtape);
    }
    if (btnSuivant) {
        btnSuivant.addEventListener('click', changerEtape);
    }
    if (btnEnvoyer) {
        btnEnvoyer.addEventListener('click', changerEtape);
    }

    // permet de retourner voir les étapes précédentes en passant par la navigation
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

// ajoute le champ montant personnalisé si l'utilisateur choisi autre montant
function ajouterChampMontant() {
    if (autreMontant?.checked) {
        inputMontant?.classList.remove('cacher');
    }
    else {
        inputMontant?.classList.add('cacher');
    }
}

// ajoute le champ nom de l'entreprise si l'utilisateur choisi Entreprise
function ajouterChampEntreprise() {
    if (nomEntreprise?.checked) {
        inputEntreprise?.classList.remove('cacher');
    }
    else {
        inputEntreprise?.classList.add('cacher');
    }
}

// obtient les messages d'erreurs dans le JSON
async function obtenirMessages(): Promise<void> {
    const reponse = await fetch('objJSONMessages.json');
    messagesJson = await reponse.json();
}

// crée la liste déroulante des pays à partir du JSON
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
        if (inputPays.value == 'CA') {
            obtenirProvince();
            provinceConteneur.classList.remove('cacher');
        }
        else {
            provinceConteneur.classList.add('cacher');
        }
    })
}

// crée la liste déroulante des provinces à partir du JSON
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

// Vérifie si les champs sont complétés et respectent leur propre regex fourni dans le HTML
// retourne true si le champ est valide
// reçoit en argument le input du champ à valider
function validerChamp(champ: HTMLInputElement): boolean {
    let valide = false;

    const id = champ.id;
    const idMessageErreur = "err_" + id;
    const errElement: HTMLElement | null = document.getElementById(idMessageErreur);

    if (champ.validity.valueMissing && messagesJson[id].vide) {
        valide = false;
        errElement!.innerText = messagesJson[id].vide;
    } else if (champ.validity.typeMismatch && messagesJson[id].type) {
        valide = false;
        errElement!.innerText = messagesJson[id].type;
    } else if (champ.validity.patternMismatch && messagesJson[id].pattern) {
        valide = false;
        errElement!.innerText = messagesJson[id].pattern;
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
// valide spécifiquement le champ email
// donne des suggestions pour les erreurs de frappe communes
// retourne true si le email est valide et ne contient pas un tld suspicieux
function validerEmail(champ: HTMLInputElement): boolean {
    const tldSuspicieux = [
        '.ru',
        '.cn',
        '.click',
        '.party'
    ];

    const erreursCommunes: { [key: string]: string } = {
        'hotnail': 'hotmail',
        'gnail': 'gmail',
        'yahooo': 'yahoo'
    }

    let valide = false;

    const id = champ.id;
    const idMessageErreur = "err_" + id;
    const errElement: HTMLElement | null = document.getElementById(idMessageErreur);
    const leEmail = champ.value;
    const expRegEmail = new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$");

    // vérifie si le champ a été rempli et s'il respecte son pattern
    if (champ.validity.valueMissing && messagesJson[id].vide) {
        valide = false;
        errElement!.innerText = messagesJson[id].vide;
    }
    else if (!expRegEmail.test(leEmail) && messagesJson[id].pattern) {
        valide = false;
        errElement!.innerText = messagesJson[id].pattern;
    }
    else if (champ.validity.typeMismatch && messagesJson[id].type) {
        valide = false;
        errElement!.innerText = messagesJson[id].type;
    }
    else if (tldSuspicieux.some(
        (tld) => leEmail.toLowerCase().endsWith(tld)) && messagesJson[id].suspicieux) {
        valide = false;
        errElement!.innerText = messagesJson[id].suspicieux;
    }
    else {
        // done des suggestions pour les erreurs communes
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

// envoie le email se faire valider dès que l'utilisateur quitte le champ
function faireValiderEmail(event: Event) {
    const monInput = event.currentTarget as HTMLInputElement;
    validerEmail(monInput);
}

// s'assure que tous les champs sont valides avant de changer d'étape
// reçoit le numéro de l'étape en cours en argument
function validerEtape(etape: number): boolean {
    let valide = false;

    switch (etape) {
        case 0:
            // vérifie que l'utilisateur a choisi un type de don et un montant
            const typeDonElement = document.querySelector('[name=typeDon]:checked') as HTMLInputElement;
            const errElementDon = document.getElementById("err_typeDon");

            if (typeDonElement != null) {
                errElementDon!.innerText = '';
            }
            else {
                valide = false;
                errElementDon!.innerText = messagesJson["typeDon"].vide ?? "";
            }

            const montantElement = document.querySelector('[name=montant]:checked') as HTMLInputElement;
            const errElementMontant = document.getElementById("err_montant");
            if (montantElement != null) {
                errElementMontant!.innerText = '';
            }
            else {
                valide = false;
                errElementMontant!.innerText = messagesJson["montant"].vide ?? "";
            }

            if (typeDonElement != null && montantElement != null) {
                // s'assure que le montant personnalisé est valide
                if (montantElement.value == 'autre') {
                    const montantPersoElement = document.getElementById("montantPersonnalise") as HTMLInputElement;
                    const montantPersoValide = validerChamp(montantPersoElement);
                    if (montantPersoValide) {

                        valide = true;
                    }
                }
                else {
                    valide = true;
                }
            }

            break;
        case 1:
            // envoie tous les champs à la fonction validerChamp() pour s'assurer qu'ils respectent le pattern
            const typeDonneurElement = document.querySelector('[name=typeDonneur]') as HTMLInputElement;
            const appbureauElement = document.getElementById('appbureau') as HTMLInputElement;
            const appbureauValide = validerChamp(appbureauElement);

            const nomElement = document.getElementById('nom') as HTMLInputElement;
            const prenomElement = document.getElementById('prenom') as HTMLInputElement;
            const emailElement = document.getElementById('email') as HTMLInputElement;
            const telElement = document.getElementById('tel') as HTMLInputElement;
            const adresseElement = document.getElementById('adresse') as HTMLInputElement;
            const villeElement = document.getElementById('ville') as HTMLInputElement;
            const postalElement = document.getElementById('postalcode') as HTMLInputElement;

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

            // s'assure qu'un pays a été sélectionné
            if (inputPays.value != "") {
                paysValide = true;
                errPays!.innerText = '';
                // valide la province si le pays choisi est le Canada
                if (inputPays.value == 'CA') {
                    if (inputProvince.value != "") {
                        provinceValide = true;
                        errProvince!.innerText = '';
                    }
                    else {
                        errProvince!.innerText = messagesJson["province"].vide ?? "";
                    }
                }
                else {
                    provinceValide = true;
                }
            }
            else {
                errPays!.innerText = messagesJson["pays"].vide ?? "";
            }
            // s'assure qu'un type de donneur a été sélectionné
            const typeDonneurCoche = document.querySelector('[name=typeDonneur]:checked') as HTMLInputElement;
            const errElementDonneur = document.getElementById("err_typeDonneur");
            if (typeDonneurCoche != null) {

                errElementDonneur!.innerText = '';

                if (typeDonneurCoche.value == 'entreprise') {
                    // vérifie que le nom de l'entreprise est valide si l'utilisateur fait un don au nom d'une entreprise
                    const nomEntrepriseElement = document.getElementById('nomEntreprise') as HTMLInputElement;
                    const nomEntrepriseValide = validerChamp(nomEntrepriseElement);
                    if (nomEntrepriseValide) {
                        if (nomValide && prenomValide && emailValide && telValide && adresseValide && villeValide && postalValide && paysValide) {
                            // valide app/bureau si ce champ est rempli
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
                    // valide tous les champs si c'est un don personnel
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
                errElementDonneur!.innerText = messagesJson["typeDonneur"].vide ?? "";
            }

            break;
        case 2:
            // s'assure que tous les champs de la carte de crédit sont valides
            const titulaireElement = document.getElementById('titulaire') as HTMLInputElement;
            const titulaireValide = validerChamp(titulaireElement);
            const creditElement = document.getElementById('cc') as HTMLInputElement;
            const creditValide = validerChamp(creditElement);
            const codeElement = document.getElementById('securitycode') as HTMLInputElement;
            const codeValide = validerChamp(codeElement);
            const moisElement = document.getElementById('expiration') as HTMLInputElement;
            const errMois = document.getElementById("err_expiration");
            let moisValide = false;

            // vérifie que la carte de crédit n'est pas expirée
            if (moisElement.value) {
                if (moisElement.value > dateAuj) {
                    moisValide = true;
                    errMois!.innerText = "";
                }
                else {
                    moisValide = false;
                    errMois!.innerText = messagesJson["expiration"].pattern ?? "";
                }
            }
            else {
                moisValide = false;
                errMois!.innerText = messagesJson["expiration"].vide ?? "";
            }
            if (titulaireValide && creditValide && codeValide && moisValide) {
                valide = true;
            }
            break;
    }

    return valide;
}

// affiche la bonne étape
// reçoit en argument le numéro de l'étape à afficher
function afficherEtape(etape: number) {

    // modifie les attributs aria selon l'étape en cours
    const etatCourant = document.getElementById('etat' + etape);
    const monEtape = document.getElementById('step' + etape);

    const mySteps = document.querySelectorAll(".navigation li");
    mySteps.forEach(step => {
        step.removeAttribute("aria-current");
    });
    const mesEtapes = document.querySelectorAll(".navigation a");
    mesEtapes.forEach(etape => {
        etape.setAttribute("aria-disabled", "true");
    });
    if (etatCourant && monEtape) {
        etatCourant.setAttribute("aria-current", "page");
        monEtape.setAttribute("aria-disabled", "false");
    }

    // affiche la bonne étape et les boutons de navigation entre les étapes
    cacherFieldsets();
    if (etape >= 0 && etape < etapes.length) {
        etapes[etape].classList.remove('cacher');
        etatCourant?.classList.add('etatCourant');
        if (etape == 0) {
            btnPrecedent?.classList.add('cacher');
            btnSuivant?.classList.remove('cacher');
            btnEnvoyer?.classList.add('cacher');
        } else if (etape == 1) {
            btnPrecedent?.classList.remove('cacher');
            btnSuivant?.classList.remove('cacher');
            btnEnvoyer?.classList.add('cacher');
            afficherResume();
        } else if (etape == 2) {
            btnPrecedent?.classList.remove('cacher');
            btnSuivant?.classList.add('cacher');
            btnEnvoyer?.classList.remove('cacher');
            afficherResume();
        }
        else if (etape == 3) {
            btnPrecedent?.classList.add('cacher');
            btnSuivant?.classList.add('cacher');
            btnEnvoyer?.classList.add('cacher');
        }
    }
    // console.log("etape" + noEtape);
}

// retourne à l'étape précédente
function revenirEtape(event: MouseEvent) {
    if (noEtape > 0) {
        noEtape--;
        // console.log (noEtape); 
        afficherEtape(noEtape);
    }
}

// affiche l'étape suivante si tous les champs sont biens remplis
function changerEtape(event: MouseEvent) {
    event.preventDefault();
    const etapeValide = validerEtape(noEtape);
    if (etapeValide == true) {
        if (noEtape < 3) {
            noEtape++;
            // console.log('#etape ' + noEtape); 
            afficherEtape(noEtape);
        }
    }
}

// cache toutes les étapes
function cacherFieldsets() {
    etapes.forEach((section: any) => {
        section.classList.add('cacher');
    });
}

// affiche le nom complet et le montant du don choisi par l'utilisateur
function afficherResume() {
    const typeDonElement = document.querySelector('[name=typeDon]:checked') as HTMLInputElement;
    const montantElement = document.querySelector('[name="montant"]:checked') as HTMLInputElement;
    const resumeMontant = document.querySelector('.resume__montant') as HTMLParagraphElement;

    const leNom = document.getElementById('nom') as HTMLInputElement | null;
    const lePrenom = document.getElementById('prenom') as HTMLInputElement | null;
    const nomComplet = document.querySelector('.resume__nom') as HTMLParagraphElement;

    // affiche le montant du don et son type dans le HTML
    if (typeDonElement && montantElement && resumeMontant) {
        if (montantElement.value == 'autre') {
            const montantPerso = document.getElementById('montantPersonnalise') as HTMLInputElement;
            resumeMontant.innerText = "Montant de " + montantPerso.value + "$ " + typeDonElement.value;
        }
        else {
            resumeMontant.innerText = "Montant de " + montantElement.value + "$ " + typeDonElement.value;
        }
    }

    // affiche le nom complet du donneur dans le HTML
    if (leNom && lePrenom && nomComplet) {
        const prenom = lePrenom.value.trim();
        const nom = leNom.value.trim();

        if (prenom || nom) {
            nomComplet.innerText = "Au nom de " + prenom + " " + nom;
        } else {
            nomComplet.innerText = '';
        }
    }
}


