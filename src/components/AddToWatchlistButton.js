import React from 'react';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

const AddToWatchlistButton = ({ db, userId, stockData, watchlist, appId }) => {
    if (!stockData || !stockData.symbol || !db || !userId) return null;

    const { symbol, profile } = stockData;
    const isInWatchlist = watchlist.some(item => item.id === symbol);

    const handleWatchlistToggle = async () => {
        const docPath = `artifacts/${appId}/users/${userId}/watchlist/${symbol}`;
        try {
            if (isInWatchlist) {
                await deleteDoc(doc(db, docPath));
            } else {
                await setDoc(doc(db, docPath), { name: profile?.name || symbol });
            }
        } catch (error) {
             console.error("Error toggling watchlist:", error);
        }
    };

    return (
        <button
          onClick={handleWatchlistToggle}
          className={`ml-4 p-2 rounded-full transition duration-200 ${isInWatchlist ? 'bg-yellow-500 text-white' : 'bg-gray-600 hover:bg-yellow-500 text-gray-300 hover:text-white'}`}
          title={isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        </button>
    );
};

export default AddToWatchlistButton;
