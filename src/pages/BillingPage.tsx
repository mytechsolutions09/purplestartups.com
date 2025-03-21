import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { CreditCard, DollarSign, Clock, Plus, Loader, AlertTriangle, CheckCircle, XCircle, Zap, Star, Building } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

interface PaymentMethod {
  id: string;
  last4: string;
  brand: string;
  exp_month: number;
  exp_year: number;
  isDefault: boolean;
}

interface BillingHistory {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  invoice_url?: string;
}

interface Subscription {
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  current_period_end: string;
  cancel_at_period_end: boolean;
  billing_cycle: 'monthly' | 'annually';
}

interface PlanFeature {
  name: string;
  included: boolean;
}

interface PricingPlan {
  id: 'free' | 'pro' | 'enterprise';
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  annualSavings: number;
  features: PlanFeature[];
  icon: React.ReactNode;
}

const BillingPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [isChangingPlan, setIsChangingPlan] = useState(false);

  const pricingPlans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Basic',
      description: 'For solo entrepreneurs and startups',
      monthlyPrice: 0,
      annualPrice: 0,
      annualSavings: 0,
      icon: <Zap className="h-6 w-6 text-gray-500" />,
      features: [
        { name: 'AI Startup Generator', included: true },
        { name: 'Basic Business Plan Templates', included: true },
        { name: 'Market Research Tools', included: true },
        { name: 'Email Support', included: true },
        { name: '1 User', included: true },
        { name: '2 Projects per month', included: true },
        { name: 'Community Access', included: true },
        { name: 'Advanced AI Analysis', included: false },
        { name: 'Custom Business Plans', included: false },
        { name: 'Financial Projections', included: false },
        { name: 'Priority Support', included: false }
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Ideal for growing businesses and teams',
      monthlyPrice: 19.99,
      annualPrice: 16.67,
      annualSavings: 39.89,
      icon: <Star className="h-6 w-6 text-indigo-500" />,
      features: [
        { name: 'Everything in Basic, plus:', included: true },
        { name: 'Advanced AI Analysis', included: true },
        { name: 'Custom Business Plans', included: true },
        { name: 'Financial Projections', included: true },
        { name: 'Priority Support', included: true },
        { name: 'All Apps Included', included: true },
        { name: '2 Team Members', included: true },
        { name: '10 Projects', included: true },
        { name: 'Custom Branding', included: true },
        { name: 'Dedicated Account Manager', included: false },
        { name: 'Custom AI Models', included: false }
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large organizations and agencies',
      monthlyPrice: 49.99,
      annualPrice: 41.67,
      annualSavings: 99.89,
      icon: <Building className="h-6 w-6 text-purple-500" />,
      features: [
        { name: 'Everything in Pro, plus:', included: true },
        { name: '50 Projects', included: true },
        { name: 'Dedicated Account Manager', included: true },
        { name: 'Custom AI Models', included: true },
        { name: 'Enterprise Analytics', included: true },
        { name: 'SLA Support', included: true },
        { name: 'Unlimited Team Members', included: true },
        { name: 'White Label Options', included: true },
        { name: 'Custom Integrations', included: true },
        { name: 'Training Sessions', included: true }
      ]
    }
  ];

  // Mock data for demo purposes
  useEffect(() => {
    if (user) {
      // Simulate API call to fetch billing data
      setTimeout(() => {
        setSubscription({
          plan: 'pro',
          status: 'active',
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cancel_at_period_end: false,
          billing_cycle: 'annually'
        });
        
        setPaymentMethods([{
          id: 'pm_123456789',
          last4: '4242',
          brand: 'Visa',
          exp_month: 12,
          exp_year: 2024,
          isDefault: true
        }]);
        
        setBillingHistory([
          {
            id: 'in_1234',
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            amount: 199.99,
            status: 'paid',
            invoice_url: '#'
          },
          {
            id: 'in_1235',
            date: new Date().toISOString(),
            amount: 199.99,
            status: 'paid',
            invoice_url: '#'
          }
        ]);
        
        setIsLoading(false);
      }, 1000);
    }
  }, [user]);

  const handleAddPaymentMethod = () => {
    setIsAddingPayment(true);
    // This would typically open a Stripe Elements or similar payment form
    // For demo purposes, we'll just simulate it
    setTimeout(() => {
      setPaymentMethods([
        ...paymentMethods,
        {
          id: 'pm_new' + Date.now(),
          last4: '5678',
          brand: 'Mastercard',
          exp_month: 11,
          exp_year: 2025,
          isDefault: false
        }
      ]);
      setIsAddingPayment(false);
    }, 2000);
  };

  const handleSetDefaultPayment = (id: string) => {
    setPaymentMethods(
      paymentMethods.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
  };

  const handleRemovePaymentMethod = (id: string) => {
    setPaymentMethods(
      paymentMethods.filter(method => method.id !== id)
    );
  };

  const handleCancelSubscription = () => {
    if (subscription) {
      setSubscription({
        ...subscription,
        cancel_at_period_end: true
      });
    }
  };

  const handleResumeSubscription = () => {
    if (subscription) {
      setSubscription({
        ...subscription,
        cancel_at_period_end: false
      });
    }
  };

  const handleChangePlan = (planId: 'free' | 'pro' | 'enterprise') => {
    setIsChangingPlan(true);
    setTimeout(() => {
      setSubscription({
        ...subscription!,
        plan: planId
      });
      setIsChangingPlan(false);
    }, 1500);
  };

  const handleChangeBillingCycle = (cycle: 'monthly' | 'annually') => {
    setIsChangingPlan(true);
    setTimeout(() => {
      setSubscription({
        ...subscription!,
        billing_cycle: cycle
      });
      setIsChangingPlan(false);
    }, 1000);
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const currentPlan = pricingPlans.find(plan => plan.id === subscription?.plan);
  
  const nextBillingDate = subscription
    ? formatDate(subscription.current_period_end)
    : '';

  const currentPrice = subscription?.billing_cycle === 'annually'
    ? currentPlan?.annualPrice
    : currentPlan?.monthlyPrice;

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-6">Billing & Subscription</h2>
      
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
            <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {/* Current Plan */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-indigo-800 flex items-center">
                <DollarSign className="h-5 w-5 text-indigo-500 mr-2" />
                Current Plan
              </h3>
              
              {subscription?.cancel_at_period_end && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Canceling on {nextBillingDate}
                </span>
              )}
            </div>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <div className="sm:flex sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center">
                  {currentPlan?.icon}
                  <h4 className="ml-2 text-xl font-bold text-gray-900">{currentPlan?.name}</h4>
                  
                  {currentPlan?.id !== 'free' && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {subscription?.billing_cycle === 'annually' ? 'Annual' : 'Monthly'}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">{currentPlan?.description}</p>
                
                {currentPlan?.id !== 'free' && (
                  <p className="mt-2 text-sm text-gray-600">
                    {subscription?.billing_cycle === 'annually' ? (
                      <>
                        <span className="font-semibold">{formatCurrency(currentPlan.annualPrice!)}</span> per month, billed annually.
                        <span className="ml-1 text-green-600">
                          You save {formatCurrency(currentPlan.annualSavings!)} per year.
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="font-semibold">{formatCurrency(currentPlan.monthlyPrice!)}</span> per month, billed monthly.
                      </>
                    )}
                  </p>
                )}
                
                <p className="mt-2 text-sm text-gray-600">
                  Next billing date: <span className="font-medium">{nextBillingDate}</span>
                </p>
                
                {subscription?.cancel_at_period_end && (
                  <p className="mt-2 text-sm text-red-600">
                    Your subscription will end on {nextBillingDate}.
                  </p>
                )}
                
                <div className="mt-4 flex flex-wrap gap-2">
                  {currentPlan?.id !== 'free' && (
                    <div className="mt-4 space-x-3">
                      {subscription?.billing_cycle === 'monthly' && (
                        <button
                          type="button"
                          onClick={() => handleChangeBillingCycle('annually')}
                          disabled={isChangingPlan}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                        >
                          {isChangingPlan ? (
                            <Loader className="animate-spin h-4 w-4 mr-2" />
                          ) : null}
                          Switch to Annual Billing
                          <span className="ml-1 text-green-600">(Save {formatCurrency(currentPlan.annualSavings!)})</span>
                        </button>
                      )}
                      
                      {subscription?.billing_cycle === 'annually' && (
                        <button
                          type="button"
                          onClick={() => handleChangeBillingCycle('monthly')}
                          disabled={isChangingPlan}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                        >
                          {isChangingPlan ? (
                            <Loader className="animate-spin h-4 w-4 mr-2" />
                          ) : null}
                          Switch to Monthly Billing
                        </button>
                      )}
                    </div>
                  )}
                  
                  {subscription?.cancel_at_period_end ? (
                    <button
                      type="button"
                      onClick={handleResumeSubscription}
                      className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Resume Subscription
                    </button>
                  ) : (
                    <>
                      {currentPlan?.id !== 'free' && (
                        <button
                          type="button"
                          onClick={handleCancelSubscription}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                        >
                          <XCircle className="h-4 w-4 mr-2 text-red-500" />
                          Cancel Subscription
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex-shrink-0 sm:flex sm:items-center">
                <div className="mt-3 rounded-md shadow sm:mt-0">
                  <button
                    type="button"
                    onClick={() => {
                      const plansModal = document.getElementById('change-plan-modal');
                      if (plansModal) {
                        plansModal.classList.remove('hidden');
                      }
                    }}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                  >
                    Change Plan
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Your Plan Features</h4>
              <ul className="space-y-2">
                {currentPlan?.features
                  .filter(feature => feature.included)
                  .map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature.name}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Payment Methods */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <CreditCard className="h-5 w-5 text-indigo-500 mr-2" />
              Payment Methods
            </h3>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            {paymentMethods.length === 0 ? (
              <div className="text-center py-6">
                <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No payment methods</h3>
                <p className="mt-1 text-sm text-gray-500">Add a payment method to manage your subscription.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {paymentMethods.map((method) => (
                  <li key={method.id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-4">
                        {method.brand === 'Visa' ? (
                          <div className="w-10 h-6 bg-blue-600 rounded text-white flex items-center justify-center text-xs font-bold">VISA</div>
                        ) : method.brand === 'Mastercard' ? (
                          <div className="w-10 h-6 bg-red-600 rounded text-white flex items-center justify-center text-xs font-bold">MC</div>
                        ) : (
                          <div className="w-10 h-6 bg-gray-200 rounded flex items-center justify-center text-xs font-bold text-gray-600">{method.brand.substring(0, 4).toUpperCase()}</div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {method.brand} ending in {method.last4}
                        </p>
                        <p className="text-xs text-gray-500">
                          Expires {method.exp_month}/{method.exp_year}
                          {method.isDefault && ' (Default)'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {!method.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleSetDefaultPayment(method.id)}
                          className="text-xs text-indigo-600 hover:text-indigo-500"
                        >
                          Set as default
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemovePaymentMethod(method.id)}
                        className="text-xs text-red-600 hover:text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            
            <div className="mt-6">
              <button
                type="button"
                onClick={handleAddPaymentMethod}
                disabled={isAddingPayment}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isAddingPayment ? (
                  <Loader className="animate-spin h-4 w-4 mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Add Payment Method
              </button>
            </div>
          </div>
        </div>
        
        {/* Billing History */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <Clock className="h-5 w-5 text-indigo-500 mr-2" />
              Billing History
            </h3>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            {billingHistory.length === 0 ? (
              <div className="text-center py-6">
                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No billing history</h3>
                <p className="mt-1 text-sm text-gray-500">Your billing history will appear here when you make a payment.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {billingHistory.map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(invoice.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(invoice.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                            invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          {invoice.invoice_url && (
                            <a href={invoice.invoice_url} className="text-indigo-600 hover:text-indigo-500">
                              Download
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Change Plan Modal (Hidden by default) */}
      <div id="change-plan-modal" className="hidden fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Select a Plan</h3>
            <button 
              type="button" 
              onClick={() => {
                const plansModal = document.getElementById('change-plan-modal');
                if (plansModal) {
                  plansModal.classList.add('hidden');
                }
              }}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {pricingPlans.map((plan) => (
                <div 
                  key={plan.id}
                  className={`relative rounded-lg border ${
                    subscription?.plan === plan.id
                      ? 'border-indigo-500 ring-2 ring-indigo-500'
                      : 'border-gray-300'
                  } bg-white p-6 shadow-sm focus:outline-none`}
                >
                  {subscription?.plan === plan.id && (
                    <div className="absolute -top-2 -right-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        Current Plan
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    {plan.icon}
                    <h3 className="ml-2 text-lg font-medium text-gray-900">{plan.name}</h3>
                  </div>
                  
                  <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
                  
                  <div className="mt-4">
                    {plan.id === 'free' ? (
                      <p className="text-2xl font-bold text-gray-900">Free</p>
                    ) : (
                      <div>
                        <div className="flex items-baseline">
                          <p className="text-2xl font-bold text-gray-900">${plan.annualPrice}</p>
                          <p className="ml-1 text-sm font-medium text-gray-500">/mo</p>
                        </div>
                        <p className="text-sm text-gray-500">billed annually</p>
                        <p className="text-xs text-green-600 mt-1">Save ${plan.annualSavings} annually</p>
                      </div>
                    )}
                  </div>
                  
                  <ul className="mt-6 space-y-4">
                    {plan.features.slice(0, 6).map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature.name}</span>
                      </li>
                    ))}
                    {plan.features.length > 6 && (
                      <li className="text-sm text-gray-600 pl-7">
                        +{plan.features.length - 6} more features
                      </li>
                    )}
                  </ul>
                  
                  <div className="mt-6">
                    {subscription?.plan === plan.id ? (
                      <button
                        type="button"
                        disabled
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-300 cursor-not-allowed"
                      >
                        Current Plan
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          handleChangePlan(plan.id);
                          const plansModal = document.getElementById('change-plan-modal');
                          if (plansModal) {
                            plansModal.classList.add('hidden');
                          }
                        }}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                      >
                        {isChangingPlan ? (
                          <Loader className="animate-spin h-4 w-4 mr-2" />
                        ) : null}
                        {plan.id === 'free' ? 'Downgrade' : subscription?.plan === 'free' ? 'Upgrade' : plan.id === 'enterprise' ? 'Upgrade' : 'Downgrade'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPage; 