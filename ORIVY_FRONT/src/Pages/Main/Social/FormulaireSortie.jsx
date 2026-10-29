import { useRef, useState } from 'react';
import { useLieux } from '../../../Hooks/useLieux.js';
import { LISTE_CATEGORIES, categorie } from '../../../Constants/categories.js';
import Bouton from '../../../Composants/Bouton.jsx';
import Icone from '../../../Composants/Icone.jsx';
import CarteSortie from '../../../Composants/CarteSortie.jsx';
import Photo, { estVideo } from '../../../Composants/Photo.jsx';
import { Champ } from '../../../Composants/Formulaire.jsx';
import ChampsLieu, { versPayload } from './ChampsLieu.jsx';

/*
 * Formulaire de sortie, partagé par la création et la modification
 * (maquette design/maquettes/sortie-formulaire.html).
 *
 * Props :
 *   initial        : valeurs de départ { nom, categorie, dateDebut, description, lieu, latitude, longitude, nombreMax, imageUrl }
 *   texteValider   : « Publie la sortie » ou « Enregistre les modifications »
 *   onValider(payload, fichier) : données prêtes pour le back + photo/vidéo choisie (ou null) ; peut lancer une erreur
 *   onAnnuler      : retour en arrière
 *   enPlus         : contenu ajouté sous le formulaire (ex. la zone « Supprimer »)
 */
const LONGUEUR_MAX = 600;
// Maintenant, au format attendu par <input type="datetime-local"> : « 2030-06-01T18:30 »
const maintenant = () => {
    const d = new Date();
    const deux = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${deux(d.getMonth() + 1)}-${deux(d.getDate())}T${deux(d.getHours())}:${deux(d.getMinutes())}`;
};

const FormulaireSortie = ({ initial, texteValider, onValider, onAnnuler, enPlus }) => {
    const { lieux } = useLieux();
    const [sortie, setSortie] = useState(initial);
    const [erreurs, setErreurs] = useState({});
    const [erreurEnvoi, setErreurEnvoi] = useState(null);
    const [enCours, setEnCours] = useState(false);
    const refs = { nom: useRef(null), dateDebut: useRef(null) };
    const [fichier, setFichier] = useState(null);                       // photo ou vidéo choisie
    const [apercu, setApercu] = useState(initial.imageUrl ?? null);     // ce qu'on montre dans le formulaire
    const [apercuVideo, setApercuVideo] = useState(estVideo(initial.imageUrl));

    const modifier = (champ, valeur) => {
        setSortie((s) => ({ ...s, [champ]: valeur }));
        // L'erreur d'un champ disparaît dès qu'on le corrige
        if (erreurs[champ]) setErreurs((e) => ({ ...e, [champ]: undefined }));
    };

    /* Choisir un lieu de la carte : nom, coordonnées ET catégorie (modifiable ensuite) */
    const choisirLieu = (lieu) => {
        setSortie((s) => ({ ...s, lieu: lieu.nom, latitude: lieu.latitude, longitude: lieu.longitude, categorie: categorie(lieu.categorie).cle }));
        setErreurs((e) => ({ ...e, lieu: undefined }));
    };
    /* Texte libre : on oublie les coordonnées d'un lieu choisi avant */
    const saisirLieu = (texte) => {
        setSortie((s) => ({ ...s, lieu: texte, latitude: null, longitude: null }));
        if (erreurs.lieu) setErreurs((e) => ({ ...e, lieu: undefined }));
    };

    const choisirMedia = (event) => {
        const f = event.target.files[0];
        event.target.value = '';
        if (!f) return;
        const video = f.type.startsWith('video/');

        const maxMo = video ? 50 : 2;
        if (f.size > maxMo * 1024 * 1024) {
            setErreurs((e) => ({ ...e, media: `${video ? 'La vidéo' : 'La photo'} ne doit pas dépasser ${maxMo} Mo.` }));
            return;
        }

        const url = URL.createObjectURL(f);   // adresse temporaire, pour l'aperçu avant l'envoi
        if (!video) { setFichier(f); setApercu(url); setApercuVideo(false); setErreurs((e) => ({ ...e, media: undefined })); return; }
        // Vidéo : on lit sa durée avant d'accepter
        const lecteur = document.createElement('video');
        lecteur.preload = 'metadata';
        lecteur.onloadedmetadata = () => {
            if (lecteur.duration > 60) {
                URL.revokeObjectURL(url);
                setErreurs((e) => ({ ...e, media: "Ta vidéo dure plus d'une minute." }));
            } else {
                setFichier(f); setApercu(url); setApercuVideo(true); setErreurs((e) => ({ ...e, media: undefined }));
            }
        };
        lecteur.src = url;
    };

    const valider = () => {
        const e = {};
        if (!sortie.nom.trim()) e.nom = 'Donne un titre à ta sortie.';
        if (!sortie.lieu.trim()) e.lieu = 'Indique où ça se passe.';
        if (!sortie.dateDebut) e.dateDebut = 'Choisis une date et une heure.';
        else if (sortie.dateDebut < maintenant()) e.dateDebut = 'Choisis une date et une heure à venir.';
        return e;
    };

    const envoyer = async (event) => {
        event.preventDefault();
        const e = valider();
        setErreurs(e);
        if (Object.keys(e).length > 0) {
            // Focus sur le premier champ fautif, pour que l'utilisateur sache où corriger
            const premier = ['nom', 'lieu', 'dateDebut'].find((c) => e[c]);
            if (premier === 'lieu') document.querySelector('[role="combobox"]')?.focus();
            else refs[premier]?.current?.focus();
            return;
        }
        setErreurEnvoi(null);
        setEnCours(true);
        try {
            await onValider(versPayload({ ...sortie, nom: sortie.nom.trim(), description: sortie.description.trim(),
                              nombreMax: sortie.nombreMax ? Number(sortie.nombreMax) : null }), fichier);

        } catch (err) {
            setErreurEnvoi(err.message || "L'enregistrement a échoué. Réessaie.");
            setEnCours(false);
        }
    };

    return (
        <div className="formulaire-sortie">
            <form className="formulaire" onSubmit={envoyer} noValidate>
                <Champ ref={refs.nom} label="Titre de la sortie" maxLength={70} placeholder="Ex. : Pique-nique au bord de l'Erdre"
                       aide="Court et parlant : on doit comprendre l'idée en un coup d'œil."
                       value={sortie.nom} onChange={(e) => modifier('nom', e.target.value)} erreur={erreurs.nom} required />

                <ChampsLieu valeur={sortie.lieu ?? ''} lieux={lieux} onChoisir={choisirLieu} onSaisir={saisirLieu} erreur={erreurs.lieu} />

                {/* Type de sortie : de vrais boutons radio, stylés en puces */}
                <fieldset className="choix-cat">
                    <legend>Type de sortie</legend>
                    <div className="puces">
                        {LISTE_CATEGORIES.map((c) => (
                            <label key={c.cle} className={`cat-${c.cle}`}>
                                <input type="radio" name="categorie" value={c.cle}
                                       checked={sortie.categorie === c.cle} onChange={() => modifier('categorie', c.cle)} />
                                <span className="puce"><Icone nom={`cat-${c.cle}`} />{c.nom}</span>
                            </label>
                        ))}
                    </div>
                </fieldset>

                <Champ ref={refs.dateDebut} label="Date et heure" type="datetime-local" min={maintenant()}
                       value={sortie.dateDebut} onChange={(e) => modifier('dateDebut', e.target.value)} erreur={erreurs.dateDebut} required />
                <Champ label="Nombre de places" type="number" min={2} inputMode="numeric" placeholder="Illimité"
                        value={sortie.nombreMax ?? ''} onChange={(e) => modifier('nombreMax', e.target.value)}
                        aide="Laisse vide si tout le monde peut venir." />

                    <div className="champ">
                        <span className="champ__label">Photo ou vidéo (1 min max)</span>
                        {apercu && <Photo src={apercu} video={apercuVideo} alt="" cle={sortie.categorie} paresseuse={false} />}
                        <label className="bouton bouton--secondaire" style={{ alignSelf: 'flex-start' }}>
                            <Icone nom="appareil-photo" />{apercu ? 'Changer' : 'Ajouter une photo ou une vidéo'}
                            <input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                                className="visuellement-cache" onChange={choisirMedia} />
                        </label>
                        {erreurs.media && <p className="champ__erreur" role="alert">{erreurs.media}</p>}
                    </div>

                <div>
                    <Champ label="Description" multiligne maxLength={LONGUEUR_MAX}
                           placeholder="Le programme, ce qu'il faut apporter, où se retrouver…"
                           value={sortie.description ?? ''} onChange={(e) => modifier('description', e.target.value)} />
                    <p className="compteur" aria-live="polite">{(sortie.description ?? '').length} / {LONGUEUR_MAX}</p>
                </div>

                {erreurEnvoi && <p className="champ__erreur" role="alert"><Icone nom="alerte" />{erreurEnvoi}</p>}

                <div className="formulaire__pied">
                    <Bouton variante="fantome" onClick={onAnnuler}>Annuler</Bouton>
                    <Bouton type="submit" disabled={enCours} aria-busy={enCours}>{enCours ? 'Enregistrement…' : texteValider}</Bouton>
                </div>

                {enPlus}
            </form>

            {/* Aperçu en direct (ordinateur) : la carte telle qu'elle apparaîtra dans la liste */}
            <aside className="apercu-sortie" aria-label="Aperçu de ta sortie">
                <h2 style={{ fontSize: 'var(--taille-l)', margin: 0 }}>Aperçu</h2>
                <p className="texte-doux" style={{ fontSize: 'var(--taille-s)', margin: 0 }}>Voilà comment ta sortie apparaîtra dans la liste.</p>
                <CarteSortie key={sortie.categorie} sortie={{
                    id: 0,
                    nom: sortie.nom || 'Ta super sortie',
                    categorie: sortie.categorie || 'autre',
                    dateDebut: sortie.dateDebut || maintenant(),
                    lieu: sortie.lieu || 'Quelque part en France',
                }} />
            </aside>
        </div>
    );
};

export default FormulaireSortie;
