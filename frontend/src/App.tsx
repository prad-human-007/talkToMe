import { BrowserRouter, Route, Routes } from "react-router-dom"
import Home from "./components/home"
import Chat from "./components/chat"
import Supa from "./components/supa"
import AuthPage from "./components/ui/auth.tsx"
import { AppSidebar } from "./components/app-sidebar"
import { SidebarProvider } from './components/ui/sidebar.tsx'
import Cookies from "js-cookie";
import { useEffect, useState } from "react"

// import './App.css';
function App() {

  const cookieValue = Cookies.get("sidebar:state");
  console.log("cookieValue", cookieValue === "true");
  const defaultOpen = cookieValue === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/chat" element={<Chat/>} />
          <Route path="/supa" element={<Supa/>} />
          <Route path="/auth" element={<AuthPage/>}/>
        </Routes>
      </BrowserRouter>
    </SidebarProvider>
  )
}

export default App
