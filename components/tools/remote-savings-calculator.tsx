"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  DollarSign,
  Clock,
  Car,
  Train,
  Coffee,
  Sparkles,
  Share2,
  Check,
  ArrowRight,
  TrendingUp,
  Leaf,
  Download,
} from "lucide-react";

export function RemoteSavingsCalculator() {
  // Input State
  const [commuteMode, setCommuteMode] = useState<"car" | "transit">("car");
  const [daysInOffice, setDaysInOffice] = useState(5);
  const [roundTripMiles, setRoundTripMiles] = useState(32);
  const [roundTripMinutes, setRoundTripMinutes] = useState(75);
  const [gasPrice, setGasPrice] = useState(3.65);
  const [mpg, setMpg] = useState(25);
  const [dailyTransitCost, setDailyTransitCost] = useState(8.50);
  const [dailyParkingTolls, setDailyParkingTolls] = useState(6.00);
  const [dailyLunchCoffee, setDailyLunchCoffee] = useState(16.00);
  const [monthlyAttire, setMonthlyAttire] = useState(50);
  const [annualSalary, setAnnualSalary] = useState(110000);

  // UI state
  const [copied, setCopied] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [reportSent, setReportSent] = useState(false);

  // 48 working weeks per year (assuming 4 weeks vacation/holidays)
  const workWeeksPerYear = 48;
  const workDaysPerYear = daysInOffice * workWeeksPerYear;

  // Financial calculations
  const calculations = useMemo(() => {
    // 1. Commute Costs
    let annualTransitCost = 0;
    let annualFuelCost = 0;
    let annualMaintenanceCost = 0;
    const annualParkingTolls = dailyParkingTolls * workDaysPerYear;

    if (commuteMode === "car") {
      const annualMiles = roundTripMiles * workDaysPerYear;
      annualFuelCost = (annualMiles / (mpg || 25)) * (gasPrice || 3.50);
      // Wear, tear & depreciation (~$0.18/mile marginal cost beyond gas)
      annualMaintenanceCost = annualMiles * 0.18;
    } else {
      annualTransitCost = dailyTransitCost * workDaysPerYear;
    }

    const totalTransportCost = annualFuelCost + annualMaintenanceCost + annualTransitCost + annualParkingTolls;

    // 2. Food & Beverage Costs (Difference between eating out/coffee at office vs making at home)
    const homeLunchCost = 4.00;
    const marginalFoodSavingsDaily = Math.max(0, dailyLunchCoffee - homeLunchCost);
    const annualFoodSavings = marginalFoodSavingsDaily * workDaysPerYear;

    // 3. Wardrobe & Dry Cleaning
    const annualWardrobeSavings = monthlyAttire * 12;

    // 4. Total Financial Savings
    const totalCashSavings = Math.round(totalTransportCost + annualFoodSavings + annualWardrobeSavings);

    // 5. Equivalent Percentage Pay Raise
    const salary = annualSalary > 0 ? annualSalary : 100000;
    const effectiveRaisePercentage = ((totalCashSavings / salary) * 100).toFixed(1);

    // 6. Time Saved
    const annualCommuteHours = Math.round((roundTripMinutes / 60) * workDaysPerYear);
    const daysOfLifeSaved = (annualCommuteHours / 24).toFixed(1);

    // 7. Environmental Impact (EPA ~404 grams CO2 per vehicle mile)
    const annualMilesDriven = commuteMode === "car" ? roundTripMiles * workDaysPerYear : 0;
    const poundsCo2Saved = Math.round((annualMilesDriven * 0.404) * 2.20462);

    return {
      totalCashSavings,
      totalTransportCost: Math.round(totalTransportCost),
      annualFoodSavings: Math.round(annualFoodSavings),
      annualWardrobeSavings: Math.round(annualWardrobeSavings),
      effectiveRaisePercentage,
      annualCommuteHours,
      daysOfLifeSaved,
      poundsCo2Saved,
    };
  }, [
    commuteMode,
    daysInOffice,
    roundTripMiles,
    roundTripMinutes,
    gasPrice,
    mpg,
    dailyTransitCost,
    dailyParkingTolls,
    dailyLunchCoffee,
    monthlyAttire,
    annualSalary,
    workDaysPerYear,
  ]);

  const handleShare = () => {
    const text = `💡 Working remotely saves me $${calculations.totalCashSavings.toLocaleString()}/year and ${calculations.annualCommuteHours} hours of traffic. Calculate your commute savings on Remote Work Daily: https://remoteworkdaily.com/tools/remote-savings-calculator`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setReportSent(true);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner Hook */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-50 dark:bg-red-950/60 text-[#FF4742] border border-red-200 dark:border-red-900/60 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Free Engineering-as-Marketing Tool</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 dark:text-white tracking-tight leading-tight">
          How Much Do You <span className="text-[#FF4742]">Actually Save</span> Working From Home?
        </h1>
        <p className="mt-3 text-neutral-600 dark:text-neutral-400 text-sm sm:text-base max-w-2xl mx-auto">
          Going into an office costs the average employee <span className="font-bold text-neutral-900 dark:text-white">$8,000–$16,000 in cash</span> and over <span className="font-bold text-neutral-900 dark:text-white">350 hours of life</span> every year. Calculate your exact numbers below.
        </p>
      </div>

      {/* Grid: Inputs (Left) & Real-time Results Projection (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Calculator Inputs */}
        <div className="lg:col-span-7 bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <h2 className="font-extrabold text-lg text-neutral-900 dark:text-white flex items-center gap-2">
              <span>Your Current Office Commute</span>
            </h2>

            {/* Commute Mode Toggle */}
            <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setCommuteMode("car")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                  commuteMode === "car"
                    ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>Car / Driving</span>
              </button>
              <button
                type="button"
                onClick={() => setCommuteMode("transit")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                  commuteMode === "transit"
                    ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                <Train className="w-3.5 h-3.5" />
                <span>Public Transit</span>
              </button>
            </div>
          </div>

          {/* 1. Days in office */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-neutral-700 dark:text-neutral-300">Days Commuting Per Week</span>
              <span className="text-sm font-extrabold text-[#FF4742]">{daysInOffice} days / week</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={daysInOffice}
              onChange={(e) => setDaysInOffice(Number(e.target.value))}
              className="w-full accent-[#FF4742] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-neutral-400">
              <span>1 day (Hybrid)</span>
              <span>3 days</span>
              <span>5 days (Full In-Office)</span>
            </div>
          </div>

          {/* 2. Round-trip Commute Distance & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Round-trip Distance (Miles)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={roundTripMiles}
                  onChange={(e) => setRoundTripMiles(Number(e.target.value) || 0)}
                  className="w-full pl-3 pr-12 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 font-semibold">
                  miles
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Daily Commute Time (Round-trip)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="5"
                  max="360"
                  value={roundTripMinutes}
                  onChange={(e) => setRoundTripMinutes(Number(e.target.value) || 0)}
                  className="w-full pl-3 pr-14 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 font-semibold">
                  mins
                </span>
              </div>
            </div>
          </div>

          {/* 3. Conditional Vehicle Costs or Transit Cost */}
          {commuteMode === "car" ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800">
              <div>
                <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">
                  Gas Price ($/gal)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={gasPrice}
                  onChange={(e) => setGasPrice(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">
                  Car Mileage (MPG)
                </label>
                <input
                  type="number"
                  value={mpg}
                  onChange={(e) => setMpg(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">
                  Daily Parking & Tolls ($)
                </label>
                <input
                  type="number"
                  step="1"
                  value={dailyParkingTolls}
                  onChange={(e) => setDailyParkingTolls(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800">
              <div>
                <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">
                  Daily Round-trip Transit Fare ($)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={dailyTransitCost}
                  onChange={(e) => setDailyTransitCost(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1">
                  Station Parking / Rideshare ($)
                </label>
                <input
                  type="number"
                  step="1"
                  value={dailyParkingTolls}
                  onChange={(e) => setDailyParkingTolls(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* 4. Food, Coffee & Lifestyle Costs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <Coffee className="w-3.5 h-3.5 text-amber-500" />
                <span>Daily Work Lunch & Coffee ($)</span>
              </label>
              <input
                type="number"
                min="0"
                value={dailyLunchCoffee}
                onChange={(e) => setDailyLunchCoffee(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold"
              />
              <span className="text-[10px] text-neutral-400">Coffee, takeout, salad bars, snacks</span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Work Attire & Dry Cleaning ($/mo)
              </label>
              <input
                type="number"
                min="0"
                value={monthlyAttire}
                onChange={(e) => setMonthlyAttire(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold"
              />
              <span className="text-[10px] text-neutral-400">Suits, office clothes, laundry services</span>
            </div>
          </div>

          {/* 5. Salary Context */}
          <div className="space-y-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Your Current Annual Salary (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">$</span>
              <input
                type="number"
                step="5000"
                value={annualSalary}
                onChange={(e) => setAnnualSalary(Number(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold"
              />
            </div>
            <span className="text-[11px] text-neutral-400">
              Used to calculate the equivalent raise percentage working remotely gives you.
            </span>
          </div>
        </div>

        {/* Right Column: Real-Time Big Value Projection Card */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          {/* Card Hero */}
          <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 text-white p-6 sm:p-8 rounded-3xl border border-neutral-800 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#FF4742]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800/80 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                Annual Net Gain
              </span>
              <button
                type="button"
                onClick={handleShare}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied Link!" : "Share"}</span>
              </button>
            </div>

            <div className="space-y-1 mb-6">
              <div className="text-xs text-neutral-400 font-medium">Your Annual WFH Financial Savings:</div>
              <div className="text-4xl sm:text-5xl font-black text-white tracking-tight tabular-nums">
                ${calculations.totalCashSavings.toLocaleString()}
              </div>
              <div className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5 pt-1">
                <Sparkles className="w-4 h-4" />
                <span>Equivalent to an <strong className="underline decoration-emerald-500/50">+{calculations.effectiveRaisePercentage}% pay raise</strong></span>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-1 text-neutral-400 mb-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Time Reclaimed</span>
                </div>
                <div className="font-extrabold text-base text-white tabular-nums">
                  {calculations.annualCommuteHours} hours
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">
                  ≈ {calculations.daysOfLifeSaved} full 24h days of life
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-1 text-neutral-400 mb-1">
                  <Car className="w-3.5 h-3.5 text-sky-400" />
                  <span>Transit & Fuel</span>
                </div>
                <div className="font-extrabold text-base text-white tabular-nums">
                  ${calculations.totalTransportCost.toLocaleString()}
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">
                  Gas, tolls, maintenance
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-1 text-neutral-400 mb-1">
                  <Coffee className="w-3.5 h-3.5 text-amber-300" />
                  <span>Food & Coffee</span>
                </div>
                <div className="font-extrabold text-base text-white tabular-nums">
                  ${calculations.annualFoodSavings.toLocaleString()}
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">
                  Lunches & takeout saved
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-1 text-neutral-400 mb-1">
                  <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Carbon Avoided</span>
                </div>
                <div className="font-extrabold text-base text-white tabular-nums">
                  {calculations.poundsCo2Saved.toLocaleString()} lbs
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">
                  CO2 emissions prevented
                </div>
              </div>
            </div>

            {/* High-Intent Conversion CTAs */}
            <div className="mt-6 space-y-2.5">
              <Link
                href="/?workplace=remote"
                className="w-full py-3 px-4 rounded-xl text-center text-xs sm:text-sm font-black bg-[#FF4742] hover:bg-[#e03a35] text-white shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <span>Browse Verified Remote Jobs with #OpenSalaries</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <p className="text-center text-[11px] text-neutral-400">
                Keep the full ${calculations.totalCashSavings.toLocaleString()} in your bank account this year.
              </p>
            </div>
          </div>

          {/* Lead Capture: Personalized WFH Savings Report */}
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-[#FF4742]" />
              <span>Get Your Personalized WFH Savings Audit (PDF)</span>
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Includes remote state tax deduction advice, home office expense write-offs, and salary negotiation scripts.
            </p>

            {reportSent ? (
              <div className="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Check your inbox! Your personalized audit report has been generated.</span>
              </div>
            ) : (
              <form onSubmit={handleSendReport} className="mt-3 flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email..."
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-[#FF4742]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-[#FF4742] dark:hover:bg-[#FF4742] dark:hover:text-white transition-colors shrink-0"
                >
                  Send Free PDF
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
