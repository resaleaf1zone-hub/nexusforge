
import React, { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import { Page, WebsiteTemplate } from '../types';
import { websiteTemplates } from '../services/websiteTemplates';

const TemplateCard: React.FC<{ template: WebsiteTemplate, onSelect: () => void }> = ({ template, onSelect }) => {
    return (
        <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 group transition-all duration-300 hover:border-primary hover:shadow-2xl hover:shadow-primary">
            <div className="overflow-hidden h-48">
                <img src={template.previewImageUrl} alt={template.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
            </div>
            <div className="p-4">
                <h3 className="text-xl font-bold">{template.name}</h3>
                <p className="text-sm text-gray-400 h-10 my-2">{template.description}</p>
                <div className="flex flex-wrap gap-2 my-3">
                    {template.tags.map(tag => (
                        <span key={tag} className={`px-2 py-1 text-xs font-semibold rounded-full ${tag === 'Custom' ? 'bg-purple-600/20 text-purple-400' : 'bg-primary/20 text-primary'}`}>{tag}</span>
                    ))}
                </div>
                <button onClick={onSelect} className="w-full mt-2 py-2 bg-primary rounded-md font-semibold hover:bg-primary-hover transition">
                    Select Template
                </button>
            </div>
        </div>
    );
};

const TemplateMarketplacePage: React.FC = () => {
    const context = useContext(AppContext);

    const handleSelectTemplate = (template: WebsiteTemplate) => {
        if (!context || !context.newProjectName) return;
        
        context.addProject({
            name: context.newProjectName,
            type: 'website',
            config: template.config,
        });

        context.setNewProjectName(null);
        context.navigate(Page.DASHBOARD);
    };
    
    const customTemplates = context?.customTemplates || [];

    return (
        <div className="min-h-screen bg-gray-900 animate-fade-in">
            <header className="flex justify-between items-center p-4 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
                <div className="text-center flex-grow">
                    <h1 className="text-2xl font-bold">Choose a Template for "{context?.newProjectName}"</h1>
                    <p className="text-gray-400 text-sm">Select a starting point for your new website.</p>
                </div>
                <button onClick={() => context?.navigate(Page.DASHBOARD)} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 rounded-md hover:bg-gray-700 transition">
                    &larr; Back to Dashboard
                </button>
            </header>
            <main className="p-8">
                 {customTemplates.length > 0 && (
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-center mb-6">Your Templates</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                           {customTemplates.map(template => (
                                <TemplateCard key={template.id} template={template} onSelect={() => handleSelectTemplate(template)} />
                            ))}
                        </div>
                    </div>
                )}
                
                <h2 className="text-3xl font-bold text-center mb-6">Featured Templates</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {websiteTemplates.map(template => (
                        <TemplateCard key={template.id} template={template} onSelect={() => handleSelectTemplate(template)} />
                    ))}
                </div>
            </main>
        </div>
    );
};

export default TemplateMarketplacePage;
