import { useState } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Eye,
  DollarSign,
  Tag,
  Star,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Product } from "@/lib/types";
import { AppData } from "@/hooks/useDataPersistence";

interface AdminProductsProps {
  data: AppData;
  onUpdateProduct: (productId: string, updates: Partial<Product>) => void;
  onDeleteProduct: (productId: string) => void;
  onAddProduct: (product: Product) => void;
}

export const AdminProducts = ({
  data,
  onUpdateProduct,
  onDeleteProduct,
  onAddProduct,
}: AdminProductsProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCollection, setFilterCollection] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const collections = [...new Set(data.products.map((p) => p.collection))];

  const filteredProducts = data.products.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.vendor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCollection =
      filterCollection === "all" || product.collection === filterCollection;
    return matchesSearch && matchesCollection;
  });

  const getProductStats = (productId: string) => {
    return (
      data.stats.find((s) => s.productId === productId) || {
        productId,
        likes: 0,
        dislikes: 0,
        "Love It": 0,
      }
    );
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleSaveProduct = () => {
    if (selectedProduct) {
      onUpdateProduct(selectedProduct.id, selectedProduct);
      setIsEditDialogOpen(false);
      setSelectedProduct(null);
    }
  };

  const getTotalInteractions = (productId: string) => {
    const stats = getProductStats(productId);
    return stats.likes + stats.dislikes + stats["Love It"];
  };

  const getEngagementRate = (productId: string) => {
    const stats = getProductStats(productId);
    const total = getTotalInteractions(productId);
    return total > 0
      ? Math.round(((stats.likes + stats["Love It"]) / total) * 100)
      : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6" />
            Product Management
          </h2>
          <p className="text-gray-600">
            Manage your product catalog and performance
          </p>
        </div>

        <Button
          onClick={() => {
            setSelectedProduct({
              id: `product_${Date.now()}`,
              title: "",
              description: "",
              price: 0,
              images: [],
              collection: "",
              tags: [],
              vendor: "",
              available: true,
              variants: [],
            });
            setIsEditDialogOpen(true);
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filterCollection}
              onValueChange={setFilterCollection}
            >
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by collection" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Collections</SelectItem>
                {collections.map((collection) => (
                  <SelectItem key={collection} value={collection}>
                    {collection}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product, index) => {
          const stats = getProductStats(product.id);
          const totalInteractions = getTotalInteractions(product.id);
          const engagementRate = getEngagementRate(product.id);

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">
                        {product.title}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        {product.vendor} • {product.collection}
                      </p>
                    </div>
                    <Badge
                      className={
                        product.available
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }
                    >
                      {product.available ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Product Image */}
                  {product.images.length > 0 && (
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Price and Stats */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-lg font-bold">
                        <DollarSign className="w-4 h-4" />
                        {product.price}
                      </div>
                      {product.compareAtPrice && (
                        <div className="text-sm text-gray-500 line-through">
                          ${product.compareAtPrice}
                        </div>
                      )}
                    </div>

                    {/* Performance Stats */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Interactions</span>
                        <Badge variant="outline">{totalInteractions}</Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className="font-medium text-green-600">
                            {stats.likes}
                          </div>
                          <div className="text-gray-500">Likes</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-purple-600">
                            {stats["Love It"]}
                          </div>
                          <div className="text-gray-500">Love It</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-red-600">
                            {stats.dislikes}
                          </div>
                          <div className="text-gray-500">Dislikes</div>
                        </div>
                      </div>

                      {totalInteractions > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="w-4 h-4 text-blue-500" />
                          <span className="text-gray-600">Engagement:</span>
                          <Badge className="bg-blue-100 text-blue-700">
                            {engagementRate}%
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {product.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {product.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {product.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{product.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProduct(product)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterCollection !== "all"
                ? "Try adjusting your search or filters"
                : "Add your first product to get started"}
            </p>
            <Button
              onClick={() => {
                setSelectedProduct({
                  id: `product_${Date.now()}`,
                  title: "",
                  description: "",
                  price: 0,
                  images: [],
                  collection: "",
                  tags: [],
                  vendor: "",
                  available: true,
                  variants: [],
                });
                setIsEditDialogOpen(true);
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Product
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct?.title ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={selectedProduct.title}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        title: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Price</label>
                  <Input
                    type="number"
                    value={selectedProduct.price}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={selectedProduct.description}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Collection</label>
                  <Input
                    value={selectedProduct.collection}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        collection: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Vendor</label>
                  <Input
                    value={selectedProduct.vendor}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        vendor: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Image URL</label>
                <Input
                  value={selectedProduct.images[0] || ""}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      images: [e.target.value],
                    })
                  }
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex gap-4 justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProduct}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Save Product
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
