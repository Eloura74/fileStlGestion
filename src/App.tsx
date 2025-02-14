import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import ModelePage from "./components/modeles/ModelePage";
import MoonrakerSensor from './components/klipper/printer1/MoonrakerSensor';
import PrinterSelector, { Printer } from './components/klipper/PrinterSelector';
import Header from "./components/layout/header";

const PRINTERS: Printer[] = [
  {
    id: "vzbot",
    name: "VzBot",
    url: "http://192.168.1.130:7125"
  },
  {
    id: "switchire",
    name: "Switchire",
    url: "http://192.168.1.128:7125"
  }
];

const App: React.FC = () => {
  const [showPrinterStatus, setShowPrinterStatus] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState<Printer>(PRINTERS[0]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Header onTogglePrinterStatus={() => setShowPrinterStatus(!showPrinterStatus)} />
        <main className="relative">
          <Routes>
            <Route path="/" element={<ModelePage />} />
            <Route path="/models" element={<ModelePage />} />
            <Route path="/recent" element={<ModelePage />} />
          </Routes>

          {/* Popup MoonrakerSensor avec sélection d'imprimante */}
          {showPrinterStatus && (
            <div className="fixed right-4 top-20 z-50 sm:right-6 md:right-8 lg:right-[calc((100vw-1024px)/2+2rem)]">
              <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-700 p-4 w-[calc(100vw-2rem)] sm:w-[400px]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white text-lg font-medium">Statut Imprimantes</h3>
                  <button
                    onClick={() => setShowPrinterStatus(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
                
                <PrinterSelector
                  printers={PRINTERS}
                  selectedPrinter={selectedPrinter}
                  onSelectPrinter={setSelectedPrinter}
                />
                
                <MoonrakerSensor printerUrl={selectedPrinter.url} />
              </div>
            </div>
          )}
        </main>
      </div>
    </Router>
  );
};

export default App;
