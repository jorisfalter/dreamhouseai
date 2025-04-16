import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface House {
  _id: string;
  prompt: string;
  imageUrl: string;
  imageData: string;
  createdAt: string;
}

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [houses, setHouses] = useState<House[]>([]);
  const [selectedImage, setSelectedImage] = useState<{ url: string; prompt: string } | null>(null);
  const [houseImages, setHouseImages] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  const generateHouse = async (e: React.FormEvent) => {
    e.preventDefault();
    


    setIsLoading(true);
    setError('');
    setGeneratedImage('');
    
    try {
      // Start the generation process
      const startResponse = await fetch('/api/start-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const startData = await startResponse.json();
      if (!startResponse.ok || !startData.success) {
        throw new Error(startData.message || 'Failed to start generation');
      }

      // Poll for results
      const jobId = startData.jobId;
      let attempts = 0;
      const maxAttempts = 60; // 2 minutes maximum (with 2-second intervals)

      while (attempts < maxAttempts) {
        const statusResponse = await fetch(`/api/check-status/${jobId}`);
        const statusData = await statusResponse.json();

        if (!statusResponse.ok || !statusData.success) {
          throw new Error(statusData.message || 'Failed to check status');
        }

        if (statusData.status === 'completed') {
          setGeneratedImage(statusData.imageData);
          break;
        }

        if (statusData.status === 'failed') {
          throw new Error(statusData.error || 'Generation failed');
        }

        // Wait 2 seconds before checking again
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
      }

      if (attempts >= maxAttempts) {
        throw new Error('Generation is taking longer than expected. Please check the gallery later.');
      }

    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchHouses = async () => {
      try {
        const response = await fetch('/api/houses?limit=8'); // Limit to 8 images for homepage
        const result = await response.json();
        if (result.success) {
          setHouses(result.data);
          
          // Fetch images for each house
          result.data.forEach(async (house: House) => {
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
        }
      } catch (error) {
        console.error('Error fetching houses:', error);
      }
    };

    fetchHouses();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Dream House AI</title>
        <meta name="description" content="Generate your dream house with AI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">Dream House AI</h1>
          <p className="text-xl text-gray-600">Describe your dream house and see it come to life</p>
        </div>

        <div className="max-w-3xl mx-auto mb-16">
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

          {error && (
            <div className="mt-4 text-red-500">
              {error}
            </div>
          )}
        </div>

          {/* gallery */}
        <section className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Recent Creations
            </h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.isArray(houses) ? houses.map((house) => (
                <div key={house._id} className="overflow-hidden">
                  <div 
                    className="relative aspect-square cursor-pointer" 
                    onClick={() => setSelectedImage({ 
                      url: houseImages[house._id] || house.imageData, 
                      prompt: house.prompt 
                    })}
                  >
                    {(houseImages[house._id] || house.imageData) ? (
                      <img
                        src={houseImages[house._id] || house.imageData}
                        alt={house.prompt}
                        className="w-full h-full object-cover hover:opacity-90 transition-opacity rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-house.png';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <p className="text-gray-500">Loading image...</p>
                      </div>
                    )}
                  </div>
                  <div className="pt-2">
                    <p className="text-gray-800 text-sm line-clamp-2">{house.prompt}</p>
                  </div>
                </div>
              )) : null}
            </div>
          )}

          <div className="text-center mt-8">
            <a
              href="/gallery"
              className="inline-block px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              View Gallery
            </a>
          </div>
        </section>

        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="max-w-4xl w-full bg-white rounded-xl overflow-hidden shadow-xl">
              <img
                src={selectedImage.url}
                alt={selectedImage.prompt}
                className="w-full h-auto rounded-t-xl"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="p-4 bg-white">
                <p className="text-gray-800">{selectedImage.prompt}</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
} 