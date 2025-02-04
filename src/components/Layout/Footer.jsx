import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold">Plateforme de Modèles 3D</h3>
            <p className="text-gray-400 text-sm">© 2025 Tous droits réservés</p>
          </div>
          
          <div className="flex space-x-6">
            <a href="/aide" className="text-gray-400 hover:text-white transition-colors">
              Aide
            </a>
            <a href="/contact" className="text-gray-400 hover:text-white transition-colors">
              Contact
            </a>
            <a href="/mentions-legales" className="text-gray-400 hover:text-white transition-colors">
              Mentions légales
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
