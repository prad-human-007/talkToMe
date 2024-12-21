import { Auth } from "@supabase/auth-ui-react"
import { supabaseClient } from "@/supabaseClient"
import { useEffect } from "react"

export default function AuthPage() {

    useEffect(() => {
        supabaseClient.auth.getSession()
        .then(({ data: { session }}) => {
            console.log(' setSession:', session)
            if(session) {
                window.location.href = '/'
            }
        })
        
        const { data: { subscription }} = supabaseClient.auth.onAuthStateChange((_event, session) => {
            console.log('onAuthStateChange: Event: ', _event)
            console.log('onAuthStateChange: Session: ', session)
            if(session) {
                window.location.href = '/'
            }
        })
    })

    return (
        <>
         <Auth supabaseClient={supabaseClient} />
        </>
    )
}