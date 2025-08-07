import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import Spinner from './Spinner';

const Watchlist = ({ db, userId, onSelectStock, appId }) => {
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!db || !userId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        const collectionPath = `artifacts/${appId}/users/${userId}/watchlist`;
        const q = collection(db, collectionPath);
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const stocks = [];
            querySnapshot.forEach((doc) => stocks.push({ id: doc.id, ...doc.data() }));
            setWatchlist(stocks);
            setLoading(false);
        }, (error) => {
            console.error("Watchlist snapshot error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [db, userId, appId]);

    const removeFromWatchlist = async (symbol) => {
        if (!db || !userId) return;
        try {
            const docPath = `artifacts/${appId}/users/${userId}/watchlist/${symbol}`;
            await deleteDoc(doc(db, docPath));
        } catch (error) {
            console.error("Error removing from watchlist:", error);
        }
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-white mb-4">My Watchlist</h3>
            {loading && <div className="flex justify-center p-4"><Spinner /></div>}
            {!loading && watchlist.length === 0 && <p className="text-gray-400">Add stocks via the star icon.</p>}
            <ul className="space-y-2">
                {watchlist.map(stock => (
                    <li key={stock.id} className="flex justify-between items-center bg-gray-700 p-2 rounded-md">
                        <button onClick={() => onSelectStock(stock.id)} className="text-left flex-grow hover:text-cyan-400 transition">
                            <span className="font-bold">{stock.id}</span>
                            <span className="text-sm text-gray-300 ml-2">{stock.name}</span>
                        </button>
                        <button onClick={() => removeFromWatchlist(stock.id)} className="text-red-500 hover:text-red-400 p-1 rounded-full transition">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Watchlist;
