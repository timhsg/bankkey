/**
 * Chiffrement applicatif des secrets sensibles stockés en base
 * (tokens OAuth Gmail/Outlook, mot de passe IMAP).
 *
 * AES-256-GCM, clé symétrique dans la variable d'env `BANKKEY_ENC_KEY`.
 *
 * Deux propriétés clés pour un déploiement SANS casse :
 *
 *  1. **No-op si la clé est absente.** Tant que `BANKKEY_ENC_KEY` n'est pas
 *     définie, `encryptSecret` renvoie le texte en clair. Déployer ce code sans
 *     poser la clé ne change donc RIEN au comportement actuel. On « active » le
 *     chiffrement en posant la clé sur Vercel — les écritures suivantes sont
 *     chiffrées.
 *
 *  2. **Tolérance « legacy clair ».** `decryptSecret` ne déchiffre que les
 *     valeurs préfixées `enc:v1:`. Une valeur déjà en clair en base (avant
 *     activation) est renvoyée telle quelle. La migration se fait donc
 *     naturellement : chaque refresh de token réécrit la valeur chiffrée.
 *     (Le mot de passe IMAP, lui, ne se rafraîchit pas → voir la note plus bas
 *      pour le re-chiffrer une fois, ou le courtier reconnecte sa boîte.)
 *
 * ⚠️ La clé doit rester STABLE. Si on la change/supprime après activation, les
 *    valeurs déjà chiffrées deviennent illisibles et la synchro casse. Pour une
 *    rotation propre : déchiffrer avec l'ancienne, re-chiffrer avec la nouvelle.
 *
 * Générer une clé (32 octets) :
 *   openssl rand -base64 32
 */

import crypto from 'crypto'

const ALGO = 'aes-256-gcm'
const PREFIX = 'enc:v1:'

function getKey(): Buffer | null {
  const raw = process.env.BANKKEY_ENC_KEY
  if (!raw) return null
  // Accepte hex (64 caractères) ou base64.
  const key = /^[0-9a-fA-F]{64}$/.test(raw)
    ? Buffer.from(raw, 'hex')
    : Buffer.from(raw, 'base64')
  if (key.length !== 32) {
    throw new Error('BANKKEY_ENC_KEY invalide : 32 octets attendus (hex 64 ou base64 de 32 octets).')
  }
  return key
}

/** Indique si le chiffrement est actif (clé présente et valide). */
export function encryptionEnabled(): boolean {
  try {
    return getKey() !== null
  } catch {
    return false
  }
}

/**
 * Chiffre une chaîne → blob `enc:v1:<iv>:<tag>:<ciphertext>` (chaque partie en base64).
 * Si aucune clé n'est configurée, renvoie le texte en clair (mode dev / non activé).
 */
export function encryptSecret(plain: string | null | undefined): string | null {
  if (plain == null) return null
  const key = getKey()
  if (!key) return plain // chiffrement non activé → comportement inchangé

  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGO, key, iv)
  const ciphertext = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  return PREFIX + [
    iv.toString('base64'),
    tag.toString('base64'),
    ciphertext.toString('base64'),
  ].join(':')
}

/**
 * Déchiffre une valeur produite par `encryptSecret`.
 * Tolérant : une valeur NON préfixée `enc:v1:` est considérée « legacy clair »
 * et renvoyée telle quelle (aucune migration bloquante requise).
 */
export function decryptSecret(value: string | null | undefined): string | null {
  if (value == null) return null
  if (!value.startsWith(PREFIX)) return value // legacy en clair

  const key = getKey()
  if (!key) {
    throw new Error('BANKKEY_ENC_KEY manquante : impossible de déchiffrer un secret chiffré.')
  }

  // "enc:v1:IV:TAG:CT" → split sur ':' (le base64 ne contient jamais ':')
  const parts = value.split(':')
  const ivB64 = parts[2], tagB64 = parts[3], ctB64 = parts[4]
  if (!ivB64 || !tagB64 || !ctB64) {
    throw new Error('Secret chiffré malformé.')
  }

  const decipher = crypto.createDecipheriv(ALGO, key, Buffer.from(ivB64, 'base64'))
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'))
  return Buffer.concat([
    decipher.update(Buffer.from(ctB64, 'base64')),
    decipher.final(),
  ]).toString('utf8')
}
