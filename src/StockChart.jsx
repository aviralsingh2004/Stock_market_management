import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto"; // Required for Chart.js v3+ support

const StockChart = ({ symbol }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Fetch stock data from your backend API
    fetch(`http://localhost:3000/api/stocks/${symbol}`)
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, [symbol]);

  // Prepare the data for the chart
  const chartData = {
    labels: data.map((entry) => entry.date), // Dates on X-axis
    datasets: [
      {
        label: `${symbol} Closing Price`,
        data: data.map((entry) => entry.close), // Closing prices on Y-axis
        borderColor: "blue",
        borderWidth: 2,
        tension: 0.1, // Smooth curve
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        display: true,
        title: { display: true, text: "Date" },
      },
      y: {
        display: true,
        title: { display: true, text: "Price (USD)" },
      },
    },
  };

  return (
    <div style={{ margin: "20px" }}>
      <h2>{symbol} Stock Price Chart</h2>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default StockChart;
