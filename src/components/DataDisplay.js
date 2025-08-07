import React from 'react';

const DataDisplay = ({ data }) => {
    if (!data || !data.quote) return null;
    const { quote, profile } = data;
    const change = quote.d;
    const changePercent = quote.dp;
    const isPositive = change >= 0;

    const stats = [
        { label: 'Previous Close', value: quote.pc?.toFixed(2) },
        { label: 'Open', value: quote.o?.toFixed(2) },
        { label: 'Day High', value: quote.h?.toFixed(2) },
        { label: 'Day Low', value: quote.l?.toFixed(2) },
        { label: 'Market Cap', value: profile?.marketCapitalization ? `${profile.marketCapitalization.toFixed(2)}M` : 'N/A' },
        { label: 'Exchange', value: profile?.exchange || 'N/A' },
    ];

    return (
        <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">{profile?.name || data.symbol} <span className="text-lg text-gray-400">({data.symbol})</span></h2>
                    {profile?.weburl && <a href={profile.weburl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 transition duration-200 text-sm">{profile.weburl}</a>}
                </div>
                <div className="text-right mt-4 sm:mt-0">
                    <p className="text-3xl sm:text-4xl font-bold text-white">{quote.c?.toFixed(2)}</p>
                    <p className={`text-lg font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {isPositive ? '+' : ''}{change?.toFixed(2)} ({changePercent?.toFixed(2)}%)
                    </p>
                </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-gray-700 pt-4">
                {stats.map(stat => (
                    <div key={stat.label}>
                        <p className="text-sm text-gray-400">{stat.label}</p>
                        <p className="text-md font-semibold text-white">{stat.value || '---'}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DataDisplay;
