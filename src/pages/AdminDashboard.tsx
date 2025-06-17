import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { useDataPersistence } from "@/hooks/useDataPersistence";
import { AdminNavigation } from "@/components/admin/AdminNavigation";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { AdminProducts } from "@/components/admin/AdminProducts";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { AdminDataManagement } from "@/components/admin/AdminDataManagement";
import { AdminConfig } from "@/components/admin/AdminConfig";
import { mockProducts } from "@/lib/mockData";

// Import mock data on first load if no data exists
const initializeWithMockData = (data: any) => {
  if (data.products.length === 0) {
    return {
      ...data,
      products: mockProducts,
      lastUpdated: new Date(),
    };
  }
  return data;
};

const AdminDashboard = () => {
  const [currentSection, setCurrentSection] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);

  const {
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
  } = useDataPersistence();

  // Initialize with mock data if empty
  useEffect(() => {
    if (data.products.length === 0) {
      const initializedData = initializeWithMockData(data);
      updateData(initializedData);
    }
  }, [data.products.length, updateData]);

  // Track current session
  useEffect(() => {
    updateSession({
      pagesViewed: [
        ...new Set([...currentSession.pagesViewed, "/admin/dashboard"]),
      ],
    });
  }, [currentSession.pagesViewed, updateSession]);

  // Auto-save session on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      endSession();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [endSession]);

  const handleRefresh = async () => {
    setIsLoading(true);

    // Simulate data refresh
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Update session
    updateSession({
      interactions: currentSession.interactions + 1,
    });

    setIsLoading(false);
  };

  const handleSectionChange = (section: string) => {
    setCurrentSection(section);

    // Track navigation
    updateSession({
      pagesViewed: [
        ...new Set([...currentSession.pagesViewed, `/admin/${section}`]),
      ],
      interactions: currentSession.interactions + 1,
    });
  };

  const handleProductUpdate = (productId: string, updates: any) => {
    updateProduct(productId, updates);

    // Track admin action
    addInteraction({
      productId,
      action: "like", // Using as a placeholder for admin actions
      timestamp: new Date(),
    });
  };

  const handleProductDelete = (productId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this product? This action cannot be undone.",
      )
    ) {
      deleteProduct(productId);
    }
  };

  const handleProductAdd = (product: any) => {
    addProduct(product);
  };

  const handleDataImport = (importedData: any): boolean => {
    return importData(importedData);
  };

  const handleDataClear = () => {
    clearAllData();
  };

  const dataCount = {
    products: data.products.length,
    interactions: data.interactions.length,
    sessions: data.sessions.length,
  };

  const renderCurrentSection = () => {
    const sectionProps = {
      key: currentSection,
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
      transition: { duration: 0.3 },
    };

    switch (currentSection) {
      case "overview":
        return (
          <motion.div {...sectionProps}>
            <AdminOverview data={data} />
          </motion.div>
        );

      case "products":
        return (
          <motion.div {...sectionProps}>
            <AdminProducts
              data={data}
              onUpdateProduct={handleProductUpdate}
              onDeleteProduct={handleProductDelete}
              onAddProduct={handleProductAdd}
            />
          </motion.div>
        );

      case "analytics":
        return (
          <motion.div {...sectionProps}>
            <AdminAnalytics data={data} />
          </motion.div>
        );

      case "sessions":
        return (
          <motion.div {...sectionProps}>
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">
                User Sessions
              </h2>

              {/* Current Session */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">
                  Current Session
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-blue-600">Session ID</div>
                    <div className="font-mono text-xs">{currentSession.id}</div>
                  </div>
                  <div>
                    <div className="text-sm text-blue-600">Start Time</div>
                    <div className="text-sm">
                      {currentSession.startTime.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-blue-600">Interactions</div>
                    <div className="text-lg font-bold">
                      {currentSession.interactions}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-blue-600">Pages Viewed</div>
                    <div className="text-lg font-bold">
                      {currentSession.pagesViewed.length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Session History */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Session History</h3>
                {data.sessions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No completed sessions yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.sessions
                      .slice(-10)
                      .reverse()
                      .map((session) => (
                        <div
                          key={session.id}
                          className="bg-white border rounded-lg p-4"
                        >
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                            <div>
                              <div className="text-gray-500">Start</div>
                              <div>
                                {session.startTime.toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-400">
                                {session.startTime.toLocaleTimeString()}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-500">Duration</div>
                              <div>
                                {session.duration
                                  ? `${Math.round(session.duration / 1000 / 60)}m`
                                  : "Active"}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-500">Interactions</div>
                              <div className="font-semibold">
                                {session.interactions}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-500">Pages</div>
                              <div className="font-semibold">
                                {session.pagesViewed.length}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-500">Status</div>
                              <div
                                className={`inline-flex px-2 py-1 rounded-full text-xs ${
                                  session.endTime
                                    ? "bg-gray-100 text-gray-700"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                {session.endTime ? "Completed" : "Active"}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );

      case "data":
        return (
          <motion.div {...sectionProps}>
            <AdminDataManagement
              data={data}
              onImportData={handleDataImport}
              onClearData={handleDataClear}
            />
          </motion.div>
        );

      case "config":
        return (
          <motion.div {...sectionProps}>
            <AdminConfig config={data.config} onUpdateConfig={updateConfig} />
          </motion.div>
        );

      default:
        return (
          <motion.div {...sectionProps}>
            <AdminOverview data={data} />
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <AdminNavigation
        currentSection={currentSection}
        onSectionChange={handleSectionChange}
        isLoading={isLoading}
        onRefresh={handleRefresh}
        dataCount={dataCount}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">{renderCurrentSection()}</AnimatePresence>
      </div>

      {/* Global Notifications */}
      <Toaster />

      {/* Loading Overlay */}
      {isLoading && (
        <motion.div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              <span className="text-gray-700">Loading...</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Development Info */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-2 rounded">
          <div>Session: {currentSession.id.slice(-8)}</div>
          <div>Products: {data.products.length}</div>
          <div>Interactions: {data.interactions.length}</div>
          <div>Updated: {data.lastUpdated.toLocaleTimeString()}</div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
