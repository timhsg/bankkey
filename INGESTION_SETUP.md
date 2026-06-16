# Activer les sources de leads — guide infra (pour Tim)

3 voies d'entrée. **Gmail marche déjà sans rien faire.** Les 2 autres demandent un réglage.

---

## ✅ Voie 1 — Gmail (RIEN à faire, déjà actif)

Le courtier va sur `/pro/sources` → **Connecter Gmail** → autorise → c'est fini.
Aucune config DNS, aucune variable. C'est la voie à recommander à tes pilotes.

---

## 🟦 Voie 2 — Transfert universel (la réponse au "multi-plateformes")

Permet à un courtier de transférer SeLoger / Empruntis / Outlook / n'importe quoi
vers une adresse BankKey unique. **Le code est prêt** (`/api/ingest/email`). Il manque
juste la réception d'email entrant via Resend.

### Étapes (≈ 15 min, une seule fois)

1. **Resend → Domains** : tu as déjà `bankkey.ch` pour l'envoi. Pour la réception,
   active **Inbound** sur un sous-domaine, ex. `inbound.bankkey.ch`.
2. **DNS (chez ton registrar / Vercel DNS)** : ajoute l'enregistrement **MX** fourni
   par Resend pour `inbound.bankkey.ch` (Resend te donne la valeur exacte, type
   `feedback-smtp.eu-west-1.amazonses.com` ou équivalent, priorité 10).
3. **Resend → Inbound → Add endpoint** : pointe le webhook vers
   `https://bankkey.ch/api/ingest/email` (méthode POST).
4. **Adresse des courtiers** : chaque profil a un champ `forwarding_address`
   (ex. `dossiers-lefevre@inbound.bankkey.ch`). Le code route l'email entrant vers
   le bon courtier en cherchant cette adresse. Vérifie que tes nouveaux comptes en
   reçoivent une (le seed démo en met une ; pour les vrais comptes, à générer à
   l'inscription si ce n'est pas déjà le cas).

### Sécurité
- La sécurité principale = l'adresse est **unique et non devinable**, et le route ne
  matche que des adresses connues.
- **Ne mets PAS** `WEBHOOK_INBOUND_SECRET` si tu utilises Resend Inbound (Resend ne
  poste pas de Bearer). Laisse la variable vide. (Elle ne sert que si tu mets un
  forwarder maison type Cloudflare Email Worker qui peut ajouter le header.)

### Test
Une fois les MX propagés (jusqu'à 1-2 h) : envoie un email à une `forwarding_address`
d'un compte → un prospect doit apparaître dans `/pro`.

---

## 🟪 Voie 3 — Outlook natif (OAuth Microsoft, optionnel)

Connexion en 1 clic comme Gmail, pour les courtiers sous Microsoft 365.
Le code est en place (scaffold). Il s'active quand tu fais ceci :

### Étapes

1. **Azure Portal → App registrations → New registration**
   - Nom : BankKey
   - Comptes supportés : "Accounts in any org directory and personal Microsoft accounts"
   - Redirect URI (Web) : `https://bankkey.ch/api/outlook/callback`
2. **Certificates & secrets → New client secret** → copie la valeur.
3. **API permissions → Microsoft Graph → Delegated** : ajoute
   `Mail.Read`, `Mail.Send`, `User.Read`, `offline_access`, `email`, `openid`.
4. **Vercel → Environment Variables** :
   - `MICROSOFT_CLIENT_ID` = l'Application (client) ID
   - `MICROSOFT_CLIENT_SECRET` = le secret copié
5. **Supabase → SQL Editor** : applique `supabase/migrations/010_outlook.sql`
   (ajoute les colonnes `outlook_*`).
6. **Redeploy** Vercel.

Après ça, le bouton "Connecter Outlook" sur `/pro/sources` fonctionne, et le cron
traite aussi les boîtes Outlook automatiquement.

---

## Ordre conseillé

| Priorité | Voie | Effort |
|---|---|---|
| 1 — maintenant | Gmail | 0 (déjà actif) |
| 2 — cette semaine | Transfert (Resend Inbound) | ~15 min DNS |
| 3 — si un courtier le demande | Outlook natif | ~30 min (Azure) |

Pour tes premiers pilotes : **Gmail suffit.** Le reste, tu l'actives au besoin.
