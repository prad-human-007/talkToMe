import React, { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useSearchParams } from 'react-router-dom';
import { supabaseClient } from '../supabaseClient';
import { Session } from '@supabase/supabase-js';
import { Auth } from '@supabase/auth-ui-react';
import { AppSidebar } from './app-sidebar';
import { SidebarTrigger } from './ui/sidebar';
import { ModeToggle } from './mode-toggle';
export default function Chat() {

    const [messages, setMessages] = useState<{ sender: string, text: string }[]>([]);
    const [input, setInput] = useState('');
    const [username, setUsername] = useState('');
    const [searchParams] = useSearchParams();
    const [session, setSession] = useState<Session | null>(null)
    
    useEffect(() => {
            supabaseClient.auth.getSession()
            .then(({ data: { session }}) => {
                console.log(' setSession:', session)
                if(session) {
                    setSession(session)
                    setUsername(session.user?.email || '')
                }
                
            })

            const { data: { subscription }} = supabaseClient.auth.onAuthStateChange((_event, session) => {
                console.log('onAuthStateChange: Event: ', _event)
                console.log('onAuthStateChange: Session: ', session)
                if(session)  setSession(session)
            })

            return () => subscription.unsubscribe();
    }, [])



    const sendMessage = async () => {
        if (input.trim() === '') return;

        const newMessage = { sender: 'user', text: input };
        setMessages([...messages, newMessage]);
        setInput('');
        const response = await fetch('http://localhost:8000/getreply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: input, username }),
        });

        const data = await response.json();
        const msg = data.reply;
        // const msg = "Dummy message";
        const aiMessage = { sender: 'ai', text: msg };
        setMessages([...messages, newMessage, aiMessage]);
    
    };

    const handleKeyDown = (e: any) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevents the default behavior (e.g., submitting a form)
            sendMessage();
        }
    };

    if (!session) {
        return (
            <>
             <Auth supabaseClient={supabaseClient} />
            </>
        )
    }
    else {
        return (
            <>
                <AppSidebar />
                <div className='flex flex-col w-full h-screen p-4 gap-5'>
                    <div className='flex flex-row gap-5 px-3'>
                        <SidebarTrigger />
                        <p>{username}</p>
                        <ModeToggle />
                    </div>
                    <div className='flex flex-row flex-grow'>
                        <div className='flex flex-col'>
                            
                        </div>
                        <div className='flex flex-col flex-grow gap-3'>
                            <div style={{ flex: 1, overflowY: 'auto', padding: '10px', border: '1px solid #ccc' }}>
                                {messages.map((msg, index) => (
                                    <div key={index} style={{ margin: '10px 0' }}>
                                        <strong>{msg.sender}:</strong> {msg.text}
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', padding: '10px' }}>
                                <Input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    style={{ flex: 1, marginRight: '10px', padding: '10px' }}
                                />
                                <Button onClick={sendMessage} style={{ padding: '10px 20px' }}>Send</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
    

}