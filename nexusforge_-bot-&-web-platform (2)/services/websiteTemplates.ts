import type { WebsiteTemplate, WebsiteConfig } from '../types';

const defaultEcommerceConfig: WebsiteConfig['ecommerce'] = {
    enabled: true, 
    stripePublicKey: '', 
    stripeSecretKey: '',
    enabledGateways: { stripe: true, paypal: true, crypto: false },
    cart: { enabled: true },
    discounts: [{ id: 'd1', code: 'NEXUS10', type: 'percentage', value: 10 }],
    shippingOptions: [
        { id: 's1', name: 'Standard', price: 4.99 },
        { id: 's2', name: 'Express', price: 14.99 },
    ]
};

export const websiteTemplates: WebsiteTemplate[] = [
    {
        id: 'quantum',
        name: 'Quantum',
        description: 'A sleek, modern, dark-themed template perfect for tech gadgets and electronics.',
        previewImageUrl: 'https://images.unsplash.com/photo-155074mas165-9bc0b252726a?q=80&w=800',
        tags: ['E-commerce', 'Tech', 'Dark', 'Modern'],
        config: {
            theme: { primaryColor: '#3b82f6', secondaryColor: '#1f2937', font: 'Inter' },
            template: 'modern',
            productPageLayout: 'image-left',
            seo: { 
                metaTitle: 'Quantum Tech Store', 
                metaDescription: 'The latest in tech gadgets and electronics.',
                faviconUrl: 'https://cdn-icons-png.flaticon.com/512/8106/8106114.png' 
            },
            domain: { customDomain: '', status: 'unlinked' },
            pages: [{ 
                id: 'home', title: 'Home', path: '/', 
                sections: {
                    hero: { enabled: true, order: 1, title: 'Welcome to Quantum', subtitle: 'Discover the future of technology.', cta: 'Shop Now' },
                    products: { enabled: true, order: 2, title: 'Featured Products' },
                    about: { enabled: false, order: 3, title: 'About Us', content: 'We are a company dedicated to selling the best things.' },
                    contact: { enabled: false, order: 4, title: 'Contact Us', email: 'contact@example.com', phone: '123-456-7890' },
                    footer: { enabled: true, order: 5, text: '© 2024 Quantum. All rights reserved.' }
                }
            }],
            products: [
                { id: 'prod_1', name: 'Astro-Gears', price: 199.99, productType: 'physical', imageUrl: 'https://images.unsplash.com/photo-1518314916381-77a37c2a49ae?q=80&w=800&auto=format&fit=crop', description: 'High-performance mechanical gears for astrogation units.', categoryId: 'cat_1' },
                { id: 'prod_2', name: 'Cyber-Core License', price: 499.99, salePrice: 449.99, productType: 'digital', imageUrl: 'https://images.unsplash.com/photo-1620282433428-b1416757c913?q=80&w=800&auto=format&fit=crop', description: 'A quantum-entangled processor license for advanced AI.', categoryId: 'cat_1' },
                { id: 'prod_3', name: 'Retro Gaming Console', price: 89.99, productType: 'physical', imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726a?q=80&w=800&auto=format&fit=crop', description: 'Classic gaming experience, reimagined.', categoryId: 'cat_2' }
            ],
            categories: [{id: 'cat_1', name: 'Processors'}, {id: 'cat_2', name: 'Gaming'}],
            subcategories: [],
            ecommerce: defaultEcommerceConfig,
            orders: [],
            customCss: '', customHtml: '', customJs: '',
        }
    },
    {
        id: 'serene',
        name: 'Serene',
        description: 'A clean, minimalist, light-themed template for portfolios, blogs, or artisan shops.',
        previewImageUrl: 'https://images.unsplash.com/photo-1491975474562-1f4e30bc9468?q=80&w=800',
        tags: ['Minimalist', 'Light', 'Portfolio', 'Blog'],
        config: {
            theme: { primaryColor: '#10b981', secondaryColor: '#f9fafb', font: 'Roboto' },
            template: 'minimalist',
            productPageLayout: 'image-top',
            seo: { metaTitle: 'Serene Creations', metaDescription: 'Handcrafted goods and articles.', faviconUrl: '' },
            domain: { customDomain: '', status: 'unlinked' },
            pages: [{ 
                id: 'home', title: 'Home', path: '/', 
                sections: {
                    hero: { enabled: true, order: 1, title: 'Simplicity & Elegance', subtitle: 'Handcrafted goods for a mindful life.', cta: 'Explore' },
                    products: { enabled: true, order: 2, title: 'Our Collection' },
                    about: { enabled: true, order: 3, title: 'Our Story', content: 'We believe in the power of simplicity and quality craftsmanship.' },
                    contact: { enabled: false, order: 4, title: 'Contact Us', email: 'contact@example.com', phone: '123-456-7890' },
                    footer: { enabled: true, order: 5, text: '© 2024 Serene. All rights reserved.' }
                }
            }],
            products: [
                { id: 'p1', name: 'Ceramic Vase', price: 45.00, productType: 'physical', imageUrl: 'https://images.unsplash.com/photo-1525944322196-216a97e065a3?q=80&w=800', description: 'A beautiful, handcrafted ceramic vase.', categoryId: 'c1' },
                { id: 'p2', name: 'E-Book: The Art of Zen', price: 19.99, productType: 'digital', imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800', description: 'A digital guide to mindful living and design.', categoryId: 'c1' },
            ],
            categories: [{id: 'c1', name: 'Homeware'}],
            subcategories: [],
            ecommerce: defaultEcommerceConfig,
            orders: [],
            customCss: '', customHtml: '', customJs: '',
        }
    },
    {
        id: 'ember',
        name: 'Ember',
        description: 'A bold and vibrant template ideal for restaurants, cafes, or food blogs.',
        previewImageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800',
        tags: ['Bold', 'Food', 'Restaurant', 'Vibrant'],
        config: {
            theme: { primaryColor: '#ef4444', secondaryColor: '#111827', font: 'Poppins' },
            template: 'bold',
            productPageLayout: 'image-left',
            seo: { metaTitle: 'Ember Grill', metaDescription: 'Taste the flame.', faviconUrl: '' },
            domain: { customDomain: '', status: 'unlinked' },
            pages: [{ 
                id: 'home', title: 'Home', path: '/', 
                sections: {
                    hero: { enabled: true, order: 1, title: 'EMBER GRILL', subtitle: 'Where Fire Meets Flavor.', cta: 'View Menu' },
                    products: { enabled: true, order: 2, title: 'Signature Dishes' },
                    about: { enabled: false, order: 3, title: 'About Us', content: 'We are a company dedicated to selling the best things.' },
                    contact: { enabled: true, order: 4, title: 'Reservations', email: 'book@ember.com', phone: '123-555-7890' },
                    footer: { enabled: true, order: 5, text: '© 2024 Ember Grill. All rights reserved.' }
                }
            }],
            products: [
                { id: 'd1', name: 'Flame-Grilled Steak', price: 32.50, salePrice: 28.00, productType: 'physical', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800', description: 'Aged to perfection and grilled over an open flame.', categoryId: 'mains' },
                { id: 'd2', name: 'Gourmet Spice Rub', price: 16.00, productType: 'physical', imageUrl: 'https://images.unsplash.com/photo-1600742444738-9e0c72b2a8d3?q=80&w=800', description: 'Take home the signature taste of Ember Grill.', categoryId: 'starters' },
            ],
            categories: [{id: 'mains', name: 'Mains'}, {id: 'starters', name: 'Starters'}],
            subcategories: [],
            ecommerce: defaultEcommerceConfig,
            orders: [],
            customCss: '', customHtml: '', customJs: '',
        }
    },
];