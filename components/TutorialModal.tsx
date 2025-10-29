import React, { useState } from 'react';

const steps = [
  {
    icon: '🚀',
    title: 'Welcome to NexusForge!',
    description: "Your all-in-one platform to create Discord bots and websites with ease. Let's get you started in a few simple steps."
  },
  {
    icon: '➕',
    title: 'Create Your First Project',
    description: "Click the '+ New Project' button on your dashboard. You can choose to build a powerful Discord bot or a stunning website."
  },
  {
    icon: '🎨',
    title: 'Use the Builder',
    description: "Once created, open your project in its builder. Here you can configure features, customize appearances, and generate the final code or site."
  },
  {
    icon: '☁️',
    title: 'Deploy to the Cloud',
    description: "When you're ready, hit 'Deploy' or 'Publish'. We'll simulate a live deployment, and your project will be online in moments!"
  }
];

const TutorialModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-primary/30 animate-slide-in-top" onClick={e => e.stopPropagation()}>
        <div className="text-center">
          <div className="text-6xl mb-4">{step.icon}</div>
          <h2 className="text-2xl font-bold mb-2 text-white">{step.title}</h2>
          <p className="text-gray-400 mb-6">{step.description}</p>
        </div>

        <div className="flex justify-center items-center my-4">
          {steps.map((_, index) => (
            <div key={index} className={`h-2 w-2 rounded-full mx-1 transition-all ${index === currentStep ? 'bg-primary scale-125' : 'bg-gray-600'}`}></div>
          ))}
        </div>
        
        <button 
          onClick={nextStep} 
          className="w-full py-3 mt-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-transform transform hover:scale-105"
        >
          {currentStep === steps.length - 1 ? "Let's Go!" : "Next"}
        </button>
        
        {currentStep < steps.length - 1 && (
          <button onClick={onClose} className="w-full text-center text-xs text-gray-500 mt-3 hover:text-gray-400">
            Skip Tutorial
          </button>
        )}
      </div>
    </div>
  );
};

export default TutorialModal;