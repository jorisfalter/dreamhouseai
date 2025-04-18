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

  

  return (
    <div className="min-h-screen bg-white">
     
      <Head>
        <title>Gallery - Dream House AI</title>
        <meta name="description" content="Search of AI-generated dream houses" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            Dream House Search
          </h1>
          <p className="text-xl text-gray-600">
            Explore AI-generated dream houses from our community
          </p>
        </div>

      </main>

      <Footer />
    </div>
  );
} 