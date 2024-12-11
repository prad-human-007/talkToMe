import React, { useContext, useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useSearchParams } from 'react-router-dom';
import { supabaseClient } from '../supabaseClient';
import { Session } from '@supabase/supabase-js';
import { Auth } from '@supabase/auth-ui-react';
import { AppSidebar } from './app-sidebar';
import { SidebarTrigger } from './ui/sidebar';
import { ModeToggle } from './mode-toggle';
import { Textarea } from './ui/textarea';
import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"

export default function Chat() {

    const [messages, setMessages] = useState<{ sender: string, text: string }[]>([]);
    const [input, setInput] = useState('');
    const [username, setUsername] = useState('');
    const [searchParams] = useSearchParams();
    const [session, setSession] = useState<Session | null>(null)
    const [chats, setChats] = useState<any[] | null>([])
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);

        // Auto resize the textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto"; // Reset height
            const scrollHeight = textareaRef.current.scrollHeight;
            const maxHeight = 6 * parseFloat(getComputedStyle(textareaRef.current).lineHeight!); // Max height for 4 rows
            textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`; // Adjust height with max limit
        }
    };

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
        
        getChats()

        return () => subscription.unsubscribe();
    }, [])

    const getChats= async () => {
        console.log('in getChats')
        const { data, error } = await supabaseClient.from('chats').select('id, chat_title')
        console.log(error)
        console.log(data)
        if (data) {
            setChats(data)
        }
    }

    function handleClick(chatID: any) {
        console.log('Chat ID in handleClick:', chatID)
    }
   

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
        if (e.key === 'Enter' && !e.shiftKey) {
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
                <AppSidebar chats={chats} handleClick={handleClick} username={username}/>
                <div className='flex flex-col w-full h-screen p-4 gap-5'>
                    <div className='flex flex-row gap-5 px-3'>
                        <SidebarTrigger />
                        <ModeToggle />
                    </div>
                    <div className='flex flex-row flex-grow'>
                        <div className='flex flex-col'>
                            
                        </div>
                        <div className='flex flex-col flex-grow gap-3'>
                            <div className="flex-1 overflow-y-auto p-2 border border-gray-300 rounded-lg">
                                {messages.map((msg, index) => (
                                    <div key={index} className="p-2">
                                        <span className="font-bold">{msg.sender}: </span> <span className="ml-2">{msg.text}</span>
                                    </div>
                                ))}
                            </div>
                            <div className='flex flex-col border border-input rounded-xl p-2'>
                                <Textarea
                                    // type="text"
                                    ref={textareaRef}
                                    value={input}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyDown}
                                    className='flex p-2'
                                />
                                <div className='flex justify-end'>
                                    <Button onClick={sendMessage} className='flex p-2 '>Send</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
    

}