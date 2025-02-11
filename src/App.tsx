import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import ModelePage from "./components/modeles/ModelePage";

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<ModelePage />} />
          <Route path="/models" element={<ModelePage />} />
          <Route path="/recent" element={<ModelePage />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
