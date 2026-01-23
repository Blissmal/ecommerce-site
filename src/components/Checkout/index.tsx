"use client";
import React, { useState, useEffect, useRef } from "react";
import { useAppSelector } from "@/redux/store";
import { useSelector } from "react-redux";
import { selectTotalPrice } from "@/redux/features/cart-slice";
import Breadcrumb from "../Common/Breadcrumb";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";

const Checkout = ({ userId }: { userId: string }) => {
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const totalPrice = useSelector(selectTotalPrice);
  const searchParams = useSearchParams();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Form state matching your database schema
  const [formData, setFormData] = useState({
    billingName: '',
    billingEmail: '',
    phoneNumber: '',
    billingAddress: '',
    orderNotes: ''
  });

  /**
   * Cleanup function to stop polling
   */
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  /**
   * Check payment status on page load (handles refresh scenario)
   */
  useEffect(() => {
    const checkInitialStatus = async () => {
      // Check if there's a checkoutRequestID in URL or localStorage
      const urlCheckoutId = searchParams.get('checkoutRequestID');
      const storedCheckoutId = localStorage.getItem('pendingCheckoutRequestID');
      const checkoutId = urlCheckoutId || storedCheckoutId;

      if (!checkoutId) return;

      setIsProcessing(true);
      setPaymentStatus('Checking payment status...');

      try {
        const response = await fetch('/api/mpesa/check-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ checkoutRequestID: checkoutId })
        });

        if (!response.ok) {
          throw new Error('Failed to check payment status');
        }

        const data = await response.json();

        if (data.status === 'PAID') {
          // Already paid, redirect immediately
          setPaymentStatus('Payment confirmed! Redirecting...');
          toast.success("Order confirmed!");
          localStorage.removeItem('pendingCheckoutRequestID');
          
          setTimeout(() => {
            window.location.href = `/order-success?orderId=${data.orderId}`;
          }, 1500);
        } else if (data.status === 'CANCELLED' || data.status === 'FAILED') {
          // Already cancelled/failed
          setPaymentStatus('Payment was cancelled or failed.');
          toast.error(data.message || 'Payment failed');
          localStorage.removeItem('pendingCheckoutRequestID');
          setIsProcessing(false);
        } else if (data.status === 'PENDING') {
          // Still pending, resume polling
          setPaymentStatus('Waiting for payment confirmation...');
          toast.error("Payment still pending. Please complete on your phone.", {
          icon: '⏰',
          duration: 5000
        });
          pollPaymentStatus(checkoutId);
        } else {
          // Unknown status
          setPaymentStatus('');
          setIsProcessing(false);
          localStorage.removeItem('pendingCheckoutRequestID');
        }
      } catch (error) {
        console.error('Initial status check error:', error);
        
        // Don't show error toast on page load - payment might still be processing
        setPaymentStatus('Checking payment status...');
        
        // Try to resume polling if we have a checkoutRequestID
        if (checkoutId) {
          toast.error("Resuming payment verification...", {
          icon: '⏰',
          duration: 5000
        });
          pollPaymentStatus(checkoutId);
        } else {
          setIsProcessing(false);
        }
      }
    };

    checkInitialStatus();

    // Cleanup on unmount
    return () => {
      stopPolling();
    };
  }, [searchParams]);

  /**
   * Prevent accidental page refresh/close during payment
   */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isProcessing) {
        e.preventDefault();
        e.returnValue = 'Payment is being processed. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isProcessing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  /**
   * 1. Initiate the M-Pesa STK Push
   */
  const handleMpesaPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!formData.billingName || !formData.billingEmail || !formData.phoneNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!userId) {
      toast.error('Please log in to place an order');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('Initiating payment request...');

    try {
      const response = await fetch('/api/mpesa/initiate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...formData
        })
      });

      const data = await response.json();

      if (data.success) {
        setPaymentStatus('Please check your phone for the M-Pesa prompt.');
        toast.success("STK Push sent! Check your phone.");
        
        // Store checkoutRequestID for page refresh handling
        localStorage.setItem('pendingCheckoutRequestID', data.checkoutRequestID);
        
        // 2. Start Polling for payment completion
        pollPaymentStatus(data.checkoutRequestID);
      } else {
        throw new Error(data.message || 'Payment initiation failed');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Failed to initiate payment');
      setPaymentStatus('');
      setIsProcessing(false);
      localStorage.removeItem('pendingCheckoutRequestID');
    }
  };

  /**
   * 3. Poll the server to check if the user has entered their PIN
   */
  const pollPaymentStatus = async (checkoutRequestID: string) => {
    // Stop any existing polling
    stopPolling();
    
    const maxAttempts = 18; // Poll for ~3 minutes (18 * 10s)
    let attempts = 0;

    pollingIntervalRef.current = setInterval(async () => {
      attempts++;
      
      try {
        const response = await fetch('/api/mpesa/check-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ checkoutRequestID })
        });

        if (!response.ok) {
          console.error('Status check failed:', response.status);
          
          // Continue polling even if request fails
          if (attempts >= maxAttempts) {
            stopPolling();
            setPaymentStatus('Unable to verify payment. Please check your order history.');
            toast.error('Payment verification issue. Check your orders.');
            setIsProcessing(false);
            localStorage.removeItem('pendingCheckoutRequestID');
          }
          return;
        }

        const data = await response.json();

        if (data.status === 'PAID') {
          stopPolling();
          setPaymentStatus('Payment Successful! Redirecting...');
          toast.success("Order confirmed!");
          localStorage.removeItem('pendingCheckoutRequestID');
          
          // Redirect to success page
          setTimeout(() => {
            window.location.href = `/order-success?orderId=${data.orderId}`;
          }, 1500);
        } 
        else if (data.status === 'CANCELLED') {
          stopPolling();
          setPaymentStatus('Payment was cancelled.');
          toast.error('Payment cancelled');
          localStorage.removeItem('pendingCheckoutRequestID');
          setIsProcessing(false);
        }
        else if (data.status === 'FAILED') {
          stopPolling();
          setPaymentStatus('Payment failed.');
          toast.error(data.message || 'Payment failed');
          localStorage.removeItem('pendingCheckoutRequestID');
          setIsProcessing(false);
        }
        else if (data.status === 'PENDING') {
          // Still pending, continue polling
          setPaymentStatus('Waiting for payment confirmation...');
        }
        
        // If we hit max attempts without a definitive result
        if (attempts >= maxAttempts) {
          stopPolling();
          setPaymentStatus('Payment verification timed out.');
          toast.error('Payment verification timed out. Check your order history or contact support.');
          setIsProcessing(false);
          // Don't remove checkoutRequestID - user might still complete payment
        }
      } catch (error) {
        console.error("Polling error:", error);
        
        // Continue polling even on errors, unless max attempts reached
        if (attempts >= maxAttempts) {
          stopPolling();
          setPaymentStatus('Unable to verify payment status.');
          toast.error('Payment verification issue. Please check your order history.');
          setIsProcessing(false);
        }
      }
    }, 10000); // Check every 10 seconds
  };

  return (
    <>
      <Breadcrumb title={"Checkout"} pages={["shop", "checkout"]} />
      
      <section className="py-20 bg-gray-2 font-euclid-circular-a">
        <div className="max-w-[1170px] mx-auto px-4">
          <form onSubmit={handleMpesaPayment} className="flex flex-col lg:flex-row gap-10">
            
            {/* LEFT: Billing Details */}
            <div className="lg:w-2/3 space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-3">
                <h3 className="text-xl font-bold text-dark mb-6">Billing & Shipping</h3>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-dark">Full Name *</label>
                    <input
                      name="billingName"
                      type="text"
                      value={formData.billingName}
                      onChange={handleInputChange}
                      disabled={isProcessing}
                      className="w-full p-4 bg-gray-1 border border-gray-3 rounded-xl outline-none focus:ring-2 focus:ring-blue/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-dark">Email Address *</label>
                    <input
                      name="billingEmail"
                      type="email"
                      value={formData.billingEmail}
                      onChange={handleInputChange}
                      disabled={isProcessing}
                      className="w-full p-4 bg-gray-1 border border-gray-3 rounded-xl outline-none focus:ring-2 focus:ring-blue/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium text-dark">M-Pesa Phone Number *</label>
                  <input
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    disabled={isProcessing}
                    className="w-full p-4 bg-gray-1 border border-gray-3 rounded-xl outline-none focus:ring-2 focus:ring-blue/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="0712345678"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark">Delivery Address</label>
                  <textarea
                    name="billingAddress"
                    value={formData.billingAddress}
                    onChange={handleInputChange}
                    disabled={isProcessing}
                    rows={3}
                    className="w-full p-4 bg-gray-1 border border-gray-3 rounded-xl outline-none focus:ring-2 focus:ring-blue/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Street, Apartment, City"
                  />
                </div>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-3">
                <label className="text-sm font-medium text-dark">Order Notes (Optional)</label>
                <textarea
                  name="orderNotes"
                  value={formData.orderNotes}
                  onChange={handleInputChange}
                  disabled={isProcessing}
                  rows={2}
                  className="w-full mt-2 p-4 bg-gray-1 border border-gray-3 rounded-xl outline-none focus:ring-2 focus:ring-blue/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Notes about your delivery..."
                />
              </div>

              {/* Payment In Progress Warning */}
              {isProcessing && (
                <div className="bg-yellow-light-2 border-l-4 border-yellow-dark rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <svg className="w-6 h-6 text-yellow-dark flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-bold text-yellow-dark mb-1">Payment In Progress</h4>
                      <p className="text-xs text-dark-5">
                        Please don't close or refresh this page. Check your phone to complete the M-Pesa payment.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-3 sticky top-6">
                <h3 className="text-xl font-bold text-dark mb-6">Your Order</h3>
                
                <div className="max-h-[300px] overflow-y-auto mb-6 space-y-4 pr-2">
                  {cartItems.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div className="flex-1">
                        <p className="font-medium text-dark line-clamp-1">{item.product.title}</p>
                        <p className="text-xs text-body">
                          Qty: {item.quantity} 
                          {item.variant && ` | ${item.variant.color || ''} ${item.variant.size || ''}`}
                        </p>
                      </div>
                      <p className="font-bold text-dark ml-4">
                        KSh {(item.discountedPrice * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-3 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-dark">Total</span>
                    <span className="text-xl font-black text-blue">
                      KSh {totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                {paymentStatus && (
                  <div className="mb-4 p-3 bg-blue/5 border border-blue/10 rounded-lg">
                    <p className="text-xs text-center text-blue-dark font-medium">
                      {paymentStatus}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing || cartItems.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-blue text-white rounded-xl font-bold hover:bg-blue-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay KSh ${totalPrice.toLocaleString()} via M-Pesa`
                  )}
                </button>

                {!userId && (
                  <p className="mt-3 text-xs text-center text-red">
                    Please log in to complete your purchase.
                  </p>
                )}
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Checkout;