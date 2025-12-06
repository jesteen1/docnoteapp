import React from 'react';

interface LoadingSpinnerProps {
    fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ fullScreen = false }) => {
    const spinner = (
        <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-500 font-medium animate-pulse">Loading...</p>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                {spinner}
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center py-12">
            {spinner}
        </div>
    );
};

export default LoadingSpinner;
