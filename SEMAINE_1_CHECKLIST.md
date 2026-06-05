# Semaine 1 — Checklist Jour par Jour

## ✅ JOUR 1 (Lundi) — Renaming + Repositioning

Ce qui a été fait :
- [x] Package.json renommé : `immopilot-demo` → `credify`
- [x] Sectors.ts : forcer crédit immobilier comme seul secteur
- [x] Page d'accueil : header simplifié (Credify | Démo)

**Ce que VOUS devez faire :**

1. **Domaine :**
   - Aller sur vercel.com → credify project → Settings → Domains
   - Ajouter domaine personnalisé : `credify.ch` (ou `.com` si CH pris)
   - Coût : ~12 CHF/an
   - Attendre ~10 min pour la propagation DNS

2. **Email custom :**
   - Aller sur Resend.com → Domains
   - Ajouter domaine `credify.ch`
   - Copier les records DNS dans votre registraire
   - Créer adresse `support@credify.ch`

3. **GitHub :**
   - Renommer le repo : `immopilot-demo` → `credify`
   - Git pull latest, git branch -m main

---

## 📝 JOUR 2 (Mardi) — Landing Page

**À faire par le dev (Claude) :**
- Créer `/app/credify-landing/page.tsx` (landing complète)
- Page simple mais convaincante :
  - Hero : "Répondez à TOUS vos leads en < 60s"
  - Problem/solution en 2 colonnes
  - Features en grid 3 colonnes
  - Pricing (Essai gratuit + Pro 399 CHF)
  - Testimonials (une fois qu'il y en aura)
  - CTA partout : "Essai gratuit" et "Voir la démo"

**À faire par vous :**
- Tester que tout fonctionne en local : `npm run dev`
- Vérifier que la landing s'affiche bien
- Tester les CTAs (doivent pointer vers `/pro/login`)

---

## 🚀 JOUR 3 (Mercredi) — Intégration Stripe

**À faire par le dev :**
- Ajouter `stripe` au package.json
- Créer `/app/api/stripe/webhook/route.ts` (webhook)
- Créer `/app/pro/settings/billing/page.tsx` (gestion abonnement)
- Intégrer Stripe Payment Links dans l'UI

**À faire par vous :**
- Créer compte Stripe (stripe.com)
- Copier Publishable Key + Secret Key dans `.env.local`
- Tester en mode TEST (pas de vrai paiement)
- Vérifier le webhook en Stripe Dashboard

---

## 📧 JOUR 4 (Jeudi) — Onboarding Email Sequence

**À faire par le dev :**
- Email de bienvenue (via Resend) quand compte créé
- Email "Connecter Gmail" si pas connecté
- Email "Votre premier prospect" quand 1er analyse

**À faire par vous :**
- Tester que les emails arrivent
- Vérifier qu'ils sont lisibles et non classés en spam

---

## ✨ JOUR 5 (Vendredi) — Déploiement + Polish

**À faire par le dev :**
- Dernier pass sur la landing page
- Vérifier que l'onboarding est sans friction
- Test complet : creation compte → Gmail connect → analyze email → voir résultat

**À faire par vous :**
- Déployer sur Vercel (`git push`)
- Tester en production : credify.ch
- Vérifier tous les liens, tous les boutons
- Créer un compte test
- Faire une analyse de test email
- Vérifier que Stripe en mode test fonctionne

---

## 🎯 JOUR 6-7 (Samedi-Dimanche) — Repos + Préparation Semaine 2

**Samedi :**
- Repos (vous l'avez mérité)

**Dimanche :**
- Lire à nouveau le script d'outreach (semaine 2)
- Préparer 100 courtiers (list building sur LinkedIn)
- Tester tous les CTA de la landing une dernière fois

---

## 📋 Checklist de "Prêt pour Semaine 2"

✅ Domaine `credify.ch` pointe vers le site
✅ Email `support@credify.ch` fonctionne
✅ Landing page en ligne et convaincante
✅ Authentification Supabase fonctionne
✅ Gmail OAuth flow fonctionne (test)
✅ Stripe intégré (mode test)
✅ Vous avez une liste de 100 courtiers cibles
✅ Vous avez mémorisé le script de vente

**Si tout ça est coché : vous pouvez commencer l'outreach lundi matin.**

---

## Les 3 erreurs à NE PAS faire

1. ❌ Perfectionner la landing page (elle est assez bonne)
2. ❌ Ajouter des features (Slack, SMS, API = semaine 4+)
3. ❌ Attendre le "moment parfait" pour déployer (déployez vendredi QUOIQU'IL ARRIVE)
