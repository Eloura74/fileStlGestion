import "./Navbar.css";

const Navbar = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-links">
        <button onClick={() => scrollToSection("accueil")} className="nav-link">
          Accueil
        </button>

        <button
          onClick={() => scrollToSection("visualisation")}
          className="nav-link"
        >
          Modeles
        </button>
        <button
          onClick={() => scrollToSection("parametres")}
          className="nav-link"
        >
          Paramètres
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
