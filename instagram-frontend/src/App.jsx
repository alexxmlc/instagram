import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Login from './Login';
import Register from './Register';

export default function App() {
  const [currentForm, setCurrentForm] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const toggleForm = (formName) => {
    setCurrentForm(formName);
  }
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  }

  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <h1 className="text-4xl font-bold">Welcome to the Feed!</h1>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">

      {/* Left */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 flex-col justify-center items-center p-12 text-white">
        <h1 className="text-5xl font-bold mb-4">Instagram Clone</h1>
        <p className="text-xl text-blue-100 text-center">
          Connect with friends, share what you're up to, or see what's new from others all over the world.
        </p>
      </div>

      {/* Right */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50">

        {
          (currentForm == 'login') ? <Login onFormSwitch={toggleForm} onLoginSuccess={handleLoginSuccess} /> : <Register onFormSwitch={toggleForm} />
        }

        <Toaster />

      </div>

    </div>
  );
}