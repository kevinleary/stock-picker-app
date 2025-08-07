import React, { useState } from 'react';
import Spinner from './Spinner';
import { FINNHUB_BASE_URL, FINNHUB_API_KEY } from '../services/finnhub';

const AiRecommendations = ({ onSelectStock }) => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getRecommendations = async () => {
        setLoading(true);
        setError(null);
        setRecommendations([]);

        try {
            // 1. Fetch general market news
            const newsResponse = await fetch(`${FINNHUB_BASE_URL}/news?category=general&token=${FINNHUB_API_KEY}`);
            if (!newsResponse.ok) throw new Error('Failed to fetch market news.');
            const marketNews = await newsResponse.json();
            const headlines = marketNews.slice(0, 15).map(n => n.headline).join('\n');

            // 2. Prompt Gemini for recommendations in JSON format
            const prompt = `Act as a financial analyst. Based on these recent market news headlines, identify 3 promising stocks. For each stock, provide the ticker symbol, company name, and a concise one-sentence reason for the recommendation. Do not include any stocks that are not publicly traded.\n\nHeadlines:\n${headlines}`;

            const payload = {
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                symbol: { type: "STRING" },
                                companyName: { type: "STRING" },
                                reason: { type: "STRING" }
                            },
                            required: ["symbol", "companyName", "reason"]
                        }
                    }
                }
            };
            const apiKey = ""; // IMPORTANT: This should be handled securely
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

            const geminiResponse = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!geminiResponse.ok) throw new Error(`Gemini API failed with status: ${geminiResponse.status}`);

            const result = await geminiResponse.json();
            const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;

            if (jsonText) {
                setRecommendations(JSON.parse(jsonText));
            } else {
                throw new Error("AI model returned an empty response.");
            }

        } catch (err) {
            console.error("AI Recommendation Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-white mb-3">AI Stock Recommendations</h3>
            <p className="text-xs text-gray-500 mb-4 italic">
                Disclaimer: This is not financial advice. AI-generated content may be inaccurate. Always do your own research.
            </p>
            <button
                onClick={getRecommendations}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition duration-200 flex items-center justify-center"
            >
                {loading ? <><Spinner size="sm" /><span className="ml-2">Analyzing Market...</span></> : 'Get New Recommendations'}
            </button>

            <div className="mt-4 space-y-3">
                {error && <p className="text-red-400 text-sm">Error: {error}</p>}
                {recommendations.map((stock) => (
                    <div key={stock.symbol} className="bg-gray-700 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                            <h4 className="font-bold text-white">{stock.companyName} ({stock.symbol})</h4>
                            <button
                                onClick={() => onSelectStock(stock.symbol)}
                                className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold"
                            >
                                View
                            </button>
                        </div>
                        <p className="text-sm text-gray-300 mt-1">{stock.reason}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AiRecommendations;
