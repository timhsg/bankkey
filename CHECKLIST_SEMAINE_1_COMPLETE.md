# ✅ Checklist finale — Fin de semaine 1

Avant de commencer l'outreach lundi matin, vérifier que TOUT fonctionne.

---

## 🌍 Infrastructure

- [ ] Domaine `credify.ch` ou `credify-lending.ch` acheté
- [ ] Domaine pointe vers Vercel (DNS propagé, tester en tape le domaine dans le navigateur)
- [ ] Email `support@credify.ch` fonctionne (Resend configuré)
- [ ] Site landing est live sur credify.ch (pas juste sur credify.vercel.app)
- [ ] Tous les liens internes pointent vers credify.ch (pas localhost ni vercel.app)

---

## 🔐 Authentification

- [ ] Créer compte test sur credify.ch/pro/login fonctionne
- [ ] Email de confirmation reçu
- [ ] Peut se connecter avec l'email + mot de passe
- [ ] Session persiste (rechargement = reste connecté)

---

## 🔗 Gmail OAuth

- [ ] Configuration Google Cloud en place (credentials pour Gmail API)
- [ ] Lien "Connecter Gmail" redirige vers Google
- [ ] Authentification Google OAuth acceptée
- [ ] Après auth, l'app affiche "Gmail connecté"
- [ ] Dashboard affiche les prospets (au moins les test emails)

---

## 📧 Pipeline IA

**Tester en local avec `npm run dev` :**

- [ ] Aller sur credify.ch (la démo)
- [ ] Coller un email test (exemple fourni dans le landing)
- [ ] Cliquer "Analyser"
- [ ] Voir le loading (3 étapes)
- [ ] Résultat affiche :
  - [ ] Score (ex: 82/100)
  - [ ] Température (hot/warm/cold)
  - [ ] Données extraites (nom, email, revenus, apport, etc.)
  - [ ] Email de réponse (onglet Email)
  - [ ] Briefing appel (onglet Call)
- [ ] Copier l'email fonctionne
- [ ] Pas d'erreurs JavaScript (F12 → Console doit être vide)

---

## 💳 Stripe

- [ ] Compte Stripe créé (stripe.com)
- [ ] Clés Stripe copiées dans `.env.local` (Publishable + Secret)
- [ ] Mode TEST configuré (pas de vrai paiement)
- [ ] Page /pro/settings/billing existe et affiche les plans
- [ ] Bouton "Passer à Pro" donne un lien de paiement Stripe

---

## 🎯 Landing Page

- [ ] credify.ch s'affiche avec header, hero, features, pricing, footer
- [ ] Hero : "Répondez à TOUS vos leads en < 60 secondes"
- [ ] Pas d'éléments mal alignés ou de texte qui overflow
- [ ] Tous les boutons fonctionnent :
  - [ ] "Essai gratuit 30 jours" → redirige vers /pro/login
  - [ ] "Voir une démo" → redirige vers / (la démo)
  - [ ] "Se connecter" (header) → redirige vers /pro/login

---

## 📱 Mobile

- [ ] Landing page responsive (testez sur iPhone)
- [ ] Démo responsive (testez sur iPhone)
- [ ] Pas de texte illisible
- [ ] Boutons cliquables (pas trop petits)

---

## 🚀 Performance

- [ ] Site charge en < 3 secondes (test sur credify.ch)
- [ ] Analyse IA prend 3-5 secondes (pas plus)
- [ ] Pas de timeouts ou d'erreurs 500

---

## 📊 Données

- [ ] Base de données Supabase remplie (tables créées)
- [ ] Peut créer un compte utilisateur (sauvegardé en base)
- [ ] Gmail OAuth tokens stockés (sécurisés)
- [ ] Prospects analysés sauvegardés en base

---

## 🧪 Test end-to-end complet

**Timing : 10 minutes**

1. Allez sur credify.ch (incognito mode)
2. Cliquez "Essai gratuit 30 jours"
3. Créez un compte (email test)
4. Cliquez "Connecter Gmail"
5. Acceptez permissions Google OAuth
6. Voyez "Gmail connecté"
7. Allez sur la démo (/)
8. Collez email test
9. Analyser → voir résultat en < 5s
10. Copier email → fonctionnel
11. Aller au dashboard → voir prospect
12. Pas d'erreurs partout

**Si tout fonctionne d'un coup : ✅ Prêt**

---

## 📝 Listes

- [ ] Fichier Google Sheet avec 100 courtiers
- [ ] Colonnes : Prénom, Nom, Entreprise, Email, Téléphone, Source, Status
- [ ] Tous les emails vérifiés (pas de typos évidentes)
- [ ] Organisé pour la semaine 2

---

## 🎤 Préparation mentale

- [ ] Vous avez lu le script d'email (SEMAINE_2_SCRIPT.md)
- [ ] Vous avez lu le script de démo
- [ ] Vous connaissez votre elevator pitch par cœur :
  > "Credify qualifie et répond à TOUS vos leads en moins d'une minute.
  > Vous n'avez plus besoin de passer 15-20 min par dossier. Ça se fait automatiquement."

---

## ⚠️ Erreurs courantes à éviter

❌ **Perfectionnisme :** "Ma landing page n'est pas assez belle"
✅ **Action :** Lancez comme c'est. Vous l'améliorerez en semaine 3.

❌ **Attendre les retours :** "Attendons les réactions pour envoyer plus"
✅ **Action :** Envoyez les 40 emails dès lundi. En parallèle, gérez les démos.

❌ **Ne pas tracker :** "Je vais juste envoyer et voir"
✅ **Action :** Utilisez votre Google Sheet pour tracker : Date envoi, Date réponse, RDV pris.

❌ **Trop commercial :** "Découvrez comment Credify révolutionne l'industrie"
✅ **Action :** Soyez ennuyeux. "Vous recevez combien de dossiers par semaine ?"

---

## 📋 À garder sous la main semaine 2

Imprimer ou ouvrir côte-à-côte :
- [ ] SEMAINE_2_SCRIPT.md (copier/coller les emails)
- [ ] Liste 100 courtiers (pour envoyer les emails)
- [ ] Script de démo (pour vos 5-8 démos)
- [ ] Google Sheet de suivi (remplir status en temps réel)

---

## Verdict final

Si vous avez coché 95%+ des cases : **vous êtes prêt.**

Si vous avez 80-95% : **vous êtes ok pour lancer et corriger en route.**

Si vous avez < 80% : **relisez et finissez les items critiques.**

Les items critiques non-négociables :
1. Domaine fonctionne (credify.ch)
2. Landing page en ligne
3. Démo en ligne et fonctionne
4. OAuth Gmail marche
5. 100 courtiers avec emails

Les items "nice-to-have semaine 1" qui peuvent attendre :
- Stripe totalement configuré (vous pouvez le finir lundi)
- Mobile 100% responsive
- Performance < 2s (3-5s c'est ok)

---

**Vous êtes prêt ? Allez à SEMAINE_2_SCRIPT.md et commencez l'outreach lundi matin.**

Bonne chance. 🚀
