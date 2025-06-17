import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Eye, BarChart3 } from "lucide-react";
import { StatsPage } from "@/components/StatsPage";
import { DetailedStatsPage } from "@/components/DetailedStatsPage";
import { useProductStats } from "@/hooks/useProductStats";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminDashboard = () => {
  const [currentView, setCurrentView] = useState<"overview" | "detailed">(
    "overview",
  );
  const { stats, getTotalStats } = useProductStats();

  const handleBack = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      {/* Private Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-gradient-to-r from-slate-600 to-purple-600 p-2 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-purple-600 bg-clip-text text-transparent">
                  SwipeShop Admin
                </h1>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  Private Dashboard
                </p>
              </div>
            </motion.div>

            <div className="flex items-center gap-3">
              {currentView === "overview" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentView("detailed")}
                  className="border-purple-200 hover:bg-purple-50 text-purple-600"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Detailed View
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="hover:bg-slate-100 text-slate-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to App
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-amber-800 text-sm flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Private Access Only
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-amber-700 text-sm">
                This dashboard contains sensitive analytics data and is only
                accessible to authorized users. No links to this dashboard exist
                in the public application.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Dashboard Views */}
        {currentView === "overview" ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <StatsPage stats={stats} totalStats={getTotalStats()} />
          </motion.div>
        ) : (
          <motion.div
            key="detailed"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <DetailedStatsPage
              stats={stats}
              totalStats={getTotalStats()}
              onBack={() => setCurrentView("overview")}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
