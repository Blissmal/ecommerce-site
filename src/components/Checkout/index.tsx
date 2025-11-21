// "use client";
// import React from "react";
// import Breadcrumb from "../Common/Breadcrumb";
// import Login from "./Login";
// import Shipping from "./Shipping";
// import ShippingMethod from "./ShippingMethod";
// import PaymentMethod from "./PaymentMethod";
// import Coupon from "./Coupon";
// import Billing from "./Billing";

// const Checkout = () => {
//   const cartItems = useAppSelector((state) => state.cartReducer.items);
//   const totalPrice = useSelector(selectTotalPrice);
//   return (
//     <>
//       <Breadcrumb title={"Your Orders"} pages={["checkout"]} />
//       <section className="overflow-hidden py-20 bg-gray-2">
//         <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
//           <form>
//             <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
//               {/* <!-- checkout left --> */}
//               <div className="lg:max-w-[670px] w-full">
//                 {/* <!-- login box --> */}

//                 {/* <!-- billing details --> */}
//                 <Billing />

//                 {/* <!-- others note box --> */}
//                 <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mt-7.5">
//                   <div>
//                     <label htmlFor="notes" className="block mb-2.5">
//                       Other Notes (optional)
//                     </label>

//                     <textarea
//                       name="notes"
//                       id="notes"
//                       rows={5}
//                       placeholder="Notes about your order, e.g. speacial notes for delivery."
//                       className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
//                     ></textarea>
//                   </div>
//                 </div>
//               </div>

//               {/* // <!-- checkout right --> */}
//               <div className="max-w-[455px] w-full">
//                 {/* <!-- order list box --> */}
//                 <div className="bg-white shadow-1 rounded-[10px]">
//                   <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
//                     <h3 className="font-medium text-xl text-dark">
//                       Your Orders
//                     </h3>
//                   </div>

//                   <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
//                     {/* <!-- title --> */}
//                     <div className="flex items-center justify-between py-5 border-b border-gray-3">
//                       <div>
//                         <h4 className="font-medium text-dark">Product</h4>
//                       </div>
//                       <div>
//                         <h4 className="font-medium text-dark text-right">
//                           Subtotal
//                         </h4>
//                       </div>
//                     </div>

//                     {/* <!-- product item --> */}
//                     {cartItems.map(item => (
//                       <div key={item.id} className="flex items-center justify-between py-5 border-b border-gray-3">
//                       <div>
//                         <p className="text-dark">{item.product.title}</p>
//                       </div>
//                       <div>
//                         <p className="text-dark text-right">${item.product.price} * {item.quantity}</p>
//                       </div>
//                     </div>
//                     ))}

//                     {/* <!-- total --> */}
//                     <div className="flex items-center justify-between pt-5">
//                       <div>
//                         <p className="font-medium text-lg text-dark">Total</p>
//                       </div>
//                       <div>
//                         <p className="font-medium text-lg text-dark text-right">
//                           ${totalPrice}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* <!-- payment box --> */}
//                 <PaymentMethod />
//                 <AgreementCheckboxes />

//                 {/* <!-- checkout button --> */}
//                 <button
//                   type="submit"
//                   className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5"
//                 >
//                   Make payment
//                 </button>
//               </div>
//             </div>
//           </form>
//         </div>
//       </section>
//     </>
//   );
// };

// export default Checkout;


// import { useState } from "react";
// import { useAppSelector } from "@/redux/store";
// import { useSelector } from "react-redux";
// import { selectTotalPrice } from "@/redux/features/cart-slice";

// export function AgreementCheckboxes() {
//   const [termsAccepted, setTermsAccepted] = useState(false);
//   const [offersAccepted, setOffersAccepted] = useState(false);

//   return (
//     <div className="space-y-4 mt-6">
//       <label className="flex items-start space-x-2 cursor-pointer">
//         <input
//           type="checkbox"
//           checked={termsAccepted}
//           onChange={(e) => setTermsAccepted(e.target.checked)}
//           className="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
//         />
//         <span className="text-sm text-gray-700">
//           I have read and understood the <strong>Terms and Conditions</strong> associated with this purchase.
//         </span>
//       </label>

//       <label className="flex items-start space-x-2 cursor-pointer">
//         <input
//           type="checkbox"
//           checked={offersAccepted}
//           onChange={(e) => setOffersAccepted(e.target.checked)}
//           className="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
//         />
//         <span className="text-sm text-gray-700">
//           I agree to receive offers or promotions from <strong>HustleSasa</strong> by Email, Text, or Phone.
//         </span>
//       </label>
//     </div>
//   );
// }

// Updated Checkout Component
"use client";
import React, { useState, useEffect } from "react";
import { useAppSelector } from "@/redux/store";
import { useSelector } from "react-redux";
import { selectTotalPrice } from "@/redux/features/cart-slice";
import Breadcrumb from "../Common/Breadcrumb";

const Checkout = ({userId}: {userId: string}) => {
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const totalPrice = useSelector(selectTotalPrice);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [orderId, setOrderId] = useState('');

  console.log(cartItems, totalPrice, userId);
  
  // Form state matching your schema
  const [formData, setFormData] = useState({
    billingName: '',
    billingEmail: '',
    phoneNumber: '',
    billingAddress: '',
    orderNotes: ''
  });

  // const userId = useAppSelector((state) => state.auth?.user?.id); // Adjust based on your auth state

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleMpesaPayment = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.billingName || !formData.billingEmail || !formData.phoneNumber) {
      alert('Please fill in all required fields');
      return;
    }

    if (!userId) {
      alert('Please log in to place an order');
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('Creating order...');

    try {
      const response = await fetch('/api/mpesa/initiate-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          phoneNumber: formData.phoneNumber,
          billingName: formData.billingName,
          billingEmail: formData.billingEmail,
          billingAddress: formData.billingAddress,
          orderNotes: formData.orderNotes
        })
      });

      const data = await response.json();

      if (data.success) {
        setOrderId(data.orderId);
        setPaymentStatus('Check your phone for M-Pesa prompt...');
        
        // Start polling for payment status
        pollPaymentStatus(data.checkoutRequestID);
      } else {
        setPaymentStatus(`Order failed: ${data.message}`);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('Order failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const pollPaymentStatus = async (checkoutRequestID) => {
    const maxAttempts = 24; // Poll for 4 minutes (24 * 10 seconds)
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch('/api/mpesa/check-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ checkoutRequestID })
        });

        const data = await response.json();
        
        if (data.status === 'PAID') {
          setPaymentStatus('Payment successful! Order confirmed.');
          setIsProcessing(false);
          
          // Redirect to success page after 2 seconds
          setTimeout(() => {
            window.location.href = `/order-success?orderId=${data.orderId}`;
          }, 2000);
          
        } else if (data.status === 'FAILED') {
          setPaymentStatus('Payment failed. Please try again.');
          setIsProcessing(false);
          
        } else if (data.status === 'PROCESSING' && attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 10000); // Poll every 10 seconds
          
        } else {
          // Timeout or unknown status
          setPaymentStatus('Payment timeout. Please check your M-Pesa messages or contact support.');
          setIsProcessing(false);
        }
      } catch (error) {
        console.error('Status check error:', error);
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 10000);
        } else {
          setPaymentStatus('Unable to verify payment status. Please contact support.');
          setIsProcessing(false);
        }
      }
    };

    // Start polling after 5 seconds
    setTimeout(poll, 5000);
  };

  return (
    <>
      <Breadcrumb title={"Your Orders"} pages={["checkout"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <form onSubmit={handleMpesaPayment}>
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
              {/* Checkout Left - Billing Details */}
              <div className="lg:max-w-[670px] w-full">
                {/* Billing Details */}
                <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
                  <h3 className="font-medium text-xl text-dark mb-5">Billing Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label htmlFor="billingName" className="block mb-2.5 text-dark">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="billingName"
                        name="billingName"
                        value={formData.billingName}
                        onChange={handleInputChange}
                        className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="billingEmail" className="block mb-2.5 text-dark">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="billingEmail"
                        name="billingEmail"
                        value={formData.billingEmail}
                        onChange={handleInputChange}
                        className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-5">
                    <label htmlFor="phoneNumber" className="block mb-2.5 text-dark">
                      Phone Number (M-Pesa) *
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="07XXXXXXXX or 2547XXXXXXXX"
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                      required
                    />
                  </div>

                  <div className="mb-5">
                    <label htmlFor="billingAddress" className="block mb-2.5 text-dark">
                      Address
                    </label>
                    <textarea
                      id="billingAddress"
                      name="billingAddress"
                      value={formData.billingAddress}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Delivery address"
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>
                </div>

                {/* Order Notes */}
                <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mt-7.5">
                  <div>
                    <label htmlFor="orderNotes" className="block mb-2.5 text-dark">
                      Order Notes (optional)
                    </label>
                    <textarea
                      name="orderNotes"
                      id="orderNotes"
                      value={formData.orderNotes}
                      onChange={handleInputChange}
                      rows={5}
                      placeholder="Notes about your order, e.g. special notes for delivery."
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>
                </div>
              </div>

              {/* Checkout Right - Order Summary */}
              <div className="max-w-[455px] w-full">
                {/* Order List */}
                <div className="bg-white shadow-1 rounded-[10px]">
                  <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                    <h3 className="font-medium text-xl text-dark">Your Orders</h3>
                  </div>

                  <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
                    {/* Header */}
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <div>
                        <h4 className="font-medium text-dark">Product</h4>
                      </div>
                      <div>
                        <h4 className="font-medium text-dark text-right">Subtotal</h4>
                      </div>
                    </div>

                    {/* Cart Items */}
                    {cartItems.map(item => {
                      const price = item.product.discount 
                        ? item.product.price * (1 - item.product.discount)
                        : item.product.price;
                      
                      return (
                        <div key={item.id} className="flex items-center justify-between py-5 border-b border-gray-3">
                          <div>
                            <p className="text-dark">{item.product.title}</p>
                            {item.product.discount && (
                              <p className="text-sm text-green-600">
                                {(item.product.discount * 100).toFixed(0)}% off
                              </p>
                            )}
                          </div>
                          <div>
                            <p className="text-dark text-right">
                              KSh {price.toFixed(2)} × {item.quantity}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {/* Total */}
                    <div className="flex items-center justify-between pt-5">
                      <div>
                        <p className="font-medium text-lg text-dark">Total</p>
                      </div>
                      <div>
                        <p className="font-medium text-lg text-dark text-right">
                          KSh {totalPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Status */}
                {paymentStatus && (
                  <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mt-7.5">
                    <p className={`text-center ${
                      paymentStatus.includes('successful') ? 'text-green-600' : 
                      paymentStatus.includes('failed') || paymentStatus.includes('timeout') ? 'text-red-600' : 
                      'text-blue-600'
                    }`}>
                      {paymentStatus}
                    </p>
                  </div>
                )}

                {/* Payment Button */}
                <button
                  type="submit"
                  disabled={isProcessing || !userId || cartItems.length === 0}
                  className={`w-full flex justify-center font-medium text-white py-3 px-6 rounded-md ease-out duration-200 mt-7.5 ${
                    isProcessing || !userId || cartItems.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue hover:bg-blue-dark'
                  }`}
                >
                  {isProcessing 
                    ? 'Processing...' 
                    : `Pay KSh ${totalPrice.toFixed(2)} via M-Pesa`
                  }
                </button>

                {!userId && (
                  <p className="text-red-600 text-center mt-2">
                    Please log in to place an order
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
