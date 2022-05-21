// // After
// import { createRoot } from 'react-dom/client';
// import App from './App'

// const container = document.getElementById('root');
// const root = createRoot(container); // createRoot(container!) if you use TypeScript
// root.render(<App />);

import { createRoot }  from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import Citizen from "./pages/Citizen";
import Avatar from "./pages/Avatar";
import Builder from "./pages/Builder";
import NoPage from "./pages/NoPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Citizen />} />
          <Route path="avatar" element={<Avatar />} />
          <Route path="builder" element={<Builder />} />
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(<App />);