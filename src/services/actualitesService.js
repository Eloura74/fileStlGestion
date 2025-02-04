const RSS_CORS_PROXY = "https://api.rss2json.com/v1/api.json?rss_url=";
const RSS_FEEDS = [
  "https://3dnatives.com/feed/",
  "https://www.primante3d.com/feed/",
];

export const fetchActualites = async () => {
  try {
    // On utilise le premier flux RSS disponible (3DNatives)
    const response = await fetch(
      `${RSS_CORS_PROXY}${encodeURIComponent(RSS_FEEDS[0])}`
    );
    const data = await response.json();

    if (data.status !== "ok") {
      throw new Error("Erreur lors de la récupération des actualités");
    }

    // On transforme les articles RSS en notre format
    return data.items.slice(0, 5).map((item, index) => ({
      id: index + 1,
      titre: item.title,
      description:
        item.description.replace(/<[^>]*>/g, "").slice(0, 200) + "...", // On nettoie le HTML et on limite la longueur
      image:
        item.enclosure?.link ||
        item.thumbnail ||
        "https://via.placeholder.com/400x300?text=3D+Printing+News",
      date: item.pubDate,
      categorie: "Actualité",
      lien: item.link,
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des actualités:", error);
    return [];
  }
};
