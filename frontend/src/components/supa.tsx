import { useState, useEffect } from 'react'
import { createClient, Session } from '@supabase/supabase-js'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'

const supabase = createClient('https://xjetihhskbeawbqedwqh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqZXRpaGhza2JlYXdicWVkd3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzMTkzNDIsImV4cCI6MjA0ODg5NTM0Mn0.q9uJEfMVNIDIQ6-wBylqcVshyZetgiCqAJeauUZsMjA')

export default function Supa() {
  const [session, setSession] = useState<Session | null>(null)
  const [ data, setData ] = useState<any[] | null>()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session },  }) => {
        setSession(session)
    })

    const { data: { subscription }, } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      console.log(session)
      console.log('Event:', _event)
    })
    
    return () => subscription.unsubscribe()
  }, [])

  const getData = async () => {
    const { data, error } = await supabase.from('chats').select('chat_title')
    console.log(error)
    console.log(data)
    if (data) {
        setData((prevData) => (prevData ? [...prevData, ...data] : data))
    }
  }

  if (!session) {
    return (
        <div className='flex flex-row items-center justify-center h-screen items '>
            <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
        </div> 
    )
  }

  else {
    return (
        <>
            <div>Logged in!</div>
            <button onClick={getData}>Get Data</button>
            {data && (
                <ul>
                    {data.map((item, index) => (
                        <li key={index}>{item.chat_title}</li>
                    ))}
                </ul>
            )}
        </>
    )
  }
}