// Chart instance
let stockChartInstance = null;

// Global variable for stock data
let stockData = [];

// Canvas context for the chart
let ctx = document.getElementById('stockChart').getContext('2d');

// Function to fetch historical stock data
const fetchStockData = async (symbol) => {
    document.getElementById('loading').style.display = 'block'; // Show loading spinner
    try {
        const response = await fetch(`/api/historical?symbol=${symbol}`);
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        if (!data || data.length === 0) {
            throw new Error('No data available for the selected stock.');
        }
        stockData = data; // Save the fetched data globally
        return data;
    } catch (error) {
        alert(error.message); // Show user-friendly error message
        console.error('Error fetching stock data:', error);
        return null; // Return null to indicate an error
    } finally {
        document.getElementById('loading').style.display = 'none'; // Hide loading spinner
    }
};

// Function to limit data points for large datasets
const limitDataPoints = (data, maxPoints = 100) => {
    if (data.length > maxPoints) {
        return data.slice(-maxPoints); // Keep only the last `maxPoints` entries
    }
    return data;
};

// Function to render the chart
const renderChart = async (symbol) => {
    const data = await fetchStockData(symbol);

    if (data) {
        const limitedData = limitDataPoints(data); // Limit the data points
        const dates = limitedData.map(entry => entry.date).reverse();
        const closingPrices = limitedData.map(entry => entry.close).reverse();
        const volumes = limitedData.map(entry => entry.volume).reverse();

        // Destroy the previous chart if it exists
        if (stockChartInstance) {
            stockChartInstance.destroy();
            stockChartInstance = null;
        }

        // Clear the canvas to reset properties
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Create a new chart
        stockChartInstance = new Chart(ctx, {
            type: 'line', // Default chart type
            data: {
                labels: dates, // x-axis (dates)
                datasets: [
                    {
                        label: `${symbol} Closing Prices`,
                        data: closingPrices,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        tension: 0.3,
                        pointRadius: 1 // Smaller data points for better readability
                    },
                    {
                        label: `${symbol} Volume`,
                        data: volumes,
                        type: 'bar', // Show volume as bars
                        backgroundColor: 'rgba(192, 192, 75, 0.5)',
                        yAxisID: 'volumeAxis'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Enable dynamic resizing
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        enabled: true
                    },
                    zoom: {
                        pan: {
                            enabled: true,
                            mode: 'x', // Allow panning only on the x-axis
                        },
                        zoom: {
                            wheel: {
                                enabled: true, // Enable zooming with the mouse wheel
                            },
                            pinch: {
                                enabled: true // Enable zooming on touch devices
                            },
                            mode: 'x' // Allow zooming only on the x-axis
                        }
                    }
                }
                ,
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Price (USD)'
                        },
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(200, 200, 200, 0.2)'
                        }
                    },
                    volumeAxis: {
                        type: 'linear',
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Volume'
                        },
                        beginAtZero: true,
                        grid: {
                            drawOnChartArea: false // Prevent overlapping grids
                        }
                    },
                    x: {
                        ticks: {
                            maxTicksLimit: 10, // Reduce the number of visible dates
                            maxRotation: 45,
                            minRotation: 0
                        },
                        grid: {
                            color: 'rgba(200, 200, 200, 0.2)'
                        }
                    }
                }
            }
        });
    }
};

// Function to render a chart from filtered data
const renderChartFromData = (filteredData) => {
    const dates = filteredData.map(entry => entry.date).reverse();
    const closingPrices = filteredData.map(entry => entry.close).reverse();

    // Destroy the previous chart if it exists
    if (stockChartInstance) {
        stockChartInstance.destroy();
        stockChartInstance = null;
    }

    // Clear the canvas to reset properties
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Create the chart with the filtered data
    stockChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Filtered Closing Prices',
                data: closingPrices,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true },
                tooltip: { enabled: true }
            }
        }
    });
};

// Add event listener for stock selection
document.getElementById('stockSelector').addEventListener('change', async (e) => {
    const selectedSymbol = e.target.value;

    // Fetch new stock data and render the chart
    const data = await fetchStockData(selectedSymbol);
    if (data) {
        renderChart(selectedSymbol);

        // Update analytics for the selected stock
        calculateAnalytics(data);
    } else {
        console.error('No data available for the selected stock.');
        // Reset analytics to default values if no data is available
        document.getElementById('averagePrice').textContent = 'Average Closing Price: N/A';
        document.getElementById('growthRate').textContent = 'Growth Rate: N/A';
    }
});


// Add event listener for date range filtering
document.getElementById('filterButton').addEventListener('click', () => {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    if (startDate && endDate) {
        // Filter the global stockData based on the selected date range
        const filteredData = stockData.filter(entry => {
            const date = new Date(entry.date);
            return date >= new Date(startDate) && date <= new Date(endDate);
        });

        // Render the chart with the filtered data
        renderChartFromData(filteredData);

        // Update analytics
        calculateAnalytics(filteredData);
    }
});


document.getElementById('downloadChart').addEventListener('click', () => {
    if (stockChartInstance) {
        const link = document.createElement('a');
        link.href = stockChartInstance.toBase64Image();
        link.download = 'stock-chart.png';
        link.click();
    } else {
        alert('No chart available to download.');
    }
});

document.getElementById('resetFilters').addEventListener('click', () => {
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    renderChart('AAPL'); // Reload the default chart
});

const initializeResetZoom = () => {
    document.getElementById('resetZoom').addEventListener('click', () => {
        if (stockChartInstance && typeof stockChartInstance.resetZoom === 'function') {
            stockChartInstance.resetZoom();
            console.log('Zoom reset successfully.');
        } else {
            console.warn('Cannot reset zoom: Chart is not initialized.');
        }
    });
};




document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('multiStockSelector').addEventListener('change', async (e) => {
        const selectedStocks = Array.from(e.target.selectedOptions).map(option => option.value);

        if (stockChartInstance) {
            stockChartInstance.destroy(); // Clear the previous chart
        }

        const datasets = [];
        for (const symbol of selectedStocks) {
            const data = await fetchStockData(symbol);
            if (data) {
                const limitedData = limitDataPoints(data);
                const closingPrices = limitedData.map(entry => entry.close).reverse();

                datasets.push({
                    label: `${symbol} Closing Prices`,
                    data: closingPrices,
                    borderColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`,
                    backgroundColor: 'rgba(0,0,0,0)',
                    tension: 0.3,
                    pointRadius: 1
                });
            }
        }

        if (datasets.length > 0) {
            ctx = resetCanvas(); // Reset canvas
            stockChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: stockData.map(entry => entry.date).reverse(),
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: true }
                    },
                    scales: {
                        x: { ticks: { maxTicksLimit: 10 } },
                        y: { beginAtZero: false }
                    }
                }
            });
        } else {
            alert('No data available for the selected stocks.');
        }
    });
});



const calculateAnalytics = (data) => {
    if (!data || data.length === 0) {
        document.getElementById('averagePrice').textContent = 'Average Closing Price: N/A';
        document.getElementById('growthRate').textContent = 'Growth Rate: N/A';
        return;
    }

    const closingPrices = data.map(entry => entry.close);
    const averagePrice = closingPrices.reduce((a, b) => a + b, 0) / closingPrices.length;
    const growthRate = ((closingPrices[closingPrices.length - 1] - closingPrices[0]) / closingPrices[0]) * 100;

    // Update the DOM
    document.getElementById('averagePrice').textContent = `Average Closing Price: $${averagePrice.toFixed(2)}`;
    document.getElementById('growthRate').textContent = `Growth Rate: ${growthRate.toFixed(2)}%`;
};


// Call this function after fetching data
fetchStockData('AAPL').then(data => {
    if (data) {
        calculateAnalytics(data);
    }
});

const resetCanvas = () => {
    const parent = document.getElementById('chartContainer'); // Parent container
    parent.innerHTML = '<canvas id="stockChart"></canvas>'; // Replace the canvas
    return document.getElementById('stockChart').getContext('2d'); // Return the new canvas context
};


// Initial render for default stock (AAPL)
fetchStockData('AAPL').then(data => {
    if (data) {
        renderChart('AAPL'); // Render initial chart
        calculateAnalytics(data); // Update analytics
    }
});


