import { useState, useCallback, useEffect } from "react";
import { ProductStats, UserInteraction } from "@/lib/types";

const STATS_STORAGE_KEY = "swipeshop_stats";
const INTERACTIONS_STORAGE_KEY = "swipeshop_interactions";

export const useProductStats = () => {
  const [stats, setStats] = useState<ProductStats[]>(() => {
    try {
      const saved = localStorage.getItem(STATS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [interactions, setInteractions] = useState<UserInteraction[]>(() => {
    try {
      const saved = localStorage.getItem(INTERACTIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((interaction: any) => ({
          ...interaction,
          timestamp: new Date(interaction.timestamp),
        }));
      }
      return [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage whenever stats or interactions change
  useEffect(() => {
    try {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error("Failed to save stats:", error);
    }
  }, [stats]);

  useEffect(() => {
    try {
      localStorage.setItem(
        INTERACTIONS_STORAGE_KEY,
        JSON.stringify(interactions),
      );
    } catch (error) {
      console.error("Failed to save interactions:", error);
    }
  }, [interactions]);

  const addInteraction = useCallback(
    (productId: string, action: "like" | "dislike" | "Love It") => {
      const interaction: UserInteraction = {
        productId,
        action,
        timestamp: new Date(),
      };

      setInteractions((prev) => [...prev, interaction]);

      setStats((prev) => {
        const existingIndex = prev.findIndex(
          (stat) => stat.productId === productId,
        );

        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            [action === "like"
              ? "likes"
              : action === "dislike"
                ? "dislikes"
                : "Love It"]:
              updated[existingIndex][
                action === "like"
                  ? "likes"
                  : action === "dislike"
                    ? "dislikes"
                    : "Love It"
              ] + 1,
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              productId,
              likes: action === "like" ? 1 : 0,
              dislikes: action === "dislike" ? 1 : 0,
              "Love It": action === "Love It" ? 1 : 0,
            },
          ];
        }
      });
    },
    [],
  );

  const getProductStats = useCallback(
    (productId: string): ProductStats => {
      const stat = stats.find((s) => s.productId === productId);
      return stat || { productId, likes: 0, dislikes: 0, "Love It": 0 };
    },
    [stats],
  );

  const getTotalStats = useCallback(() => {
    return stats.reduce(
      (acc, stat) => ({
        likes: acc.likes + stat.likes,
        dislikes: acc.dislikes + stat.dislikes,
        "Love It": acc["Love It"] + stat["Love It"],
      }),
      { likes: 0, dislikes: 0, "Love It": 0 },
    );
  }, [stats]);

  const clearAllStats = useCallback(() => {
    setStats([]);
    setInteractions([]);
    localStorage.removeItem(STATS_STORAGE_KEY);
    localStorage.removeItem(INTERACTIONS_STORAGE_KEY);
  }, []);

  return {
    stats,
    interactions,
    addInteraction,
    getProductStats,
    getTotalStats,
    clearAllStats,
  };
};
