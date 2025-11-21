"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // Use 'next/navigation' for App Router
import Link from 'next/link';
import { CheckCircleIcon, TruckIcon, PhoneIcon, MailIcon, MapPinIcon } from 'lucide-react';

const OrderSuccess = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/order/${orderId}`);
      const data = await response.json();

      if (data.success) {
        setOrder(data.order);
      } else {
        setError(data.message || 'Order not found');
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID':
        return 'text-green-dark bg-green-light-6';
      case 'PROCESSING':
        return 'text-blue-dark bg-blue-light-6';
      case 'PENDING':
        return 'text-yellow-dark bg-yellow-light-6';
      case 'FAILED':
        return 'text-red-dark bg-red-light-6';
      default:
        return 'text-gray-dark bg-gray-light-6';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-2 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-dark"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-2 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-red-dark mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-7 mb-2">Order Not Found</h2>
            <p className="text-gray-5 mb-6">{error}</p>
            <Link 
              href="/"
              className="inline-flex items-center px-4 py-2 bg-blue-dark text-white rounded-md hover:bg-blue-dark transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-1 py-12 mt-30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircleIcon className="w-16 h-16 text-green-dark mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-7 mb-2">Order Confirmed!</h1>
          <p className="text-lg text-gray-7">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="bg-blue-dark px-6 py-4">
            <h2 className="text-xl font-semibold text-white">Order Summary</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Order Info */}
              <div>
                <h3 className="font-semibold text-gray-7 mb-3">Order Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-5">Order ID:</span>
                    <span className="font-medium">#{order.id.slice(-8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-5">Order Date:</span>
                    <span className="font-medium">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-5">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-5">Payment Method:</span>
                    <span className="font-medium">M-Pesa</span>
                  </div>
                  {order.receipt && (
                    <div className="flex justify-between">
                      <span className="text-gray-5">M-Pesa Receipt:</span>
                      <span className="font-medium text-green-5">{order.receipt}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Billing Info */}
              <div>
                <h3 className="font-semibold text-gray-7 mb-3">Billing Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <span className="text-gray-5 w-6 h-6 mr-2">👤</span>
                    <span>{order.billingName}</span>
                  </div>
                  <div className="flex items-center">
                    <MailIcon className="w-4 h-4 text-gray-5 mr-2" />
                    <span>{order.billingEmail}</span>
                  </div>
                  <div className="flex items-center">
                    <PhoneIcon className="w-4 h-4 text-gray-5 mr-2" />
                    <span>{order.phoneNumber}</span>
                  </div>
                  {order.billingAddress && (
                    <div className="flex items-start">
                      <MapPinIcon className="w-4 h-4 text-gray-5 mr-2 mt-0.5" />
                      <span>{order.billingAddress}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-7 mb-4">Order Items</h3>
              <div className="space-y-4">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-1 last:border-b-0">
                    <div className="flex items-center">
                      <img 
                        src={item.product.imageUrl} 
                        alt={item.product.title}
                        className="w-16 h-16 object-cover rounded-md mr-4"
                      />
                      <div>
                        <h4 className="font-medium text-gray-7">{item.product.title}</h4>
                        <p className="text-sm text-gray-5">Quantity: {item.quantity}</p>
                        <p className="text-sm text-gray-5">Unit Price: KSh {item.price.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-7">
                        KSh {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Total */}
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-7">Total Amount:</span>
                  <span className="text-2xl font-bold text-blue-dark">KSh {order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What's Next Section */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="p-6">
            <h3 className="font-semibold text-gray-7 mb-4 flex items-center">
              <TruckIcon className="w-5 h-5 mr-2" />
              What's Next?
            </h3>
            <div className="space-y-3 text-sm text-gray-5">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-light text-blue-dark rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">1</div>
                <div>
                  <p className="font-medium">Order Processing</p>
                  <p>We're preparing your order for shipment.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-gray-1 text-gray-5 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">2</div>
                <div>
                  <p className="font-medium">Shipping Notification</p>
                  <p>You'll receive an email/SMS when your order ships.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-gray-1 text-gray-6 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">3</div>
                <div>
                  <p className="font-medium">Delivery</p>
                  <p>Your order will be delivered to your specified address.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Notes */}
        {order.orderNotes && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="p-6">
              <h3 className="font-semibold text-gray-7 mb-3">Order Notes</h3>
              <p className="text-gray-5 bg-gray-1 p-4 rounded-md">{order.orderNotes}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="text-center space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
          <Link 
            href="/my-account"
            className="inline-flex items-center px-6 py-3 bg-blue-dark text-white rounded-md hover:bg-blue-light transition-colors font-medium"
          >
            View All Orders
          </Link>
          <Link 
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gray-1 text-gray-7 rounded-md hover:bg-gray-2 transition-colors font-medium"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Support Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-5 mb-2">Need help with your order?</p>
          <div className="space-y-2 sm:space-y-0 sm:space-x-6 sm:flex sm:justify-center text-sm">
            <Link href="/contact" className="text-blue-dark hover:text-blue-light block sm:inline">
              Contact Support
            </Link>
            <Link href="/faq" className="text-blue-dark hover:text-blue-light block sm:inline">
              View FAQ
            </Link>
            <Link href="/shipping" className="text-blue-dark hover:text-blue-light block sm:inline">
              Shipping Info
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;