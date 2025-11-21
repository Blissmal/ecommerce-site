import React, { useState } from "react";
import Image from "next/image";
import CreditCardForm from "./CreditCard";

const PaymentMethod = () => {
  const [payment, setPayment] = useState<"bank" | "mpesa">("bank");
  const [bankCard, setBankCard] = useState("");
  const [mpesaNumber, setMpesaNumber] = useState("");

  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark">Payment Method</h3>
      </div>

      <div className="p-4 sm:p-8.5 space-y-4">
        {/* BANK OPTION */}
        <label htmlFor="bank" className="flex cursor-pointer items-start gap-4">
          <div className="relative pt-1">
            <input
              type="radio"
              name="payment"
              id="bank"
              checked={payment === "bank"}
              className="sr-only"
              onChange={() => setPayment("bank")}
            />
            <div
              className={`flex h-4 w-4 items-center justify-center rounded-full ${
                payment === "bank"
                  ? "border-4 border-blue"
                  : "border border-gray-4"
              }`}
            ></div>
          </div>

          <div
            className={`flex-1 rounded-md border-[0.5px] py-3.5 px-5 transition duration-200 ${
              payment === "bank"
                ? "border-transparent bg-gray-2"
                : "border-gray-4 shadow-1 hover:bg-gray-2"
            }`}
          >
            <div className="flex items-center">
              <Image
                src="/images/checkout/bank.svg"
                alt="Bank"
                width={32}
                height={32}
                className="mr-3"
              />
              <p className="font-medium">Pay via Bank Card</p>
            </div>

            {payment === "bank" && (
              <CreditCardForm />
            )}
          </div>
        </label>

        {/* MPESA OPTION */}
        <label htmlFor="mpesa" className="flex cursor-pointer items-start gap-4">
          <div className="relative pt-1">
            <input
              type="radio"
              name="payment"
              id="mpesa"
              checked={payment === "mpesa"}
              className="sr-only"
              onChange={() => setPayment("mpesa")}
            />
            <div
              className={`flex h-4 w-4 items-center justify-center rounded-full ${
                payment === "mpesa"
                  ? "border-4 border-blue"
                  : "border border-gray-4"
              }`}
            ></div>
          </div>

          <div
            className={`flex-1 rounded-md border-[0.5px] py-3.5 px-5 transition duration-200 ${
              payment === "mpesa"
                ? "border-transparent bg-gray-2"
                : "border-gray-4 shadow-1 hover:bg-gray-2"
            }`}
          >
            <div className="flex items-center">
              <Image
                src="/mpesa.png"
                alt="M-PESA"
                width={32}
                height={32}
                className="mr-3"
              />
              <p className="font-medium">Pay with M-PESA</p>
            </div>

            {payment === "mpesa" && (
              <div className="mt-4 space-y-2">
                <label className="block text-sm text-gray-600 mb-1">
                  M-PESA Number
                </label>
                <input
                  type="text"
                  placeholder="Enter your M-PESA phone number"
                  value={mpesaNumber}
                  onChange={(e) => setMpesaNumber(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue focus:outline-none"
                />
              </div>
            )}
          </div>
        </label>
      </div>
    </div>
  );
};

export default PaymentMethod;
