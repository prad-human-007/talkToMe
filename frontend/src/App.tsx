// import './App.css';
function App() {

  async function handleChat() {
    alert('Chat with Gym Trainer')
  }
 

  return (
    <div className='flex flex-col p-4 w-full h-screen gap-2'>
      <div className="flex w-full justify-end gap-3">
        <button> Sign Up</button>
        <button> Login</button>
      </div>
      <div className="flex flex-col items-center w-full h-full gap-20 py-20">
        <div className="flex flex-col gap-4 py-20">
          <h1> Welcome to the your AI Personal Trainer</h1>
          <h2> You can ask ANYthing!... and I mean <em>ANYTHING</em></h2>
        </div>
        <button onClick={handleChat}>Chat with Gym Trainer</button>
      </div>
    </div>
  )
}

export default App
