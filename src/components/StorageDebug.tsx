import { useEffect, useState } from "react";

export const StorageDebug = () => {
  const [storageData, setStorageData] = useState<any>({});

  useEffect(() => {
    const updateData = () => {
      try {
        const data = {
          cart: JSON.parse(localStorage.getItem("swipeshop-cart") || "[]"),
          favorites: JSON.parse(
            localStorage.getItem("swipeshop-favorites") || "[]",
          ),
          stats: JSON.parse(localStorage.getItem("swipeshop-stats") || "[]"),
          interactions: JSON.parse(
            localStorage.getItem("swipeshop-interactions") || "[]",
          ),
        };
        setStorageData(data);
      } catch (error) {
        console.error("Error reading localStorage:", error);
      }
    };

    updateData();
    const interval = setInterval(updateData, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-20 left-4 z-50 bg-black/80 text-white p-3 rounded-lg text-xs max-w-sm">
      <h4 className="font-bold mb-2">🔍 Storage Debug</h4>
      <div className="space-y-1">
        <div>Cart: {storageData.cart?.length || 0} items</div>
        <div>Favorites: {storageData.favorites?.length || 0} items</div>
        <div>Stats: {storageData.stats?.length || 0} products</div>
        <div>Interactions: {storageData.interactions?.length || 0} total</div>
      </div>
    </div>
  );
};
