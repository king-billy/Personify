'use client';

import { useRouter } from 'next/navigation';

export default function LoginSection() {
  const router = useRouter();

  return (
    <div className="mt-12">
      <button 
        onClick={() => router.push('/success')}
        className="bg-white text-black py-3 px-12 rounded-full font-medium text-lg hover:bg-gray-300 transition cursor-pointer"
      >
        Login with Spotify
      </button>
    </div>
  )
}
