import React, { useState, useEffect } from "react";
import { actualites } from "../../data/actualites3d";

const Actualites = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused]);

  const nextSlide = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % actualites.length);
      setIsTransitioning(false);
    }, 300);
  };

  const previousSlide = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? actualites.length - 1 : prevIndex - 1
      );
      setIsTransitioning(false);
    }, 300);
  };

  const goToSlide = (index) => {
    if (index === currentIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 300);
  };

  const currentActualite = actualites[currentIndex];

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
                      e.target.src =
                        "https://via.placeholder.com/400x300?text=Image+non+disponible";
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
          <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center space-x-2">
            <button
              onClick={previousSlide}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              ←
            </button>
            {actualites.map((_, index) => (
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
        </div>
      </div>
    </div>
  );
};

export default Actualites;
