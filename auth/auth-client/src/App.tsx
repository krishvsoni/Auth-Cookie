import './App.css'

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Signin } from './components/sigin';
import { User } from './components/user';
import { Signup } from './components/signup';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={"/signup"} element={<Signup />} />
        <Route path={"/signin"} element={<Signin />} />
        <Route path={"/user"} element={<User />} />
        
      </Routes>
    </BrowserRouter>
  )
}

export default App
