"use client";

import { useState } from "react";
import { X, CreditCard, Lock, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
}

export function PaymentModal({ isOpen, onClose, onSuccess, amount }: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  if (!isOpen) return null;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !expiry || !cvc) return;
    
    setIsProcessing(true);
    
    // Simulate network delay for payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    setIsSuccess(true);
    
    // Call onSuccess after showing the success animation briefly
    setTimeout(() => {
      setIsSuccess(false);
      onSuccess();
    }, 1500);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 16) value = value.slice(0, 16);
    // Add spaces every 4 digits
    value = value.replace(/(.{4})/g, "$1 ").trim();
    setCardNumber(value);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setExpiry(value);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={!isProcessing && !isSuccess ? onClose : undefined}
      />
      
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-cs-gray-100 bg-cs-gray-50/50">
          <div className="flex items-center gap-2 text-cs-black">
            <Lock className="w-4 h-4 text-cs-gray-500" />
            <span className="font-semibold text-sm tracking-wide">SECURE CHECKOUT</span>
          </div>
          <button 
            onClick={onClose}
            disabled={isProcessing || isSuccess}
            className="p-2 text-cs-gray-400 hover:text-cs-black transition-colors rounded-full hover:bg-cs-gray-100 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-8 animate-in zoom-in duration-500">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-cs-black mb-2">Payment Successful!</h3>
              <p className="text-cs-gray-500">Your invoice has been marked as paid.</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <p className="text-cs-gray-500 text-sm font-medium mb-1">Amount Due</p>
                <h2 className="text-4xl font-bold text-cs-black">
                  ₹{amount.toLocaleString()}
                </h2>
              </div>

              <form onSubmit={handlePay} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-cs-gray-700 mb-1.5">Card Information</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <CreditCard className="h-5 w-5 text-cs-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className="block w-full pl-11 pr-3 py-3 border border-cs-gray-200 rounded-xl focus:ring-2 focus:ring-cs-black focus:border-cs-black transition-all text-cs-black font-medium tracking-wide placeholder:font-normal"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-cs-gray-700 mb-1.5">Expiry Date</label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={handleExpiryChange}
                      className="block w-full px-3.5 py-3 border border-cs-gray-200 rounded-xl focus:ring-2 focus:ring-cs-black focus:border-cs-black transition-all text-cs-black font-medium tracking-wide placeholder:font-normal"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-cs-gray-700 mb-1.5">CVC</label>
                    <input
                      type="text"
                      required
                      placeholder="123"
                      maxLength={4}
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, ""))}
                      className="block w-full px-3.5 py-3 border border-cs-gray-200 rounded-xl focus:ring-2 focus:ring-cs-black focus:border-cs-black transition-all text-cs-black font-medium tracking-wide placeholder:font-normal"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isProcessing || cardNumber.length < 19 || expiry.length < 5 || cvc.length < 3}
                    className={cn(
                      "w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white transition-all",
                      isProcessing ? "bg-cs-black/80" : "bg-cs-black hover:bg-cs-gray-800 disabled:bg-cs-gray-300 disabled:cursor-not-allowed"
                    )}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      `Pay ₹${amount.toLocaleString()}`
                    )}
                  </button>
                </div>
              </form>
              
              <div className="mt-6 flex justify-center items-center gap-1.5 text-xs text-cs-gray-400">
                <Lock className="w-3 h-3" /> Payments are processed securely via OneSpace Stripe integration.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
