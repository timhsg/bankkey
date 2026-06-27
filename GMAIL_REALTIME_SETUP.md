# Gmail temps réel (Pub/Sub) — setup à finir

Le code est écrit (lib/gmail.ts `watchInbox`, /api/gmail/push, cron renew, start-on-connect).
Il s'active automatiquement une fois les 2 variables d'env posées + la config Pub/Sub faite.

**Projet Google Cloud : `bankkey-gmail`** (numéro 754058895037, compte authuser=3)
C'est bien le projet du client OAuth "BankKey Web" (type Web application). Le topic DOIT
être dans ce projet, sinon `watch()` échoue.

## Valeurs

- Topic : `gmail-leads`
- `GMAIL_PUBSUB_TOPIC` = `projects/bankkey-gmail/topics/gmail-leads`
- `GMAIL_PUSH_TOKEN` = (fourni en chat — ne PAS commiter ici)
- Endpoint push : `https://bankkey.ch/api/gmail/push?token=<GMAIL_PUSH_TOKEN>`
- Service account Gmail (à autoriser) : `gmail-api-push@system.gserviceaccount.com`

## Étapes (console Google Cloud, projet bankkey-gmail)

1. **Vérifier que l'API Gmail + l'API Pub/Sub sont activées** (Pub/Sub a été activée pendant l'audit).
2. **Créer le topic** : Pub/Sub → Topics → Create topic → ID = `gmail-leads`
   (décocher "Add a default subscription").
3. **Autoriser Gmail à publier** : ouvrir le topic → onglet Permissions → Add principal →
   `gmail-api-push@system.gserviceaccount.com` → rôle **Pub/Sub Publisher** → Save.
4. **Créer la souscription push** : Pub/Sub → Subscriptions → Create subscription
   - ID : `gmail-leads-push`
   - Topic : `gmail-leads`
   - Delivery type : **Push**
   - Endpoint URL : `https://bankkey.ch/api/gmail/push?token=<GMAIL_PUSH_TOKEN>`
   - Create.

## Étapes (Vercel → bankkey → Environment Variables)

5. Ajouter :
   - `GMAIL_PUBSUB_TOPIC` = `projects/bankkey-gmail/topics/gmail-leads`
   - `GMAIL_PUSH_TOKEN` = (la même valeur que dans l'URL push)

## Activer

6. Déployer (push main). Puis soit reconnecter Gmail (le callback lance `watch()`),
   soit déclencher une fois le cron `renew-gmail-watch` (bouton "Run workflow" dans GitHub Actions).
7. Test : envoyer un email à la boîte connectée → le prospect doit apparaître en < 1 min.

## Notes

- `watch()` expire après 7 jours → le cron `renew-gmail-watch` (7h30 UTC) le renouvelle.
- Le cron `sync-gmail` (5 min) reste comme filet de secours si une notification se perd.
- L'API Pub/Sub a aussi été activée par erreur sur "My First Project" pendant l'audit
  (sans ressource créée) — tu peux la désactiver là-bas si tu veux, sans impact.
