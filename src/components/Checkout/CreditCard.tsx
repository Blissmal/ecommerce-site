"use client";

export default function CreditCardForm() {
  return (
    <div className="w-full max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-1">Credit Card</h2>
      <p className="text-sm text-gray-500 mb-4">Enter your payment details</p>

      {/* Card Number */}
      <div className="flex items-center gap-3 mb-4">
        <CreditCardIcon className="w-8 h-8 text-blue-600" />
        <input
          type="text"
          id="card-number"
          placeholder="1234 5678 9012 3456"
          maxLength={19}
          pattern="\d{4} \d{4} \d{4} \d{4}"
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Expiration & CVC */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Expiration */}
        <div>
          <label htmlFor="expiration-month" className="block text-sm font-medium text-gray-700 mb-1">
            Expiration
          </label>
          <div className="flex gap-2">
            <select
              id="expiration-month"
              className="w-1/2 border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>MM</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={String(i + 1).padStart(2, "0")}>
                  {String(i + 1).padStart(2, "0")}
                </option>
              ))}
            </select>
            <select
              id="expiration-year"
              className="w-1/2 border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>YY</option>
              {Array.from({ length: 10 }, (_, i) => (
                <option key={i} value={(2023 + i).toString().slice(2)}>
                  {(2023 + i).toString().slice(2)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* CVC */}
        <div>
          <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 mb-1">
            CVC
          </label>
          <input
            type="text"
            id="cvc"
            placeholder="123"
            maxLength={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Pay
        </button>
      </div>
    </div>
  );
}

function CreditCardIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}
