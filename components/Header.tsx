import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 transform hover:scale-105 transition-transform duration-300">
            <div className="w-8 h-8 relative">
              <Image
                src="/logo.png"
                alt="Dream House AI Logo"
                width={32}
                height={32}
                className="object-contain w-auto h-auto"
              />
            </div>
            <span className="text-xl font-semibold text-gray-800">
              DreamHouse AI
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-8">
            <Link
              href="/gallery"
              className="text-gray-600 hover:text-purple-600 transition-colors duration-300 font-medium"
            >
              Gallery
            </Link>
            <Link
              href="#"
              className="text-gray-600 hover:text-purple-600 transition-colors duration-300 font-medium"
            >
              How it Works
            </Link>
            <Link
              href="#"
              className="text-gray-600 hover:text-purple-600 transition-colors duration-300 font-medium"
            >
              About
            </Link>
            <Link
              href="/search"
              className="text-gray-600 hover:text-purple-600 transition-colors duration-300 font-medium"
            >
              Search
            </Link>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg 
              transform hover:scale-105 transition-all duration-300 hover:shadow-lg font-medium">
              Sign In
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
} 