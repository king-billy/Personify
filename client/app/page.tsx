"use client";
import LoginButtonHomePage from "@/components/LoginButtonHomePage";
import Image from "next/image";

const cards = Array(9).fill(null);

const Home = () => {
	return (
		<div className="min-h-screen flex flex-col">
			<main className="flex flex-col md:flex-row flex-1 p-4 sm:p-6 md:p-8 lg:p-10">
				{/* Left Side */}
				<div
					className="w-full md:w-1/2 flex flex-col justify-center 
                       md:pr-6 lg:pr-8 xl:pr-12
                       items-center md:items-start"
				>
					<div
						className="max-w-[520px] 2xl:max-w-[640px]
                          text-center md:text-left"
					>
						<h1
							className="text-5xl sm:text-5xl md:text-6xl lg:text-7xl 
                          xl:text-7xl font-bold text-[#F7CFD8] leading-normal
                         transition-transform font-inter
                         pt-8 md:pt-0"
						>
							Personify.
						</h1>
						<p
							className="text-sm sm:text-lg md:text-xl lg:text-xl 
                         mt-3 md:mt-4 lg:mt-5 max-w-md lg:max-w-lg
                         text-[#F7CFD8]
                         px-6 md:px-0"
						>
							{
								"What's your vibe? Deep dive into your music personality and see how you match with others."
							}
						</p>
						<div
							className="mt-4 md:mt-6 lg:mt-8
                            flex justify-center md:justify-start"
						>
							<LoginButtonHomePage />
						</div>
					</div>
				</div>

				{/* Right Side for desktop */}
				<div
					className="w-full md:w-1/2 mt-6 md:mt-0 
                       hidden md:flex items-center justify-center"
				>
					<div className="w-full max-w-3xl">
						<div
							className="grid grid-cols-2 md:grid-cols-3 
                           gap-2 sm:gap-3 md:gap-3 lg:gap-4"
						>
							{cards.map((_, index) => (
								<div
									key={index}
									className="rounded-lg sm:rounded-xl overflow-hidden 
                            aspect-square p-2 sm:p-3 transition-transform"
								>
									<Image
										src={`/Rectangle ${index + 1}.png`}
										alt={`Vibe card ${index + 1}`}
										width={512}
										height={512}
										className="w-full h-full object-contain transition-opacity"
									/>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Mobile
        <div className="w-full flex md:hidden items-center justify-center mt-6">
          <div className="w-full max-w-3xl text-center p-4 border-2 border-dashed rounded-lg">
            MOBILE
          </div>
        </div>
         */}
				{/* Mobile Infinite Scroll */}
				<div className="w-full flex md:hidden items-center justify-center mt-6 overflow-hidden">
					<div className="relative w-full max-w-3xl h-[300px]">
						<div className="absolute flex w-auto animate-infinite-scroll">
							{[...cards, ...cards].map((_, index) => (
								<div
									key={index}
									className="flex-shrink-0 rounded-lg sm:rounded-xl overflow-hidden 
                              aspect-square p-2 sm:p-3 w-[200px] transition-transform"
								>
									<Image
										src={`/Rectangle ${(index % cards.length) + 1}.png`}
										alt={`Vibe card ${(index % cards.length) + 1}`}
										width={512}
										height={512}
										className="w-full h-full object-contain transition-opacity"
									/>
								</div>
							))}
						</div>
					</div>
				</div>
			</main>
		</div>
	);
};

export default Home;
