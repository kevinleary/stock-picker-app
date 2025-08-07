import React, { useState } from 'react';
import Spinner from './Spinner';

const SearchBar = ({ onSearch, isSearching }) => {
    const [symbol, setSymbol] = useState('AAPL');

    const handleSearch = (e) => {
        e.preventDefault();
        if (symbol.trim()) {
            onSearch(symbol.trim().toUpperCase());
        }
    };

    return (
        <form onSubmit={handleSearch} className="p-4 bg-gray-800 rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row items-center gap-3">
                <label htmlFor="stock-search" className="sr-only">Search Stock</label>
                <input
                    id="stock-search"
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    placeholder="Enter Stock Ticker (e.g., TSLA)"
                    className="w-full sm:flex-grow bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-200"
                />
                <button
                    type="submit"
                    disabled={isSearching}
                    className="w-full sm:w-auto flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-500 text-white font-bold py-2 px-6 rounded-md transition duration-200 shadow-md transform hover:scale-105"
                >
                    {isSearching ? (
                        <>
                            <Spinner size="sm" />
                            <span className="ml-2">Searching...</span>
                        </>
                    ) : (
                        'Search'
                    )}
                </button>
            </div>
        </form>
    );
};

export default SearchBar;
