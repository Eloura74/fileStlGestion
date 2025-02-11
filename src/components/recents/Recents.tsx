import { useEffect, useState } from "react";
import { listFiles } from "../../api/apiStl";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import PreviewSTL from "../previewSTL/PreviewSTL"; // 🔹 Import du composant de rendu 3D

const Recents = () => {
  const [stlFiles, setStlFiles] = useState<string[]>([]);

  useEffect(() => {
    listFiles().then((files) => {
      setStlFiles(files.reverse()); // 🔹 Afficher tous les fichiers, du plus récent au plus ancien
    });
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-10">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Fichiers STL Récents
      </h2>

      {/* Carrousel avec Swiper */}
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={20}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className="w-full"
      >
        {stlFiles.map((file, index) => (
          <SwiperSlide key={index} className="flex justify-center">
            <div className="bg-white shadow-lg rounded-lg p-4 w-72 text-center transform transition duration-300 hover:scale-105">
              <h3 className="text-lg font-semibold text-gray-900">{file}</h3>
              {/* 🔹 Rendu 3D du fichier STL */}
              <PreviewSTL
                fileUrl={`http://localhost:5000/stl-files/${encodeURIComponent(
                  file
                )}`}
              />

              <button
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 transition"
                onClick={() =>
                  window.open(
                    `http://localhost:5000/stl-files/${file}`,
                    "_blank"
                  )
                }
              >
                Télécharger
              </button>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Recents;
