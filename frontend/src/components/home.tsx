import { useState } from "react";

export default function Home() {

    const [email, setEmail] = useState('');

    async function handleChat() {
        if (email.trim() === '')
            alert('Please enter a valid email ID');
        else
            window.location.href = `/chat?email=${encodeURIComponent(email)}`;
    }
     
    
      return (
        <div className='flex flex-col p-4 w-full h-screen gap-2'>
          <div className="flex w-full justify-end gap-3">
            <button> Sign Up </button>
            <button> Login </button>
          </div>
          <div className="flex flex-col items-center w-full h-full gap-20 py-20">
            <div className="flex flex-col gap-4 py-20">
              <h1> Welcome to the your AI Personal Trainer</h1>
              <h2> You can ask ANYthing!... and I mean <em>ANYTHING</em></h2>
            </div>
            <input 
                type="text" 
                placeholder="Enter Email ID" 
                className="p-3 rounded"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={handleChat}>Chat with Gym Trainer</button>
          </div>
        </div>
      )

}