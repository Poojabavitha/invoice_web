import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { IoIosSearch } from "react-icons/io";
import { useInvoice } from "../contexts/InvoiceContext"; // Import context to update invoices state

function Settings() {
  const [invoices, setInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // State for search input
  const { setInvoices: setContextInvoices } = useInvoice(); // Access context to update invoices
  const navigate = useNavigate();

  // Navigate to invoice edit form
  const handleEdit = (id) => {
    navigate(`/dashboard/invoice-form/${id}`);
  };

  // Fetch invoices from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "invoices"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setInvoices(data.filter((invoice) => invoice.invoiceDetails?.invoiceNumber)); // Filter out empty rows
    });

    return () => unsubscribe();
  }, []);

  // Handle invoice deletion
  const handleDelete = async (id) => {
    const confirmed = window.confirm("Do you want to delete this invoice?");
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "invoices", id));
      setInvoices((prevInvoices) => prevInvoices.filter((invoice) => invoice.id !== id));
      setContextInvoices((prevInvoices) => prevInvoices.filter((invoice) => invoice.id !== id));
    } catch (error) {
      console.error("Error deleting invoice:", error);
    }
  };

  // Filter invoices based on search query
  const filteredInvoices = invoices
    .filter(
      (invoice) =>
        invoice.invoiceDetails?.invoiceNumber
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        invoice.client?.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map((invoice) => {
      // Calculate total for each invoice
      const calculatedTotal = invoice.tableData?.reduce((sum, item) => {
        const discountAmount = (item.quantity * item.rate * item.discountPercent) / 100;
        const amount = item.quantity * item.rate - discountAmount;
        const vatAmount = (amount * item.vat) / 100;
        return sum + amount + vatAmount;
      }, 0);

      return {
        ...invoice,
        total: calculatedTotal || invoice.total, // Use recalculated total if available
      };
    });

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold">Settings</h2>
          <div className="flex justify-end mb-4">
            <div className="relative w-full max-w-lg mx-auto md:mx-0">
              <input
                type="text"
                className="border rounded p-2 pl-10 w-full max-w-lg placeholder:text-sm"
                placeholder="Search by name or invoice number"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="absolute left-1 top-2.5 text-gray-500">
                <IoIosSearch size={20} />
              </span>
            </div>
          </div>
        </div>
        <div>
          {filteredInvoices.length === 0 ? (
            <p>No invoices found.</p>
          ) : (
            <div className="overflow-x-auto hidden md:block">
              <table className="table-auto w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">Invoice Number</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Client Name</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Total</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="border border-gray-300 px-4 py-2">
                        {invoice.invoiceDetails?.invoiceNumber}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">{invoice.client?.name}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {invoice.total ? `Rs${invoice.total.toFixed(2)}` : ""}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <div className="flex justify-center items-center space-x-4">
                          <button
                            onClick={() => handleEdit(invoice.id)}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(invoice.id)}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
