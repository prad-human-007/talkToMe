import { useState, useEffect } from 'react'
import { createClient, Session } from '@supabase/supabase-js'
import { Button } from './ui/button'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabaseClient } from '../supabaseClient'



export default function Supa() {
  const [session, setSession] = useState<Session | null>(null)
  const [chats, setChats] = useState<any[] | null>(null)
  const [messages, setMessages] = useState<any[] | null>(null)

  useEffect(() => {
    console.log('Running UseEffect on mount')
    supabaseClient.auth.getSession().then(({ data: { session },  }) => {
        setSession(session)
    })

    const { data: { subscription }, } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      console.log(session)
      console.log('Event:', _event)
    })
    
    return () => subscription.unsubscribe()
  }, [])

  const getChats= async () => {
    const { data, error } = await supabaseClient.from('chats').select('id, chat_title')
    console.log(error)
    console.log(data)
    if (data) {
        setChats((prevData) => (prevData ? [...prevData, ...data] : data))
    }
  }

  async function getMessages(chat_id: any) {
    const {data, error} = await supabaseClient.from('messages').select('*').eq('chat_id', chat_id)
    if(data) {
        setMessages(data)
    }
    console.log(data)
  }

  if (!session) {
    return (
        <div className='flex flex-row items-center justify-center h-screen items '>
            <Auth supabaseClient={supabaseClient} appearance={{ theme: ThemeSupa }} />
        </div> 
    )
  }

  else {
    return (
        <>  
            <div className='flex flex-col max-w-3xl gap-3'>
                <div>Logged in!</div>
                <Button onClick={getChats}>Get Chats</Button>
                {chats && (
                    <ul>
                        {chats.map((item, index) => (
                            <li key={index} onClick={() => getMessages(item.id)}>{item.chat_title}</li>
                        ))}
                    </ul>
                )}
                <h2> Messages </h2>
                {/* <button onClick={getMessages}>Get Messages</button> */}
                {messages && (
                    <ul>
                        {messages.map((item, index)=> (
                            <li key={index} >{item.role}: {item.content}</li>
                        ))}
                    </ul>
                )}
                <p className='w-full break-words'>
                </p>
            </div>
            
        </>
    )
  }
}