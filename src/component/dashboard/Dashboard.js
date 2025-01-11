import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase'; 
import { NavLink, Outlet } from 'react-router-dom'; // Import NavLink and Outlet
import { FaFileInvoice  } from "react-icons/fa"; 
import {FaHouse, FaFileCirclePlus} from "react-icons/fa6";
import { IoSettings,IoLogOut } from "react-icons/io5";



function Dashboard () {
  const navigate = useNavigate();
  const user = auth.currentUser; // Get the current user from Firebase Authentication

  

  const handleLogout = async () => {
    try {
      await auth.signOut(); // Firebase logout function
      navigate('/login');
    } catch (err) {
      console.error('Logout error: ', err);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 font-montserrat h-screen">
      {/* Left side with 2 sections (Navigation Menu) */}
      <div className="md:col-span-2 bg-gray-600">
      <div className="header justify-between p-2 bg-gray-600 ">
        <h1 className="text-sm md:text-m text-white">Welcome, {user ? user.displayName || user.email : 'User'}!</h1>
        <div className="flex justify-center items-center">
  <button
    className="bg-white font-bold text-black text-m p-2 rounded flex items-center space-x-2"
    onClick={handleLogout}
  >
    <IoLogOut className="text-lg" /> {/* Add the logout icon here */}
    <span>Logout</span>
  </button>
</div>
</div>
      
        <hr/>
        <div className="text-center text-white p-2 font-bold hover:bg-blue-300 flex items-center justify-center space-x-2 ">
          <NavLink
            to="/dashboard"
            className='mt-2 p-2 flex items-center'
          >
              <FaHouse className="text-xl text-white mr-2" />
              <span className="text-sm md:text-base">Home</span>
          </NavLink>
        </div>
       
        <div className="text-center text-white hover:bg-blue-300 p-2 font-bold flex items-center justify-center space-x-2">
          <NavLink
            to="/dashboard/invoices" // Updated path for invoices
            className='p-2 flex items-center'
          >
           <FaFileInvoice className="text-xl text-white mr-2"/> 
            <span className="text-sm md:text-base">Invoices</span>
          </NavLink>
        </div>
       
        <div className="text-center text-white hover:bg-blue-300 p-2 font-bold flex items-center justify-center space-x-2">
          <NavLink
            to="/dashboard/invoice" // Updated path for new invoice
            className=' mt-2 p-2 flex items-center'
          >
           <FaFileCirclePlus  className="text-xl text-white mr-2"/>
           <span className="text-sm md:text-base">New Invoice</span>
          </NavLink>
        </div>
       
        <div className="text-center p-2 text-white hover:bg-blue-300 font-bold flex items-center justify-center space-x-2">
          <NavLink
            to="/dashboard/settings" // Updated path for settings
            className=' mt-2 p-2 flex items-center '
          >
           <IoSettings className="text-xl text-white mr-2"/> 
           <span className="text-sm md:text-base">Settings</span>

          </NavLink>
        </div>
       
      </div>

      {/* Right side with dynamic content */}
      <div className=" col-span-1 md:col-span-10 p-4">
         
        
        {/* Use the Outlet here to render the child components */}
        <Outlet />

      </div>
    </div>
  );
};

export default Dashboard;
