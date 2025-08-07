import React, { useState, useEffect } from 'react';
import Spinner from './Spinner';
import { FINNHUB_BASE_URL, FINNHUB_API_KEY } from '../services/finnhub';

const NewsFeed = ({ symbol, onNewsFetched }) => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!symbol) return;
        let isMounted = true;
        setLoading(true);
        setError(null);

        const fetchNews = async () => {
            try {
                const to = new Date().toISOString().split('T')[0];
                const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                const response = await fetch(`${FINNHUB_BASE_URL}/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`);
                if (!response.ok) throw new Error(`Failed to fetch news (status: ${response.status})`);
                const data = await response.json();
                if(isMounted) {
                    if (Array.isArray(data)) {
                        setNews(data.slice(0, 10));
                        onNewsFetched(data.slice(0, 5));
                    } else {
                        setNews([]);
                        onNewsFetched([]);
                    }
                }
            } catch (err) {
                if(isMounted) setError(err.message);
            } finally {
             if(isMounted) setLoading(false);
            }
        };
        fetchNews();
        return () => { isMounted = false; }
    }, [symbol, onNewsFetched]);

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-white mb-4">Latest News</h3>
            {loading && <div className="flex justify-center p-4"><Spinner /></div>}
            {error && <p className="text-red-400 text-sm">Error: {error}</p>}
            {!loading && news.length === 0 && <p className="text-gray-400">No recent news found.</p>}
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {news.map(item => (
                    <a href={item.url} key={item.id} target="_blank" rel="noopener noreferrer" className="block p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition duration-200">
                        <p className="font-semibold text-white">{item.headline}</p>
                        <p className="text-xs text-gray-400 mt-1">{item.source} - {new Date(item.datetime * 1000).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-300 mt-2">{item.summary}</p>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default NewsFeed;
