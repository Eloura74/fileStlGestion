import React, { useState, useEffect } from "react";
import { recupererActualites } from "../../services/actualitesService";

const Actualites = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chargement initial des articles
  useEffect(() => {
    const chargerArticles = async () => {
      try {
        const articlesRecus = await recupererActualites();
        if (articlesRecus.length > 0) {
          setArticles(articlesRecus);
        } else {
          setError("Aucun article trouvé");
        }
      } catch (err) {
        setError("Erreur lors du chargement des actualités");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    chargerArticles();
  }, []);

  // Rafraîchissement périodique des articles (toutes les heures)
  useEffect(() => {
    const rafraichirArticles = async () => {
      const articlesRecus = await recupererActualites();
      if (articlesRecus.length > 0) {
        setArticles(articlesRecus);
      }
    };

    const intervalId = setInterval(rafraichirArticles, 3600000); // 1 heure
    return () => clearInterval(intervalId);
  }, []);

  // Défilement automatique
  useEffect(() => {
    if (isPaused || articles.length <= 1) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused, articles.length]);

  const nextSlide = () => {
    if (articles.length <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % articles.length);
      setIsTransitioning(false);
    }, 300);
  };

  const previousSlide = () => {
    if (articles.length <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? articles.length - 1 : prevIndex - 1
      );
      setIsTransitioning(false);
    }, 300);
  };

  const goToSlide = (index) => {
    if (index === currentIndex || articles.length === 0) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 300);
  };

  // Affichage du chargement
  if (isLoading) {
    return (
      <div className="w-full bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg">
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-700 rounded"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-700 rounded w-1/4"></div>
              <div className="h-6 bg-gray-700 rounded w-3/4"></div>
              <div className="h-20 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Affichage des erreurs
  if (error || articles.length === 0) {
    return (
      <div className="w-full bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-6">
          Actualités de l'Impression 3D
        </h2>
        <div className="text-gray-300">
          {error || "Aucune actualité disponible pour le moment"}
        </div>
      </div>
    );
  }

  const currentActualite = articles[currentIndex];

  return (
    <div
      className="w-full bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative">
        {/* Image de fond avec effet de flou */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={currentActualite.image}
            alt=""
            className="w-full h-full object-cover filter blur-lg opacity-20 scale-110 transform"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/400x300?text=Image+non+disponible";
            }}
          />
        </div>

        {/* Contenu principal */}
        <div className="relative p-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            Actualités de l'Impression 3D
          </h2>

          <div className="relative overflow-hidden rounded-lg">
            <div
              className={`transition-all duration-300 ease-in-out ${
                isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
              }`}
            >
              <div className="grid md:grid-cols-2 gap-6">
                {/* Image */}
                <div className="h-64 overflow-hidden rounded-lg shadow-lg">
                  <img
                    src={currentActualite.image}
                    alt={currentActualite.titre}
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/400x300?text=Image+non+disponible";
                    }}
                  />
                </div>

                {/* Contenu */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-block px-3 py-1 bg-purple-600 text-white text-sm rounded-full">
                      {currentActualite.categorie}
                    </span>
                    <span className="text-sm text-gray-400">
                      via {currentActualite.source}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-white">
                    {currentActualite.titre}
                  </h3>

                  <p className="text-gray-300 line-clamp-3">
                    {currentActualite.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <p className="text-purple-400 text-sm">
                      {new Date(currentActualite.date).toLocaleDateString(
                        "fr-FR",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                    <a
                      href={currentActualite.lienSource}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 text-sm underline"
                    >
                      Lire l'article
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          {articles.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center space-x-2">
              <button
                onClick={previousSlide}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                ←
              </button>
              {articles.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-purple-500 w-4"
                      : "bg-gray-400 hover:bg-purple-400"
                  }`}
                />
              ))}
              <button
                onClick={nextSlide}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Actualites;
