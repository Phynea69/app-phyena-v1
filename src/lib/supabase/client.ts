'use client'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Client Supabase pour le code "client" (composants React côté navigateur)
export const supabase = createClientComponentClient()
