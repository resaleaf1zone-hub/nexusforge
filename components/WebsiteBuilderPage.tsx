
import React, { useState, useContext, useMemo, useEffect } from 'react';
import type { Project, WebsiteConfig, WebsiteTemplate, WebsiteCategory, WebsiteSubCategory, WebsitePage, DiscountCode, ShippingOption, ProductVariant, WebsiteProduct, Order } from '../types';
import { AppContext } from '../contexts/AppContext';
import { Page } from '../types';
import SupportWidget from './SupportWidget';
import DeploymentModal from './DeploymentModal';
import ImageGalleryModal from './ImageGalleryModal';

type EditorTab = 'Content' | 'Design' | 'Store' | 'Settings' | 'Analytics';

const themes = {
  modern: {
    primaryColor: '#3b82f6',
    secondaryColor: '#1f2937',
    font: 'Inter'
  },
  minimalist: {
    primaryColor: '#10b981',
    secondaryColor: '#f9fafb',
    font: 'Roboto'
  },
  bold: {
    primaryColor: '#ef4444',
    secondaryColor: '#111827',
    font: 'Poppins'
  }
};

const LockIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 text-yellow-400 inline-block" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
    </svg>
);

const Section: React.FC<{ title: string; children: React.ReactNode, description?: string, locked?: boolean }> = ({ title, children, description, locked }) => (
    <div className={`glass-card p-6 rounded-lg ${locked ? 'opacity-50' : ''}`}>
        <h2 className="text-xl font-bold mb-2 border-b border-[var(--border-color)] pb-2 flex items-center">{title} {locked && <LockIcon />}</h2>
        {description && <p className="text-sm text-gray-400 mb-4">{description}</p>}
        <div className={`space-y-4 ${locked ? 'pointer-events-none' : ''}`}>{children}</div>
    </div>
);

const AnalyticsStatCard: React.FC<{ title: string, value: string | number, change?: string, changeType?: 'increase' | 'decrease' }> = ({ title, value, change, changeType }) => (
    <div className="glass-card p-4 rounded-lg">
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
        {change && (
            <p className={`text-xs ${changeType === 'increase' ? 'text-green-400' : 'text-red-400'}`}>
                {change} vs last period
            </p>
        )}
    </div>
);

const AnalyticsChart: React.FC<{ data: number[] }> = ({ data }) => {
    const maxVal = Math.max(...data, 1);
    const points = data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - (d / maxVal) * 90}`).join(' ');

    return (
        <div className="bg-black/20 p-4 rounded-lg h-64">
             <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                <polyline
                    fill="none"
                    stroke="var(--primary-color)"
                    strokeWidth="2"
                    points={points}
                />
            </svg>
        </div>
    );
};


const WebsiteBuilderPage: React.FC<{ project: Project | null }> = ({ project }) => {
  const context = useContext(AppContext);
  const [config, setConfig] = useState<WebsiteConfig | null>(project?.config as WebsiteConfig || null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isGalleryOpen, setGalleryOpen] = useState(false);
  
  const [activeEditorTab, setActiveEditorTab] = useState<EditorTab>("Content");
  
  const [editingPageId, setEditingPageId] = useState<string>('home');
  const [previewState, setPreviewState] = useState<{type: 'page', id: string} | {type: 'product', id: string} | {type: 'checkout', cart: WebsiteProduct[]} | {type: 'order_success'}>({type: 'page', id: 'home'});
  
  const [editingProduct, setEditingProduct] = useState<WebsiteProduct | null>(null);
  const [galleryContext, setGalleryContext] = useState<'productImage' | 'descriptionImage' | null>(null);
  const [editingProductIdForImage, setEditingProductIdForImage] = useState<string | null>(null);

  const [analyticsData, setAnalyticsData] = useState({
    visits: [50, 60, 80, 75, 90, 120, 110], // last 7 days
    totalVisits: 585,
    uniqueVisitors: 412,
    orders: 23,
    topPages: [
        { name: 'Home', views: 350 },
        { name: '/products/astro-gears', views: 120 },
        { name: '/products/cyber-core', views: 95 },
    ],
    referrers: [
        { name: 'Google', visits: 210 },
        { name: 'Direct', visits: 150 },
        { name: 'Twitter', visits: 52 },
    ]
});

  const currentPage = useMemo(() => config?.pages.find(p => p.id === editingPageId), [config, editingPageId]);
  const isProOrHigher = context?.user?.plan === 'Pro' || context?.user?.plan === 'Enterprise';
  
  const addOrder = (orderData: Omit<Order, 'id' | 'createdAt'>) => {
    if (!config) return;
    const newOrder: Order = {
        ...orderData,
        id: `order_${Date.now()}`,
        createdAt: new Date(),
    };
    updateConfigValue(['orders'], [newOrder, ...config.orders]);
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
        if (!event.isTrusted || !event.data || !event.data.action) return;
        const { action, payload } = event.data;
        if (action === 'viewProduct') setPreviewState({ type: 'product', id: payload.id });
        if (action === 'viewCheckout') setPreviewState({ type: 'checkout', cart: payload.cart });
        if (action === 'navigate') setPreviewState({ type: 'page', id: payload.id });
        if (action === 'placeOrder') {
            addOrder(payload);
            setPreviewState({type: 'order_success'});
        }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
      if (project) {
          const webConfig = project.config as WebsiteConfig;
          setConfig(webConfig);
          if (webConfig.pages && webConfig.pages.length > 0) {
              setEditingPageId(webConfig.pages[0].id);
              setPreviewState({ type: 'page', id: webConfig.pages[0].id });
          }
      }
  }, [project]);
  
  const updateConfigValue = (path: (string|number)[], value: any) => {
    if (!config || !project) return;

    let newConfig = JSON.parse(JSON.stringify(config)); // Deep copy
    let current: any = newConfig;

    for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    
    setConfig(newConfig);
    context?.updateProjectConfig(project.id, newConfig);
  };

  const handleSelectImageForDescription = (imageUrl: string) => {
    if (editingProduct) {
        const imgTag = `<br><img src="${imageUrl}" alt="" style="max-width: 100%; border-radius: 8px; margin: 8px 0;" />`;
        setEditingProduct(prev => prev ? { ...prev, description: prev.description + imgTag } : null);
    }
    setGalleryOpen(false);
  };

  const handleSelectImageForProduct = (imageUrl: string) => {
      if (config && editingProductIdForImage) {
          const productIndex = config.products.findIndex(p => p.id === editingProductIdForImage);
          if (productIndex > -1) {
              updateConfigValue(['products', productIndex, 'imageUrl'], imageUrl);
          }
      }
      setGalleryOpen(false);
  };

  const handleThemeSelect = (template: 'modern' | 'minimalist' | 'bold') => {
    if (!config) return;
    const theme = themes[template];
    updateConfigValue(['template'], template);
    updateConfigValue(['theme'], { ...config.theme, ...theme });
  };
  
  const handleSaveAsTemplate = () => {
    const name = prompt("Enter a name for your new template:");
    if (name && config && project) {
        const newTemplate: WebsiteTemplate = {
            id: `custom_${Date.now()}`,
            name: name,
            description: `A custom template based on '${project.name}'.`,
            previewImageUrl: 'https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?q=80&w=800', // A generic placeholder
            tags: ['Custom'],
            config: JSON.parse(JSON.stringify(config)) // Deep copy
        };
        context?.addCustomTemplate(newTemplate);
        alert(`Template '${name}' saved successfully! You can find it in the marketplace.`);
    }
};

  const templateStyles = useMemo(() => {
    if (!config) return '';

    const {primaryColor, secondaryColor} = config.theme;

    return {
        modern: `
            body { background-color: #111827; color: #f3f4f6; }
            .card { background-color: #1f2937; border-radius: 0.75rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); }
            .btn-primary { background-image: linear-gradient(to right, ${primaryColor}, #6366f1); color: white; border-radius: 9999px; transition: transform 0.2s; }
            .btn-primary:hover { transform: scale(1.05); }
            header { background-color: rgba(31, 41, 55, 0.8); backdrop-filter: blur(10px); }
            .form-input { background-color: #374151; border: 1px solid #4b5563; border-radius: 0.5rem; padding: 0.75rem 1rem; color: #f3f4f6; }
            .form-input:focus { outline: none; border-color: ${primaryColor}; box-shadow: 0 0 0 2px ${primaryColor}40; }
        `,
        minimalist: `
            body { background-color: #ffffff; color: #374151; }
            .card { border: 1px solid #e5e7eb; border-radius: 0; }
            .btn-primary { background-color: ${primaryColor}; color: white; border-radius: 0; }
            header { background-color: #ffffff; box-shadow: none; border-bottom: 1px solid #e5e7eb; }
            nav { color: #1f2937; }
            .form-input { background-color: #f9fafb; border: 1px solid #d1d5db; border-radius: 0.25rem; padding: 0.75rem 1rem; color: #111827; }
            .form-input:focus { outline: none; border-color: ${primaryColor}; box-shadow: 0 0 0 2px ${primaryColor}40; }
        `,
        bold: `
            body { background-color: #000000; color: #ffffff; }
            .card { background-color: #111827; border: 2px solid ${primaryColor}; border-radius: 0; }
            .btn-primary { background-color: ${primaryColor}; color: ${secondaryColor}; font-weight: 900; border-radius: 0; }
            h1, h2, h3, h4 { text-transform: uppercase; font-weight: 900; letter-spacing: 0.05em; }
            .form-input { background-color: #1f2937; border: 1px solid #4b5563; border-radius: 0; padding: 0.75rem 1rem; color: #f3f4f6; }
            .form-input:focus { outline: none; border-color: ${primaryColor}; box-shadow: 0 0 0 2px ${primaryColor}40; }
        `
    }[config.template];
  }, [config]);

  const websiteHtml = useMemo(() => {
    if (!config || !project) return '';

    const {primaryColor, secondaryColor, font} = config.theme;

    const cartScriptAndStyle = `
        <style>
          #cart-panel {
            position: fixed;
            top: 0;
            right: 0;
            width: 350px;
            height: 100%;
            background-color: ${config.template === 'minimalist' ? '#FFF' : '#1f2937'};
            color: ${config.template === 'minimalist' ? '#111' : '#FFF'};
            box-shadow: -10px 0 20px rgba(0,0,0,0.2);
            transform: translateX(100%);
            transition: transform 0.3s ease-in-out;
            z-index: 100;
          }
          #cart-panel.open {
            transform: translateX(0);
          }
          #cart-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
            z-index: 99;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease-in-out;
          }
          #cart-backdrop.open {
            opacity: 1;
            pointer-events: auto;
          }
        </style>
        <div id="cart-backdrop"></div>
        <div id="cart-panel" class="flex flex-col">
            <div class="p-4 border-b ${config.template === 'minimalist' ? 'border-gray-200' : 'border-gray-700'} flex justify-between items-center">
                <h3 class="font-bold text-lg">Your Cart</h3>
                <button id="close-cart-btn" class="text-2xl">&times;</button>
            </div>
            <div id="cart-items" class="flex-grow p-4 overflow-y-auto">
                <p class="text-gray-400">Your cart is empty.</p>
            </div>
            <div class="p-4 border-t ${config.template === 'minimalist' ? 'border-gray-200' : 'border-gray-700'}">
                <div class="flex justify-between font-bold">
                    <span>Subtotal</span>
                    <span id="cart-subtotal">$0.00</span>
                </div>
                <button id="checkout-btn" class="w-full mt-4 py-3 font-semibold btn-primary">Proceed to Checkout</button>
            </div>
        </div>
        <script>
            const cartPanel = document.getElementById('cart-panel');
            const cartBackdrop = document.getElementById('cart-backdrop');
            const cartIcon = document.getElementById('cart-icon');
            const closeCartBtn = document.getElementById('close-cart-btn');
            const cartItemsContainer = document.getElementById('cart-items');
            const cartSubtotalEl = document.getElementById('cart-subtotal');
            const cartCountEl = document.getElementById('cart-count');
            const checkoutBtn = document.getElementById('checkout-btn');
            
            let cart = [];

            function toggleCart() {
                cartPanel.classList.toggle('open');
                cartBackdrop.classList.toggle('open');
            }

            if(cartIcon) cartIcon.addEventListener('click', toggleCart);
            if(closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
            if(cartBackdrop) cartBackdrop.addEventListener('click', toggleCart);
            if(checkoutBtn) checkoutBtn.addEventListener('click', () => {
                if (cart.length > 0) {
                    window.parent.postMessage({ action: 'viewCheckout', payload: { cart } }, '*');
                }
            });

            function renderCart() {
                if (cart.length === 0) {
                    cartItemsContainer.innerHTML = '<p class="text-gray-400">Your cart is empty.</p>';
                } else {
                    cartItemsContainer.innerHTML = cart.map(item => \`
                        <div class="flex gap-4 mb-4 items-center">
                            <img src="\${item.imageUrl}" class="w-16 h-16 object-cover rounded-md" />
                            <div>
                                <p class="font-bold">\${item.name}</p>
                                <p class="text-sm" style="color: ${primaryColor};">$ \${(item.salePrice || item.price).toFixed(2)}</p>
                            </div>
                        </div>
                    \`).join('');
                }
                
                const subtotal = cart.reduce((acc, item) => acc + (item.salePrice || item.price), 0);
                cartSubtotalEl.textContent = '$' + subtotal.toFixed(2);
                if(cartCountEl) cartCountEl.textContent = cart.length;
            }
            
            window.parent.addToCart = function(product) {
                cart.push(JSON.parse(product));
                renderCart();
                if (!cartPanel.classList.contains('open')) {
                    toggleCart();
                }
            }
        </script>
    `;

    const interactionScript = `
      <script>
        document.addEventListener('click', function(e) {
          let target = e.target.closest('[data-action]');
          if (target) {
            e.preventDefault();
            const action = target.dataset.action;
            const id = target.dataset.id;
            if (action === 'addToCart') {
                window.parent.addToCart(target.dataset.product);
            } else {
                window.parent.postMessage({ action, payload: { id } }, '*');
            }
          }
        });
      </script>
    `;

    const navHtml = `
      <nav class="p-4 flex justify-between items-center text-gray-200 sticky top-0 z-10" style="background-color: ${config.template === 'minimalist' ? 'white' : secondaryColor};">
        <h1 class="text-xl font-bold" style="color: ${primaryColor};">${project?.name}</h1>
        <div class="hidden md:flex gap-6 items-center">
          ${config.pages.map(p => `<a href="#" data-action="navigate" data-id="${p.id}" class="hover:text-gray-400">${p.title}</a>`).join('')}
           ${config.ecommerce.cart.enabled ? `
            <div id="cart-icon" class="relative cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              <span id="cart-count" class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">0</span>
            </div>
          ` : ''}
        </div>
      </nav>
    `;

    let pageContent = '';
    
    if(previewState.type === 'page') {
      const page = config.pages.find(p => p.id === previewState.id);
      if(page && page.sections) {
          const { hero, products, footer, about, contact } = page.sections;
          pageContent = `
            ${hero?.enabled ? `
            <header class="text-center py-20 px-4" style="background-color: ${secondaryColor};">
              <h2 class="text-4xl font-bold">${hero.title}</h2>
              <p class="mt-2 text-lg text-gray-300">${hero.subtitle}</p>
              <button class="mt-6 px-6 py-3 font-semibold btn-primary">${hero.cta}</button>
            </header>` : ''}
            
            ${about?.enabled ? `<section class="p-8"><div class="max-w-4xl mx-auto"><h3 class="text-3xl font-bold text-center mb-4">${about.title}</h3><p>${about.content}</p></div></section>` : ''}
            
            ${products?.enabled ? `
            <main class="p-8">
              ${config.categories.map(cat => {
                const catProducts = config.products.filter(p => p.categoryId === cat.id);
                if (catProducts.length === 0) return '';
                return `
                  <div class="mb-12">
                    <h3 class="text-3xl font-bold mb-6">${cat.name}</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      ${catProducts.map(p => `
                        <div class="card overflow-hidden flex flex-col">
                          <img src="${p.imageUrl}" alt="${p.name}" class="w-full h-48 object-cover" />
                          <div class="p-4 flex-grow flex flex-col">
                            <h4 class="font-bold text-lg">${p.name}</h4>
                            <div class="mt-1 mb-4">
                                ${p.salePrice ? `
                                    <span class="text-xl font-bold text-red-500">$${p.salePrice.toFixed(2)}</span>
                                    <span class="text-sm line-through text-gray-400 ml-2">$${p.price.toFixed(2)}</span>
                                ` : `
                                    <span class="text-xl font-bold" style="color:${primaryColor}">$${p.price.toFixed(2)}</span>
                                `}
                            </div>
                            <button data-action="viewProduct" data-id="${p.id}" class="mt-auto w-full py-2 font-semibold btn-primary">View Details</button>
                          </div>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                `
              }).join('')}
            </main>` : ''}

             ${contact?.enabled ? `<section class="p-8 bg-gray-800"><div class="max-w-4xl mx-auto text-center"><h3 class="text-3xl font-bold mb-4">${contact.title}</h3><p>Email: ${contact.email}</p><p>Phone: ${contact.phone}</p></div></section>` : ''}
            
            ${footer?.enabled ? `<footer class="text-center py-6" style="background-color: ${secondaryColor}"><p class="opacity-70">${footer.text}</p></footer>` : ''}
          `;
      }
    } else if (previewState.type === 'product') {
        const product = config.products.find(p => p.id === previewState.id);
        if(product) {
            const layoutClasses = config.productPageLayout === 'image-left'
                ? 'md:grid-cols-2 gap-8'
                : 'md:grid-cols-1 gap-4';
            pageContent = `
                <div class="p-8 max-w-6xl mx-auto">
                    <div class="grid ${layoutClasses} items-start">
                        <img src="${product.imageUrl}" alt="${product.name}" class="w-full rounded-lg shadow-lg"/>
                        <div class="pt-8 md:pt-0">
                            <h2 class="text-4xl font-bold">${product.name}</h2>
                            <div class="text-3xl my-4">
                                ${product.salePrice ? `
                                    <span class="font-bold text-red-500">$${product.salePrice.toFixed(2)}</span>
                                    <span class="text-xl line-through text-gray-400 ml-3">$${product.price.toFixed(2)}</span>
                                ` : `
                                    <span class="font-bold" style="color:${primaryColor}">$${product.price.toFixed(2)}</span>
                                `}
                            </div>
                            <div class="text-gray-400 mb-6 prose">${product.description}</div>
                            <div class="space-y-4 mb-6">
                                ${product.variants?.map(variant => `
                                    <div>
                                        <label class="block text-sm font-medium mb-1">${variant.type}</label>
                                        <select class="w-full bg-gray-700 p-2 rounded-md border border-gray-600">
                                            ${variant.options.map(opt => `<option>${opt}</option>`).join('')}
                                        </select>
                                    </div>
                                `).join('')}
                            </div>
                            <button data-action="addToCart" data-product='${JSON.stringify(product)}' class="px-8 py-4 font-semibold btn-primary text-lg">Add to Cart</button>
                        </div>
                    </div>
                </div>
            `;
        }
    } else if (previewState.type === 'checkout') {
        const { cart } = previewState;
        const subtotal = cart.reduce((acc, item) => acc + (item.salePrice ?? item.price), 0);
        const shipping = 4.99; // Assume fixed for now
        const total = subtotal + shipping;
        const needsShipping = cart.some(item => item.productType === 'physical');

        pageContent = `
            <div id="checkout-view" class="p-8 max-w-4xl mx-auto">
                <h2 class="text-3xl font-bold text-center mb-8">Checkout</h2>
                <form id="checkout-form" class="grid md:grid-cols-2 gap-8">
                    <div>
                         <div class="space-y-4">
                            <div>
                                <h3 class="font-bold text-lg mb-4">Contact Information</h3>
                                <input type="email" name="email" placeholder="Email Address" class="form-input w-full" required />
                            </div>
                             <div id="shipping-address-form" style="display: ${needsShipping ? 'block' : 'none'}">
                                <h3 class="font-bold text-lg mb-4 mt-6">Shipping Address</h3>
                                <div class="space-y-4">
                                    <input type="text" name="name" placeholder="Full Name" class="form-input w-full" />
                                    <input type="text" name="street" placeholder="Street Address" class="form-input w-full" />
                                    <div class="flex gap-4">
                                        <input type="text" name="city" placeholder="City" class="form-input w-full" />
                                        <input type="text" name="state" placeholder="State / Province" class="form-input w-full" />
                                    </div>
                                    <div class="flex gap-4">
                                        <input type="text" name="zip" placeholder="ZIP / Postal Code" class="form-input w-full" />
                                        <input type="text" name="country" placeholder="Country" class="form-input w-full" />
                                    </div>
                                </div>
                            </div>
                         </div>
                    </div>
                    <div class="bg-gray-800 p-6 rounded-lg">
                        <h3 class="font-bold text-lg mb-4">Your Order</h3>
                        <div class="space-y-3">
                            ${cart.map(item => `
                                <div class="flex justify-between items-center text-sm">
                                    <div class="flex items-center gap-2">
                                        <img src="${item.imageUrl}" class="w-10 h-10 rounded-md object-cover" />
                                        <p>${item.name}</p>
                                    </div>
                                    <p>$${(item.salePrice ?? item.price).toFixed(2)}</p>
                                </div>
                            `).join('')}
                             <div class="flex justify-between border-t border-gray-600 pt-3 mt-3">
                                <p>Subtotal</p>
                                <p>$${subtotal.toFixed(2)}</p>
                            </div>
                             <div class="flex justify-between">
                                <p>Shipping</p>
                                <p>$${shipping.toFixed(2)}</p>
                            </div>
                            <div class="flex justify-between font-bold border-t border-gray-600 pt-3 mt-3">
                                <p>Total</p>
                                <p>$${total.toFixed(2)}</p>
                            </div>
                            <button type="submit" class="w-full py-3 btn-primary font-semibold mt-4">Place Order</button>
                        </div>
                    </div>
                </form>
                <script>
                    document.getElementById('checkout-form').addEventListener('submit', function(e) {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        const data = Object.fromEntries(formData.entries());
                        
                        const order = {
                            customerEmail: data.email,
                            items: ${JSON.stringify(cart)},
                            total: ${total},
                            shippingAddress: ${needsShipping ? `{
                                name: data.name,
                                street: data.street,
                                city: data.city,
                                state: data.state,
                                zip: data.zip,
                                country: data.country
                            }` : 'undefined'}
                        };
                        window.parent.postMessage({ action: 'placeOrder', payload: order }, '*');
                    });
                </script>
            </div>
        `;
    } else if (previewState.type === 'order_success') {
         pageContent = `
            <div class="p-8 max-w-2xl mx-auto text-center">
                <div class="text-6xl mb-4">✅</div>
                <h2 class="text-3xl font-bold mb-4">Thank You!</h2>
                <p class="text-gray-400 mb-6">Your order has been placed successfully. A confirmation email has been sent to you.</p>
                <button data-action="navigate" data-id="home" class="px-8 py-3 font-semibold btn-primary">Continue Shopping</button>
            </div>
         `;
    }

    const fullHtml = `
      <html>
          <head>
              <script src="https://cdn.tailwindcss.com"></script>
               <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tailwindcss/typography@0.5.x/dist/typography.min.css">
              <style>
              @import url('https://fonts.googleapis.com/css2?family=${font.replace(' ', '+')}:wght@400;700;900&display=swap');
              html { scroll-behavior: smooth; }
              body { font-family: '${font}', sans-serif; }
              ${templateStyles}
              .prose img { 
                  margin-top: 1em;
                  margin-bottom: 1em;
                  border-radius: 0.5rem;
              }
              </style>
          </head>
          <body class="theme-${config.template}">
            ${navHtml}
            ${pageContent}
            ${cartScriptAndStyle}
            ${interactionScript}
          </body>
      </html>
    `;
    return fullHtml;
  }, [config, project?.name, previewState]);

  const handlePublish = () => {
    if (!context || !context.user) return;
    const planLimits: { [key: string]: number } = { Free: 1, Hobby: 3, Pro: 10, Enterprise: Infinity };
    const userPlan = context.user.plan;
    const onlineCount = context.projects.filter(p => p.hostingStatus === 'online' && p.id !== project?.id).length;

    if (onlineCount >= planLimits[userPlan]) {
        alert(`You have reached your publication limit of ${planLimits[userPlan]} for the ${userPlan} plan. Please upgrade to publish more projects.`);
        return;
    }
    setIsDeploying(true);
  };

  const onDeploySuccess = (url: string | null) => {
      if (!project) return;
      context?.updateProjectHosting(project.id, 'online', url);
  }

  const renderEditorDashboard = () => {
    if (!config || !currentPage) return null;
    
    switch (activeEditorTab) {
        case 'Analytics':
            return (
                <div className="space-y-6 animate-fade-in">
                    <h2 className="text-2xl font-bold">Site Analytics</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <AnalyticsStatCard title="Total Visits" value={analyticsData.totalVisits} change="+5.2%" changeType="increase" />
                        <AnalyticsStatCard title="Unique Visitors" value={analyticsData.uniqueVisitors} change="+3.1%" changeType="increase" />
                        <AnalyticsStatCard title="Orders" value={analyticsData.orders} change="-1.5%" changeType="decrease" />
                        <AnalyticsStatCard title="Conversion Rate" value={`${((analyticsData.orders / analyticsData.totalVisits) * 100).toFixed(2)}%`} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-2">Visits (Last 7 Days)</h3>
                        <AnalyticsChart data={analyticsData.visits} />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-card p-4 rounded-lg">
                            <h3 className="font-bold mb-2">Top Pages</h3>
                            <ul className="text-sm space-y-2">
                                {analyticsData.topPages.map(page => (
                                    <li key={page.name} className="flex justify-between">
                                        <span className="text-gray-300">{page.name}</span>
                                        <span className="font-semibold">{page.views} views</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="glass-card p-4 rounded-lg">
                            <h3 className="font-bold mb-2">Top Referrers</h3>
                             <ul className="text-sm space-y-2">
                                {analyticsData.referrers.map(ref => (
                                    <li key={ref.name} className="flex justify-between">
                                        <span className="text-gray-300">{ref.name}</span>
                                        <span className="font-semibold">{ref.visits} visits</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )
        case 'Design':
             return (
                 <div className="space-y-6 animate-fade-in">
                    <Section title="Theme Templates" description="Quickly change the overall look and feel of your site.">
                        <div className="flex gap-4">
                            <button onClick={() => handleThemeSelect('modern')} className={`w-full p-3 rounded-md transition ${config.template === 'modern' ? 'bg-primary' : 'bg-white/10'}`}>Modern</button>
                            <button onClick={() => handleThemeSelect('minimalist')} className={`w-full p-3 rounded-md transition ${config.template === 'minimalist' ? 'bg-primary' : 'bg-white/10'}`}>Minimalist</button>
                            <button onClick={() => handleThemeSelect('bold')} className={`w-full p-3 rounded-md transition ${config.template === 'bold' ? 'bg-primary' : 'bg-white/10'}`}>Bold</button>
                        </div>
                    </Section>
                    <Section title="Save as Template" description="Save your current design and configuration as a reusable template.">
                         <button onClick={handleSaveAsTemplate} className="w-full py-2 bg-primary/80 hover:bg-primary rounded-md font-semibold transition">Save Current Design as Template</button>
                    </Section>
                 </div>
            )
        case 'Settings':
            return (
                 <div className="space-y-6 animate-fade-in">
                    <Section title="SEO & Domains" description="Configure search engine optimization and link your custom domain." locked={!isProOrHigher}>
                        {/* TextInput is not defined here, let's create a local one */}
                        {React.createElement('input', { className: "w-full bg-white/5 p-2 rounded-md", placeholder: "Meta Title", value: config.seo.metaTitle, onChange: e => updateConfigValue(['seo', 'metaTitle'], e.target.value)})}
                        {React.createElement('input', { className: "w-full bg-white/5 p-2 rounded-md", placeholder: "Meta Description", value: config.seo.metaDescription, onChange: e => updateConfigValue(['seo', 'metaDescription'], e.target.value)})}
                        {React.createElement('input', { className: "w-full bg-white/5 p-2 rounded-md", placeholder: "your-domain.com", value: config.domain.customDomain, onChange: e => updateConfigValue(['domain', 'customDomain'], e.target.value)})}
                        {!isProOrHigher && <p className="text-xs text-yellow-400">Custom Domains are available on the Pro plan and higher.</p>}
                    </Section>
                 </div>
            );
        default:
            return <div className="animate-fade-in"><Section title="Content Editor"><p>Controls for "{activeEditorTab}" would go here.</p></Section></div>
    }
  }
  
  if (!project || !config) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>No project selected. <button onClick={() => context?.navigate(Page.DASHBOARD)} className="text-blue-500 hover:underline">Go to Dashboard</button></p>
      </div>
    );
  }

  const editorTabs: EditorTab[] = ['Content', 'Design', 'Store', 'Settings', 'Analytics'];

  return (
    <div className="flex flex-col h-screen bg-grid text-gray-200">
        <header className="flex justify-between items-center p-4 bg-black/30 backdrop-blur-lg border-b border-[var(--border-color)] flex-shrink-0 z-20">
            <div className="flex items-center gap-2">
                 <button onClick={() => context?.navigate(Page.DASHBOARD)} className="p-2 rounded-md hover:bg-white/10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                 </button>
                 <h1 className="text-xl font-bold truncate">Website Builder: <span className="text-primary">{project.name}</span></h1>
            </div>
             <div className="flex items-center gap-4">
                <button onClick={handlePublish} className="px-5 py-2 bg-green-600 rounded-lg font-semibold hover:bg-green-700 transition-transform transform hover:scale-105">Publish</button>
             </div>
        </header>
        <div className="flex flex-1 overflow-hidden">
            <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
                <div className="w-full md:w-2/5 lg:w-1/3 flex flex-col border-b md:border-b-0 md:border-r border-[var(--border-color)]">
                    <div className="p-2 border-b border-[var(--border-color)] overflow-x-auto">
                        <nav className="flex space-x-2" aria-label="Tabs">
                            {editorTabs.map(tab => (
                                 <button key={tab} onClick={() => setActiveEditorTab(tab)} className={`py-2 px-4 text-sm font-medium transition-colors whitespace-nowrap rounded-md ${activeEditorTab === tab ? 'bg-primary text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-white/10'}`}>{tab}</button>
                            ))}
                        </nav>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto">
                        {renderEditorDashboard()}
                    </div>
                </div>
                <div className="flex-1 p-4 overflow-y-auto bg-black/20">
                     <div className="w-full h-full bg-white rounded-lg shadow-lg">
                        <iframe 
                            srcDoc={websiteHtml} 
                            title="Website Preview" 
                            className="w-full h-full rounded-lg" 
                            sandbox="allow-scripts allow-modals allow-forms"
                        />
                     </div>
                </div>
            </main>
        </div>
        {isDeploying && <DeploymentModal project={project} onClose={() => setIsDeploying(false)} onDeploySuccess={onDeploySuccess} siteHtml={websiteHtml} />}
        {isGalleryOpen && <ImageGalleryModal onSelect={galleryContext === 'productImage' ? handleSelectImageForProduct : handleSelectImageForDescription} onClose={() => setGalleryOpen(false)} />}
        {context?.featureFlags.supportSystem && <SupportWidget />}
    </div>
  );
};

export default WebsiteBuilderPage;
