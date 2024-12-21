import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { supabaseClient } from "@/supabaseClient";
import { Session } from "@supabase/supabase-js";

export default function Home() {

    const [email, setEmail] = useState('');
    const [session, setSession] = useState<Session| null>(null);

    useEffect(() => {
      supabaseClient.auth.getSession().then(({data: {session}}) => {
        if(session) {
          setSession(session)
          setEmail(session.user?.email || '')
        }
      })

      const { data: { subscription} } = supabaseClient.auth.onAuthStateChange((event, session) => {
        if(session) {
          setSession(session)
          setEmail(session.user?.email || '')
        }
      })
      
      return () => subscription.unsubscribe()
    }, [])

    async function handleChat() {
      const {data, error} = await supabaseClient.from('user_roles').select('role').eq('user_id', session?.user?.id)
      if(data) {
        console.log(data)
        if(data[0].role === 'paid') {
          window.location.href  = '/chat'
        }
        else {
          window.location.href = '/payment'
        }
      }
      else {
        console.log(error)
      }
    }
    
    return (
      <div className='flex flex-col p-4 w-full h-screen gap-2'>
        <div className="flex w-full justify-end gap-3">
          {!session && <Button> Sign Up </Button>}
          {!session && <Button> Login </Button>}
        </div>
        <div className="flex flex-col items-center w-full h-full gap-20 py-20">
          <div className="flex flex-col gap-4 py-20">
            <h1> Welcome to the your AI Personal Trainer</h1>
            <h2> You can ask ANYthing!... and I mean <em>ANYTHING</em></h2>
          </div>
          <Button onClick={handleChat}>Chat with Gym Trainer</Button>
        </div>
      </div>
    )

}