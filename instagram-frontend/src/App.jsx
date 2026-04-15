import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Login from './Login';
import Register from './Register';
import Feed from './Feed';
import Profile from './Profile';
import PostDetails from './PostDetails';

export default function App() {
  const [currentForm, setCurrentForm] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [currentView, setCurrentView] = useState('feed');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [selectedUsername, setSelectedUsername] = useState(null);

  const toggleForm = (formName) => {
    setCurrentForm(formName);
  }

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentView('feed');
  }

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentForm('login');
  }

  const handleNavigate = (view, data = null) => {
    setCurrentView(view);
    if (view === 'post') {
      setSelectedPostId(data);
    } else if (view === 'profile') {
      setSelectedUsername(data);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] text-zinc-100">
        {currentView === 'feed' && <Feed onNavigate={handleNavigate} />}
        {currentView === 'profile' && <Profile username={selectedUsername} onNavigate={handleNavigate} onLogout={handleLogout} />}
        {currentView === 'post' && <PostDetails postId={selectedPostId} onNavigate={handleNavigate} />}

        <Toaster />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center items-center p-12 overflow-hidden bg-[#050505]">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-purple-900/30 blur-[120px] mix-blend-screen"></div>
          <div className="absolute bottom-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-pink-900/20 blur-[120px] mix-blend-screen"></div>
        </div>
        <div className="relative z-10 flex flex-col items-center w-full max-w-lg">
          <div className="mb-16 text-center">
            <h1 className="text-7xl font-extrabold mb-6 tracking-tighter bg-gradient-to-br from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
              Instagram
            </h1>
            <p className="text-xl text-zinc-400 leading-relaxed font-light">
              Connect with friends, share what you're up to, or see what's new from others all over the world.
            </p>
          </div>
        </div>
      </div>
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