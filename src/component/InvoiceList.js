import React, { useState, useMemo } from "react";
import { useInvoice } from "../contexts/InvoiceContext";
import { IoIosSearch } from "react-icons/io";

// MarkAsPaidButton component
const MarkAsPaidButton = ({ invoiceId, isPaid }) => {
  const { updateInvoiceStatus } = useInvoice();

  const handleClick = () => {
    updateInvoiceStatus(invoiceId, isPaid);
  };

  return (
    <button
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      onClick={handleClick}
    >
      Mark as {isPaid ? "Paid" : "Unpaid"}
    </button>
  );
};

function InvoiceList() {
  const { invoices } = useInvoice(); // Assume `updateInvoiceStatus` updates the backend
  const [filterByStatus, setFilterByStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("");

  // Helper function to calculate total with VAT and discount
  const calculateInvoiceTotal = (tableData) => {
    return tableData.reduce((sum, item) => {
      const discountAmount = (item.quantity * item.rate * item.discountPercent) / 100;
      const subtotal = item.quantity * item.rate - discountAmount;
      const vatAmount = (subtotal * item.vat) / 100;
      return sum + subtotal + vatAmount;
    }, 0);
  };

  // Apply filters and sorting
 // Memoize filtered invoices
 const filteredInvoices = useMemo(() => {
  return invoices.filter((invoice) => {
    const hasRequiredFields =
      invoice.invoiceDetails?.invoiceNumber && invoice.client?.name;

    const isStatusMatch =
      filterByStatus === "All" ||
      (filterByStatus === "Paid" && (invoice.balanceDue || 0) === 0) ||
      (filterByStatus === "Unpaid" && (invoice.balanceDue || 0) > 0);

    const isSearchMatch =
      searchQuery === "" ||
      invoice.client?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.invoiceDetails?.invoiceNumber
        .toString()
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    return hasRequiredFields && isStatusMatch && isSearchMatch;
  });
}, [invoices, filterByStatus, searchQuery]);

 // Memoize sorted invoices
 const sortedInvoices = useMemo(() => {
  return [...filteredInvoices].sort((a, b) => {
    if (sortBy === "Due Date Asc") {
      return new Date(a.invoiceDetails?.dueDate) - new Date(b.invoiceDetails?.dueDate);
    }
    if (sortBy === "Due Date Desc") {
      return new Date(b.invoiceDetails?.dueDate) - new Date(a.invoiceDetails?.dueDate);
    }
    if (sortBy === "Client Name Asc") {
      return a.client.name.localeCompare(b.client.name);
    }
    if (sortBy === "Client Name Desc") {
      return b.client.name.localeCompare(a.client.name);
    }
    return 0;
  });
}, [filteredInvoices, sortBy]);


  return (
    <div className="p-4 max-w-screen-lg mx-auto">
      <div className="p-4">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row justify-end mb-4 gap-2">
          <div className="relative w-full sm:max-w-md">
            <input
              type="text"
              className="border rounded p-2 pl-10 w-full"
              placeholder="Search by client name or invoice number"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="absolute left-2 top-2.5 text-gray-500">
              <IoIosSearch size={20} />
            </span>
          </div>
        </div>

        {/* Filter and Sort */}
        <div className="mb-4 p-4 bg-white rounded shadow-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold mb-2">Filter</label>
              <select
                className="border rounded p-2 w-full"
                value={filterByStatus}
                onChange={(e) => setFilterByStatus(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
            <div>
              <label className="block font-bold mb-2">Sort By</label>
              <select
                className="border rounded p-2 w-full"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="">None</option>
                <option value="Due Date Asc">Due Date (Ascending)</option>
                <option value="Due Date Desc">Due Date (Descending)</option>
                <option value="Client Name Asc">Client Name (A-Z)</option>
                <option value="Client Name Desc">Client Name (Z-A)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Invoice Table */}
        {sortedInvoices.length === 0 ? (
          <p className="text-gray-500">No invoices match your criteria.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 p-2">Invoice Number</th>
                  <th className="border border-gray-300 p-2">Client Name</th>
                  <th className="border border-gray-300 p-2">Total</th>
                  <th className="border border-gray-300 p-2">Due Date</th>
                  <th className="border border-gray-300 p-2">Status</th>
                  <th className="border border-gray-300 p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedInvoices.map((invoice) => {
                  const isPaid = invoice.balanceDue === 0;
                  const total = calculateInvoiceTotal(invoice.tableData);

                  return (
                    <tr
                      key={invoice.id}
                      className={isPaid ? "bg-green-300" : "bg-blue-300"}
                    >
                      <td className="border border-gray-300 p-2">
                        {invoice.invoiceDetails.invoiceNumber}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {invoice.client.name}
                      </td>
                      <td className="border border-gray-300 p-2">
                        Rs {total.toFixed(2)}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {new Date(
                          invoice.invoiceDetails.dueDate
                        ).toLocaleDateString()}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {isPaid ? "Paid" : "Unpaid"}
                      </td>
                      <td className="border border-gray-300 p-2">
                        <MarkAsPaidButton
                          invoiceId={invoice.id}
                          isPaid={!isPaid}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default InvoiceList;
