import { redirect } from 'next/navigation'

// Ancienne page « Testez avec votre email » fusionnée dans /demo (toggle interne).
// On redirige pour ne garder qu'une seule entrée de démo.
export default function ManualDemoRedirect() {
  redirect('/demo')
}
