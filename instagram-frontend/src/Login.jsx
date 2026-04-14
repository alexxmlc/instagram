import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Login({ onFormSwitch, onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:8080/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
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

    return (
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-3xl font-bold text-center mb-8">Instagram</h2>

                {error && <p className="text-red-500 text-center mb-4">{error}</p>}

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="border p-2 rounded"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border p-2 rounded"
                        required
                    />
                    <button type="submit" className="bg-blue-500 text-white font-bold py-2 rounded">
                        Log In
                    </button>

                    <button
                        className="mt-4 text-blue-500 hover:underline w-full text-center"
                        onClick={() => onFormSwitch('register')}
                    >
                        Don't have an account? Sign up.
                    </button>
                </form>
            </div>
        </div>
    );
}