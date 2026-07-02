# Playbook commercial BankKey (source de vérité des agents)

> Tout ce qu'un agent affirme à un prospect doit venir de ce fichier.
> Un fait absent d'ici ne se dit pas. Mise à jour par Tim uniquement.

## 1. Positionnement (une phrase)

**BankKey se branche sur la boîte mail du courtier, lit chaque demande de
financement, score sa finançabilité et prépare la réponse : les bons
dossiers sont rappelés en premier, sans rien changer au CRM existant.**

Variante courte (signature, P.S.) : « Le logiciel des courtiers qui
répondent en premier. »

Angle clé face à l'objection CRM : BankKey travaille AVANT le CRM
(réception, tri, qualification, premier contact). Le CRM gère l'après
(dossier en cours, relances). Complément, jamais remplacement.

## 2. ICP et anti-ICP

**Cœur de cible** : cabinet de courtage crédit/hypothèque indépendant,
1-5 personnes, 60-120 demandes/mois, présent sur au moins un portail
(Empruntis, SeLoger, Pretto, Comparis…) ou faisant de la pub locale.
CH romande : GE, VD, VS, NE, FR. France : Lyon, Bordeaux, Nantes,
Toulouse, arc lémanique français. Éviter Paris (saturé, cycles longs).

**Secondaire** : agence immobilière avec activité de financement, CGP
faisant du crédit, petit réseau régional (2-3 agences → plan Cabinet/Réseau).

**Anti-ICP (ne pas contacter)** : franchises nationales (outils imposés),
> 15 personnes (cycle 6 mois), cabinets sans présence web (pas la douleur).

## 3. Grille tarifaire (verbatim, aucune autre remise n'existe)

| Plan | Prix | Contenu |
|---|---|---|
| Essai | 0, 30 jours, sans carte | accès complet |
| **Solo** | 249 €/mois ou 249 CHF/mois | 1 courtier, ~60 leads/mois |
| **Cabinet** | 449 €/mois ou 449 CHF/mois | leads illimités, 5 courtiers, scoring sur-mesure, support prioritaire |
| Réseau | sur devis (dès ~890) | multi-agences, API |
| Annuel | 2 mois offerts (10 payés) | tous plans |
| Fondateurs (20 premiers cabinets) | 3 mois offerts sur l'annuel | levier de closing autorisé |

Argument ROI : une commission moyenne = ~2 500 (€ ou CHF) par dossier
signé. Un seul dossier récupéré grâce à un rappel plus rapide paie 10 mois
de Solo.

## 4. Liens officiels (les seuls à utiliser)

- Démo zéro-clic (aucun compte) : `https://bankkey.ch/demo/access?enter=1`
- Démo guidée : `https://bankkey.ch/demo`
- Essai 30 j : `https://bankkey.ch/pro/login?mode=signup`
- RDV avec Tim : `https://bankkey.ch/book`
- Sécurité : `https://bankkey.ch/security`
- Ajouter `utm_source=outreach&utm_campaign={t1|t2|t3|reply}` sur les liens
  dans les emails.

## 5. Séquence email (structure ; personnaliser à chaque envoi)

### T1 — J0 (l'observation d'abord, le produit ensuite)
```
Objet : {ville} · vos demandes de financement

Bonjour {Prénom},

{OBSERVATION SPÉCIFIQUE : leur pub active / leur portail / leurs avis.
Ex : « Je vois que vous êtes actifs sur Comparis et que vos avis Google
parlent de réactivité. »}

Question directe : quand une demande arrive un vendredi soir, qui la lit,
la trie et répond avant le lundi ?

Je construis BankKey : il lit les demandes reçues par email, calcule un
score de finançabilité et prépare la réponse. Vous rappelez les bons
dossiers en premier, votre CRM ne change pas.

Vous pouvez voir un cabinet fictif complet ici, sans créer de compte :
{lien démo zéro-clic}

Ou répondez simplement, je vous le montre en 15 minutes sur VOS emails.

{Signature complète : Tim, fondateur de BankKey, adresse, téléphone}
{FR : Un mot et je ne vous solliciterai plus. / CH : Dites-moi si vous ne
souhaitez pas être recontacté, ce sera respecté.}
```

### T2 — J+4 si silence (valeur pure, zéro pitch)
```
Objet : re: {objet T1}

Bonjour {Prénom},

Un chiffre de la semaine qui peut vous servir : {donnée VeilleClaw : SARON,
taux d'usure, délai moyen de réponse constaté chez les courtiers…}.

{Une phrase de contexte métier, utile même s'ils n'achètent jamais.}

Bonne semaine,
Tim
```

### T3 — J+9 si silence (break-up)
```
Objet : re: {objet T1}

Bonjour {Prénom},

Je ne vous relancerai plus après ce message. Si un jour le tri des
demandes entrantes devient un sujet, la porte est ouverte : {lien démo}.

Bonne continuation à votre cabinet.
Tim
```

## 6. Bibliothèque d'objections → réponses

| Objection | Réponse (à adapter, pas à copier mot à mot) |
|---|---|
| « C'est trop cher » | Une commission = ~2 500. Solo = 249/mois. Un seul dossier signé en plus par AN rembourse l'outil. Et l'essai de 30 jours est gratuit, sans carte : mesurez sur vos propres emails. |
| « J'ai déjà un CRM » | Parfait, gardez-le. BankKey travaille avant : il trie et qualifie ce qui arrive dans votre boîte mail, votre CRM reçoit des dossiers déjà propres. Rien à migrer. |
| « Et la sécurité des données clients ? » | Hébergement UE (Francfort), accès boîte mail en LECTURE SEULE révocable à tout moment, isolation par cabinet au niveau base de données, aucune revente, aucun entraînement de modèles. Détail complet : bankkey.ch/security. Proposer un appel si l'inquiétude persiste (profil sceptique = démo/appel). |
| « L'IA va dire des bêtises » | Le score est une aide à la décision, jamais un avis bancaire. Rien ne part sans validation : BankKey rédige, le courtier relit et clique. La checklist documents est déterministe (pas d'IA). |
| « Ça marche avec Outlook / IMAP ? » | Oui : Gmail, Outlook, IMAP (Yahoo, Infomaniak…), formulaire web, transfert d'email, webhook Zapier/Make. |
| « BankKey envoie des emails à ma place ? » | Non. Brouillon préparé, envoi uniquement sur votre clic, depuis votre propre adresse. |
| « Pas le temps de m'y mettre » | 10 minutes : connexion de la boîte, premier dossier analysé dans la foulée. Aucune migration, aucune formation. |
| « Vous êtes qui ? » | Transparence totale : Tim, fondateur, produit jeune, programme pilote 50 places, 3 mois offerts pour les 20 premiers cabinets fondateurs en annuel. En échange : du feedback direct. (Carte « fondateur transparent », voir DEMO-PLAYBOOK.md.) |
| Demande de remise hors grille | Fondateur annuel (3 mois offerts) sinon escalade Tim. Jamais de prix inventé. |

## 7. Cadre légal (résumé opérationnel)

- **Suisse — LCD art. 3 al. 1 let. o** : la publicité de masse automatisée
  sans consentement est déloyale. Conséquence pratique : chaque email CH est
  individuel, nominatif, motivé par un fait propre au destinataire, faible
  volume, identité complète, opt-out réel. **nLPD** : ne collecter que des
  données professionnelles nécessaires, les supprimer sur demande.
- **France — CNIL, prospection B2B** : licite en opt-out si le message est
  en rapport avec la profession du destinataire + moyen simple de
  s'opposer + identification de l'expéditeur.
- **Toujours** : stop-on-reply, suppression list éternelle, pas de pixel de
  tracking, pas d'achat de bases, pas de scraping LinkedIn/Maps automatisé.

## 8. Ton (identique au site)

Français simple et précis. Phrases courtes. Vocabulaire métier (dossier,
finançabilité, compromis, apport), zéro jargon marketing (« révolutionner »,
« booster », « IA magique » interdits). Pas d'em-dash. Vouvoiement
systématique. On parle comme un confrère sérieux, pas comme une startup.
