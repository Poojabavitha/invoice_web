import React, { useState } from 'react';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, OAuthProvider } from 'firebase/auth';
import { auth } from '../firebase.js'; // Firebase authentication instance
import { GoLock, GoMail } from 'react-icons/go';
import { FaApple } from 'react-icons/fa';  // Google and Apple icons
import googleLogo from '../images/google.svg';
import invoiceImage from '../images/invoice.jpeg'; // Same image as in SignUp page
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({
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
      await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in successfully');
      navigate('/dashboard');
    } catch (err) {
      setError('Error logging in: ' + err.message);
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
    <div className="grid grid-cols-1 md:grid-cols-2 w-full h-screen">
      {/* Left Section: Image */}
      <div className="flex-1 flex items-center justify-center relative h-full">
        <div className="relative h-full">
          <img
            src={invoiceImage}
            alt="Invoice"
            className="object-cover w-full h-full"
          />
        </div>
      </div>

      {/* Right Section: Login Form */}
      <div className="flex-1 flex font-montserrat items-center justify-center bg-gray-300">
        <div className="w-full max-w-sm p-4 mx-auto">
          <h3 className="text-xl md:text-2xl font-bold text-blue-900 mb-6 text-center">Login To Continue</h3>

          <form className="signform p-4 bg-white rounded shadow-md w-full max-w-sm" onSubmit={handleSubmit}>
            <h2 className="flex items-center justify-center text-gray-700 text-3xl font-bold mb-4">Welcome Back!</h2>
            <hr className="mb-4" />

            {/* Email Input */}
            <label className="block text-lg font-medium mb-2" htmlFor="email">
              Email
            </label>
            <div className="relative mb-4">
              <GoMail className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-600" />
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 pl-10 border border-gray-300 rounded shadow-xl"
                style={{
                  boxShadow: 'inset 0 0 5px rgba(169, 169, 169, 0.5)',
                }}
                required
              />
            </div>

            {/* Password Input */}
            <label className="block text-lg font-medium mb-2" htmlFor="password">
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

            {/* Error Message */}
            {error && <div className="text-red-500 text-xl mb-4">{error}</div>}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? 'Logging In...' : 'Login'}
            </button>

            <div className="flex items-center justify-center mt-4">
              Don't have an account? <Link to="/" className='text-blue-500'>Sign up</Link>
            </div>

            {/* Social Sign-In Buttons */}
            <div className="flex flex-col md:w-flex-row gap-2 mt-4">
              <button
                type="button"
                className="w-full md:w-auto p-2 bg-white text-black rounded flex items-center justify-center gap-2 hover:bg-blue-300"
                onClick={handleGoogleSignIn}
              >
                <img src={googleLogo} alt="Google" className="text-xl h-8 w-8" />
                <span className="ml-2">Login with Google</span>
              </button>

              <button
                type="button"
                className="w-full p-2 md:w-auto bg-white text-black rounded flex items-center justify-center gap-2 hover:bg-blue-300"
                onClick={handleAppleSignIn}
              >
                <FaApple className="text-black text-2xl" />
                <span className="ml-2">Login with Apple</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
