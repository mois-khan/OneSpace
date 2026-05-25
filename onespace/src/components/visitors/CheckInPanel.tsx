"use client";

import React, { useState } from "react";
import { members } from "@/lib/data/seed";
import { Camera, Check, QrCode, Send } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface CheckInPanelProps {
  onCheckIn: (visitor: { name: string; phone: string; purpose: string; hostName: string }) => void;
}

export function CheckInPanel({ onCheckIn }: CheckInPanelProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("Client Meeting");
  const [hostId, setHostId] = useState("");
  
  const [isPhotoTaken, setIsPhotoTaken] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkedInVisitorId, setCheckedInVisitorId] = useState<string | null>(null);

  const handlePhotoClick = () => {
    // Simulate taking a photo for the demo
    setIsPhotoTaken(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    
    setIsCheckingIn(true);
    
    // Simulate API delay
    setTimeout(() => {
      const hostName = hostId ? members.find(m => m.id === hostId)?.name || "" : "Reception";
      
      onCheckIn({ name, phone, purpose, hostName });
      
      const newId = `v-${Date.now()}`;
      setCheckedInVisitorId(newId);
      setIsCheckingIn(false);
    }, 600);
  };

  const handleReset = () => {
    setName("");
    setPhone("");
    setPurpose("Client Meeting");
    setHostId("");
    setIsPhotoTaken(false);
    setCheckedInVisitorId(null);
  };

  return (
    <div className="bg-white border border-cs-gray-200 rounded-xl overflow-hidden h-full flex flex-col relative">
      <div className="px-6 py-4 border-b border-cs-gray-200 bg-gradient-to-r from-red-50 to-white">
        <h3 className="font-semibold font-heading text-cs-black flex items-center gap-2">
          Check In Visitor
        </h3>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {checkedInVisitorId ? (
          <div className="flex flex-col items-center justify-center h-full space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
              <Check className="w-8 h-8" />
            </div>
            
            <div className="text-center">
              <h4 className="text-xl font-bold text-cs-black">Check-in Complete!</h4>
              <p className="text-sm text-cs-gray-500 mt-1">{name} has been added to the log.</p>
            </div>

            <div className="p-4 bg-white border border-cs-gray-200 rounded-xl shadow-sm">
              <QRCodeSVG 
                value={`onespace://visitor/${checkedInVisitorId}`} 
                size={160}
                bgColor={"#ffffff"}
                fgColor={"#0D1B2A"}
                level={"L"}
                includeMargin={false}
              />
            </div>

            <button className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-[#20bd5a] transition-colors shadow-sm">
              <Send className="w-4 h-4" /> Share via WhatsApp
            </button>
            
            <button 
              onClick={handleReset}
              className="text-sm text-cs-gray-500 hover:text-cs-black hover:underline"
            >
              Check in another visitor
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 h-full flex flex-col">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-cs-gray-500 uppercase">Full Name *</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Verma"
                className="w-full px-3 py-2.5 border border-cs-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cs-red/20 focus:border-cs-red transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-cs-gray-500 uppercase">Mobile Number *</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-cs-gray-200 bg-cs-gray-50 text-cs-gray-500 text-sm">
                  +91
                </span>
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98765 43210"
                  className="w-full px-3 py-2.5 border border-cs-gray-200 rounded-r-lg text-sm focus:outline-none focus:ring-2 focus:ring-cs-red/20 focus:border-cs-red transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-cs-gray-500 uppercase">Purpose</label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-3 py-2.5 border border-cs-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cs-red/20 focus:border-cs-red transition-all bg-white"
              >
                <option>Client Meeting</option>
                <option>Interview</option>
                <option>Demo</option>
                <option>Delivery</option>
                <option>Personal</option>
                <option>Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-cs-gray-500 uppercase">Host Member</label>
              <select
                value={hostId}
                onChange={(e) => setHostId(e.target.value)}
                className="w-full px-3 py-2.5 border border-cs-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cs-red/20 focus:border-cs-red transition-all bg-white"
              >
                <option value="">-- None (Walk-in / Reception) --</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.company})</option>
                ))}
              </select>
            </div>

            <div className="pt-2">
              <button 
                type="button"
                onClick={handlePhotoClick}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed text-sm font-medium transition-all ${
                  isPhotoTaken 
                    ? 'border-green-200 bg-green-50 text-green-700' 
                    : 'border-cs-gray-200 bg-cs-gray-50 text-cs-gray-600 hover:border-cs-gray-300 hover:bg-cs-gray-100'
                }`}
              >
                {isPhotoTaken ? (
                  <><Check className="w-4 h-4" /> Photo Captured</>
                ) : (
                  <><Camera className="w-4 h-4" /> Take Photo (Webcam)</>
                )}
              </button>
            </div>

            <div className="mt-auto pt-6">
              <button 
                type="submit"
                disabled={isCheckingIn || !name || !phone}
                className="w-full flex items-center justify-center py-3 bg-cs-red text-white rounded-lg font-medium hover:bg-cs-red-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isCheckingIn ? "Processing..." : "Check In Visitor"}
              </button>
            </div>
          </form>
        )}
      </div>
      
      {/* QR Demo Section */}
      {!checkedInVisitorId && (
        <div className="p-4 border-t border-cs-gray-100 bg-cs-gray-50">
          <div className="border border-dashed border-cs-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-cs-gray-100 transition-colors group">
            <QrCode className="w-6 h-6 text-cs-gray-400 mb-2 group-hover:text-cs-gray-600" />
            <p className="text-xs font-semibold text-cs-gray-500">Scan QR to check out</p>
          </div>
        </div>
      )}
    </div>
  );
}
