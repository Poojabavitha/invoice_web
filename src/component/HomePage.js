import React, { useState } from "react";
import { useInvoice } from "../contexts/InvoiceContext";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function HomePage() {
  const { invoices } = useInvoice(); // Get shared invoices state
  const currentYear = new Date().getFullYear(); // Get the current year
  const [selectedYear, setSelectedYear] = useState(currentYear.toString()); // Default to the current year

  // Helper function to calculate totals
  const calculateInvoiceTotal = (tableData) => {
    return tableData.reduce((sum, item) => {
      const discountAmount = (item.quantity * item.rate * item.discountPercent) / 100;
      const subtotal = item.quantity * item.rate - discountAmount;
      const vatAmount = (subtotal * item.vat) / 100;
      return sum + subtotal + vatAmount;
    }, 0);
  };

  // Calculate totals dynamically based on all invoices
  const totalInvoices = invoices.length;
  const totalRevenue = invoices.reduce(
    (acc, invoice) => acc + calculateInvoiceTotal(invoice.tableData || []),
    0
  );
  const totalPaid = invoices.reduce(
    (acc, invoice) =>
      acc +
      (calculateInvoiceTotal(invoice.tableData || []) - (invoice.balanceDue || 0)),
    0
  );
  const totalUnpaid = invoices.reduce((acc, invoice) => acc + (invoice.balanceDue || 0), 0);

  // Calculate monthly revenue for the selected year
  const revenueData = invoices.reduce((acc, invoice) => {
    const date = new Date(invoice.invoiceDetails?.dueDate);
    const year = date.getFullYear();
    const month = date.getMonth();

    if (year === parseInt(selectedYear)) {
      acc[month] =
        acc[month] + calculateInvoiceTotal(invoice.tableData || []);
    }

    return acc;
  }, new Array(12).fill(0));

  const barChartData = {
    labels: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    datasets: [
      {
        label: `Monthly Revenue - ${selectedYear}`,
        data: revenueData,
        backgroundColor: "rgba(196, 61, 220, 0.79)",
        borderColor: "rgb(147, 75, 192)",
        borderWidth: 1.5,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "top" },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { title: { display: true, text: "Months" } },
      y: { title: { display: true, text: "Revenue (Rs)" }, beginAtZero: true },
    },
  };

  // Get unique years from invoices
  const uniqueYears = [
    ...new Set(
      invoices
        .map((invoice) => {
          const date = new Date(invoice.invoiceDetails?.dueDate);
          return isNaN(date.getFullYear()) ? null : date.getFullYear();
        })
        .filter((year) => year !== null) // Exclude invalid years
    ),
  ];

  // Ensure the current year is always displayed
  if (!uniqueYears.includes(currentYear)) {
    uniqueYears.push(currentYear);
  }

  // Sort years in descending order
  uniqueYears.sort((a, b) => b - a);

  return (
    <div>
      {/* Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-indigo-800 text-white p-4 rounded shadow-md flex flex-col items-center justify-center">
          <h3 className="text-lg font-bold">Total Invoices</h3>
          <p className="text-2xl mt-2">{totalInvoices}</p>
        </div>
        <div className="bg-fuchsia-800 text-white p-4 rounded shadow-md flex flex-col items-center justify-center">
          <h3 className="text-lg font-bold">Total Revenue</h3>
          <p className="text-2xl mt-2">Rs {totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-gray-800 text-white p-4 rounded shadow-md flex flex-col items-center justify-center">
          <h3 className="text-lg font-bold">Paid</h3>
          <p className="text-2xl mt-2">Rs {totalPaid.toFixed(2)}</p>
        </div>
        <div className="bg-sky-800 text-white p-4 rounded shadow-md flex flex-col items-center justify-center">
          <h3 className="text-lg font-bold">Unpaid</h3>
          <p className="text-2xl mt-2">Rs {totalUnpaid.toFixed(2)}</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 bg-white p-4 rounded shadow-md h-[600px]">
        <div className="lg:col-span-2 flex flex-col justify-center items-center">
          <h2 className="text-xl font-bold mb-4">Monthly Revenue Chart</h2>
          <div className="h-full w-full">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>
        <div className="flex flex-col items-center pl-8">
          <h2 className="text-2xl font-bold mb-4">Yearly Revenue</h2>
          <ul className="space-y-4">
            {uniqueYears.map((year) => (
              <li
                key={year}
                className={`cursor-pointer p-4 border rounded ${
                  year === parseInt(selectedYear)
                    ? "bg-indigo-400 text-xl font-bold"
                    : "hover:bg-gray-200"
                }`}
                onClick={() => setSelectedYear(year.toString())}
              >
                Year: {year}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
