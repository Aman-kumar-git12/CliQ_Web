import { BrowserRouter, Route, Routes } from "react-router-dom";
import Body from "./components/Body.jsx";
import {Signup,Login}  from "./components/auth.jsx";

function App() {
  return (
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Body />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
