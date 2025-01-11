import React, { useState } from 'react';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, OAuthProvider } from 'firebase/auth';
import { auth } from '../firebase.js'; // Firebase authentication instance
import { GoLock, GoMail, GoPerson } from 'react-icons/go';
import { FaApple } from 'react-icons/fa';  // Google and Apple icons
import googleLogo from '../images/google.svg';
import invoiceImage from '../images/invoice.jpeg'; // Image import
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

function SignUp() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { email, password } = formData;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User signed up successfully', user);

      // Store user UID in local storage or application context for later use
      localStorage.setItem('userId', user.uid);

      navigate('/dashboard');
    } catch (err) {
      setError('Error signing up: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Google sign-in successful', result.user);
      navigate('/dashboard');
    } catch (err) {
      setError('Google Sign-In Error: ' + err.message);
    }
  };

  const handleAppleSignIn = async () => {
    const provider = new OAuthProvider('apple.com');
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Apple sign-in successful', result.user);
      navigate('/dashboard');
    } catch (err) {
      setError('Apple Sign-In Error: ' + err.message);
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-screen relative">
      {/* Left Section: Image */}
      <div className="flex-1 h-48 md:h-full flex items-center justify-center relative">
        <div className="w-full h-full">
          <img
            src={invoiceImage}
            alt="Invoice"
            className="object-cover w-full h-full"
          />
        </div>
      </div>

      {/* Right Section: Sign-Up Form */}
      <div className="flex-1 flex font-montserrat items-center justify-center bg-gray-300 px-4 py-8 md:px-8">
        <div className="w-full max-w-sm p-4">
          <h3 className="text-2xl md:text-4xl font-bold text-blue-900 mb-6 text-center">Pay Invoice</h3>

          <form className="signform p-4 bg-white rounded shadow-md w-full max-w-sm" onSubmit={handleSubmit}>
            <h2 className="flex items-center justify-center text-blue-700 text-4xl font-bold mb-4">Sign Up</h2>
            <hr className="mb-4" />

            {/* Username Input */}
            <div className='w-full'>
            <label className="block text-sm md:text-xl font-medium mb-2" htmlFor="username">
              Username
            </label>
            <div className="relative mb-4">
              <GoPerson className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-700" />
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full p-2 pl-10 border border-gray-300 rounded shadow-xl"
                style={{
                  boxShadow: 'inset 0 0 5px rgba(169, 169, 169, 0.5)',
                }}
                required
              />
            </div>

            {/* Email Input */}
            <label className="block text-sm md:text-xl font-medium mb-2" htmlFor="email">
              Email
            </label>
            <div className="relative mb-4">
              <GoMail className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 pl-10 border border-gray-300 shadow-xl rounded"
                style={{
                  boxShadow: 'inset 0 0 5px rgba(169, 169, 169, 0.5)',
                }}
                required
              />
            </div>

            {/* Password Input */}
            <label className="block text-sm md:text-xl font-medium mb-2" htmlFor="password">
              Password
            </label>
            <div className="relative mb-4">
              <GoLock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full p-2 pl-10 border border-gray-300 rounded shadow-xl"
                style={{
                  boxShadow: 'inset 0 0 5px rgba(169, 169, 169, 0.5)',
                }}
                required
              />
            </div>
            </div>

            {/* Error Message */}
            {error && <div className="text-red-500 text-xl mb-4">{error}</div>}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? 'Signing Up...' : 'Register'}
            </button>

            <div className="flex items-center justify-center mt-4">
              Already have an account? <Link to="/login" className='text-blue-500'>Login</Link>
            </div>

            {/* Social Sign-In Buttons */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                className="w-full p-2 bg-white text-black rounded flex items-center justify-center gap-2 hover:bg-blue-300 mt-4"
                onClick={handleGoogleSignIn}
              >
                <img src={googleLogo} alt="Google" className="text-xl h-8 w-8" />
                <span className="ml-2">Sign up with Google</span>
              </button>

              {/* Apple Sign-In Button */}
              <button
                type="button"
                className="w-full p-2 bg-white text-black rounded flex items-center justify-center gap-2 hover:bg-blue-300 mt-4"
                onClick={handleAppleSignIn}
              >
                <FaApple className="text-black text-2xl" />
                <span className="ml-2">Sign up with Apple</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
