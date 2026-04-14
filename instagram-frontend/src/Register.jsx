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
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        }
    };

    return (
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-3xl font-bold text-center mb-8">Sign Up</h2>

                {error && <p className="text-red-500 text-center mb-4">{error}</p>}

                <form onSubmit={handleRegister} className="flex flex-col gap-4">

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

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border p-2 rounded"
                        required
                    />

                    <button type="submit" className="bg-blue-500 text-white font-bold py-2 rounded">
                        Create Account
                    </button>

                    <button
                        className="mt-4 text-blue-500 hover:underline w-full text-center"
                        onClick={() => onFormSwitch('login')}
                    >
                        Already have an account? Log in
                    </button>
                </form>
            </div>
        </div>
    );
}