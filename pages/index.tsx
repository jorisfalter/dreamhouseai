import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Header from '../components/Header';

interface House {
  _id: string;
  prompt: string;
  imageUrl: string;
  createdAt: string;
}

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [houses, setHouses] = useState<House[]>([]);
  const [houseImages, setHouseImages] = useState<Record<string, string>>({});

  const generateHouse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/generate-house', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await response.json();
      setGeneratedImage(data.imageUrl);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchHouses = async () => {
      try {
        const response = await fetch('/api/houses');
        const data = await response.json();
        setHouses(data);
        
        // Fetch images for each house
        data.forEach(async (house: House) => {
          const imageResponse = await fetch(`/api/house/${house._id}`);
          const imageData = await imageResponse.json();
          setHouseImages(prev => ({
            ...prev,
            [house._id]: imageData.imageData
          }));
        });
      } catch (error) {
        console.error('Error fetching houses:', error);
      }
    };

    fetchHouses();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 transition-all duration-500">
      <Head>
        <title>Dream House Generator</title>
        <meta name="description" content="Generate your dream house using AI" />
      </Head>

      <Header />

      {/* Main Content - Centered */}
      <main className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16">
        <div className="max-w-3xl w-full">
          <div className="text-center mb-12 transform hover:scale-105 transition-transform duration-300">
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
              Dream House Generator
            </h1>
            <p className="text-xl text-gray-600 animate-fade-in">
              Describe your perfect home and watch it come to life!
            </p>
          </div>

          <form onSubmit={generateHouse} className="space-y-6">
            <div className="transform hover:scale-101 transition-all duration-300">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-gray-200 shadow-lg p-4 
                  focus:ring-2 focus:ring-purple-500 focus:border-transparent
                  bg-white/70 backdrop-blur-sm transition-all duration-300
                  hover:shadow-xl"
                placeholder="Describe your dream house... (e.g., A modern minimalist house with large windows, surrounded by nature)"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !prompt}
              className={`w-full flex justify-center py-4 px-6 rounded-xl text-lg font-medium
                transform hover:scale-102 transition-all duration-300 
                shadow-lg hover:shadow-xl
                ${isLoading || !prompt 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                }
                disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span className="flex items-center">
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  'Generate Dream House'
                )}
              </span>
            </button>
          </form>

          {generatedImage && (
            <div className="mt-12 transform hover:scale-102 transition-all duration-500">
              <div className="rounded-xl overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow duration-300">
                <img
                  src={generatedImage}
                  alt="Generated dream house"
                  className="w-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 