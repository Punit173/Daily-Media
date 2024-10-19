import './App.css';
import Home from "./components/Home";
import Login from './components/Login';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Post from './components/Post';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Login route */}
          <Route path="/" element={<Login />} />

          {/* Home route */}
          <Route path="/home" element={<Home />} />
          <Route path="/post" element={<Post />} />

          {/* Uncomment this if you want a fallback for undefined routes */}
          {/* <Route path="*" element={<NoPage />} /> */}
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
