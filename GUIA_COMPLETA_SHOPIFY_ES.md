# 🛍️ Guía Completa: Conectar SwipeShop a Shopify

## 📋 Paso a Paso Detallado

¡Te voy a explicar exactamente cómo conectar tu página SwipeShop completa a Shopify! Hay **3 formas diferentes** de hacerlo, te explico todas paso a paso.

---

## 🎯 **OPCIÓN 1: Dashboard de Analytics Privado (MÁS POPULAR)**

_Esta opción te permite tener un dashboard privado con todas las estadísticas, accesible solo por ti._

### **Paso 1: Preparar tu Aplicación**

1. **Abrir terminal y navegar a tu proyecto:**

   ```bash
   cd tu-proyecto-swipeshop
   ```

2. **Asegurarte de que todo funciona:**
   ```bash
   npm install
   npm run dev
   ```
   - Verifica que tu app funcione en `http://localhost:3000`
   - Verifica que el dashboard funcione en `http://localhost:3000/analytics-dashboard-full`

### **Paso 2: Compilar para Producción**

1. **Crear build de producción:**

   ```bash
   npm run build
   ```

2. **Probar build localmente:**
   ```bash
   npm run preview
   ```

### **Paso 3: Subir a Internet (Deploy)**

**OPCIÓN A - Vercel (Recomendado):**

1. **Instalar Vercel:**

   ```bash
   npm install -g vercel
   ```

2. **Hacer deploy:**
   ```bash
   vercel --prod
   ```
   - Te va a pedir que inicies sesión
   - Responde las preguntas (usa defaults)
   - Al final te dará una URL como: `https://tu-app-xyz.vercel.app`

**OPCIÓN B - Netlify:**

1. **Instalar Netlify:**

   ```bash
   npm install -g netlify-cli
   ```

2. **Hacer deploy:**
   ```bash
   netlify deploy --prod --dir=dist
   ```
   - Sigue las instrucciones para conectar con tu cuenta
   - Te dará una URL como: `https://amazing-app-123.netlify.app`

### **Paso 4: Configurar tu Dashboard Privado**

Una vez que tengas tu URL (ejemplo: `https://tu-app.vercel.app`), tus URLs serán:

- **Tu app principal:** `https://tu-app.vercel.app/`
- **Tu dashboard privado:** `https://tu-app.vercel.app/analytics-dashboard-full`

**¡Guarda esta URL del dashboard! Solo tú la conoces, es tu dashboard privado.**

### **Paso 5: Conectar con Shopify Admin (Opcional)**

Si quieres acceder al dashboard desde tu admin de Shopify:

1. **Ir a Shopify Partners:**

   - Ve a https://partners.shopify.com
   - Crea cuenta si no tienes

2. **Crear nueva app:**

   - Click "Create app"
   - Nombre: "SwipeShop Analytics"
   - Type: "Public app"

3. **Configurar URLs:**

   - App URL: `https://tu-app.vercel.app`
   - Allowed redirection URLs: `https://tu-app.vercel.app/auth/callback`

4. **Instalar en tu tienda:**
   - Una vez creada la app, instalala en tu tienda Shopify
   - Aparecerá en tu admin de Shopify como una nueva app

---

## 🎯 **OPCIÓN 2: Widget SwipeShop en tus Productos**

_Esta opción agrega SwipeShop directamente en las páginas de tus productos para que los clientes puedan usarlo._

### **Paso 1: Preparar Archivos para Shopify**

Ya tienes estos archivos creados en tu proyecto:

- `shopify-widget.js`
- `swipeshop-section.liquid`

### **Paso 2: Subir Archivos a tu Tema de Shopify**

1. **Ir a tu admin de Shopify:**

   - Online Store → Themes
   - Click "Actions" → "Edit code" en tu tema activo

2. **Subir el JavaScript:**

   - En la carpeta "Assets", click "Add a new asset"
   - Upload el archivo `shopify-widget.js`

3. **Subir la sección:**
   - En la carpeta "Sections", click "Add a new section"
   - Copy-paste el contenido de `swipeshop-section.liquid`
   - Guardar como "swipeshop-section"

### **Paso 3: Activar el Widget**

1. **Editar theme.liquid:**

   - En "Layout", abre `theme.liquid`
   - Antes de `</head>`, agrega:

   ```liquid
   {{ 'shopify-widget.js' | asset_url | script_tag }}
   ```

2. **Agregar a páginas de producto:**
   - Ve a "Online Store" → "Themes" → "Customize"
   - Selecciona una página de producto
   - Click "Add section"
   - Busca y agrega "SwipeShop Widget"
   - Configurar título y opciones
   - Guardar

### **Paso 4: Configurar URL de tu App**

En el archivo `shopify-widget.js`, busca esta línea:

```javascript
const SWIPESHOP_URL = "https://your-domain.com";
```

Cámbiala por tu URL real:

```javascript
const SWIPESHOP_URL = "https://tu-app.vercel.app";
```

---

## 🎯 **OPCIÓN 3: Página Completa de SwipeShop**

_Esta opción crea una página completa en tu tienda Shopify con SwipeShop._

### **Paso 1: Crear Template de Página**

1. **En tu admin de Shopify:**

   - Online Store → Themes → Actions → Edit code

2. **Crear nuevo template:**

   - En "Templates", click "Add a new template"
   - Selecciona "page"
   - Nombra: "swipeshop"

3. **Copiar contenido:**
   - Copia todo el contenido del archivo `page.swipeshop.liquid`
   - Pégalo en el nuevo template
   - Guarda

### **Paso 2: Crear la Página**

1. **En tu admin de Shopify:**

   - Online Store → Pages → Add page

2. **Configurar página:**
   - Title: "Descubre Productos" (o el que prefieras)
   - Handle: "swipeshop"
   - Template: Selecciona "page.swipeshop"
   - Guarda

### **Paso 3: Actualizar URL en el Template**

En el template que acabas de crear, busca:

```javascript
const SWIPESHOP_URL = "https://your-domain.com";
```

Cámbiala por:

```javascript
const SWIPESHOP_URL = "https://tu-app.vercel.app";
```

### **Paso 4: Probar la Página**

Tu página estará disponible en:

```
https://tu-tienda.myshopify.com/pages/swipeshop
```

---

## 🔧 **Configuraciones Adicionales**

### **A. Sincronizar Productos de Shopify**

Para que SwipeShop use los productos reales de tu tienda:

1. **Crear endpoint API:**
   Agrega esto a tu proyecto (crear archivo `src/api/shopify.ts`):

   ```typescript
   // src/api/shopify.ts
   export async function fetchShopifyProducts(
     shop: string,
     accessToken: string,
   ) {
     const response = await fetch(
       `https://${shop}.myshopify.com/admin/api/2024-01/products.json`,
       {
         headers: {
           "X-Shopify-Access-Token": accessToken,
           "Content-Type": "application/json",
         },
       },
     );
     return response.json();
   }
   ```

2. **Actualizar mockData:**
   Modifica `src/lib/mockData.ts` para cargar productos reales en lugar de datos de prueba.

### **B. Configurar Variables de Entorno**

Si usas la integración completa, necesitas estas variables:

1. **Crear archivo `.env` en tu proyecto:**

   ```env
   VITE_SHOPIFY_DOMAIN=tu-tienda.myshopify.com
   VITE_SHOPIFY_STOREFRONT_TOKEN=tu_token_aqui
   VITE_APP_URL=https://tu-app.vercel.app
   ```

2. **En tu hosting (Vercel/Netlify):**
   - Agrega estas mismas variables en las configuraciones de tu hosting

### **C. Configurar CORS (Para Embebido)**

Si usas widgets o páginas embebidas, actualiza `vite.config.ts`:

```typescript
export default defineConfig({
  // ... resto de configuración
  server: {
    cors: {
      origin: [
        "https://admin.shopify.com",
        "https://*.myshopify.com",
        "https://tu-tienda.myshopify.com", // Tu tienda específica
      ],
    },
  },
});
```

---

## 📊 **Resultado Final**

Una vez completado todo, tendrás:

### **URLs de Administrador (Solo para ti):**

- **Dashboard principal:** `https://tu-app.vercel.app/analytics-dashboard-full`
- **App regular:** `https://tu-app.vercel.app/`

### **URLs para Clientes:**

- **Widget en productos:** Aparece automáticamente en páginas de producto
- **Página completa:** `https://tu-tienda.myshopify.com/pages/swipeshop`

### **Funcionalidades:**

- ✅ Analytics privados solo para ti
- ✅ Widget de productos para clientes
- ✅ Página completa de descubrimiento
- ✅ Datos persistentes entre sesiones
- ✅ Diseño responsivo
- ✅ Integración con carrito de Shopify

---

## ✅ **Checklist de Verificación**

### **Básico (Para Opción 1):**

- [ ] App funciona en local (`npm run dev`)
- [ ] Build creado sin errores (`npm run build`)
- [ ] App deployada en internet (Vercel/Netlify)
- [ ] Dashboard accesible en `tu-url/analytics-dashboard-full`
- [ ] URL guardada y secreta

### **Widget (Para Opción 2):**

- [ ] Archivos subidos al tema de Shopify
- [ ] JavaScript agregado a theme.liquid
- [ ] Sección agregada a productos
- [ ] URL actualizada en widget
- [ ] Widget funciona en página de producto

### **Página Completa (Para Opción 3):**

- [ ] Template creado en Shopify
- [ ] Página creada con template correcto
- [ ] URL actualizada en template
- [ ] Página accesible públicamente

### **Avanzado (Opcional):**

- [ ] Variables de entorno configuradas
- [ ] CORS configurado para embebido
- [ ] Productos sincronizados con Shopify API
- [ ] SSL habilitado (automático en Vercel/Netlify)

---

## 🚨 **¿Problemas Comunes?**

### **"No funciona el deploy"**

- Verifica que `npm run build` funcione sin errores
- Revisa que todas las dependencias estén instaladas
- Checa que el puerto en vite.config.ts sea correcto

### **"No se ve el widget"**

- Verifica que el JavaScript esté agregado a theme.liquid
- Checa que la URL en el widget sea correcta
- Asegúrate de que la sección esté agregada a la página

### **"Dashboard no carga"**

- Verifica que la URL sea exactamente `/analytics-dashboard-full`
- Checa que el hosting esté activo
- Revisa la consola del navegador para errores

### **"No funciona en Shopify"**

- Verifica configuraciones de CORS
- Checa que las URLs sean HTTPS (obligatorio para Shopify)
- Asegúrate de que no haya bloqueos de JavaScript

---

## 🎉 **¡Listo!**

Con esta guía tienes todo lo necesario para conectar tu SwipeShop completo a Shopify. Puedes usar una o las tres opciones según tus necesidades:

1. **Solo dashboard privado** = Opción 1
2. **Widget en productos** = Opción 1 + 2
3. **Experiencia completa** = Opciones 1 + 2 + 3

¡Tu SwipeShop estará completamente integrado con Shopify! 🚀

**¿Necesitas ayuda con algún paso específico?** Solo dime en qué paso tienes dudas y te ayudo en detalle.
