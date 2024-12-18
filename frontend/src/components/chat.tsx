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

    const [messages, setMessages] = useState<{ role: string, content: string }[]>([]);
    const [input, setInput] = useState('');
    const [username, setUsername] = useState('');
    const [searchParams] = useSearchParams();
    const [session, setSession] = useState<Session | null>(null)
    const [chats, setChats] = useState<any[] | null>([])
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatIDRef = useRef('');

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

    // Automatically scroll to the bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]); // Trigger when the `messages` array updates

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

    const getChats = async () => {
        console.log('in getChats')
        const { data, error } = await supabaseClient.from('chats').select('id, chat_title')
        console.log(error)
        console.log(data)
        if (data) {
            setChats(data)
        }
    }

    const getMessages = async () => {
        console.log('in getMessages')
        const { data, error } = await supabaseClient.from('messages').select('*').eq('chat_id', chatIDRef.current).order('created_at')
        if(data) {
            // console.log("", data)
            const chats: any = []
            data.map(data => {
                console.log("Chat Messages: ", data.role, data.content)
                const newMessage = { role: data.role, content: data.content };
                chats.push(newMessage)
            })
            setMessages(chats)
        }
        else
            console.log("Error when getting Messages: ", error)

    }

    function handleClick(chatID: string) {
        console.log('Chat ID in handleClick:', chatID)
        chatIDRef.current = chatID
        getMessages()

    }

    function newChat() {
        console.log('Pressed new chat')
        setMessages([])
        chatIDRef.current = ''
    }

    const sendMessage = async () => {
        if (input.trim() === '') return;

        if(chatIDRef.current === '') {
            // Create a new chat
            console.log("User Id =", session?.user?.id)
            const { data, error } = await supabaseClient
            .from('chats')
            .insert([{chat_title: `Chat ${Math.floor(Math.random() * 1000)}`, user_id : session?.user?.id}])
            .select('id')
            
            if(error){
                console.log("Chat Creation Error: ", error)
                return
            }
            else {
                chatIDRef.current = data[0].id
            }

            getChats()
        }

        const newMessage = { role: 'user', content: input };
        setMessages([...messages, newMessage]);
        setInput('');


        const response = await fetch('http://localhost:8000/getreply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: [...messages, newMessage], username }),
        });

        const data = await response.json();
        const msg = data.reply;
        // const msg = "Dummy message";
        const aiMessage = { role: 'assistant', content: msg };

        const { error } = await supabaseClient
        .from('messages')
        .insert([
            { chat_id: chatIDRef.current, role: 'user', content: input },
            { chat_id: chatIDRef.current, role: 'assistant', content: msg }
        ])
        if(error) {
            console.log('Error inserting message: ', error)
        }
        
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
                <AppSidebar chats={chats} handleClick={handleClick} username={username} newChat={newChat}/>
                <div className='flex flex-col w-full items-center justify-between h-screen p-4 gap-5'>
                    <div className='flex flex-row w-full gap-5 px-3'>
                        <SidebarTrigger />
                        <ModeToggle />
                    </div>
                    <div className="flex flex-col h-full w-full max-w-3xl overflow-y-auto gap-2">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex p-1 mr-2 max-w-3xl ${(msg.role === "user") ? "justify-end" : "justify-start"}`}>
                                {/* <span className="font-bold">{msg.role}: </span>  */}
                                <p className="break-words border border-input rounded-md max-w-2xl p-1 px-2">{msg.content}</p>
                            </div>
                        ))}
                        {/* Ref to ensure scrolling to the bottom */}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className='flex flex-col border border-input rounded-xl p-2 max-w-3xl w-full'>
                        <Textarea
                            rows={1}
                            ref={textareaRef}
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            
                        />
                        <div className='flex justify-end'>
                            <Button onClick={sendMessage} className='flex p-2 '>Send</Button>
                        </div>
                    </div>
                </div>
            </>
        );
    }
    

}