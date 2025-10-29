import React, { useState, useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import { Plan } from '../types';

interface PaymentModalProps {
    plan: Plan;
    cycle: 'monthly' | 'yearly';
    onClose: () => void;
    onSuccess: () => void;
    onLoginInfo: (details: {username: string, email: string, password: string, plan: Plan}) => void;
}

const planDetails = {
    Hobby: { monthly: '$3.99/mo', yearly: '$39.99/yr', color: 'text-cyan-400' },
    Pro: { monthly: '$11.99/mo', yearly: '$119.99/yr', color: 'text-primary' },
    Enterprise: { price: 'Custom Pricing', color: 'text-purple-400' },
    Free: { price: '$0', color: 'text-gray-400'}
}

const PaymentModal: React.FC<PaymentModalProps> = ({ plan, cycle, onClose, onSuccess, onLoginInfo }) => {
    const context = useContext(AppContext);
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState('');

    // Form state for new user signup through payment
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const handlePayment = () => {
        if (!context?.user) {
            if (!username.trim() || !email.trim() || !password.trim()) {
                alert("Please fill out your new account details before proceeding.");
                return;
            }
        }

        setIsProcessing(true);
        setMessage('Processing payment...');
        setTimeout(() => {
            setMessage('Payment successful!');
            setTimeout(() => {
                if(context?.user) {
                    onSuccess();
                } else {
                    onLoginInfo({username, email, password, plan});
                }
            }, 1000);
        }, 1500);
    };

    const isNewUserFlow = !context?.user;

    const details = planDetails[plan];
    const displayPrice = 'price' in details ? details.price : details[cycle];


    return (
         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-primary/30 sm:animate-slide-in-top animate-slide-in-bottom" onClick={e => e.stopPropagation()}>
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Upgrade to <span className={details.color}>{plan}</span></h2>
                    <p className="text-4xl font-extrabold my-2">{displayPrice}</p>
                    <p className="text-gray-400 text-sm">You are about to subscribe to the {plan} plan.</p>
                </div>

                {isProcessing ? (
                    <div className="flex flex-col items-center justify-center h-48">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        <p className="mt-4 text-gray-300">{message}</p>
                    </div>
                ) : (
                    <>
                        {isNewUserFlow && (
                             <div className="space-y-4 mb-6">
                                <h3 className="font-semibold text-lg text-center">Create Your Account</h3>
                                <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required className="w-full bg-gray-700 p-3 rounded-md focus:ring-2 focus:ring-primary outline-none" />
                                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-gray-700 p-3 rounded-md focus:ring-2 focus:ring-primary outline-none" />
                                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-gray-700 p-3 rounded-md focus:ring-2 focus:ring-primary outline-none" />
                            </div>
                        )}

                        <div className="space-y-3">
                            <button onClick={handlePayment} className="w-full flex items-center justify-center p-3 bg-gray-700 rounded-md hover:bg-gray-600 transition">
                                💳 &nbsp; Pay with Credit Card
                            </button>
                             <button onClick={handlePayment} className="w-full flex items-center justify-center p-3 bg-gray-700 rounded-md hover:bg-gray-600 transition">
                                <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor"><path fill="#0070BA" d="M4.42 4.624h15.16c.38 0 .7.234.82.583l-2.66 9.176a.546.546 0 01-.527.421H7.838a.545.545 0 01-.527-.421L4.64 5.207a.545.545 0 00-.527-.421H2.42c-.44 0-.8-.358-.8-.8s.36-.8.8-.8h1.696c.38 0 .7.234.82.583L5.34 6.13a.545.545 0 01.527.421l.004.016L7.38 12.8h8.528l2.06-7.104H5.908a.545.545 0 00-.527.421L4.42 4.624z"/><path fill="#0095DA" d="M4.45 4.043h15.1c.398 0 .72.246.832.613l2.66 9.176A.574.574 0 0122.515 14.25H7.855a.574.574 0 01-.555-.443L4.66 4.656a.574.574 0 00-.555-.443H2.438c-.463 0-.838-.376-.838-.838s.375-.837.838-.837h1.66c.398 0 .72.246.832.613l.403 1.39a.574.574 0 01.554.443l.005.016 1.503 6.223h8.512l2.06-7.104H5.925a.574.574 0 00-.555.443L4.45 4.043z"/><path fill="#002E82" d="M8.98 16.324c.092-.246.34-.413.613-.413h6.815a.574.574 0 01.554.717l-1.024 3.528a.574.574 0 01-.554.443H7.57a.574.574 0 01-.554-.717l1.024-3.528a.574.574 0 01-.22-.03z"/></svg>
                                Pay with PayPal
                            </button>
                            <div className="grid grid-cols-2 gap-3">
                                 <button onClick={handlePayment} className="w-full flex items-center justify-center p-3 bg-black text-white rounded-md hover:bg-gray-900 transition">
                                    <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M12 10.3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6.3c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm-6-8c0-3.3 2.7-6 6-6v2c-2.2 0-4 1.8-4 4s1.8 4 4 4v2c-3.3 0-6-2.7-6-6z"/></svg>
                                    Google Pay
                                </button>
                                 <button onClick={handlePayment} className="w-full flex items-center justify-center p-3 bg-black text-white rounded-md hover:bg-gray-900 transition">
                                     <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M10.7,6.2C10.7,6.2,10.7,6.2,10.7,6.2C10.7,6.2,10.7,6.2,10.7,6.2c-1.8,0-3.5,0.7-4.8,2C4.6,9.5,4.3,11,4.3,12.6c0,2.1,1.1,3.9,2.9,5c0.8,0.5,1.7,0.8,2.6,0.8c0.8,0,1.6-0.2,2.3-0.6c0.1,0,0.1,0,0.2,0c0.6-0.3,1-0.6,1.5-1.1c-1-1.3-1.6-2.9-1.6-4.7c0-2.3,1.1-4.2,2.8-5.4C14.4,6.5,13.7,6.2,13,6.2C12.2,6.2,12.2,6.2,10.7,6.2z M13.3,4.9c0.7,0,1.4-0.1,2-0.4c-0.8-1-1.9-1.7-3.1-2c-0.3,0-0.6,0-0.8,0c-1.4,0-2.8,0.5-3.8,1.5c-1.1,1-1.7,2.4-1.7,3.9c0,0.4,0,0.8,0.1,1.2c0.3-2,1.8-3.5,3.8-3.8C11.5,4.9,12.4,4.9,13.3,4.9z"/></svg>
                                    Apple Pay
                                </button>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-full text-center text-xs text-gray-500 mt-4 hover:text-gray-400">Cancel</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentModal;