import { BrowserRouter, Route, Routes } from "react-router-dom"
import Home from "./components/home"
import Chat from "./components/chat"

// import './App.css';
function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/chat" element={<Chat/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
