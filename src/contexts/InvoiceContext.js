import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, deleteDoc, doc, addDoc,updateDoc } from "firebase/firestore";

const InvoiceContext = createContext();

export const useInvoice = () => useContext(InvoiceContext);

export const InvoiceProvider = ({ children }) => {
  const [invoices, setInvoices] = useState([]);
  const [revenueData, setRevenueData] = useState({});
  const [totalPaid, setTotalPaid] = useState(0); // State for total Paid
  const [totalUnpaid, setTotalUnpaid] = useState(0); // State for total Unpaid

  useEffect(() => {
    // Real-time listener for Firestore invoices collection
    const unsubscribe = onSnapshot(collection(db, "invoices"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setInvoices(data);

      // Recalculate totalPaid and totalUnpaid
      const newTotalPaid = data.reduce(
        (acc, invoice) => acc + (invoice.total - (invoice.balanceDue || 0)),
        0
      );
      const newTotalUnpaid = data.reduce(
        (acc, invoice) => acc + (invoice.balanceDue || 0),
        0
      );

      setTotalPaid(newTotalPaid);
      setTotalUnpaid(newTotalUnpaid);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Recalculate revenue data whenever invoices state changes
    const newRevenueData = {};

    invoices.forEach((invoice) => {
      const year = new Date(invoice.invoiceDetails?.invoiceDate).getFullYear();
      const month = new Date(invoice.invoiceDetails?.invoiceDate).getMonth(); // 0-indexed
      const amount = invoice.tableData?.reduce((total, item) => total + item.amount, 0) || 0;

      if (!newRevenueData[year]) {
        newRevenueData[year] = Array(12).fill(0); // Initialize months for the year
      }

      newRevenueData[year][month] += amount;
    });

    setRevenueData(newRevenueData);
  }, [invoices]);

  const calculateTotal = (tableData) => {
    return tableData.reduce((sum, item) => {
      const discountAmount = (item.quantity * item.rate * item.discountPercent) / 100;
      const amount = item.quantity * item.rate - discountAmount;
      const vatAmount = (amount * item.vat) / 100;
      return sum + amount + vatAmount;
    }, 0);
  };

  const deleteInvoice = (id) => {
    // Delete invoice from Firestore
    const invoiceRef = doc(db, "invoices", id);
    deleteDoc(invoiceRef)
      .then(() => {
        console.log(`Invoice ${id} deleted successfully.`);

        // Update local invoices state to remove deleted invoice
        setInvoices((prevInvoices) => prevInvoices.filter((invoice) => invoice.id !== id));
      })
      .catch((error) => {
        console.error("Error deleting invoice:", error);
      });
  };

  const addInvoice = async (invoice) => {
    try {
      const docRef = await addDoc(collection(db, "invoices"), invoice);
      console.log("Invoice added with ID:", docRef.id);
    } catch (error) {
      console.error("Error adding invoice:", error);
    }
  };

  const updateInvoiceStatus = async (id, isPaid) => {
    try {
      const invoiceRef = doc(db, "invoices", id);

      // Find the target invoice
      const targetInvoice = invoices.find((invoice) => invoice.id === id);

      if (!targetInvoice) {
        console.error("Invoice not found");
        return;
      }

      const updatedBalanceDue = isPaid ? 0 : targetInvoice.total;

      // Update Firestore document
      await updateDoc(invoiceRef, { balanceDue: updatedBalanceDue });

      // Update local state
      setInvoices((prevInvoices) => {
        const updatedInvoices = prevInvoices.map((invoice) =>
          invoice.id === id ? { ...invoice, balanceDue: updatedBalanceDue } : invoice
        );

        // Recalculate totalPaid and totalUnpaid
        const newTotalPaid = updatedInvoices.reduce(
          (acc, invoice) => acc + (invoice.total - (invoice.balanceDue || 0)),
          0
        );
        const newTotalUnpaid = updatedInvoices.reduce(
          (acc, invoice) => acc + (invoice.balanceDue || 0),
          0
        );

        setTotalPaid(newTotalPaid); // Update totalPaid
        setTotalUnpaid(newTotalUnpaid); // Update totalUnpaid

        return updatedInvoices;
      });

      console.log(`Invoice ${id} status updated to ${isPaid ? "Paid" : "Unpaid"}.`);
    } catch (error) {
      console.error("Error updating invoice status:", error);
    }
  };

  return (
    <InvoiceContext.Provider
      value={{
        invoices,
        revenueData,
        totalPaid,
        totalUnpaid,
        calculateTotal,
        addInvoice,
        deleteInvoice,
        updateInvoiceStatus,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
};
