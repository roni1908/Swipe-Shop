import { motion } from "framer-motion";
import {
  TrendingUp,
  Package,
  Users,
  Activity,
  ShoppingCart,
  Heart,
  Clock,
  Calendar,
  ArrowUp,
  ArrowDown,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AppData } from "@/hooks/useDataPersistence";
import { generateAnalyticsReport } from "@/lib/dataExport";

interface AdminOverviewProps {
  data: AppData;
}

export const AdminOverview = ({ data }: AdminOverviewProps) => {
  const report = generateAnalyticsReport(data);

  const stats = [
    {
      title: "Total Products",
      value: data.products.length,
      icon: Package,
      color: "blue",
      change: "+12%",
      changeType: "increase",
    },
    {
      title: "Total Interactions",
      value: data.interactions.length,
      icon: Activity,
      color: "purple",
      change: "+24%",
      changeType: "increase",
    },
    {
      title: "Active Sessions",
      value: data.sessions.length,
      icon: Users,
      color: "green",
      change: "+8%",
      changeType: "increase",
    },
    {
      title: "Cart Items",
      value: data.cart.reduce((acc, item) => acc + item.quantity, 0),
      icon: ShoppingCart,
      color: "orange",
      change: "-5%",
      changeType: "decrease",
    },
    {
      title: "Favorites",
      value: data.favorites.length,
      icon: Heart,
      color: "pink",
      change: "+18%",
      changeType: "increase",
    },
    {
      title: "Avg Session Duration",
      value: `${report.summary.averageSessionDuration}m`,
      icon: Clock,
      color: "indigo",
      change: "+3m",
      changeType: "increase",
    },
  ];

  const getColorClasses = (
    color: string,
    variant: "bg" | "text" | "border",
  ) => {
    const colors: Record<string, Record<string, string>> = {
      blue: {
        bg: "bg-blue-500",
        text: "text-blue-600",
        border: "border-blue-200",
      },
      purple: {
        bg: "bg-purple-500",
        text: "text-purple-600",
        border: "border-purple-200",
      },
      green: {
        bg: "bg-green-500",
        text: "text-green-600",
        border: "border-green-200",
      },
      orange: {
        bg: "bg-orange-500",
        text: "text-orange-600",
        border: "border-orange-200",
      },
      pink: {
        bg: "bg-pink-500",
        text: "text-pink-600",
        border: "border-pink-200",
      },
      indigo: {
        bg: "bg-indigo-500",
        text: "text-indigo-600",
        border: "border-indigo-200",
      },
    };
    return colors[color]?.[variant] || "";
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const ChangeIcon =
            stat.changeType === "increase" ? ArrowUp : ArrowDown;

          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`border-l-4 ${getColorClasses(stat.color, "border")}`}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <Icon
                    className={`w-5 h-5 ${getColorClasses(stat.color, "text")}`}
                  />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <Badge
                      className={`flex items-center gap-1 ${
                        stat.changeType === "increase"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      <ChangeIcon className="w-3 h-3" />
                      {stat.change}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Action Breakdown Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                User Actions Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(report.actionBreakdown).map(
                  ([action, count]) => {
                    const total = Object.values(report.actionBreakdown).reduce(
                      (a, b) => a + b,
                      0,
                    );
                    const percentage = total > 0 ? (count / total) * 100 : 0;

                    const actionConfig = {
                      like: { color: "green", icon: Heart, label: "Likes" },
                      dislike: { color: "red", icon: Eye, label: "Dislikes" },
                      "Love It": {
                        color: "purple",
                        icon: ShoppingCart,
                        label: "Love It",
                      },
                    }[action] || {
                      color: "gray",
                      icon: Activity,
                      label: action,
                    };

                    const ActionIcon = actionConfig.icon;

                    return (
                      <div key={action} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ActionIcon
                              className={`w-4 h-4 ${getColorClasses(actionConfig.color, "text")}`}
                            />
                            <span className="text-sm font-medium">
                              {actionConfig.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                              {count}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {percentage.toFixed(1)}%
                            </Badge>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  },
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Collection Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Product Collections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(report.collectionBreakdown).map(
                  ([collection, count]) => {
                    const total = Object.values(
                      report.collectionBreakdown,
                    ).reduce((a, b) => a + b, 0);
                    const percentage = total > 0 ? (count / total) * 100 : 0;

                    return (
                      <div key={collection} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {collection}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                              {count} products
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {percentage.toFixed(1)}%
                            </Badge>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  },
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Performing Products */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Top Performing Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {report.topProducts.slice(0, 5).map((item, index) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    <Badge className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-100 text-purple-700">
                      #{index + 1}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {item.product?.title || "Unknown Product"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.total} interactions •{" "}
                      {item.engagementRate.toFixed(1)}% engagement
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-600">👍 {item.likes}</span>
                    <span className="text-purple-600">
                      💜 {item["Love It"]}
                    </span>
                    <span className="text-red-600">👎 {item.dislikes}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {data.products.length}
                </div>
                <div className="text-sm text-gray-500">Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {data.interactions.length}
                </div>
                <div className="text-sm text-gray-500">Interactions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {data.sessions.length}
                </div>
                <div className="text-sm text-gray-500">Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {data.lastUpdated.toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-500">Last Updated</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
