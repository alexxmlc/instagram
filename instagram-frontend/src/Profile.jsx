import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

const applyCacheBuster = (url) => {
    if (!url) return url;
    if (url.includes('?t=') || url.includes('&t=')) return url;
    return `${url}?t=${new Date().getTime()}`;
};

export default function Profile({ username, onNavigate, onLogout }) {
    const [profileData, setProfileData] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // edit mode
    const [isEditing, setIsEditing] = useState(false);
    const [editBio, setEditBio] = useState('');

    const fileInputRef = useRef(null);

    const handleModeratorAction = async (action) => {
        const loadingToast = toast.loading(`${action === 'ban' ? 'Banning' : 'Unbanning'} user...`);
        try {
            const token = localStorage.getItem('jwt_token');
            const response = await fetch(`http://localhost:8080/api/mod/${action}/${profileData.username}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error(`Failed to ${action} user`);

            toast.success(`User ${action === 'ban' ? 'banned' : 'unbanned'} successfully!`, { id: loadingToast });
            fetchProfile(); // Reîncarcă profilul pentru a vedea statusul actualizat
        } catch (err) {
            toast.error(err.message, { id: loadingToast });
        }
    };

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('jwt_token');

            // get logged in user
            const meResponse = await fetch('http://localhost:8080/api/users/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!meResponse.ok) throw new Error('Failed to fetch user info');
            const meData = await meResponse.json();
            setCurrentUser(meData);

            // whose profile to fetch
            const targetUsername = username || meData.username;

            // fetch the profile details
            const profileResponse = await fetch(`http://localhost:8080/api/users/${targetUsername}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!profileResponse.ok) throw new Error('Failed to load profile');
            const profData = await profileResponse.json();

            if (profData.profilePictureUrl) {
                profData.profilePictureUrl = applyCacheBuster(profData.profilePictureUrl);
            }

            setProfileData(profData);
            setEditBio(profData.bio || '');

            // fetch this user's posts
            const postsResponse = await fetch(`http://localhost:8080/api/posts?author=${targetUsername}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (postsResponse.ok) {
                const postsData = await postsResponse.json();
                setUserPosts(postsData);
            }

            setLoading(false);
        } catch (err) {
            toast.error(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [username]); // re-run if the username prop changes

    // is this my profile?
    const isOwnProfile = currentUser?.username === profileData?.username;

    // pfp upload
    const handleAvatarUpload = async (e) => {
        if (!isOwnProfile) return;
        const file = e.target.files[0];
        if (!file) return;

        const loadingToast = toast.loading('Uploading picture...');
        try {
            const token = localStorage.getItem('jwt_token');
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('http://localhost:8080/api/users/me/avatar', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (!response.ok) throw new Error('Failed to upload picture');

            const updatedProfile = await response.json();
            if (updatedProfile.profilePictureUrl) {
                updatedProfile.profilePictureUrl = applyCacheBuster(updatedProfile.profilePictureUrl);
            }

            setProfileData(updatedProfile);
            toast.success('Profile picture updated!', { id: loadingToast });
        } catch (err) {
            toast.error(err.message, { id: loadingToast });
        }
    };

    // bio update
    const handleSaveBio = async () => {
        if (!isOwnProfile) return;
        try {
            const token = localStorage.getItem('jwt_token');
            const response = await fetch('http://localhost:8080/api/users/me', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ bio: editBio })
            });

            if (!response.ok) throw new Error('Failed to update profile');

            const updatedProfile = await response.json();
            if (updatedProfile.profilePictureUrl) {
                updatedProfile.profilePictureUrl = applyCacheBuster(updatedProfile.profilePictureUrl);
            }

            setProfileData(updatedProfile);
            setIsEditing(false);
            toast.success('Bio updated!');
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleLogoutClick = () => {
        localStorage.removeItem('jwt_token');
        onLogout();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#050505]">
                <div className="w-10 h-10 border-4 border-zinc-800 border-t-pink-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen py-12 px-4 overflow-hidden">
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px] mix-blend-screen"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full bg-pink-900/10 blur-[120px] mix-blend-screen"></div>
            </div>

            <div className="relative z-10 max-w-3xl mx-auto flex flex-col gap-8 w-full">

                {/* header/navigation */}
                <div className="flex justify-between items-center bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/60 p-4 rounded-3xl shadow-xl">
                    <button
                        onClick={() => onNavigate('feed')}
                        className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors px-4 py-2 rounded-xl hover:bg-zinc-800"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        Back to Feed
                    </button>

                    {isOwnProfile && (
                        <button
                            onClick={handleLogoutClick}
                            className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors px-4 py-2 rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                            Log Out
                        </button>
                    )}
                </div>

                {/* profile card */}
                <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/60 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">

                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-purple-500 to-pink-500 shadow-xl shadow-pink-500/20">
                                <img
                                    src={profileData?.profilePictureUrl || 'https://via.placeholder.com/150'}
                                    alt="Profile"
                                    className="w-full h-full rounded-full object-cover border-4 border-zinc-900"
                                />
                            </div>

                            {isOwnProfile && (
                                <>
                                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" />
                                    <button onClick={() => fileInputRef.current.click()} className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer border-4 border-transparent">
                                        <svg className="w-8 h-8 text-white mb-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                        <span className="text-xs font-bold text-white">Edit</span>
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="flex-1 text-center md:text-left w-full">
                            <h1 className="text-3xl font-bold text-white mb-5">@{profileData?.username}</h1>
                            
                            {/* Moderator Actions */}
                            {currentUser?.role === 'MODERATOR' && currentUser?.username !== profileData?.username && (
                                <div className="flex gap-2 mb-4">
                                    {profileData?.banned ? (
                                        <button
                                            onClick={() => handleModeratorAction('unban')}
                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all text-sm"
                                        >
                                            Unban User
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleModeratorAction('ban')}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all text-sm"
                                        >
                                            Ban User
                                        </button>
                                    )}
                                </div>
                            )}

                            {isEditing ? (
                                <div className="flex flex-col gap-3 animate-in fade-in">
                                    <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} className="w-full bg-zinc-800/50 border border-zinc-700 text-white p-3 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all resize-none" rows="3" placeholder="Write something about yourself..." />
                                    <div className="flex gap-2 justify-end md:justify-start">
                                        <button onClick={handleSaveBio} className="px-4 py-2 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors">Save</button>
                                        <button onClick={() => { setIsEditing(false); setEditBio(profileData?.bio || ''); }} className="px-4 py-2 border border-zinc-700 text-zinc-300 font-bold rounded-lg hover:bg-zinc-800 transition-colors">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="group relative">
                                    <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                        {profileData?.bio || <span className="text-zinc-600 italic">No bio yet.</span>}
                                    </p>
                                    {isOwnProfile && (
                                        <button onClick={() => setIsEditing(true)} className="mt-4 px-4 py-2 bg-zinc-800 text-white font-semibold rounded-lg border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 transition-all">
                                            Edit Profile
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* user post grid */}
                <div className="mt-4">
                    <h3 className="text-2xl font-bold text-white mb-6 border-b border-zinc-800/60 pb-3">
                        {isOwnProfile ? 'Your Posts' : `Posts by ${profileData?.username}`}
                    </h3>

                    {userPosts.length === 0 ? (
                        <div className="text-center text-zinc-500 py-10 bg-zinc-900/30 rounded-3xl border border-zinc-800/30">
                            No posts to show.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {userPosts.map(post => (
                                <div
                                    key={post.postId || post.id}
                                    onClick={() => onNavigate('post', post.postId || post.id)}
                                    className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-2xl overflow-hidden cursor-pointer hover:border-pink-500/50 hover:shadow-[0_0_20px_rgba(236,72,153,0.15)] transition-all duration-300 group"
                                >
                                    {post.pictureUrl ? (
                                        <img src={post.pictureUrl} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" alt={post.title} />
                                    ) : (
                                        <div className="w-full h-32 bg-zinc-800 flex items-center justify-center">
                                            <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <h4 className="font-bold text-zinc-100 truncate text-lg">{post.title}</h4>
                                        <p className="text-sm text-zinc-400 mt-1 line-clamp-2">{post.text}</p>
                                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-800/50">
                                            <span className="text-xs text-pink-500 font-bold">{post.voteScore} votes</span>
                                            <span className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">View Post &rarr;</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}