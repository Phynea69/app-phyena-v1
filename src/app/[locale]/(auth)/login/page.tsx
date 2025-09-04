'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

// Pour l'instant, on garde les boutons visibles mais désactivés
const OAUTH_ENABLED = { google: false, apple: false }

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  async function signInEmail() {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${location.origin}/auth/callback` }
      })
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('E-mail envoyé. Vérifie ta boîte de réception.')
      }
    } catch (e: any) {
      toast.error(e?.message ?? 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  async function signInWith(provider: 'google' | 'apple') {
    if (!OAUTH_ENABLED[provider]) {
      toast.info(`${provider === 'google' ? 'Google' : 'Apple'} n’est pas encore activé`)
      return
    }
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${location.origin}/auth/callback` }
    })
  }

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Connexion</h1>

        <div className="space-y-2">
          <Input
            type="email"
            placeholder="ton@email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />
          <Button
            onClick={signInEmail}
            disabled={loading || !email}
            className="w-full rounded-2xl"
            aria-busy={loading}
          >
            {loading ? 'Envoi…' : 'Recevoir le lien'}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" disabled className="rounded-2xl opacity-60"
                  onClick={()=>signInWith('google')}>
            Google
          </Button>
          <Button variant="outline" disabled className="rounded-2xl opacity-60"
                  onClick={()=>signInWith('apple')}>
            Apple
          </Button>
        </div>

        <p className="text-xs text-neutral-500">
          En continuant, tu acceptes les conditions et la politique de confidentialité.
        </p>
      </div>
    </main>
  )
}
