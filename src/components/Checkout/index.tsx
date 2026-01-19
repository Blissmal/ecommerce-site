"use client";
import React, { useState } from "react";
import { useAppSelector } from "@/redux/store";
import { useSelector } from "react-redux";
import { selectTotalPrice } from "@/redux/features/cart-slice";
import Breadcrumb from "../Common/Breadcrumb";
import toast from "react-hot-toast";

const Checkout = ({ userId }: { userId: string }) => {
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const totalPrice = useSelector(selectTotalPrice);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');

  // Form state matching your database schema
  const [formData, setFormData] = useState({
    billingName: '',
    billingEmail: '',
    phoneNumber: '',
    billingAddress: '',
    orderNotes: ''
  });

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
        toast.success("STK Push sent!");
        
        // 2. Start Polling for payment completion
        pollPaymentStatus(data.checkoutRequestID);
      } else {
        throw new Error(data.message || 'Payment initiation failed');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message);
      setPaymentStatus('Order failed. Please try again.');
      setIsProcessing(false);
    }
  };

  /**
   * 3. Poll the server to check if the user has entered their PIN
   */
  const pollPaymentStatus = async (checkoutRequestID: string) => {
    const maxAttempts = 15; // Poll for ~2.5 minutes
    let attempts = 0;

    const interval = setInterval(async () => {
      attempts++;
      
      try {
        const response = await fetch('/api/mpesa/check-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ checkoutRequestID })
        });

        const data = await response.json();

        if (data.status === 'PAID') {
          clearInterval(interval);
          setPaymentStatus('Payment Successful! Redirecting...');
          toast.success("Order confirmed!");
          
          // Clear cart or redirect
          setTimeout(() => {
            window.location.href = `/order-success?orderId=${data.orderId}`;
          }, 2000);
        } 
        else if (data.status === 'FAILED') {
          clearInterval(interval);
          setPaymentStatus('Payment cancelled or failed on your phone.');
          setIsProcessing(false);
        }
        
        // If we hit max attempts without a result
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setPaymentStatus('Payment verification timed out. If you paid, please contact support.');
          setIsProcessing(false);
        }
      } catch (error) {
        console.error("Polling error:", error);
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
                      onChange={handleInputChange}
                      className="w-full p-4 bg-gray-1 border border-gray-3 rounded-xl outline-none focus:ring-2 focus:ring-blue/20"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-dark">Email Address *</label>
                    <input
                      name="billingEmail"
                      type="email"
                      onChange={handleInputChange}
                      className="w-full p-4 bg-gray-1 border border-gray-3 rounded-xl outline-none focus:ring-2 focus:ring-blue/20"
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
                    onChange={handleInputChange}
                    className="w-full p-4 bg-gray-1 border border-gray-3 rounded-xl outline-none focus:ring-2 focus:ring-blue/20"
                    placeholder="0712345678"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark">Delivery Address</label>
                  <textarea
                    name="billingAddress"
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-4 bg-gray-1 border border-gray-3 rounded-xl outline-none focus:ring-2 focus:ring-blue/20"
                    placeholder="Street, Apartment, City"
                  />
                </div>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-3">
                <label className="text-sm font-medium text-dark">Order Notes (Optional)</label>
                <textarea
                  name="orderNotes"
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full mt-2 p-4 bg-gray-1 border border-gray-3 rounded-xl outline-none focus:ring-2 focus:ring-blue/20"
                  placeholder="Notes about your delivery..."
                />
              </div>
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
                    <p className="text-xs text-center text-blue-dark font-medium animate-pulse">
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