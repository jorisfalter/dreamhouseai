import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface House {
  _id: string;
  prompt: string;
  imageUrl: string;
  imageData: string;
  createdAt: string;
}

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [houses, setHouses] = useState<House[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [houseImages, setHouseImages] = useState<Record<string, string>>({});

  // Handle clicks outside suggestions box
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions when user types
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length >= 2) {
      try {
        const response = await fetch('/api/autocomplete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ searchTerm: value }),
        });

        const data = await response.json();
        console.log('Autocomplete response:', data);

        if (data.suggestions) {
          setSuggestions(data.suggestions);
          setShowSuggestions(true);
        } else {
          console.log('No suggestions found:', data);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    // Optionally trigger search immediately
    handleSearch(suggestion);
  };

  // Modified handleSearch to accept direct search term
  const handleSearch = async (term?: string) => {
    const searchValue = term || searchTerm;
    setIsLoading(true);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchTerm: searchValue }),
      });

      const data = await response.json();
      setHouses(data.results);
      
      // Fetch images for each house
      data.results.forEach(async (house: House) => {
        try {
          const imageResponse = await fetch(`/api/house/${house._id}`);
          const imageData = await imageResponse.json();
          setHouseImages(prev => ({
            ...prev,
            [house._id]: imageData.imageData
          }));
        } catch (error) {
          console.error(`Error fetching image for house ${house._id}:`, error);
        }
      });
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Search - Dream House AI</title>
        <meta name="description" content="Search AI-generated dream houses" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            Dream House Search
          </h1>
          <p className="text-xl text-gray-600">
            Search AI-generated dream houses from our community
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="max-w-2xl mx-auto mb-12">
          <div className="relative flex gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={() => searchTerm.length >= 3 && setShowSuggestions(true)}
                placeholder="Search houses by description... (e.g., 'modern villa with pool')"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div 
                  ref={suggestionsRef}
                  className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg"
                >
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {houses.map((house) => (
            <div key={house._id} className="border rounded-lg overflow-hidden shadow-lg">
              <div className="relative h-64 w-full">
                {(houseImages[house._id] || house.imageData) ? (
                  <img
                    src={houseImages[house._id] || house.imageData}
                    alt={house.prompt}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Error loading image:', e);
                      (e.target as HTMLImageElement).src = '/placeholder-house.png';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <p className="text-gray-500">Loading image...</p>
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="text-gray-700">{house.prompt}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(house.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {houses.length === 0 && !isLoading && (
          <p className="text-center text-gray-600 mt-8">
            No houses found. Try a different search term.
          </p>
        )}
      </main>

      <Footer />
    </div>
  );
} 