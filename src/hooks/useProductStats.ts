import { useState, useCallback } from "react";
import { ProductStats, UserInteraction } from "@/lib/types";

export const useProductStats = () => {
  const [stats, setStats] = useState<ProductStats[]>([]);
  const [interactions, setInteractions] = useState<UserInteraction[]>([]);

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

  return {
    stats,
    interactions,
    addInteraction,
    getProductStats,
    getTotalStats,
  };
};
