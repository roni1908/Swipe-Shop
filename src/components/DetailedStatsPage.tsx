import { motion } from "framer-motion";
import { Heart, X, Star, TrendingUp, Package, ArrowLeft } from "lucide-react";
import { ProductStats } from "@/lib/types";
import { mockProducts } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DetailedStatsPageProps {
  stats: ProductStats[];
  totalStats: {
    likes: number;
    dislikes: number;
    "Love It": number;
  };
  onBack: () => void;
}

export const DetailedStatsPage = ({
  stats,
  totalStats,
  onBack,
}: DetailedStatsPageProps) => {
  const totalInteractions =
    totalStats.likes + totalStats.dislikes + totalStats["Love It"];

  const getProductWithStats = () => {
    return stats
      .map((stat) => {
        const product = mockProducts.find((p) => p.id === stat.productId);
        return product ? { ...stat, product } : null;
      })
      .filter((item) => item !== null)
      .sort((a, b) => {
        // Sort by total interactions (most interacted with first)
        const aTotal = a!.likes + a!.dislikes + a!["Love It"];
        const bTotal = b!.likes + b!.dislikes + b!["Love It"];
        return bTotal - aTotal;
      });
  };

  const productsWithStats = getProductWithStats();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const getEngagementRate = (productStats: ProductStats) => {
    const total =
      productStats.likes + productStats.dislikes + productStats["Love It"];
    if (total === 0) return 0;
    return Math.round(
      ((productStats.likes + productStats["Love It"]) / total) * 100,
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      className="p-6 pb-24 max-w-md mx-auto min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-4 mb-6"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="rounded-full p-2 hover:bg-pink-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Product Statistics
          </h1>
          <p className="text-gray-600">Individual product performance</p>
        </div>
      </motion.div>

      {/* Overview Summary */}
      <motion.div variants={itemVariants} className="mb-6">
        <Card className="bg-gradient-to-r from-pink-100 to-purple-100 border-pink-200">
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {productsWithStats.length}
                </div>
                <div className="text-xs text-gray-600">Products</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-700">
                  {totalStats.likes}
                </div>
                <div className="text-xs text-gray-600">Likes</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-700">
                  {totalStats["Love It"]}
                </div>
                <div className="text-xs text-gray-600">Love It</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-700">
                  {totalStats.dislikes}
                </div>
                <div className="text-xs text-gray-600">Nope</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Individual Product Statistics */}
      <motion.div variants={itemVariants} className="space-y-4">
        {productsWithStats.length > 0 ? (
          productsWithStats.map((item, index) => {
            const totalInteractions =
              item!.likes + item!.dislikes + item!["Love It"];
            const engagementRate = getEngagementRate(item!);

            return (
              <motion.div
                key={item!.productId}
                variants={itemVariants}
                className="mb-4"
              >
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex">
                      {/* Product Image */}
                      <div className="w-20 h-20 flex-shrink-0">
                        <img
                          src={item!.product!.images[0]}
                          alt={item!.product!.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Info & Stats */}
                      <div className="flex-1 p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1 min-w-0 mr-3">
                            <h4 className="font-semibold text-gray-900 text-sm truncate">
                              {item!.product!.title}
                            </h4>
                            <p className="text-xs text-gray-500 mb-1">
                              {formatPrice(item!.product!.price)}
                            </p>
                          </div>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${
                              engagementRate >= 70
                                ? "bg-green-100 text-green-700"
                                : engagementRate >= 40
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {engagementRate}% engagement
                          </Badge>
                        </div>

                        {/* Stats Row */}
                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Heart className="w-3 h-3 text-green-500" />
                              <span className="text-green-700 font-medium">
                                {item!.likes}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-purple-500" />
                              <span className="text-purple-700 font-medium">
                                {item!["Love It"]}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <X className="w-3 h-3 text-red-500" />
                              <span className="text-red-700 font-medium">
                                {item!.dislikes}
                              </span>
                            </div>
                          </div>
                          <span className="text-gray-500">
                            {totalInteractions} total
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        ) : (
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-r from-pink-100 to-purple-100 border-pink-200">
              <CardContent className="p-8 text-center">
                <Package className="w-12 h-12 text-pink-500 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">
                  No Product Data Yet
                </h3>
                <p className="text-gray-600 text-sm">
                  Start swiping through products to see individual statistics.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* Performance Insights */}
      {productsWithStats.length > 0 && (
        <motion.div variants={itemVariants} className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Performance Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              {(() => {
                const topPerformer = productsWithStats.reduce(
                  (best, current) => {
                    const currentRate = getEngagementRate(current!);
                    const bestRate = getEngagementRate(best!);
                    return currentRate > bestRate ? current : best;
                  },
                  productsWithStats[0],
                );

                const mostLiked = productsWithStats.reduce((best, current) => {
                  return current!.likes > best!.likes ? current : best;
                }, productsWithStats[0]);

                return (
                  <>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="font-medium text-green-800">
                        Top Performer: {topPerformer!.product!.title}
                      </p>
                      <p className="text-green-600">
                        {getEngagementRate(topPerformer!)}% engagement rate
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="font-medium text-purple-800">
                        Most Liked: {mostLiked!.product!.title}
                      </p>
                      <p className="text-purple-600">
                        {mostLiked!.likes} likes total
                      </p>
                    </div>
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};
