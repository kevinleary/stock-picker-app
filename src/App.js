import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import ChartComponent from './components/ChartComponent';
import DataDisplay from './components/DataDisplay';
import NewsFeed from './components/NewsFeed';
import AiSummary from './components/AiSummary';
import AiRecommendations from './components/AiRecommendations';
import Watchlist from './components/Watchlist';
import AddToWatchlistButton from './components/AddToWatchlistButton';
import Spinner from './components/Spinner';
import { db, auth, onAuthStateChanged, signInAnonymously, signInWithCustomToken, collection, onSnapshot } from './services/firebase';
import { FINNHUB_BASE_URL, FINNHUB_API_KEY } from './services/finnhub';
import { appId } from './services/firebase';

export default function App() {
    const [stockData, setStockData] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [isSearching, setIsSearching] = useState(true);
    const [error, setError] = useState(null);
    const [currentSymbol, setCurrentSymbol] = useState('AAPL');
    const [userId, setUserId] = useState(null);
    const [watchlist, setWatchlist] = useState([]);
    const [newsForAI, setNewsForAI] = useState([]);

    useEffect(() => {
        if (!auth) return;
        const signIn = async () => {
             try {
                if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                    await signInWithCustomToken(auth, __initial_auth_token);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (error) {
                console.error("Authentication Error:", error);
                setError("Authentication failed.");
            }
        };
        const unsubscribe = onAuthStateChanged(auth, user => setUserId(user ? user.uid : null));
        signIn();
        return unsubscribe;
    }, []);

    const handleSearch = useCallback(async (symbol) => {
        setIsSearching(true);
        setError(null);
        setStockData(null);
        setChartData(null);
        setNewsForAI([]);
        setCurrentSymbol(symbol);

        try {
            const to = Math.floor(Date.now() / 1000);
            const from = to - (365 * 24 * 60 * 60);

            const quotePromise = fetch(`${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`).then(res => res.json());
            const profilePromise = fetch(`${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`).then(res => res.json());
            const chartPromise = fetch(`${FINNHUB_BASE_URL}/stock/candle?symbol=${symbol}&resolution=D&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`).then(res => res.json());

            const [quote, profile, chart] = await Promise.all([quotePromise, profilePromise, chartPromise]);

            if (!quote || (quote.c === 0 && quote.pc === 0)) {
                 throw new Error(`No valid price data for "${symbol}".`);
            }

            setStockData({ symbol, quote, profile });

            if (chart.s === 'ok' && chart.c?.length > 0) {
                const formattedData = chart.t.map((time, index) => ({
                    time, open: chart.o[index], high: chart.h[index], low: chart.l[index], close: chart.c[index],
                }));
                setChartData(formattedData);
            } else {
                setChartData([]);
            }

        } catch (err) {
            const enhancedError = `${err.message} This may be due to an invalid ticker or an API key issue.`;
            setError(enhancedError);
        } finally {
             setIsSearching(false);
        }
    }, []);

    useEffect(() => {
        handleSearch('AAPL');
    }, [handleSearch]);

    useEffect(() => {
        if (!db || !userId) return;
        const collectionPath = `artifacts/${appId}/users/${userId}/watchlist`;
        const q = collection(db, collectionPath);
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const stocks = [];
            querySnapshot.forEach((doc) => stocks.push({ id: doc.id, ...doc.data() }));
            setWatchlist(stocks);
        }, (error) => console.error("Watchlist listener error:", error));
        return unsubscribe;
    }, [db, userId]);

    const handleNewsFetched = useCallback((news) => setNewsForAI(news), []);

    return (
        <div className="bg-gray-900 text-gray-200 min-h-screen font-sans">
            <Header />
            <main className="container mx-auto p-2 sm:p-4 lg:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <SearchBar onSearch={handleSearch} isSearching={isSearching} />

                        {error && (
                             <div className="bg-red-900 border border-red-500 text-red-200 px-4 py-3 rounded-lg shadow-md" role="alert">
                                <strong className="font-bold">Error: </strong>
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}

                        {isSearching && !error && (
                            <div className="flex flex-col items-center justify-center p-8 bg-gray-800 rounded-lg space-y-4">
                               <Spinner size="lg" />
                               <p className="text-lg">Fetching data for {currentSymbol}...</p>
                            </div>
                        )}

                        {!isSearching && stockData && (
                            <div className="space-y-6">
                                <div className="flex items-center">
                                    <div className="flex-grow">
                                        <DataDisplay data={stockData} />
                                    </div>
                                    <AddToWatchlistButton db={db} userId={userId} stockData={stockData} watchlist={watchlist} appId={appId} />
                                </div>
                                <ChartComponent data={chartData} />
                                <AiSummary symbol={stockData.symbol} news={newsForAI} />
                            </div>
                        )}

                    </div>

                    {/* Right Sidebar Column */}
                    <div className="lg:col-span-1 space-y-6">
                         <AiRecommendations onSelectStock={handleSearch} />
                         <Watchlist db={db} userId={userId} onSelectStock={handleSearch} appId={appId} />
                         {!isSearching && currentSymbol && (
                            <NewsFeed symbol={currentSymbol} onNewsFetched={handleNewsFetched} />
                         )}
                    </div>
                </div>
            </main>
        </div>
    );
}
