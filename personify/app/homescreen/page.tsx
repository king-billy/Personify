import React from 'react';

export default function HomeScreen() {
    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex flex-row md:flex-row flex-1 p-4 sm:p-6 md:p-8 lg:p-10">
                {/* Individual components*/}
                    <div className="flex flex-col items-center justify-center w-full md:w-1/2 bg-amber-500"><h1>Component 1</h1></div>
                    <div className="flex items-center justify-center w:full md:w-1/2 bg-red-500"><h1>Component 2</h1></div>
                    
            </div>
            <div className="flex flex-row items-center flex-1/2 justify-center bg-blue-500"><h1>Component 3</h1></div>

        </div>
    )
}