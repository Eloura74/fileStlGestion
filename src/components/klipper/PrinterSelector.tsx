import React from 'react';
import { PrinterIcon } from "@heroicons/react/24/outline";

export type Printer = {
  id: string;
  name: string;
  url: string;
};

interface PrinterSelectorProps {
  printers: Printer[];
  selectedPrinter: Printer;
  onSelectPrinter: (printer: Printer) => void;
}

const PrinterSelector: React.FC<PrinterSelectorProps> = ({
  printers,
  selectedPrinter,
  onSelectPrinter,
}) => {
  return (
    <div className="flex items-center space-x-2 mb-4">
      {printers.map((printer) => (
        <button
          key={printer.id}
          onClick={() => onSelectPrinter(printer)}
          className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 ${
            selectedPrinter.id === printer.id
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
          }`}
        >
          <PrinterIcon className="w-5 h-5" />
          <span>{printer.name}</span>
        </button>
      ))}
    </div>
  );
};

export default PrinterSelector;
