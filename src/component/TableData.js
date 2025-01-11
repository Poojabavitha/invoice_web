import React, { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";

function TableData({ initialItems, onUpdate }) {
  const [items, setItems] = useState(
    initialItems || [
      { description: "", placeholder: "Enter item name", quantity: "", rate: "", vat: 0, discountPercent: "" },
      { description: "", placeholder: "Enter item name", quantity: "", rate: "", vat: 0, discountPercent: "" },
      { description: "", placeholder: "Enter item name", quantity: "", rate: "", vat: 0, discountPercent: "" },
    ]
  );

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const handleInputChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] =
      field === "quantity" || field === "rate" || field === "vat" || field === "discountPercent"
        ? parseFloat(value) || 0
        : value;
    setItems(updatedItems);

    onUpdate(updatedItems.filter((item) => item.description || item.quantity || item.rate)); // Exclude empty rows
  };

  const addLineItem = (event) => {
    event.preventDefault(); // Prevent form submission
    setItems([
      ...items,
      { description: "", placeholder: "Enter item name", quantity: "", rate: "", vat: 0, discountPercent: "" },
    ]);
  };

  const deleteLineItem = (index) => {
    const updatedItems = items.filter((_, idx) => idx !== index);
    setItems(updatedItems);

    onUpdate(updatedItems.filter((item) => item.description || item.quantity || item.rate)); // Exclude empty rows
  };

  const calculateSubTotal = () => {
    let subTotal = 0;
    let totalVat = 0;
    let totalDiscount = 0;

    items.forEach((item) => {
      const discountAmount = (item.quantity * item.rate * item.discountPercent) / 100;
      const amount = item.quantity * item.rate - discountAmount;
      subTotal += amount;
      totalVat += (amount * item.vat) / 100;
      totalDiscount += discountAmount;
    });

    return { subTotal, totalVat, totalDiscount };
  };

  const { subTotal, totalVat, totalDiscount } = calculateSubTotal();

  return (
    <div className="p-4 space-y-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-black text-white">
              <th className="p-2">Item Description</th>
              <th className="p-2">Qty</th>
              <th className="p-2">Rate</th>
              <th className="p-2">Discount (%)</th>
              <th className="p-2 hidden sm:block">VAT (%)</th>
              <th className="p-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="relative border-t group">
                <td className="p-2">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleInputChange(index, "description", e.target.value)}
                    className="border-gray-400 px-3 py-3 w-full sm:w-38"
                    placeholder={item.placeholder}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleInputChange(index, "quantity", parseInt(e.target.value, 10) || 0)}
                    className="border-none p-2 w-full sm:w-28"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    value={item.rate}
                    onChange={(e) => handleInputChange(index, "rate", parseFloat(e.target.value) || "")}
                    className="border-gray-200 p-2 w-full sm:w-28"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    value={item.discountPercent}
                    onChange={(e) => handleInputChange(index, "discountPercent", parseFloat(e.target.value) || "")}
                    className="border-none p-2 w-full sm:w-28"
                  />
                </td>
                <td className="p-2 hidden sm:block">
                  <input
                    type="number"
                    value={item.vat}
                    onChange={(e) => handleInputChange(index, "vat", parseFloat(e.target.value) || 0)}
                    className="border-none p-2 w-full sm:w-28"
                  />
                </td>
                <td className="p-2 w-full sm:w-28">
                  {((item.quantity * item.rate - (item.quantity * item.rate * item.discountPercent) / 100) || 0).toFixed(2)}
                </td>
                <td className="p-2 absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100">
                  <button onClick={() => deleteLineItem(index)} className="text-red-600">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={5} className="text-center p-2 font-bold">
                Sub Total
              </td>
              <td className="p-2">{subTotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan={5} className="text-center p-2 font-bold">
                Total Discount
              </td>
              <td className="p-2">{totalDiscount.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan={5} className="text-center p-2 font-bold">
                Total VAT
              </td>
              <td className="p-2">{totalVat.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan={5} className="text-center p-2 font-bold">
                TOTAL
              </td>
              <td className="p-2">{(subTotal + totalVat).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <button
        onClick={addLineItem}
        className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none w-full sm:w-auto"
      >
        + Add Line Item
      </button>
    </div>
  );
}

export default TableData;
