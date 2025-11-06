import React, { useState } from "react";

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";

const TAX_SLABS = [
  { label: "5%", value: 0.05 },
  { label: "10%", value: 0.10 },
  { label: "15%", value: 0.15 },
  { label: "20%", value: 0.20 },
  { label: "30%", value: 0.30 },
];

export default function TaxCalculation() {
  const [type, setType] = useState<string>("");
  const [marketPrice, setMarketPrice] = useState("");
  const [exercisePrice, setExercisePrice] = useState("");
  const [totalShares, setTotalShares] = useState("");
  const [taxSlab, setTaxSlab] = useState<string>("");
  const [acquiredTime, setAcquiredTime] = useState("");
  const [result, setResult] = useState<string>("");

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const mp = parseFloat(marketPrice);
    const ep = parseFloat(exercisePrice);
    const ts = parseFloat(totalShares);
    const slab = parseFloat(taxSlab);
    const monthsHeld = parseInt(acquiredTime);

    if (
      isNaN(mp) ||
      isNaN(ep) ||
      isNaN(ts) ||
      isNaN(slab) ||
      isNaN(monthsHeld) ||
      type === ""
    ) {
      setResult("Please fill all fields correctly.");
      return;
    }

    const gain = (mp - ep) * ts;

    let tax = 0;
    let taxType = "";

    if (type === "esop" || type === "shares") {
      if (monthsHeld < 12) {
        // Short-term → taxed as per slab
        tax = gain * slab;
        taxType = "Short-Term Capital Gain (Taxed as per slab)";
      } else {
        // Long-term → flat 10% for listed shares (simplified assumption)
        tax = gain * 0.10;
        taxType = "Long-Term Capital Gain (Flat 10%)";
      }

      const cess = tax * 0.04;
      const totalTax = tax + cess;
      const profit = (mp - ep) * ts - totalTax;
      const totalAmount = mp * ts;

      setResult(
        `💼 ${taxType}\n\nTax Calculation: ((Market Value - Exercise Value) x Total Shares) x 0.01 x (Tax Slab + Capital Gain Slab) = ₹${tax.toFixed(2)}\n` +
        `Total Tax (including 4% cess): ₹${totalTax.toFixed(2)}\n` +
        `Total Amount (Total Shares x Market Price): ₹${totalAmount.toFixed(2)}\n` +
        `Profit: ₹${profit.toFixed(2)}`
      );
    } else {
      setResult("Invalid type selected.");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-green-100 text-black border-2 border-green-300 rounded-2xl p-8 mt-8 shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-black">Tax Calculation Tool</h2>
      <form onSubmit={handleCalculate} className="space-y-5">
        <div>
          <Label htmlFor="type" className="text-black mb-1 block">
            Type of Security
          </Label>
          <select
            id="type"
            value={type}
            onChange={e => setType(e.target.value)}
            className="w-full h-10 rounded-md border border-gray-300 bg-white text-black px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          >
            <option value="" disabled className="bg-green-100 text-black">Select ESOP or Shares</option>
            <option value="esop" className="bg-green-100 text-black">ESOP</option>
            <option value="shares" className="bg-green-100 text-black">Shares</option>
          </select>
        </div>
        <div>
          <Label htmlFor="marketPrice" className="text-black mb-1 block">
            Fair Market Value (FMV) per Share (₹)
          </Label>
          <Input
            id="marketPrice"
            type="number"
            value={marketPrice}
            onChange={(e) => setMarketPrice(e.target.value)}
            required
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <Label htmlFor="exercisePrice" className="text-black mb-1 block">
            Exercise / Strike Price per Share (₹)
          </Label>
          <Input
            id="exercisePrice"
            type="number"
            value={exercisePrice}
            onChange={(e) => setExercisePrice(e.target.value)}
            required
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <Label htmlFor="totalShares" className="text-black mb-1 block">
            Total Number of Shares
          </Label>
          <Input
            id="totalShares"
            type="number"
            value={totalShares}
            onChange={(e) => setTotalShares(e.target.value)}
            required
            min="1"
            step="1"
          />
        </div>
        <div>
          <Label htmlFor="taxSlab" className="text-black mb-1 block">
            Applicable Income Tax Slab
          </Label>
          <select
            id="taxSlab"
            value={taxSlab}
            onChange={e => setTaxSlab(e.target.value)}
            className="w-full h-10 rounded-md border border-gray-300 bg-white text-black px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            required
          >
            <option value="" disabled className="bg-green-100 text-black">Select Tax Slab</option>
            {TAX_SLABS.map(slab => (
              <option key={slab.label} value={slab.value} className="bg-black text-white">{slab.label}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="acquiredTime" className="text-black mb-1 block">
            Holding Period (Months)
          </Label>
          <Input
            id="acquiredTime"
            type="number"
            value={acquiredTime}
            onChange={(e) => setAcquiredTime(e.target.value)}
            required
            min="0"
            step="1"
          />
          <div className="text-xs text-gray-700 mt-1">
            If held for less than 12 months, gains are considered short-term.
          </div>
        </div>
        <div className="flex justify-center">
          <Button type="submit" className="w-fit p-3 mt-4">
            Calculate Tax
          </Button>
        </div>
      </form>
      {result && (
        <div className="mt-6 p-4 bg-black/70 rounded-xl text-white text-lg border border-[#38bdf8] whitespace-pre-wrap">
          {result}
        </div>
      )}
    </div>
  );
}
