import React, { useEffect, useRef, useState } from 'react';
import Spinner from './Spinner';

const ChartComponent = ({ data }) => {
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const resizeObserver = useRef(null);
    const [isLibLoaded, setIsLibLoaded] = useState(false);

    // Effect to dynamically load the lightweight-charts library script
    useEffect(() => {
        if (typeof window.LightweightCharts !== 'undefined') {
            setIsLibLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.id = 'lightweight-charts-script';
        script.src = 'https://unpkg.com/lightweight-charts/dist/lightweight-charts.standalone.production.js';
        script.async = true;

        script.onload = () => setIsLibLoaded(true);
        script.onerror = () => console.error("Failed to load lightweight-charts script.");

        document.body.appendChild(script);

        return () => {
            const scriptElement = document.getElementById('lightweight-charts-script');
            if(scriptElement && scriptElement.parentElement) {
                scriptElement.parentElement.removeChild(scriptElement);
            }
        };
    }, []);

    // Effect to create and manage the chart
    useEffect(() => {
        if (!isLibLoaded || !chartContainerRef.current || !data || data.length === 0 || typeof window.LightweightCharts?.createChart !== 'function') {
            return;
        }

        if (chartRef.current) {
            chartRef.current.remove();
        }

        const chart = window.LightweightCharts.createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 400,
            layout: { background: { color: '#111827' }, textColor: 'rgba(255, 255, 255, 0.9)' },
            grid: { vertLines: { color: '#374151' }, horzLines: { color: '#374151' } },
            crosshair: { mode: 0 },
            priceScale: { borderColor: '#485c7b' },
            timeScale: { borderColor: '#485c7b' },
        });
        chartRef.current = chart;

        const candleSeries = chart.addCandlestickSeries({
            upColor: '#22c55e', downColor: '#ef4444', borderDownColor: '#ef4444',
            borderUpColor: '#22c55e', wickDownColor: '#ef4444', wickUpColor: '#22c55e',
        });

        candleSeries.setData(data);
        chart.timeScale().fitContent();

        const handleResize = () => {
            if (chartRef.current && chartContainerRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        const container = chartContainerRef.current;
        resizeObserver.current = new ResizeObserver(handleResize);
        resizeObserver.current.observe(container);

        return () => {
            if (resizeObserver.current) {
                resizeObserver.current.unobserve(container);
            }
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
            }
        };
    }, [data, isLibLoaded]);

    if (!isLibLoaded || !data) {
        return (
            <div className="w-full h-[400px] bg-gray-900 rounded-lg shadow-inner flex flex-col items-center justify-center">
                <Spinner />
                <p className="mt-2 text-gray-400">{!isLibLoaded ? "Loading charting library..." : "Loading chart data..."}</p>
            </div>
        );
    }

    if (data.length === 0) {
        return <div className="w-full h-[400px] bg-gray-900 rounded-lg shadow-inner flex items-center justify-center text-gray-400">No chart data available for this stock.</div>
    }

    return <div ref={chartContainerRef} className="w-full h-[400px] bg-gray-900 rounded-lg shadow-inner" />;
};

export default ChartComponent;
