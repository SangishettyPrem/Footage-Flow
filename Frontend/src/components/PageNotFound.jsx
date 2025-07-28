import { Home, Search } from 'lucide-react';

const PageNotFound = () => {
    const handleGoHome = () => {
        window.location.href = '/';
    };

    const handleGoBack = () => {
        window.history.back();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-4xl mx-auto w-full">
                <div className="text-center">
                    {/* 404 Number */}
                    <div className="mb-8">
                        <h1 className="text-6xl sm:text-8xl md:text-9xl lg:text-[12rem] font-bold text-gray-300 select-none leading-none">
                            404
                        </h1>
                    </div>

                    {/* Icon */}
                    <div className="mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                    </div>

                    {/* Main Message */}
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
                        Page Not Found
                    </h2>

                    {/* Description */}
                    <p className="text-gray-600 mb-8 max-w-md mx-auto text-base sm:text-lg leading-relaxed">
                        Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                        {/* Primary Button - Go Home */}
                        <button
                            onClick={handleGoHome}
                            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 min-w-[140px] cursor-pointer"
                        >
                            <Home className="w-5 h-5" />
                            Go Home
                        </button>

                        {/* Secondary Button - Go Back */}
                        <button
                            onClick={handleGoBack}
                            className="inline-flex items-center justify-center gap-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-3 px-6 rounded-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 min-w-[140px] cursor-pointer"
                        >
                            Go Back
                        </button>
                    </div>

                    {/* Additional Help Section */}
                    <div className="pt-8 border-t border-gray-200">
                        <p className="text-gray-500 text-sm mb-4">
                            If you believe this is an error, please contact support or try refreshing the page.
                        </p>

                        {/* Quick Links */}
                        <div className="flex flex-wrap justify-center gap-4 text-sm">
                            <a href="/" className="text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                                Home
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PageNotFound;