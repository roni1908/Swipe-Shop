import { AppData } from "@/hooks/useDataPersistence";

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          if (value instanceof Date) {
            return value.toISOString();
          }
          if (typeof value === "string" && value.includes(",")) {
            return `"${value}"`;
          }
          return value;
        })
        .join(","),
    ),
  ].join("\n");

  downloadFile(csvContent, filename, "text/csv");
};

export const exportToJSON = (data: any, filename: string) => {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, filename, "application/json");
};

export const exportInteractionsCSV = (appData: AppData) => {
  const interactions = appData.interactions.map((interaction) => ({
    productId: interaction.productId,
    action: interaction.action,
    timestamp: interaction.timestamp.toISOString(),
    date: interaction.timestamp.toLocaleDateString(),
    time: interaction.timestamp.toLocaleTimeString(),
  }));

  exportToCSV(
    interactions,
    `interactions_${new Date().toISOString().split("T")[0]}.csv`,
  );
};

export const exportProductStatsCSV = (appData: AppData) => {
  const productsWithStats = appData.products.map((product) => {
    const stats = appData.stats.find((s) => s.productId === product.id);
    const totalInteractions = stats
      ? stats.likes + stats.dislikes + stats["Love It"]
      : 0;

    return {
      productId: product.id,
      title: product.title,
      price: product.price,
      collection: product.collection,
      vendor: product.vendor,
      available: product.available,
      likes: stats?.likes || 0,
      dislikes: stats?.dislikes || 0,
      loveIt: stats?.["Love It"] || 0,
      totalInteractions,
      engagementRate:
        totalInteractions > 0
          ? Math.round(
              (((stats?.likes || 0) + (stats?.["Love It"] || 0)) /
                totalInteractions) *
                100,
            )
          : 0,
    };
  });

  exportToCSV(
    productsWithStats,
    `product_stats_${new Date().toISOString().split("T")[0]}.csv`,
  );
};

export const exportSessionsCSV = (appData: AppData) => {
  const sessions = appData.sessions.map((session) => ({
    sessionId: session.id,
    startTime: session.startTime.toISOString(),
    endTime: session.endTime?.toISOString() || "Active",
    duration: session.duration
      ? Math.round(session.duration / 1000 / 60)
      : "N/A", // minutes
    interactions: session.interactions,
    pagesViewed: session.pagesViewed.join(";"),
    userAgent: session.userAgent,
  }));

  exportToCSV(
    sessions,
    `sessions_${new Date().toISOString().split("T")[0]}.csv`,
  );
};

export const exportCartAnalysisCSV = (appData: AppData) => {
  const cartAnalysis = appData.cart.map((item) => ({
    productId: item.product.id,
    productTitle: item.product.title,
    price: item.product.price,
    quantity: item.quantity,
    totalValue: item.product.price * item.quantity,
    addedAt: item.addedAt.toISOString(),
    collection: item.product.collection,
    vendor: item.product.vendor,
  }));

  exportToCSV(
    cartAnalysis,
    `cart_analysis_${new Date().toISOString().split("T")[0]}.csv`,
  );
};

export const exportFavoritesAnalysisCSV = (appData: AppData) => {
  const favoritesAnalysis = appData.favorites.map((item) => ({
    productId: item.product.id,
    productTitle: item.product.title,
    price: item.product.price,
    addedAt: item.addedAt.toISOString(),
    collection: item.product.collection,
    vendor: item.product.vendor,
  }));

  exportToCSV(
    favoritesAnalysis,
    `favorites_analysis_${new Date().toISOString().split("T")[0]}.csv`,
  );
};

export const exportCompleteDataset = (appData: AppData) => {
  const timestamp = new Date().toISOString().split("T")[0];

  // Export everything as a comprehensive JSON file
  exportToJSON(
    {
      ...appData,
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        version: "1.0",
        totalProducts: appData.products.length,
        totalInteractions: appData.interactions.length,
        totalSessions: appData.sessions.length,
        dateRange: {
          from:
            appData.interactions.length > 0
              ? Math.min(
                  ...appData.interactions.map((i) => i.timestamp.getTime()),
                )
              : null,
          to:
            appData.interactions.length > 0
              ? Math.max(
                  ...appData.interactions.map((i) => i.timestamp.getTime()),
                )
              : null,
        },
      },
    },
    `swipeshop_complete_dataset_${timestamp}.json`,
  );
};

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const generateAnalyticsReport = (appData: AppData) => {
  const totalInteractions = appData.interactions.length;
  const totalProducts = appData.products.length;
  const totalSessions = appData.sessions.length;

  const actionBreakdown = appData.interactions.reduce(
    (acc, interaction) => {
      acc[interaction.action] = (acc[interaction.action] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const collectionBreakdown = appData.products.reduce(
    (acc, product) => {
      acc[product.collection] = (acc[product.collection] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const topProducts = appData.stats
    .map((stat) => {
      const product = appData.products.find((p) => p.id === stat.productId);
      const total = stat.likes + stat.dislikes + stat["Love It"];
      return {
        product,
        ...stat,
        total,
        engagementRate:
          total > 0 ? ((stat.likes + stat["Love It"]) / total) * 100 : 0,
      };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const averageSessionDuration =
    appData.sessions
      .filter((s) => s.duration)
      .reduce((acc, s) => acc + s.duration! / 1000 / 60, 0) /
      appData.sessions.filter((s) => s.duration).length || 0;

  return {
    summary: {
      totalInteractions,
      totalProducts,
      totalSessions,
      averageSessionDuration: Math.round(averageSessionDuration * 100) / 100,
      lastUpdated: appData.lastUpdated,
    },
    actionBreakdown,
    collectionBreakdown,
    topProducts,
    dateRange: {
      from:
        totalInteractions > 0
          ? new Date(
              Math.min(
                ...appData.interactions.map((i) => i.timestamp.getTime()),
              ),
            )
          : null,
      to:
        totalInteractions > 0
          ? new Date(
              Math.max(
                ...appData.interactions.map((i) => i.timestamp.getTime()),
              ),
            )
          : null,
    },
  };
};
