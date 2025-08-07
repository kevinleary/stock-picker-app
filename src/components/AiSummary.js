import React, { useState, useEffect, useCallback } from 'react';
import Spinner from './Spinner';

const AiSummary = ({ symbol, news }) => {
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);

    const generateSummary = useCallback(async () => {
        if (!news || news.length === 0) {
            setSummary('');
            return;
        };
        setLoading(true);
        setSummary('');

        const headlines = news.map(n => n.headline).join('\n');
        const prompt = `Based on the following recent news headlines for ${symbol}, provide a brief, one-paragraph analysis of the overall market sentiment. Is it positive, negative, or neutral? Mention key themes.\n\nHeadlines:\n${headlines}`;

        try {
            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
            const apiKey = ""; // IMPORTANT: This should be handled securely, e.g., via a backend proxy
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`API call failed: ${response.status}`);

            const result = await response.json();
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
            setSummary(text || 'Could not generate AI summary.');

        } catch (error) {
            console.error("Gemini API error:", error);
            setSummary('Failed to generate AI summary.');
        } finally {
            setLoading(false);
        }
    }, [symbol, news]);

    useEffect(() => {
        generateSummary();
    }, [generateSummary]);

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-white mb-3">AI News Analysis</h3>
            {loading && <div className="flex items-center text-cyan-400"><Spinner size="sm"/> <span className="ml-2">Analyzing...</span></div>}
            {!loading && summary && <p className="text-gray-300 whitespace-pre-wrap">{summary}</p>}
            {!loading && !summary && <p className="text-gray-400">AI analysis appears here.</p>}
        </div>
    );
};

export default AiSummary;
