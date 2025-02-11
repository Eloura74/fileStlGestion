import "./Header.css";
import Navbar from "./Navbar.tsx";

const Header = () => {
  return (
    <>
      <Navbar />
      <header id="accueil" className="header-section">
        <h1 className="titleH1">
          Bienvenue sur Votre Site de Gestion de Fichier STL
        </h1>
      </header>
    </>
  );
};

export default Header;
