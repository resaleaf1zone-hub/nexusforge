import React, { useState, useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import { Plan } from '../types';

const CheckIcon = () => (
    <svg className="w-5 h-5 mr-2 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
);

const PlanCard: React.FC<{ plan: Plan, price: string, priceSubtitle: string, features: string[], onSelect: (plan: Plan) => void, popular?: boolean }> = ({ plan, price, priceSubtitle, features, onSelect, popular }) => (
    <div className={`relative bg-gray-800/50 border border-gray-700 p-6 rounded-lg flex flex-col hover:border-primary transition-all duration-300 transform hover:-translate-y-2 ${popular ? 'border-primary shadow-lg shadow-primary' : ''}`}>
        {popular && <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">POPULAR</div>}
        <h3 className="text-2xl font-bold text-center text-white">{plan}</h3>
        <p className="text-4xl font-extrabold text-center my-4">{price}<span className="text-base font-medium text-gray-400">{priceSubtitle}</span></p>
        <ul className="space-y-3 text-sm text-gray-300">
            {features.map((feature, i) => (
                <li key={i} className="flex items-start"><CheckIcon /> {feature}</li>
            ))}
        </ul>
        <button onClick={() => onSelect(plan)} className={`w-full mt-auto py-2 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${popular ? 'bg-primary hover:bg-primary-hover text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}>
            {plan === 'Free' ? 'Get Started' : 'Choose Plan'}
        </button>
    </div>
);


const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const context = useContext(AppContext);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && email.trim() && password) {
      context?.login(username.trim(), email.trim(), password);
    }
  };

  const handlePlanSelect = (plan: Plan) => {
    if (plan === 'Free') {
        alert("Please fill out the form above to create your free account!");
    } else {
        context?.upgradePlan(plan, billingCycle);
    }
  }

  const BillingToggle: React.FC<{ cycle: 'monthly' | 'yearly', setCycle: (cycle: 'monthly' | 'yearly') => void }> = ({ cycle, setCycle }) => (
    <div className="flex justify-center items-center space-x-4 mb-8 text-sm">
        <span className={`font-medium transition-colors ${cycle === 'monthly' ? 'text-white' : 'text-gray-400'}`}>Monthly</span>
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={cycle === 'yearly'} onChange={() => setCycle(cycle === 'monthly' ? 'yearly' : 'monthly')} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
        <span className={`font-medium transition-colors ${cycle === 'yearly' ? 'text-white' : 'text-gray-400'}`}>
            Yearly <span className="text-xs text-green-400">(Save ~16%)</span>
        </span>
    </div>
);

  return (
    <div className="flex items-center justify-center min-h-screen bg-grid-gray-700/[0.2] py-12 px-4 sm:px-6 lg:px-8 snow-bg">
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-gray-900 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div className="w-full max-w-7xl mx-auto z-10">
        <div className="w-full max-w-md mx-auto p-8 space-y-8 bg-gray-900/80 backdrop-blur-sm border border-primary/30 rounded-2xl shadow-2xl shadow-primary animate-slide-in-top">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-100 seasonal-header">
                    Nexus<span className="text-primary">Forge</span>
                </h1>
                <p className="mt-2 text-gray-400">Your portal to creation. Login or create an account.</p>
            </div>
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username" className="text-sm font-medium text-gray-400">
                    Username
                    </label>
                    <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-1 block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
                    placeholder="enter_your_handle"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="text-sm font-medium text-gray-400">
                    Email
                    </label>
                    <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
                    placeholder="your@email.com"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="text-sm font-medium text-gray-400">
                    Password
                    </label>
                    <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
                    placeholder="••••••••"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-primary transition-transform transform hover:scale-105"
                >
                    Access Platform
                </button>
            </form>
        </div>
        
        <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Plans & Pricing</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">Choose a plan that fits your creative needs. Unlock powerful features and bring your ideas to life.</p>
            <BillingToggle cycle={billingCycle} setCycle={setBillingCycle} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                <PlanCard
                    plan="Free"
                    price="$0"
                    priceSubtitle=""
                    features={[
                        "2 Projects",
                        "1 Published Project",
                        "Basic Bot Modules",
                        "Basic Website Templates",
                        "Community Support",
                    ]}
                    onSelect={handlePlanSelect}
                />
                <PlanCard
                    plan="Hobby"
                    price={billingCycle === 'monthly' ? '$3.99' : '$39.99'}
                    priceSubtitle={billingCycle === 'monthly' ? '/mo' : '/yr'}
                    features={[
                        "5 Projects",
                        "3 Published Projects",
                        "Most Bot Modules",
                        "All Website Templates",
                        "Community Support",
                    ]}
                    onSelect={handlePlanSelect}
                />
                <PlanCard
                    plan="Pro"
                    price={billingCycle === 'monthly' ? '$11.99' : '$119.99'}
                    priceSubtitle={billingCycle === 'monthly' ? '/mo' : '/yr'}
                    features={[
                        "15 Projects",
                        "10 Published Projects",
                        "All Premium Bot Modules",
                        "Advanced Website Customization",
                        "Custom Domains",
                        "Priority Email Support"
                    ]}
                    popular
                    onSelect={handlePlanSelect}
                />
                <PlanCard
                    plan="Enterprise"
                    price="Contact Us"
                    priceSubtitle=""
                    features={[
                        "Unlimited Project Creation",
                        "Unlimited Published Projects",
                        "Team Collaboration",
                        "Custom Integrations",
                        "Dedicated Support",
                    ]}
                    onSelect={handlePlanSelect}
                />
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;