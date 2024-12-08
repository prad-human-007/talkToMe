import { useState } from "react";
import { Button } from "./ui/button";

export default function Home() {

    const [email, setEmail] = useState('');

    async function handleChat() {
        window.location.href = `/chat`;
    }
     
    
      return (
        <div className='flex flex-col p-4 w-full h-screen gap-2'>
          <div className="flex w-full justify-end gap-3">
            <Button> Sign Up </Button>
            <Button> Login </Button>
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