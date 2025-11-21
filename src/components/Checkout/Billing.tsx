import React, { use, useState, useEffect } from "react";

const Billing = () => {
  const [formData, setFormData] = useState({
    username: '',
    country: '0',
    address: '',
    town: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        const response = await fetch('/api/get-billing-data');
        const data = await response.json();
        
        if (response.ok) {
          setFormData({
            username: data.billingInfo.name || '',
            country: data.billingInfo.country || '0',
            address: data.billingInfo.address || '',
            town: data.billingInfo.town || '',
            phone: data.billingInfo.phone || '',
          });
        } else {
          setMessage({ text: data.message || 'Failed to fetch billing details', type: 'error' });
        }
      } catch (error) {
        console.error('Error fetching billing data:', error);
        setMessage({ text: 'Network error. Please try again.', type: 'error' });
      }
    };

    fetchBillingData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch('/api/update-billing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ text: 'Billing details updated successfully!', type: 'success' });
      } else {
        setMessage({ text: result.error || 'Failed to update billing details', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Network error. Please try again.', type: 'error' });
      console.error('Error updating billing details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-9">
      <h2 className="font-medium text-dark text-xl sm:text-2xl mb-5.5">
        Billing details
      </h2>

      <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
            <div className="w-full">
              <label htmlFor="username" className="block mb-2.5">
                Username <span className="text-red">*</span>
              </label>

              <input
                type="text"
                name="username"
                id="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="joedoe"
                required
                className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              />
            </div>
          </div>

          <div className="mb-5">
            <label htmlFor="country" className="block mb-2.5">
              Country/ Region
              <span className="text-red">*</span>
            </label>

            <div className="relative">
              <select 
                name="country"
                id="country"
                value={formData.country}
                onChange={handleInputChange}
                required
                className="w-full bg-gray-1 rounded-md border border-gray-3 text-dark-4 py-3 pl-5 pr-9 duration-200 appearance-none outline-none focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              >
                <option value="0">Kenya</option>
                <option value="1">Uganda</option>
                <option value="2">Tanzania</option>
              </select>

              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-4">
                <svg
                  className="fill-current"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2.41469 5.03569L2.41467 5.03571L2.41749 5.03846L7.76749 10.2635L8.0015 10.492L8.23442 10.2623L13.5844 4.98735L13.5844 4.98735L13.5861 4.98569C13.6809 4.89086 13.8199 4.89087 13.9147 4.98569C14.0092 5.08024 14.0095 5.21864 13.9155 5.31345C13.9152 5.31373 13.915 5.31401 13.9147 5.31429L8.16676 10.9622L8.16676 10.9622L8.16469 10.9643C8.06838 11.0606 8.02352 11.0667 8.00039 11.0667C7.94147 11.0667 7.89042 11.0522 7.82064 10.9991L2.08526 5.36345C1.99127 5.26865 1.99154 5.13024 2.08609 5.03569C2.18092 4.94086 2.31986 4.94086 2.41469 5.03569Z"
                    fill=""
                    stroke=""
                    strokeWidth="0.666667"
                  />
                </svg>
              </span>
            </div>
          </div>

          <div className="mb-5">
            <label htmlFor="address" className="block mb-2.5">
              Address
              <span className="text-red">*</span>
            </label>

            <input
              type="text"
              name="address"
              id="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="House number, building name, road nearby, landmark ..."
              required
              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            />
          </div>

          <div className="mb-5">
            <label htmlFor="town" className="block mb-2.5">
              Town/ City <span className="text-red">*</span>
            </label>

            <input
              type="text"
              name="town"
              id="town"
              value={formData.town}
              onChange={handleInputChange}
              required
              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            />
          </div>

          <div className="mb-5">
            <label htmlFor="phone" className="block mb-2.5">
              Phone <span className="text-red">*</span>
            </label>

            <input
              type="tel"
              name="phone"
              id="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            />
          </div>

          {message.text && (
            <div className={`mb-4 p-3 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <button 
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className={`p-4 bg-blue-dark text-white rounded-lg transition-opacity ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
            }`}
          >
            {isLoading ? 'Updating...' : 'Update Data'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Billing;