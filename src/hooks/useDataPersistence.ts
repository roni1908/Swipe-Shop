import { useState, useEffect, useCallback } from "react";
import { Product, ProductStats, UserInteraction } from "@/lib/types";
import { CartItem, FavoriteItem } from "./useCartAndFavorites";

export interface AppData {
  products: Product[];
  stats: ProductStats[];
  interactions: UserInteraction[];
  cart: CartItem[];
  favorites: FavoriteItem[];
  sessions: SessionData[];
  config: AppConfig;
  lastUpdated: Date;
}

export interface SessionData {
  id: string;
  startTime: Date;
  endTime?: Date;
  interactions: number;
  pagesViewed: string[];
  userAgent: string;
  duration?: number;
}

export interface AppConfig {
  siteName: string;
  currency: string;
  timezone: string;
  maintenanceMode: boolean;
  maxProductsPerSession: number;
  featuredCollections: string[];
  priceRange: { min: number; max: number };
}

const DEFAULT_CONFIG: AppConfig = {
  siteName: "SwipeShop",
  currency: "USD",
  timezone: "UTC",
  maintenanceMode: false,
  maxProductsPerSession: 50,
  featuredCollections: ["Electronics", "Fashion", "Home"],
  priceRange: { min: 0, max: 1000 },
};

const STORAGE_KEY = "swipeshop_admin_data";
const SESSION_STORAGE_KEY = "swipeshop_current_session";

export const useDataPersistence = () => {
  const [data, setData] = useState<AppData>(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        // Convert date strings back to Date objects
        return {
          ...parsed,
          lastUpdated: new Date(parsed.lastUpdated),
          interactions: parsed.interactions.map((i: any) => ({
            ...i,
            timestamp: new Date(i.timestamp),
          })),
          cart: parsed.cart.map((c: any) => ({
            ...c,
            addedAt: new Date(c.addedAt),
          })),
          favorites: parsed.favorites.map((f: any) => ({
            ...f,
            addedAt: new Date(f.addedAt),
          })),
          sessions: parsed.sessions.map((s: any) => ({
            ...s,
            startTime: new Date(s.startTime),
            endTime: s.endTime ? new Date(s.endTime) : undefined,
          })),
        };
      }
    } catch (error) {
      console.error("Error loading persisted data:", error);
    }

    return {
      products: [],
      stats: [],
      interactions: [],
      cart: [],
      favorites: [],
      sessions: [],
      config: DEFAULT_CONFIG,
      lastUpdated: new Date(),
    };
  });

  const [currentSession, setCurrentSession] = useState<SessionData>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          startTime: new Date(parsed.startTime),
          endTime: parsed.endTime ? new Date(parsed.endTime) : undefined,
        };
      }
    } catch (error) {
      console.error("Error loading session data:", error);
    }

    return {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: new Date(),
      interactions: 0,
      pagesViewed: ["/"],
      userAgent: navigator.userAgent,
    };
  });

  // Save data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...data,
          lastUpdated: new Date(),
        }),
      );
    } catch (error) {
      console.error("Error saving data to localStorage:", error);
    }
  }, [data]);

  // Save session data
  useEffect(() => {
    try {
      sessionStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify(currentSession),
      );
    } catch (error) {
      console.error("Error saving session data:", error);
    }
  }, [currentSession]);

  const updateData = useCallback((updates: Partial<AppData>) => {
    setData((prev) => ({
      ...prev,
      ...updates,
      lastUpdated: new Date(),
    }));
  }, []);

  const addProduct = useCallback((product: Product) => {
    setData((prev) => ({
      ...prev,
      products: [...prev.products, product],
      lastUpdated: new Date(),
    }));
  }, []);

  const updateProduct = useCallback(
    (productId: string, updates: Partial<Product>) => {
      setData((prev) => ({
        ...prev,
        products: prev.products.map((p) =>
          p.id === productId ? { ...p, ...updates } : p,
        ),
        lastUpdated: new Date(),
      }));
    },
    [],
  );

  const deleteProduct = useCallback((productId: string) => {
    setData((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== productId),
      stats: prev.stats.filter((s) => s.productId !== productId),
      interactions: prev.interactions.filter((i) => i.productId !== productId),
      lastUpdated: new Date(),
    }));
  }, []);

  const addInteraction = useCallback((interaction: UserInteraction) => {
    setData((prev) => {
      const newStats = [...prev.stats];
      const existingIndex = newStats.findIndex(
        (s) => s.productId === interaction.productId,
      );

      if (existingIndex >= 0) {
        newStats[existingIndex] = {
          ...newStats[existingIndex],
          [interaction.action === "like"
            ? "likes"
            : interaction.action === "dislike"
              ? "dislikes"
              : "Love It"]:
            newStats[existingIndex][
              interaction.action === "like"
                ? "likes"
                : interaction.action === "dislike"
                  ? "dislikes"
                  : "Love It"
            ] + 1,
        };
      } else {
        newStats.push({
          productId: interaction.productId,
          likes: interaction.action === "like" ? 1 : 0,
          dislikes: interaction.action === "dislike" ? 1 : 0,
          "Love It": interaction.action === "Love It" ? 1 : 0,
        });
      }

      return {
        ...prev,
        interactions: [...prev.interactions, interaction],
        stats: newStats,
        lastUpdated: new Date(),
      };
    });

    // Update current session
    setCurrentSession((prev) => ({
      ...prev,
      interactions: prev.interactions + 1,
    }));
  }, []);

  const updateSession = useCallback((updates: Partial<SessionData>) => {
    setCurrentSession((prev) => ({ ...prev, ...updates }));
  }, []);

  const endSession = useCallback(() => {
    const endedSession = {
      ...currentSession,
      endTime: new Date(),
      duration: Date.now() - currentSession.startTime.getTime(),
    };

    setData((prev) => ({
      ...prev,
      sessions: [...prev.sessions, endedSession],
      lastUpdated: new Date(),
    }));

    // Start new session
    setCurrentSession({
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: new Date(),
      interactions: 0,
      pagesViewed: ["/"],
      userAgent: navigator.userAgent,
    });
  }, [currentSession]);

  const updateConfig = useCallback((config: AppConfig) => {
    setData((prev) => ({
      ...prev,
      config,
      lastUpdated: new Date(),
    }));
  }, []);

  const exportData = useCallback(() => {
    return {
      ...data,
      exportedAt: new Date(),
      version: "1.0",
    };
  }, [data]);

  const importData = useCallback((importedData: any) => {
    try {
      // Validate and convert imported data
      const validated: AppData = {
        products: importedData.products || [],
        stats: importedData.stats || [],
        interactions: (importedData.interactions || []).map((i: any) => ({
          ...i,
          timestamp: new Date(i.timestamp),
        })),
        cart: (importedData.cart || []).map((c: any) => ({
          ...c,
          addedAt: new Date(c.addedAt),
        })),
        favorites: (importedData.favorites || []).map((f: any) => ({
          ...f,
          addedAt: new Date(f.addedAt),
        })),
        sessions: (importedData.sessions || []).map((s: any) => ({
          ...s,
          startTime: new Date(s.startTime),
          endTime: s.endTime ? new Date(s.endTime) : undefined,
        })),
        config: importedData.config || DEFAULT_CONFIG,
        lastUpdated: new Date(),
      };

      setData(validated);
      return true;
    } catch (error) {
      console.error("Error importing data:", error);
      return false;
    }
  }, []);

  const clearAllData = useCallback(() => {
    const newData: AppData = {
      products: [],
      stats: [],
      interactions: [],
      cart: [],
      favorites: [],
      sessions: [],
      config: DEFAULT_CONFIG,
      lastUpdated: new Date(),
    };

    setData(newData);
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }, []);

  return {
    data,
    currentSession,
    updateData,
    addProduct,
    updateProduct,
    deleteProduct,
    addInteraction,
    updateSession,
    endSession,
    updateConfig,
    exportData,
    importData,
    clearAllData,
  };
};
