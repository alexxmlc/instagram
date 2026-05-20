import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Login({ onFormSwitch, onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isBanned, setIsBanned] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:8080/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                // Attempt to read the error message from the backend
                try {
                    const errorData = await response.json();
                    if (errorData.message === 'banned') {
                        setIsBanned(true); // Triggers your banned UI state
                        return;
                    }
                } catch (err) {
                    console.error("Parse error:", err);
                }

                // If it's not "banned", show standard error
                throw new Error('Invalid username or password');
            }

            const data = await response.json();
            localStorage.setItem('jwt_token', data.token);
            toast.success("Login successful!");
            onLoginSuccess();

        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        }
    };

    // Render the Banned UI state
    if (isBanned) {
        return (
            <div className="w-full max-w-md bg-zinc-900/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-red-900/50 text-center animate-in fade-in zoom-in-95">
                <div className="text-red-500 mb-4 flex justify-center">
                    <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-red-500 mb-4">Account Banned</h1>
                <p className="text-zinc-300 mb-8">
                    Your account has been disabled due to violations of our community guidelines.
                </p>
                <button
                    onClick={() => { setIsBanned(false); setPassword(''); }}
                    className="text-sm text-zinc-500 hover:text-white underline transition-colors"
                >
                    Return to Login
                </button>
            </div>
        );
    }

    // Render the Login form
    return (
        <div className="w-full max-w-md bg-zinc-900/40 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-zinc-800/50">
            <h2 className="text-3xl font-extrabold text-center mb-8 bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
                Instagram
            </h2>

            {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

            <form onSubmit={handleLogin} className="flex flex-col gap-5">
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-zinc-800/50 border border-zinc-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-zinc-500"
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-zinc-800/50 border border-zinc-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-zinc-500"
                    required
                />

                <button
                    type="submit"
                    className="mt-2 bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.03] hover:-translate-y-1 active:scale-[0.98] shadow-lg shadow-purple-500/40 hover:shadow-[0_0_25px_rgba(217,70,239,0.6)] relative overflow-hidden group"
                >
                    Log In
                </button>

                <button
                    type="button"
                    className="mt-2 text-sm text-zinc-400 hover:text-white hover:underline w-full text-center transition-colors"
                    onClick={() => onFormSwitch('register')}
                >
                    Don't have an account? Sign up.
                </button>
            </form>
        </div>
    );
}