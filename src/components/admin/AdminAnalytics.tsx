import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Users,
  Activity,
  Calendar,
  Filter,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { AppData } from "@/hooks/useDataPersistence";
import { generateAnalyticsReport } from "@/lib/dataExport";

interface AdminAnalyticsProps {
  data: AppData;
}

export const AdminAnalytics = ({ data }: AdminAnalyticsProps) => {
  const [timeRange, setTimeRange] = useState("all");
  const [selectedMetric, setSelectedMetric] = useState("interactions");

  const report = generateAnalyticsReport(data);

  // Filter data based on time range
  const getFilteredInteractions = () => {
    if (timeRange === "all") return data.interactions;

    const now = new Date();
    const daysAgo = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const cutoff = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    return data.interactions.filter(
      (interaction) => interaction.timestamp >= cutoff,
    );
  };

  const filteredInteractions = getFilteredInteractions();

  // Time-based analytics
  const getHourlyDistribution = () => {
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: 0,
    }));

    filteredInteractions.forEach((interaction) => {
      const hour = interaction.timestamp.getHours();
      hourlyData[hour].count++;
    });

    return hourlyData;
  };

  const getDailyDistribution = () => {
    const dailyData = Array.from({ length: 7 }, (_, i) => ({
      day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i],
      count: 0,
    }));

    filteredInteractions.forEach((interaction) => {
      const dayOfWeek = interaction.timestamp.getDay();
      dailyData[dayOfWeek].count++;
    });

    return dailyData;
  };

  const hourlyData = getHourlyDistribution();
  const dailyData = getDailyDistribution();
  const maxHourlyCount = Math.max(...hourlyData.map((d) => d.count));
  const maxDailyCount = Math.max(...dailyData.map((d) => d.count));

  // User behavior patterns
  const getActionSequences = () => {
    const sequences: Record<string, number> = {};

    for (let i = 0; i < filteredInteractions.length - 1; i++) {
      const current = filteredInteractions[i].action;
      const next = filteredInteractions[i + 1].action;
      const sequence = `${current} → ${next}`;
      sequences[sequence] = (sequences[sequence] || 0) + 1;
    }

    return Object.entries(sequences)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
  };

  const actionSequences = getActionSequences();

  // Engagement metrics
  const getEngagementMetrics = () => {
    const productEngagement = data.stats
      .map((stat) => {
        const product = data.products.find((p) => p.id === stat.productId);
        const total = stat.likes + stat.dislikes + stat["Love It"];
        const positiveActions = stat.likes + stat["Love It"];

        return {
          productId: stat.productId,
          productTitle: product?.title || "Unknown Product",
          totalInteractions: total,
          engagementRate: total > 0 ? (positiveActions / total) * 100 : 0,
          conversionRate: total > 0 ? (stat["Love It"] / total) * 100 : 0,
        };
      })
      .sort((a, b) => b.totalInteractions - a.totalInteractions);

    return productEngagement.slice(0, 10);
  };

  const topEngagement = getEngagementMetrics();

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Advanced Analytics
          </h2>
          <p className="text-gray-600">
            Deep insights into user behavior and product performance
          </p>
        </div>

        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Interactions
                </p>
                <p className="text-2xl font-bold">
                  {filteredInteractions.length}
                </p>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Avg. Engagement
                </p>
                <p className="text-2xl font-bold">
                  {topEngagement.length > 0
                    ? Math.round(
                        topEngagement.reduce(
                          (acc, item) => acc + item.engagementRate,
                          0,
                        ) / topEngagement.length,
                      )
                    : 0}
                  %
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Products
                </p>
                <p className="text-2xl font-bold">
                  {
                    data.stats.filter(
                      (s) => s.likes + s.dislikes + s["Love It"] > 0,
                    ).length
                  }
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Conversion Rate
                </p>
                <p className="text-2xl font-bold">
                  {filteredInteractions.length > 0
                    ? Math.round(
                        (filteredInteractions.filter(
                          (i) => i.action === "Love It",
                        ).length /
                          filteredInteractions.length) *
                          100,
                      )
                    : 0}
                  %
                </p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time-based Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Activity by Hour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {hourlyData.map(({ hour, count }) => (
                <div key={hour} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {hour.toString().padStart(2, "0")}:00
                    </span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                  <Progress
                    value={
                      maxHourlyCount > 0 ? (count / maxHourlyCount) * 100 : 0
                    }
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Activity by Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dailyData.map(({ day, count }) => (
                <div key={day} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{day}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                  <Progress
                    value={
                      maxDailyCount > 0 ? (count / maxDailyCount) * 100 : 0
                    }
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Behavioral Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action Sequences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              User Action Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {actionSequences.map(([sequence, count], index) => (
                <motion.div
                  key={sequence}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="font-medium text-sm">{sequence}</div>
                  <Badge className="bg-purple-100 text-purple-700">
                    {count}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Top Performing Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topEngagement.map((item, index) => (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-sm truncate flex-1">
                      {item.productTitle}
                    </div>
                    <Badge className="ml-2 bg-blue-100 text-blue-700">
                      #{index + 1}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-gray-500">Interactions</div>
                      <div className="font-medium">
                        {item.totalInteractions}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Engagement</div>
                      <div className="font-medium">
                        {item.engagementRate.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="mt-2">
                    <Progress value={item.engagementRate} className="h-1" />
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Breakdown Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Detailed Action Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(report.actionBreakdown).map(([action, count]) => {
              const total = Object.values(report.actionBreakdown).reduce(
                (a, b) => a + b,
                0,
              );
              const percentage = total > 0 ? (count / total) * 100 : 0;

              const actionConfig = {
                like: { color: "green", emoji: "👍", label: "Likes" },
                dislike: { color: "red", emoji: "👎", label: "Dislikes" },
                "Love It": { color: "purple", emoji: "💜", label: "Love It" },
              }[action] || { color: "gray", emoji: "❓", label: action };

              return (
                <div key={action} className="text-center space-y-3">
                  <div className="text-4xl">{actionConfig.emoji}</div>
                  <div>
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm text-gray-500">
                      {actionConfig.label}
                    </div>
                    <Badge className="mt-1 bg-gray-100 text-gray-700">
                      {percentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
