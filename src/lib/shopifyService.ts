// Servicio para conectar con Shopify y obtener productos reales
export interface ShopifyProduct {
  id: string;
  title: string;
  description: string;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: Array<{
      node: {
        url: string;
        altText?: string;
      };
    }>;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        price: {
          amount: string;
          currencyCode: string;
        };
      };
    }>;
  };
}

export interface ShopifyResponse {
  data: {
    products: {
      edges: Array<{
        node: ShopifyProduct;
      }>;
    };
  };
}

// Configuración de Shopify
const SHOPIFY_CONFIG = {
  domain: import.meta.env.VITE_SHOPIFY_DOMAIN || "tu-tienda.myshopify.com",
  storefrontToken: import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN || "",
  apiVersion: "2024-01",
};

// Query GraphQL para obtener productos
const PRODUCTS_QUERY = `
  query getProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          description
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`;

// Función para obtener productos de Shopify
export async function fetchShopifyProducts(
  limit: number = 20,
): Promise<ShopifyProduct[]> {
  if (!SHOPIFY_CONFIG.storefrontToken || !SHOPIFY_CONFIG.domain) {
    console.warn("Shopify credentials not configured. Using mock data.");
    return [];
  }

  try {
    const response = await fetch(
      `https://${SHOPIFY_CONFIG.domain}/api/${SHOPIFY_CONFIG.apiVersion}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": SHOPIFY_CONFIG.storefrontToken,
        },
        body: JSON.stringify({
          query: PRODUCTS_QUERY,
          variables: { first: limit },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ShopifyResponse = await response.json();
    return data.data.products.edges.map((edge) => edge.node);
  } catch (error) {
    console.error("Error fetching Shopify products:", error);
    return [];
  }
}

// Convertir producto de Shopify al formato de SwipeShop
export function convertShopifyProduct(shopifyProduct: ShopifyProduct) {
  const price = parseFloat(shopifyProduct.priceRange.minVariantPrice.amount);
  const image = shopifyProduct.images.edges[0]?.node.url || "/placeholder.svg";

  return {
    id: parseInt(shopifyProduct.id.split("/").pop() || "0"),
    name: shopifyProduct.title,
    price: price,
    originalPrice: price * 1.2, // Simular precio original con descuento
    image: image,
    category: "Shopify Product", // Podrías extraer esto de collections
    description: shopifyProduct.description || "Producto de Shopify",
    rating: 4.5, // Valor por defecto
    reviews: Math.floor(Math.random() * 100) + 10, // Valor aleatorio
    discount: 15, // Valor por defecto
    shopifyId: shopifyProduct.id,
    variantId: shopifyProduct.variants.edges[0]?.node.id || "",
  };
}

// Función para verificar si Shopify está configurado
export function isShopifyConfigured(): boolean {
  return !!(SHOPIFY_CONFIG.storefrontToken && SHOPIFY_CONFIG.domain);
}

// Función para obtener productos (Shopify o mock)
export async function getProducts() {
  const shopifyProducts = await fetchShopifyProducts();

  if (shopifyProducts.length > 0) {
    console.log(`✅ Loaded ${shopifyProducts.length} products from Shopify`);
    return shopifyProducts.map(convertShopifyProduct);
  } else {
    console.log("📦 Using mock data (Shopify not configured)");
    // Importar mock data como fallback
    const { mockProducts } = await import("./mockData");
    return mockProducts;
  }
}

export default {
  fetchShopifyProducts,
  convertShopifyProduct,
  isShopifyConfigured,
  getProducts,
};
