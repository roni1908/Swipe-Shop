import { motion } from "framer-motion";
import { Heart, X, Star, TrendingUp, Package, Target } from "lucide-react";
import { ProductStats } from "@/lib/types";
import { mockProducts } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface StatsPageProps {
  stats: ProductStats[];
  totalStats: {
    likes: number;
    dislikes: number;
    "Love It": number;
  };
}

export const StatsPage = ({ stats, totalStats }: StatsPageProps) => {
  const totalInteractions =
    totalStats.likes + totalStats.dislikes + totalStats["Love It"];

  const getTopProducts = (type: "likes" | "dislikes" | "Love It") => {
    return stats
      .filter((stat) => stat[type] > 0)
      .sort((a, b) => b[type] - a[type])
      .slice(0, 3)
      .map((stat) => {
        const product = mockProducts.find((p) => p.id === stat.productId);
        return { ...stat, product };
      })
      .filter((item) => item.product);
  };

  const mostLikedProducts = getTopProducts("likes");
  const mostLoveItProducts = getTopProducts("Love It");

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
      <motion.div variants={itemVariants} className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Statistics</h1>
        <p className="text-gray-600">Your product discovery insights</p>
      </motion.div>

      {/* Overview Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-3 gap-3 mb-6"
      >
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4 text-center">
            <Heart className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-700">
              {totalStats.likes}
            </div>
            <div className="text-xs text-green-600">Likes</div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50">
          <CardContent className="p-4 text-center">
            <Star className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-700">
              {totalStats["Love It"]}
            </div>
            <div className="text-xs text-purple-600">Love It</div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-rose-50">
          <CardContent className="p-4 text-center">
            <X className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-700">
              {totalStats.dislikes}
            </div>
            <div className="text-xs text-red-600">Nope</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Engagement Overview */}
      <motion.div variants={itemVariants} className="mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Engagement Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {totalInteractions > 0 ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-green-600">Likes</span>
                    <span>
                      {Math.round((totalStats.likes / totalInteractions) * 100)}
                      %
                    </span>
                  </div>
                  <Progress
                    value={(totalStats.likes / totalInteractions) * 100}
                    className="h-2 bg-gray-100"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-purple-600">Love It</span>
                    <span>
                      {Math.round(
                        (totalStats["Love It"] / totalInteractions) * 100,
                      )}
                      %
                    </span>
                  </div>
                  <Progress
                    value={(totalStats["Love It"] / totalInteractions) * 100}
                    className="h-2 bg-gray-100"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-red-600">Nope</span>
                    <span>
                      {Math.round(
                        (totalStats.dislikes / totalInteractions) * 100,
                      )}
                      %
                    </span>
                  </div>
                  <Progress
                    value={(totalStats.dislikes / totalInteractions) * 100}
                    className="h-2 bg-gray-100"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No interactions yet</p>
                <p className="text-sm">Start swiping to see statistics</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Liked Products */}
      {mostLikedProducts.length > 0 && (
        <motion.div variants={itemVariants} className="mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Heart className="w-5 h-5 text-green-500" />
                Most Liked Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mostLikedProducts.map((item, index) => (
                  <div key={item.productId} className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <img
                        src={item.product!.images[0]}
                        alt={item.product!.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {item.product!.title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {item.product!.collection}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700"
                    >
                      {item.likes} ♥
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Top Love It Products */}
      {mostLoveItProducts.length > 0 && (
        <motion.div variants={itemVariants} className="mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Star className="w-5 h-5 text-purple-500" />
                Most Love It Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mostLoveItProducts.map((item, index) => (
                  <div key={item.productId} className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <img
                        src={item.product!.images[0]}
                        alt={item.product!.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {item.product!.title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {item.product!.collection}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-purple-100 text-purple-700"
                    >
                      {item["Love It"]} ⭐
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Call to Action */}
      {totalInteractions === 0 && (
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-r from-pink-100 to-purple-100 border-pink-200">
            <CardContent className="p-6 text-center">
              <Target className="w-12 h-12 text-pink-500 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">
                Start Discovering!
              </h3>
              <p className="text-gray-600 text-sm">
                Swipe through products to build your statistics and discover
                what you love.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};
