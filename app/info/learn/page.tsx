'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LearnMore() {
  return (
    <main className="min-h-screen bg-gradient-to-tr from-[#1e1433] via-[#2b1858] to-[#3a2a59] text-white px-6 py-20 flex flex-col items-center">
      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl md:text-6xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-600 to-purple-500"
      >
        How Safelist Works
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="max-w-3xl text-lg md:text-xl text-purple-300 mb-12 text-center leading-relaxed"
      >
        Ready to dive into the future of trading pre-IPO shares? Here’s the lowdown on how
        Safelist makes it safe, simple, and slick for you to buy and sell shares in startups
        before they hit the big leagues.
      </motion.p>

      <motion.section
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.7 }}
        className="max-w-4xl bg-[#2b1858]/70 backdrop-blur-md rounded-2xl p-10 shadow-lg border border-purple-700"
      >
        <h2 className="text-3xl font-semibold mb-6 text-purple-300 text-center">
          Step-by-Step: How We Trade Shares
        </h2>

        <ol className="list-decimal list-inside space-y-6 text-purple-200 text-lg">
          <li>
            <strong>Create an Account & Verify</strong> – Sign up and complete KYC for your
            identity verification. This keeps everyone safe.
          </li>
          <li>
            <strong>Browse Companies</strong> – Explore verified startups listed on Safelist,
            with all the data you need to make smart moves.
          </li>
          <li>
            <strong>Place Your Bid or Offer</strong> – Want to buy shares? Make a bid.
            Want to sell? Post your offer with price and quantity.
          </li>
          <li>
            <strong>Match & Confirm</strong> – Our platform matches buyers and sellers
            securely. Once both sides agree, the trade is locked in.
          </li>
          <li>
            <strong>Secure Transactions</strong> – Funds and share transfers happen through
            trusted escrow services, ensuring no risk for either party.
          </li>
          <li>
            <strong>Track & Manage Portfolio</strong> – Keep tabs on your equity and trade
            history all in one place.
          </li>
        </ol>

        <p className="mt-8 text-center text-purple-400 font-semibold">
          It’s fast, secure, and transparent — just how modern trading should be.
        </p>
      </motion.section>

      <Link href="/" className="mt-12">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-4 rounded-full shadow-lg transition"
        >
          Back to Home
        </motion.button>
      </Link>
    </main>
  );
}
