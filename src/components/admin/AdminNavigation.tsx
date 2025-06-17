import { motion } from "framer-motion";
import {
  BarChart3,
  Database,
  Settings,
  Download,
  Shield,
  Package,
  Users,
  Activity,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AdminNavigationProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
  dataCount: {
    products: number;
    interactions: number;
    sessions: number;
  };
}

export const AdminNavigation = ({
  currentSection,
  onSectionChange,
  isLoading = false,
  onRefresh,
  dataCount,
}: AdminNavigationProps) => {
  const navItems = [
    {
      id: "overview",
      label: "Overview",
      icon: BarChart3,
      description: "Dashboard summary",
    },
    {
      id: "products",
      label: "Products",
      icon: Package,
      description: "Product management",
      count: dataCount.products,
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: Activity,
      description: "User behavior",
      count: dataCount.interactions,
    },
    {
      id: "sessions",
      label: "Sessions",
      icon: Users,
      description: "User sessions",
      count: dataCount.sessions,
    },
    {
      id: "data",
      label: "Data Management",
      icon: Database,
      description: "Import/Export",
    },
    {
      id: "config",
      label: "Configuration",
      icon: Settings,
      description: "App settings",
    },
  ];

  const handleBack = () => {
    window.location.href = "/";
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-gradient-to-r from-slate-600 to-purple-600 p-2.5 rounded-xl">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-purple-600 bg-clip-text text-transparent">
                SwipeShop Admin
              </h1>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Database className="w-4 h-4" />
                Complete Data Management System
              </p>
            </div>
          </motion.div>

          <div className="flex items-center gap-3">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
                className="border-purple-200 hover:bg-purple-50 text-purple-600"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                {isLoading ? "Refreshing..." : "Refresh"}
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

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                    : "bg-white/60 hover:bg-white/80 text-slate-700 border border-slate-200"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-600"}`}
                />
                <div className="text-left">
                  <div className="font-medium text-sm">{item.label}</div>
                  <div
                    className={`text-xs ${isActive ? "text-purple-100" : "text-slate-500"}`}
                  >
                    {item.description}
                  </div>
                </div>
                {item.count !== undefined && (
                  <Badge
                    className={`ml-2 ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {item.count}
                  </Badge>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
