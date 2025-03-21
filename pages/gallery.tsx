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

export default function Gallery() {
  const [houses, setHouses] = useState<House[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<{ url: string; prompt: string } | null>(null);
  const [houseImages, setHouseImages] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchHouses = async () => {
      try {
        const response = await fetch('/api/houses');
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
        } else {
          console.error('Error:', result.message);
        }
      } catch (error) {
        console.error('Error fetching houses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHouses();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Gallery - Dream House AI</title>
        <meta name="description" content="Gallery of AI-generated dream houses" />
        <link rel="icon" href="/favicon.ico" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.isArray(houses) ? houses.map((house) => (
              <div
                key={house._id}
                className="overflow-hidden"
              >
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
                <div className="pt-2">
                  <p className="text-gray-800 text-sm line-clamp-2">{house.prompt}</p>
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

        {!isLoading && houses.length === 0 && (
          <div className="text-center text-gray-600 py-12">
            No houses generated yet. Be the first to create one!
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
} 