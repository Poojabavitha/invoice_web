import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import TableData from './TableData';
import { db } from '../firebase';
import { collection, addDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { GoDownload } from "react-icons/go";
import { useParams } from "react-router-dom";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { auth } from '../firebase';
import "../invoice.css"

function InvoiceForm() {
  const { id } = useParams();

  useEffect(() => {
    const fetchInvoice = async () => {
      if (id) {
        try {
          const docRef = doc(db, "invoices", id);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const invoiceData = docSnap.data();
            setTableData(invoiceData.tableData || []);
            setCompanyName(invoiceData.companyName || "");
            setYourName(invoiceData.yourName || "");
            setTrn(invoiceData.trn || "");
            setAddress(invoiceData.address || "");
            setCity(invoiceData.city || "");
            setState(invoiceData.state || "");
            setClientCompany(invoiceData.client?.company || "");
            setClientName(invoiceData.client?.name || "");
            setClientTrn(invoiceData.client?.trn || "");
            setClientAddress(invoiceData.client?.address || "");
            setClientCity(invoiceData.client?.city || "");
            setClientState(invoiceData.client?.state || "");
            setInvoiceNumber(invoiceData.invoiceDetails?.invoiceNumber || "");
            setInvoiceDate(invoiceData.invoiceDetails?.invoiceDate || "");
            setDueDate(invoiceData.invoiceDetails?.dueDate || "");
            setPaid(invoiceData.paid || 0);
            setBalanceDue(invoiceData.balanceDue || 0);
            setLogo(invoiceData.logo || "");
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching invoice:", error);
        }
      } else {
        resetForm();
      }
    };

    fetchInvoice();
  }, [id]);

  // State variables
  const [companyName, setCompanyName] = useState('');
  const [yourName, setYourName] = useState('');
  const [trn, setTrn] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  const [clientCompany, setClientCompany] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientTrn, setClientTrn] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientCity, setClientCity] = useState('');
  const [clientState, setClientState] = useState('');

  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [tableData, setTableData] = useState([]);
  const [paid, setPaid] = useState(0);
  const [balanceDue, setBalanceDue] = useState(0);
  const [notification, setNotification] = useState(""); // State for notifications
  const [logo, setLogo] = useState(null);
  const [errors, setErrors] = useState({}); // Track form errors

  //balanceDue is updated,
  useEffect(() => {
    if (balanceDue === 0) {
      setPaid(tableData.reduce((sum, item) => {
        const discountAmount = (item.quantity * item.rate * item.discountPercent) / 100;
        const amount = item.quantity * item.rate - discountAmount;
        const vatAmount = (amount * item.vat) / 100;
        return sum + amount + vatAmount;
      }, 0));
    }
  }, [balanceDue, tableData]);
  

  const handleTableDataUpdate = (data) => {
    setTableData(data);
    calculateBalanceDue(data, paid);
  };

  const calculateBalanceDue = (tableData, paidAmount) => {
    const total = tableData.reduce((sum, item) => {
      const discountAmount = (item.quantity * item.rate * item.discountPercent) / 100;
      const amount = item.quantity * item.rate - discountAmount;
      const vatAmount = (amount * item.vat) / 100;
      return sum + amount + vatAmount;
    }, 0);
    
    const newBalanceDue = total - paidAmount;
    setBalanceDue(newBalanceDue);
  
    // If balanceDue is 0, update paidAmount to equal the total
    if (newBalanceDue === 0) {
      setPaid(total);
    }
  };
  

  const handlePaidChange = (e) => {
    const paidAmount = parseFloat(e.target.value) || "";
    setPaid(paidAmount);
    calculateBalanceDue(tableData, paidAmount);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!companyName.trim()) newErrors.companyName = "Company name is required.";
    if (!clientCompany.trim()) newErrors.clientCompany = "Client company is required.";
    if (!clientName.trim()) newErrors.clientName = "Client Name is required.";
    if (!invoiceNumber.trim()) newErrors.invoiceNumber = "Invoice number is required.";
    if (!invoiceDate.trim()) newErrors.invoiceDate = "Invoice date is required.";
    if (!dueDate.trim()) newErrors.dueDate = "Due date is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      alert("Please correct the errors in the form.");
      return;
    }

    // Get the userId of the logged-in user (Firebase Authentication)
    const userId = auth.currentUser?.uid;

    console.log("Logo data before submission:", logo);

    const total = tableData.reduce((sum, item) => sum + item.quantity * item.rate, 0);
    const invoiceData = {
      companyName,
      yourName,
      trn,
      address,
      city,
      state,
      client: {
        company: clientCompany,
        name: clientName,
        trn: clientTrn,
        address: clientAddress,
        city: clientCity,
        state: clientState,
      },
      invoiceDetails: {
        invoiceNumber,
        invoiceDate,
        dueDate,
      },
      tableData,
      total,
      paid,
      balanceDue,
      logo,
      userId,
    };

    try {
      if (id) {
        const docRef = doc(db, "invoices", id);
        await setDoc(docRef, invoiceData, { merge: true });
        alert("Invoice updated successfully!");
      } else {
        await addDoc(collection(db, "invoices"), invoiceData);
        alert("Invoice submitted successfully!");
      }

      // Reset form after submission
      resetForm();

      // Hide the notification after 3 seconds
      setTimeout(() => {
        setNotification("");
      }, 2000);
    } catch (error) {
      console.error("Error submitting invoice:", error);
      alert("Error submitting invoice. Please try again.");
    }
  };

  const resetForm = () => {
    setCompanyName('');
    setYourName('');
    setTrn('');
    setAddress('');
    setCity('');
    setState('');
    setClientCompany('');
    setClientName('');
    setClientTrn('');
    setClientAddress('');
    setClientCity('');
    setClientState('');
    setInvoiceNumber('');
    setInvoiceDate('');
    setDueDate('');
    setTableData([]);
    setPaid(0);
    setBalanceDue(0);
    setLogo('');
    setErrors({});
  };

 
  
    const downloadPDF = () => {
      const doc = new jsPDF();
  
      // Set line width to 30px and blue color for the border
      doc.setLineWidth(30); // Border thickness
      doc.setDrawColor(100, 100, 200); // RGB for blue
  
      // Top border
      doc.line(0, 0, doc.internal.pageSize.width, 0); // Top border at the very top of the page
  
      // Bottom border
      doc.line(0, doc.internal.pageSize.height, doc.internal.pageSize.width, doc.internal.pageSize.height); // Bottom border at the very bottom of the page
  
      // Add logo on the right top corner
      const logoX = doc.internal.pageSize.width - 50; // Adjust for alignment to the right
      const logoY = 15;
      const logoSize = 30;
  
      if (logo && typeof logo === "string" && logo.startsWith("data:image/")) {
        try {
          doc.addImage(logo, "PNG", logoX, logoY, logoSize, logoSize);
        } catch (error) {
          console.error("Error adding logo to PDF:", error);
        }
      } else {
        console.warn("Logo is not valid or not provided.");
      }
    

      // Add centered "INVOICE" heading aligned with the logo
      const headingX = doc.internal.pageSize.width / 2; // Center the heading horizontally
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("INVOICE", headingX, 50, { align: "center" });
  
      // Add company details (normal text)
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");  // Set font to normal
      doc.text(companyName, 20, 60);
      doc.text(`TRN: ${trn}`, 20, 70);
      doc.text(address, 20, 80);
      doc.text(`${city}, ${state}`, 20, 90);
  
      // Add client details (normal text)
      doc.text("Bill To:", 150, 60);
      doc.setFont("helvetica","normal"); // Bold for "Bill To"
      doc.text(`${clientCompany}`, 150, 70);
      doc.text(`${clientName}`, 150, 80);
      doc.text(`TRN: ${clientTrn}`, 150, 90);
      doc.text(`${clientAddress}`, 150, 100);
      doc.text(`${clientCity}, ${clientState}`, 150, 110);
  
      // Add invoice details (normal text)
      doc.setFont("helvetica", "normal"); // Normal text for other details
      doc.text(`Invoice # ${invoiceNumber}`, 20, 110);
      doc.text(`Date: ${invoiceDate}`, 20, 120);
      doc.text(`Due Date: ${dueDate}`, 20, 130);
      

      // Add the tabel data
      doc.autoTable({
        startY: 140,
        pageBreak: 'auto',
        head: [['Item', 'Quantity', 'Rate', 'Discount %', 'VAT %', 'Total']],
        body: tableData.map((item) => {
            const quantity = parseFloat(item.quantity) || 0;
            const rate = parseFloat(item.rate) || 0;
            const discountPercent = parseFloat(item.discountPercent) || 0;
            const vat = parseFloat(item.vat) || 0;
    
            const discountAmount = (quantity * rate * discountPercent) / 100;
            const amount = quantity * rate - discountAmount;
            const vatAmount = (amount * vat) / 100;
            const total = amount + vatAmount;
    
            // Use item.description for the item name
            return [
                item.description || "N/A", // Display the item description or "N/A" if it's empty
                quantity,
                rate.toFixed(2),
                discountPercent.toFixed(2),
                vat.toFixed(2),
                total.toFixed(2),
            ];
        }),
        styles: {
            fillColor: [240, 240, 255], // Light indigo shade for data rows
        },
        headStyles: {
            fillColor: [100, 100, 180], // Dark indigo shade for header
            textColor: 255, // White text
        },
        margin: { left: 20, right: 20 },
        theme: "striped",
    });
    
      // Add payment details below the table
      let nextY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 140;
      if (nextY > doc.internal.pageSize.height - 30) {
          doc.addPage();
          nextY = 20; // Reset Y position for the new page
      }
  
      doc.setFontSize(12);
  
      // Make bold text for "Total Due", "Balance Due", and "Paid"
      doc.setFont("helvetica", "bold"); // Bold for total due and balance due
      doc.text(`Total Due: ${tableData.reduce((sum, item) => {
          const quantity = parseFloat(item.quantity) || 0;
          const rate = parseFloat(item.rate) || 0;
          const discountPercent = parseFloat(item.discountPercent) || 0;
          const vat = parseFloat(item.vat) || 0;
  
          const discountAmount = (quantity * rate * discountPercent) / 100;
          const amount = quantity * rate - discountAmount;
          const vatAmount = (amount * vat) / 100;
          return sum + amount + vatAmount;
      }, 0).toFixed(2)}`, 20, nextY);
  
      doc.setFont("helvetica", "bold"); // Switch back to normal for "Paid" and "Balance Due"
      doc.text(`Paid: ${paid.toFixed(2)}`, 20, nextY + 10);
  
      doc.setFont("helvetica", "bold"); // Bold for "Balance Due"
      doc.text(`Balance Due: ${balanceDue.toFixed(2)}`, 20, nextY + 20);
  
      // Save PDF
      doc.save("invoice.pdf");
  };
  


  
  return (
    <div>
      {notification && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
          {notification}
        </div>
      )}

      <div className="flex p-3 justify-between items-center mb-4">
        <h2 className="text-xl lg:text-3xl font-semibold">Pay Invoice</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            className="text-white bg-green-500 text-xl p-2 rounded shadow-md hover:bg-green-700"
            onClick={handleSubmit}
          >
            Save
          </button>
          <button
            className="flex items-center text-white text-xl bg-blue-500 p-2 rounded shadow-md hover:bg-blue-700"
            onClick={downloadPDF}
          >
            <GoDownload className="mr-2" /> Download PDF
          </button>
        </div>
      </div>

      <hr className="border-gray-400" />

      {/* Invoice Form */}
      <div className="p-4 rounded m-4 justify-center align-center">
        <form
          onSubmit={handleSubmit}
          className="p-3 rounded border-gray-400 shadow-md w-full h-full max-h-m max-w-m"
        >
       <Logo logo={logo} setLogo={setLogo} /><br/>
       <div>
  <input
    type="text"
    id="companyName"
    placeholder="Your Company"
    value={companyName}
    onChange={(e) => setCompanyName(e.target.value)}
    className={`p-2 pl-3 border border-gray-400 rounded shadow-xl mb-1 ${errors.companyName ? "input-error" : ""}`}
  />
  {errors.companyName && <p className="error-message">{errors.companyName}</p>}
</div>

        
          <input
            type="text"
            placeholder="Your Name"
            value={yourName}
            onChange={(e) => setYourName(e.target.value)}
            className="p-2 pl-3 border border-gray-400 rounded shadow-xl mb-1"
          />
          <br />
          <input
            type="text"
            placeholder="Company's TRN"
            value={trn}
            onChange={(e) => setTrn(e.target.value)}
            className="p-2 pl-3 border border-gray-400 rounded shadow-xl mb-1"
          />
          <br />
          <input
            type="text"
            placeholder="Company's Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="p-2 pl-3 border border-gray-400 rounded shadow-xl mb-1"
          />
          <br />
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="p-2 pl-3 border border-gray-400 rounded shadow-xl mb-1"
          />
          <br />
          <input
            type="text"
            placeholder="State"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="p-2 pl-3 border border-gray-400 rounded shadow-xl mb-1"
          />
          
          <h2 className="text-xl">Bill To:</h2><br/>
          <div className="flex flex-col lg:flex-row justify-between gap-6">
            <div className="flex flex-col gap-1 w-1/2">
            
       <input
         type="text"
         id="clientCompany"
         placeholder="Client Company"
        value={clientCompany}
    onChange={(e) => setClientCompany(e.target.value)}
    className={`p-2 pl-3 border border-gray-400 rounded shadow-xl mb-1 input ${errors.clientCompany ? "input-error" : ""}`}
  />
  {errors.clientCompany && <p className="error-message">{errors.clientCompany}</p>}

              <input
                type="text"
                placeholder="Client's Name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className={`p-2 pl-3 border border-gray-400 rounded shadow-xl mb-1 input ${errors.clientName ? "input-error" : ""}`}
                />
              {errors.clientName && <p className="error-message">{errors.clientName}</p>}
    
              <input
                type="text"
                placeholder="Client's TRN"
                value={clientTrn}
                onChange={(e) => setClientTrn(e.target.value)}
                className="p-2 pl-3 border border-gray-400 rounded shadow-xl mb-1"
              />
              <input
                type="text"
                placeholder="Client's Address"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                className="p-2 pl-3 border border-gray-400 rounded shadow-xl mb-1"
              />
              <input
                type="text"
                placeholder="City"
                value={clientCity}
                onChange={(e) => setClientCity(e.target.value)}
                className="p-2 pl-3 border border-gray-400 rounded shadow-xl mb-1"
              />
              <input
                type="text"
                placeholder="State"
                value={clientState}
                onChange={(e) => setClientState(e.target.value)}
                className="p-2 pl-3 border border-gray-400 rounded shadow-xl mb-1"
              />
            </div>
            <div className="flex flex-col gap-2 w-full lg:w-1/2">
              <div className="flex items-center gap-2">
                <label className="w-32">Invoice#:</label>
                <input
                  type="number"
                  placeholder="INV-12"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  
                  className={`p-2 pl-3 border border-gray-400 rounded shadow-xl mb-1 w-48 input ${errors.clientCompany ? "input-error" : ""}`}
                  />
                  {errors.invoiceNumber && <p className="error-message">{errors.invoiceNumber}</p>}
                    
                
              </div>
              <div className="flex items-center gap-2">
                <label className="w-32">Invoice Date:</label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className={`p-2 pl-3 border border-gray-400 rounded shadow-xl mb-1 w-48 input ${errors.clientCompany ? "input-error" : ""}`}
                  />
                  {errors.invoiceDate && <p className="error-message">{errors.invoiceDate}</p>}
                    
              </div>
              <div className="flex items-center gap-2">
                <label className="w-32">Due Date:</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={`p-2 pl-3 border border-gray-400 rounded shadow-xl mb-1 w-48 input ${errors.clientCompany ? "input-error" : ""}`}
                  />
                  {errors.dueDate && <p className="error-message">{errors.dueDate}</p>}
                    
              </div>
            </div>
          </div><br/>
          <h2 className="text-xl">Table data:</h2>
          <div>
          <TableData initialItems={tableData} onUpdate={handleTableDataUpdate} />
          </div>

          <h2 className="text-xl text-bold">Payment Details:</h2><br/>

          <div className="space-y-2">
           <div className="flex items-center gap-2">
             <label className="w-32">Total Discount:</label>
               <input
                type="text"
                value={tableData.reduce((sum, item) => sum + (item.quantity * item.rate * item.discountPercent) / 100, 0).toFixed(2)}
                readOnly
                className="p-2 pl-3 border border-gray-400 rounded shadow-xl mb-1 w-48"
                />
          </div>
            <div className="flex items-center gap-2"> 
              <label className="w-32">Paid:</label>
              <input
                type="number"
                placeholder="Enter amount paid"
                value={paid}
                onChange={handlePaidChange}
                className="p-2 pl-3 border border-gray-400 rounded shadow-xl mb-1 w-48"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-32">Balance Due:</label>
              <input
                type="text"
                value={balanceDue}
                readOnly
                className="p-2 pl-3 border border-gray-400 rounded shadow-xl mb-1 w-48"
              />
            </div>
          </div>


          <button
            type="submit"
            className="text-white bg-blue-500 p-2 rounded shadow-md hover:bg-blue-700 mt-4"
          >
            Submit Invoice
          </button>
        </form>
      </div>
    </div>
  );
}

export default InvoiceForm;
