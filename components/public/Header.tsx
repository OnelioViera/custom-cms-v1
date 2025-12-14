import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-blue-900">
              Lindsay Precast
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              About
            </Link>
            <Link href="/services" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Services
            </Link>
            <Link href="/projects" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Projects
            </Link>
            <Link href="/team" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Team
            </Link>
            <Link href="/contact">
              <Button variant="default">
                Contact Us
              </Button>
            </Link>
          </div>

          {/* Mobile menu button - we'll add this later */}
          <div className="md:hidden">
            <Button variant="outline" size="sm">
              Menu
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
}
