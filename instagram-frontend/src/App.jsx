import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Login from './Login';
import Register from './Register';
import Feed from './Feed';

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
      <div className="min-h-screen bg-[#050505] text-zinc-100">
        <Feed />
        <Toaster />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">

      {/* left */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center items-center p-12 overflow-hidden bg-[#050505]">

        {/* ambient glows */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-purple-900/30 blur-[120px] mix-blend-screen"></div>
          <div className="absolute bottom-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-pink-900/20 blur-[120px] mix-blend-screen"></div>
        </div>

        {/*content container */}
        <div className="relative z-10 flex flex-col items-center w-full max-w-lg">

          {/* text */}
          <div className="mb-16 text-center">
            <h1 className="text-7xl font-extrabold mb-6 tracking-tighter bg-gradient-to-br from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
              Instagram
            </h1>
            <p className="text-xl text-zinc-400 leading-relaxed font-light">
              Connect with friends, share what you're up to, or see what's new from others all over the world.
            </p>
          </div>

          {/* post mock */}
          <div className="w-full bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/60 rounded-2xl p-6 shadow-2xl transform -rotate-3 hover:rotate-0 transition-all duration-500 hover:scale-[1.02] cursor-default group">

            {/* mock header */}
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 p-[2px] shadow-lg shadow-purple-500/20">
                <div className="w-full h-full bg-zinc-900 rounded-full border-2 border-transparent"></div>
              </div>
              <div>
                <div className="h-3 w-24 bg-zinc-700/80 rounded animate-pulse mb-2"></div>
                <div className="h-2 w-16 bg-zinc-800 rounded"></div>
              </div>
            </div>

            {/* mock image */}
            <div className="w-full h-56 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 rounded-xl mb-5 border border-zinc-700/30 relative overflow-hidden flex items-center justify-center group-hover:border-zinc-600/50 transition-colors">
            </div>

            {/* mock buttons */}
            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-full bg-zinc-800/60 hover:bg-pink-500/20 hover:text-pink-500 transition-colors cursor-pointer flex items-center justify-center">
                <svg className="w-4 h-4 text-zinc-500 hover:text-pink-500 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
              </div>
              <div className="h-8 w-8 rounded-full bg-zinc-800/60"></div>
              <div className="h-8 w-8 rounded-full bg-zinc-800/60"></div>
            </div>

          </div>

        </div>
      </div>

      {/* right */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#050505]">
        {
          (currentForm === 'login')
            ? <Login onFormSwitch={toggleForm} onLoginSuccess={handleLoginSuccess} />
            : <Register onFormSwitch={toggleForm} />
        }
        <Toaster />
      </div>

    </div>
  );
}