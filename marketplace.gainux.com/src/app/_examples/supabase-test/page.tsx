"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SupabaseTest() {
    const [status, setStatus] = useState<string>('Connecting...')
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function checkConnection() {
            try {
                const { data, error } = await supabase.from('countries').select('count', { count: 'exact', head: true })

                // Even if 'countries' table doesn't exist, we might get a 404 or specific error, 
                // but if we get a network error or auth error, that's different.
                // For a generic check, checking auth session or just simple query is good.
                // Let's try getting accessing auth.

                const { error: authError } = await supabase.auth.getSession()

                if (authError) throw authError

                setStatus('Connected to Supabase successfully!')
            } catch (e: any) {
                console.error(e)
                setStatus('Failed to connect')
                setError(e.message)
            }
        }

        checkConnection()
    }, [])

    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
            <p className="mb-2">Status: <span className={status.includes('Success') ? 'text-green-600 font-bold' : 'text-red-600'}>{status}</span></p>
            {error && <p className="text-red-500 bg-red-50 p-4 rounded">Error: {error}</p>}
        </div>
    )
}
