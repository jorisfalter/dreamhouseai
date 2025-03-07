import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Header from '../components/Header';

interface House {
  _id: string;
  prompt: string;
  imageUrl: string;
  imageData: string;
  createdAt: string;
}

export default function Gallery() {
  const [houses, setHouses] = useState<House[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<{ url: string; prompt: string } | null>(null);

  useEffect(() => {
    const fetchHouses = async () => {
      try {
        const response = await fetch('/api/houses');
        const data = await response.json();
        console.log('Fetched houses:', data);
        setHouses(data);
      } catch (error) {
        console.error('Error fetching houses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHouses();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Head>
        <title>Gallery - Dream House AI</title>
        <meta name="description" content="Gallery of AI-generated dream houses" />
      </Head>

      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            Dream House Gallery
          </h1>
          <p className="text-xl text-gray-600">
            Explore AI-generated dream houses from our community
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.isArray(houses) ? houses.map((house) => (
              <div
                key={house._id}
                className="bg-white/70 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-102"
              >
                <div className="relative aspect-square cursor-pointer" onClick={() => setSelectedImage({ url: house.imageData, prompt: house.prompt })}>
                  {house.imageData ? (
                    <img
                      src={house.imageData}
                      alt={house.prompt}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Error loading image:', e);
                        (e.target as HTMLImageElement).src = '/placeholder-house.png'; // Fallback image
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <p className="text-gray-500">Image not available</p>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <p className="text-gray-800 line-clamp-3">{house.prompt}</p>
                </div>
              </div>
            )) : null}
          </div>
        )}

        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="max-w-4xl w-full bg-white rounded-lg overflow-hidden shadow-xl">
              <img
                src={selectedImage.url}
                alt={selectedImage.prompt}
                className="w-full h-auto"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="p-4 bg-white">
                <p className="text-gray-800">{selectedImage.prompt}</p>
              </div>
            </div>
          </div>
        )}

        {!isLoading && houses.length === 0 && (
          <div className="text-center text-gray-600 py-12">
            No houses generated yet. Be the first to create one!
          </div>
        )}
      </main>
    </div>
  );
} 