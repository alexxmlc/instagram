import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Register({ onFormSwitch }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:8080/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password, email })
            });

            if (!response.ok) {
                throw new Error('Username or email already exists')
            }

            toast.success("Account successfully created");

            onFormSwitch('login');

        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        }
    };

    return (
        <div className="w-full max-w-md bg-zinc-900/40 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-zinc-800/50">

            <h2 className="text-3xl font-extrabold text-center mb-8 bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
                Sign Up
            </h2>

            {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

            <form onSubmit={handleRegister} className="flex flex-col gap-5">
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

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-zinc-800/50 border border-zinc-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-zinc-500"
                    required
                />

                <button
                    type="submit"
                    className="mt-2 bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-500 hover:to-pink-500 
                    text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.03] hover:-translate-y-1 
                    active:scale-[0.98] shadow-lg shadow-purple-500/40 hover:shadow-[0_0_25px_rgba(217,70,239,0.6)] relative overflow-hidden group"                >
                    Create Account
                </button>

                <button
                    type="button"
                    className="mt-2 text-sm text-zinc-400 hover:text-white hover:underline w-full text-center transition-colors"
                    onClick={() => onFormSwitch('login')}
                >
                    Already have an account? Log in
                </button>
            </form>
        </div>
    );
}