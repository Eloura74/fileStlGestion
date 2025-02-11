// partie sous le header qui vas contenir la div avec les modeles recent gerer dans recent.tsx
import Recents from "../recents/Recents.tsx";
import "./Hero.css";
const Hero = () => {
  return (
    <div className="hero">
      <h1 className="titleH1">Modèles Recents</h1>
      <Recents />
    </div>
  );
};

export default Hero;
