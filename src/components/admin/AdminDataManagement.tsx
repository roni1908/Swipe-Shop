import { useState } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Upload,
  Database,
  FileText,
  Trash2,
  AlertTriangle,
  CheckCircle,
  FileJson,
  FileSpreadsheet,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { AppData } from "@/hooks/useDataPersistence";
import {
  exportToJSON,
  exportInteractionsCSV,
  exportProductStatsCSV,
  exportSessionsCSV,
  exportCartAnalysisCSV,
  exportFavoritesAnalysisCSV,
  exportCompleteDataset,
} from "@/lib/dataExport";

interface AdminDataManagementProps {
  data: AppData;
  onImportData: (data: any) => boolean;
  onClearData: () => void;
}

export const AdminDataManagement = ({
  data,
  onImportData,
  onClearData,
}: AdminDataManagementProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [importStatus, setImportStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const dataStats = {
    products: data.products.length,
    interactions: data.interactions.length,
    sessions: data.sessions.length,
    cartItems: data.cart.length,
    favorites: data.favorites.length,
    lastUpdated: data.lastUpdated,
  };

  const exportOptions = [
    {
      id: "complete",
      title: "Complete Dataset",
      description: "Full backup with all data",
      icon: Database,
      format: "JSON",
      action: () => exportCompleteDataset(data),
    },
    {
      id: "interactions",
      title: "User Interactions",
      description: "All swipe actions and behaviors",
      icon: FileSpreadsheet,
      format: "CSV",
      action: () => exportInteractionsCSV(data),
    },
    {
      id: "product-stats",
      title: "Product Statistics",
      description: "Performance metrics per product",
      icon: FileSpreadsheet,
      format: "CSV",
      action: () => exportProductStatsCSV(data),
    },
    {
      id: "sessions",
      title: "User Sessions",
      description: "Session data and duration",
      icon: FileSpreadsheet,
      format: "CSV",
      action: () => exportSessionsCSV(data),
    },
    {
      id: "cart",
      title: "Cart Analysis",
      description: "Shopping cart behavior",
      icon: FileSpreadsheet,
      format: "CSV",
      action: () => exportCartAnalysisCSV(data),
    },
    {
      id: "favorites",
      title: "Favorites Analysis",
      description: "Liked products data",
      icon: FileSpreadsheet,
      format: "CSV",
      action: () => exportFavoritesAnalysisCSV(data),
    },
  ];

  const handleExport = async (exportFn: () => void) => {
    setIsExporting(true);
    setExportProgress(0);

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500)); // Small delay for UX
      exportFn();
      setExportProgress(100);

      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 500);
    } catch (error) {
      console.error("Export failed:", error);
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        const success = onImportData(data);
        setImportStatus(success ? "success" : "error");

        setTimeout(() => setImportStatus("idle"), 3000);
      } catch (error) {
        console.error("Import failed:", error);
        setImportStatus("error");
        setTimeout(() => setImportStatus("idle"), 3000);
      }
    };
    reader.readAsText(file);

    // Reset input
    event.target.value = "";
  };

  const handleClearData = () => {
    onClearData();
    setShowClearDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Database className="w-6 h-6" />
          Data Management
        </h2>
        <p className="text-gray-600">
          Export, import, and manage your application data
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(dataStats).map(([key, value]) => {
          if (key === "lastUpdated") return null;

          return (
            <Card key={key}>
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {typeof value === "number" ? value : "0"}
                  </div>
                  <div className="text-sm text-gray-500 capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Last Updated Info */}
      <Alert>
        <Calendar className="h-4 w-4" />
        <AlertDescription>
          <strong>Last Updated:</strong>{" "}
          {dataStats.lastUpdated.toLocaleString()}
        </AlertDescription>
      </Alert>

      {/* Import Status */}
      {importStatus !== "idle" && (
        <Alert
          className={
            importStatus === "success"
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }
        >
          {importStatus === "success" ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription
            className={
              importStatus === "success" ? "text-green-700" : "text-red-700"
            }
          >
            {importStatus === "success"
              ? "Data imported successfully!"
              : "Failed to import data. Please check the file format."}
          </AlertDescription>
        </Alert>
      )}

      {/* Export Progress */}
      {isExporting && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Exporting data...</span>
                <span>{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exportOptions.map((option, index) => {
              const Icon = option.icon;

              return (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className="h-full hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleExport(option.action)}
                  >
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <Icon className="w-8 h-8 text-purple-600" />
                          <Badge variant="outline" className="text-xs">
                            {option.format}
                          </Badge>
                        </div>

                        <div>
                          <h3 className="font-medium text-gray-900">
                            {option.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {option.description}
                          </p>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          disabled={isExporting}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export {option.format}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Import Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> Importing data will merge with
                existing data. Use the complete dataset export for full backups.
              </AlertDescription>
            </Alert>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                  id="import-file"
                />
                <label htmlFor="import-file">
                  <Button variant="outline" className="cursor-pointer" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Choose JSON File
                    </span>
                  </Button>
                </label>
              </div>

              <div className="text-sm text-gray-500">
                Only JSON files from complete dataset exports are supported.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Clear All Data</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Permanently delete all stored data including products,
                  interactions, sessions, and configuration. This action cannot
                  be undone.
                </p>
              </div>

              <Button
                variant="destructive"
                onClick={() => setShowClearDialog(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clear Data Confirmation Dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Confirm Data Deletion
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                <strong>This action is irreversible!</strong> All data will be
                permanently deleted:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>{dataStats.products} products</li>
                  <li>{dataStats.interactions} interactions</li>
                  <li>{dataStats.sessions} sessions</li>
                  <li>{dataStats.cartItems} cart items</li>
                  <li>{dataStats.favorites} favorites</li>
                </ul>
              </AlertDescription>
            </Alert>

            <p className="text-sm text-gray-600">
              Consider exporting your data first as a backup before proceeding.
            </p>

            <div className="flex gap-4 justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowClearDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleClearData}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Yes, Delete All Data
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
