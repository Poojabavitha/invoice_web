import React, { useState } from "react";
import { FaArrowUp, FaEdit, FaTrash } from "react-icons/fa";

const Logo = ({ logo, setLogo }) => { // Rename `setLogo` to `logo` for the image state
  const [showActions, setShowActions] = useState(false); // Show edit/delete icons on hover

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result;
        resizeImage(base64Image, 100, 100).then((resizedImage) => {
          setLogo(resizedImage); // Pass the resized image to the parent
        });
      };
      reader.readAsDataURL(file); // Convert to Base64
    } else {
      alert("Please upload a valid image file (e.g., PNG, JPG).");
    }
  };

  const resizeImage = (base64Image, maxWidth, maxHeight) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Image;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const scale = Math.min(maxWidth / img.width, maxHeight / img.height);

        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png")); // Return resized Base64 string
      };
    });
  };

  const handleDelete = () => {
    setLogo(null); // Clear the parent component's logo state
    setShowActions(false);
  };

  const handleEdit = () => {
    document.getElementById("file-input").click();
  };

  return (
    <div className="relative">
      <div
        className={`relative w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex justify-center items-center ${
          logo ? "bg-transparent" : "bg-gray-100"
        } overflow-hidden`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {logo ? (
          <img
            src={logo} // Use `logo` instead of `setLogo`
            alt="Logo"
            className="w-full h-full object-cover rounded-xl"
          />
        ) : (
          <div className="flex flex-col items-center">
            <FaArrowUp size={25} color="blue" />
            <button
              onClick={(event) => {
                event.preventDefault(); // Prevent the page refresh
                document.getElementById("file-input").click();
              }}
              className="text-blue-500 text-sm mt-2 cursor-pointer"
            >
              Upload Logo
            </button>
          </div>
        )}

        <input
          id="file-input"
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />

        {showActions && logo && (
          <div className="absolute top-1/2 right-1 transform -translate-y-1/2 flex flex-col items-center space-y-2">
            <FaEdit
              size={18}
              className="cursor-pointer bg-black bg-opacity-60 rounded-full p-1 hover:bg-opacity-80 text-white"
              onClick={handleEdit}
            />
            <FaTrash
              size={18}
              className="cursor-pointer bg-black bg-opacity-60 rounded-full p-1 hover:bg-opacity-80 text-white"
              onClick={handleDelete}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Logo;
