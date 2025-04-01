import LoginSection from '@/components/LoginSection'
import Image from 'next/image'
import React from 'react'


const cards = Array(9).fill(null)

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex flex-col md:flex-row flex-1 p-4 sm:p-6 md:p-8 lg:p-10">
        {/* Left Side */}
        <div className="w-full md:w-1/2 flex flex-col justify-center 
                       md:pr-6 lg:pr-8 xl:pr-12">
          <div className="max-w-[520px] 2xl:max-w-[640px]">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl 
                          xl:text-7xl font-bold text-pink-200 leading-snug
                         transition-transform">
              Personify.
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-xl 
                         mt-3 md:mt-4 lg:mt-5 max-w-md lg:max-w-lg
                         text-pink-100/90">
              What's your vibe? Deep dive into your music personality and see how you match with others.
            </p>
            <div className="mt-4 md:mt-6 lg:mt-8">
              <LoginSection />
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full md:w-1/2 mt-6 md:mt-0 
                       flex items-center justify-center">
          <div className="w-full max-w-3xl">
            <div className="grid grid-cols-2 md:grid-cols-3 
                           gap-2 sm:gap-3 md:gap-3 lg:gap-4">
              {cards.map((_, index) => (
                <div 
                  key={index} 
                  className="rounded-lg sm:rounded-xl overflow-hidden 
                            aspect-square bg-gray-800/50 p-2 sm:p-3
                            hover:scale-105 transition-transform
                            hover:bg-gray-800/70 cursor-pointer"
                >
                  <Image 
                    src="/vercel.svg"
                    alt={`Vibe card ${index + 1}`}
                    width={512}
                    height={512}
                    className="w-full h-full object-contain opacity-75 
                             hover:opacity-100 transition-opacity"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
