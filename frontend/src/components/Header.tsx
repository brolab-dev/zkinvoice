"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBalance, useAccount } from "wagmi";
import { formatEther } from "viem";

const navItems = [
  { name: "Dashboard", href: "/" },
  { name: "Create Invoice", href: "/invoice/create" },
  { name: "My Invoices", href: "/invoices" },
  { name: "KYC", href: "/kyc" },
];

export function Header() {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });

  return (
    <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ZK</span>
              </div>
              <span className="text-xl font-bold text-white">Invoice</span>
            </Link>
            
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "bg-violet-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {isConnected && balance && (
              <div className="hidden sm:flex items-center px-3 py-1.5 bg-gray-800 rounded-lg">
                <span className="text-white font-medium">
                  {parseFloat(formatEther(balance.value)).toFixed(4)} MNT
                </span>
              </div>
            )}
            <ConnectButton showBalance={false} />
          </div>
        </div>
      </div>
    </header>
  );
}

