import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Save,
  RotateCcw,
  Globe,
  DollarSign,
  Clock,
  Package,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AppConfig } from "@/hooks/useDataPersistence";

interface AdminConfigProps {
  config: AppConfig;
  onUpdateConfig: (config: AppConfig) => void;
}

export const AdminConfig = ({ config, onUpdateConfig }: AdminConfigProps) => {
  const [localConfig, setLocalConfig] = useState<AppConfig>({ ...config });
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [hasChanges, setHasChanges] = useState(false);

  const handleConfigChange = (key: keyof AppConfig, value: any) => {
    setLocalConfig((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
    setSaveStatus("idle");
  };

  const handleFeaturedCollectionChange = (index: number, value: string) => {
    const newCollections = [...localConfig.featuredCollections];
    newCollections[index] = value;
    handleConfigChange("featuredCollections", newCollections);
  };

  const addFeaturedCollection = () => {
    const newCollections = [...localConfig.featuredCollections, ""];
    handleConfigChange("featuredCollections", newCollections);
  };

  const removeFeaturedCollection = (index: number) => {
    const newCollections = localConfig.featuredCollections.filter(
      (_, i) => i !== index,
    );
    handleConfigChange("featuredCollections", newCollections);
  };

  const handleSave = async () => {
    setSaveStatus("saving");

    try {
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate save
      onUpdateConfig(localConfig);
      setHasChanges(false);
      setSaveStatus("saved");

      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const handleReset = () => {
    setLocalConfig({ ...config });
    setHasChanges(false);
    setSaveStatus("idle");
  };

  const configSections = [
    {
      title: "General Settings",
      icon: Settings,
      fields: [
        {
          key: "siteName",
          label: "Site Name",
          type: "text",
          description: "The name of your application",
        },
        {
          key: "currency",
          label: "Currency",
          type: "text",
          description: "Currency code (e.g., USD, EUR)",
        },
        {
          key: "timezone",
          label: "Timezone",
          type: "text",
          description: "Default timezone (e.g., UTC, America/New_York)",
        },
      ],
    },
    {
      title: "Application Behavior",
      icon: Package,
      fields: [
        {
          key: "maintenanceMode",
          label: "Maintenance Mode",
          type: "switch",
          description: "Enable maintenance mode to temporarily disable the app",
        },
        {
          key: "maxProductsPerSession",
          label: "Max Products Per Session",
          type: "number",
          description: "Maximum number of products shown per user session",
        },
      ],
    },
    {
      title: "Product Settings",
      icon: DollarSign,
      fields: [
        {
          key: "priceRange",
          label: "Price Range",
          type: "range",
          description: "Default price range for product filtering",
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Application Configuration
          </h2>
          <p className="text-gray-600">
            Customize your application settings and behavior
          </p>
        </div>

        <div className="flex gap-2">
          {hasChanges && (
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          )}

          <Button
            onClick={handleSave}
            disabled={!hasChanges || saveStatus === "saving"}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {saveStatus === "saving" ? (
              <>
                <Settings className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Save Status */}
      {saveStatus === "saved" && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            Configuration saved successfully!
          </AlertDescription>
        </Alert>
      )}

      {saveStatus === "error" && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            Failed to save configuration. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Changes Indicator */}
      {hasChanges && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have unsaved changes. Don't forget to save your configuration.
          </AlertDescription>
        </Alert>
      )}

      {/* Configuration Sections */}
      <div className="space-y-6">
        {configSections.map((section, sectionIndex) => {
          const Icon = section.icon;

          return (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="w-5 h-5" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {section.fields.map((field) => (
                      <div key={field.key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-900">
                              {field.label}
                            </label>
                            <p className="text-sm text-gray-500">
                              {field.description}
                            </p>
                          </div>

                          {field.type === "switch" && (
                            <Switch
                              checked={
                                localConfig[
                                  field.key as keyof AppConfig
                                ] as boolean
                              }
                              onCheckedChange={(checked) =>
                                handleConfigChange(
                                  field.key as keyof AppConfig,
                                  checked,
                                )
                              }
                            />
                          )}
                        </div>

                        {field.type === "text" && (
                          <Input
                            value={
                              localConfig[
                                field.key as keyof AppConfig
                              ] as string
                            }
                            onChange={(e) =>
                              handleConfigChange(
                                field.key as keyof AppConfig,
                                e.target.value,
                              )
                            }
                            placeholder={field.label}
                          />
                        )}

                        {field.type === "number" && (
                          <Input
                            type="number"
                            value={
                              localConfig[
                                field.key as keyof AppConfig
                              ] as number
                            }
                            onChange={(e) =>
                              handleConfigChange(
                                field.key as keyof AppConfig,
                                parseInt(e.target.value) || 0,
                              )
                            }
                            placeholder={field.label}
                          />
                        )}

                        {field.type === "range" &&
                          field.key === "priceRange" && (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs text-gray-500">
                                  Minimum Price
                                </label>
                                <Input
                                  type="number"
                                  value={localConfig.priceRange.min}
                                  onChange={(e) =>
                                    handleConfigChange("priceRange", {
                                      ...localConfig.priceRange,
                                      min: parseFloat(e.target.value) || 0,
                                    })
                                  }
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500">
                                  Maximum Price
                                </label>
                                <Input
                                  type="number"
                                  value={localConfig.priceRange.max}
                                  onChange={(e) =>
                                    handleConfigChange("priceRange", {
                                      ...localConfig.priceRange,
                                      max: parseFloat(e.target.value) || 1000,
                                    })
                                  }
                                />
                              </div>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {/* Featured Collections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Featured Collections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Collections that will be highlighted in the application
                </p>

                <div className="space-y-3">
                  {localConfig.featuredCollections.map((collection, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Input
                        value={collection}
                        onChange={(e) =>
                          handleFeaturedCollectionChange(index, e.target.value)
                        }
                        placeholder={`Collection ${index + 1}`}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFeaturedCollection(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={addFeaturedCollection}
                  className="w-full"
                >
                  Add Featured Collection
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Current Configuration Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Configuration Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-600">
                    Application
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Site Name</span>
                      <Badge variant="outline">{localConfig.siteName}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Currency</span>
                      <Badge variant="outline">{localConfig.currency}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Maintenance</span>
                      <Badge
                        className={
                          localConfig.maintenanceMode
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }
                      >
                        {localConfig.maintenanceMode ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-600">
                    Limits
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Max Products</span>
                      <Badge variant="outline">
                        {localConfig.maxProductsPerSession}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Price Range</span>
                      <Badge variant="outline">
                        ${localConfig.priceRange.min} - $
                        {localConfig.priceRange.max}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-600">
                    Collections
                  </div>
                  <div className="space-y-1">
                    {localConfig.featuredCollections.map(
                      (collection, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {collection || `Collection ${index + 1}`}
                        </Badge>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
