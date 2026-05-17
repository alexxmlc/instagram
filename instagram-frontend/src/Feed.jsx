import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import CreatePost from './CreatePost';

const getProfilePic = (url, sessionTime, size = 40) => {
    if (!url) return `https://via.placeholder.com/${size}`;
    if (url.includes('?t=') || url.includes('&t=')) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${sessionTime}`;
};

const formatTime = (dateInput) => {
    if (!dateInput) return '';
    let d;
    if (Array.isArray(dateInput)) {
        d = new Date(dateInput[0], dateInput[1] - 1, dateInput[2], dateInput[3], dateInput[4]);
    } else {
        d = new Date(dateInput);
    }
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const formatStatus = (status) => {
    if (!status) return '';
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const getStatusColor = (status) => {
    switch (status) {
        case 'JUST_POSTED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        case 'FIRST_REACTIONS': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        case 'OUTDATED': return 'bg-red-500/10 text-red-400 border-red-500/20';
        default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
};

export default function Feed({ onNavigate }) {
    const [sessionTime] = useState(Date.now());
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [confirmDialog, setConfirmDialog] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [tagQuery, setTagQuery] = useState('');
    const [authorQuery, setAuthorQuery] = useState('');

    const [editingPost, setEditingPost] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editText, setEditText] = useState('');

    const [comments, setComments] = useState({});
    const [showComments, setShowComments] = useState({});
    const [commentInputs, setCommentInputs] = useState({});

    const [commentFiles, setCommentFiles] = useState({});
    const [, setCommentPreviews] = useState({});

    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editCommentText, setEditCommentText] = useState('');

    const fetchCurrentUser = async () => {
        try {
            const token = localStorage.getItem('jwt_token');
            const response = await fetch('http://localhost:8080/api/users/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCurrentUser(data);
            }
        } catch (err) {
            console.error("An error occurred:", err);
        }
    };

    const fetchPosts = async (search = searchQuery, tag = tagQuery, author = authorQuery) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('jwt_token');
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (tag) params.append('tag', tag);
            if (author) params.append('author', author);

            const url = `http://localhost:8080/api/posts${params.toString() ? '?' + params.toString() : ''}`;

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch posts');

            const data = await response.json();
            setPosts(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const refreshComments = async (postId) => {
        try {
            const token = localStorage.getItem('jwt_token');
            const res = await fetch(`http://localhost:8080/api/comments/post/${postId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const freshComments = await res.json();
                setComments(prev => ({ ...prev, [postId]: freshComments }));
            }
        } catch (err) {console.error("An error occurred:", err); }
    };

    useEffect(() => {
        fetchCurrentUser();
        fetchPosts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchPosts(searchQuery, tagQuery, authorQuery);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setTagQuery('');
        setAuthorQuery('');
        fetchPosts('', '', '');
    };

    const openEditModal = (post) => {
        setEditingPost(post);
        setEditTitle(post.title);
        setEditText(post.text);
    };

    const handleSaveEdit = async () => {
        const loadingToast = toast.loading('Updating post...');
        try {
            const token = localStorage.getItem('jwt_token');
            const targetId = editingPost.postId || editingPost.id;

            const response = await fetch(`http://localhost:8080/api/posts/${targetId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title: editTitle, text: editText })
            });

            if (!response.ok) throw new Error('Failed to update post');

            toast.success('Post updated!', { id: loadingToast });
            setEditingPost(null);
            fetchPosts();
        } catch (err) {
            toast.error(err.message, { id: loadingToast });
        }
    };

    const handleDeletePost = (postId) => {
        setConfirmDialog({
            title: 'Delete Post',
            message: 'Are you sure you want to delete this post? This action cannot be undone.',
            confirmText: 'Delete',
            confirmStyle: 'bg-red-600 hover:bg-red-500 shadow-red-500/20',
            action: async () => {
                const loadingToast = toast.loading('Deleting post...');
                try {
                    const token = localStorage.getItem('jwt_token');
                    const response = await fetch(`http://localhost:8080/api/posts/${postId}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!response.ok) throw new Error('Failed to delete post');
                    toast.success('Post deleted permanently!', { id: loadingToast });
                    fetchPosts();
                } catch (err) {
                    toast.error(err.message, { id: loadingToast });
                }
                setConfirmDialog(null);
            }
        });
    };

    const handleCloseComments = (postId) => {
        setConfirmDialog({
            title: 'Lock Post',
            message: 'Are you sure you want to lock this post? No more comments can be added.',
            confirmText: 'Lock',
            confirmStyle: 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/20',
            action: async () => {
                const loadingToast = toast.loading('Locking post...');
                try {
                    const token = localStorage.getItem('jwt_token');
                    const response = await fetch(`http://localhost:8080/api/posts/${postId}/close`, {
                        method: 'PATCH',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!response.ok) throw new Error('Failed to close comments');
                    toast.success('Post locked!', { id: loadingToast });
                    fetchPosts();
                } catch (err) {
                    toast.error(err.message, { id: loadingToast });
                }
                setConfirmDialog(null);
            }
        });
    };

    const handleVote = async (postId, voteType) => {
        try {
            const token = localStorage.getItem('jwt_token');
            const response = await fetch(`http://localhost:8080/api/votes/posts/${postId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ voteType })
            });

            if (!response.ok) {
                let cleanErrorMessage = 'Failed to register vote';
                try {
                    const errorData = await response.json();
                    cleanErrorMessage = errorData.message || cleanErrorMessage;
                } catch (parseErr) { console.error("Parse error:", parseErr);}
                throw new Error(cleanErrorMessage);
            }
            fetchPosts();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleCommentVote = async (postId, commentId, voteType) => {
        try {
            const token = localStorage.getItem('jwt_token');
            const response = await fetch(`http://localhost:8080/api/votes/comments/${commentId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ voteType })
            });

            if (!response.ok) {
                let cleanErrorMessage = 'Failed to register vote';
                try {
                    const errorData = await response.json();
                    cleanErrorMessage = errorData.message || cleanErrorMessage;
                } catch (parseErr) { console.error("An error occurred:", parseErr);}
                throw new Error(cleanErrorMessage);
            }
            await refreshComments(postId);
        } catch (err) {
            toast.error(err.message);
        }
    };

    const toggleComments = async (postId) => {
        if (showComments[postId]) {
            setShowComments(prev => ({ ...prev, [postId]: false }));
            return;
        }

        try {
            const token = localStorage.getItem('jwt_token');
            const response = await fetch(`http://localhost:8080/api/comments/post/${postId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to load comments');

            const data = await response.json();
            setComments(prev => ({ ...prev, [postId]: data }));
            setShowComments(prev => ({ ...prev, [postId]: true }));
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleCommentFileChange = (postId, e) => {
        const file = e.target.files[0];
        if (file) {
            setCommentFiles(prev => ({ ...prev, [postId]: file }));
            setCommentPreviews(prev => ({ ...prev, [postId]: URL.createObjectURL(file) }));
        }
    };

    const handlePostComment = async (postId) => {
        const commentValue = commentInputs[postId];
        const fileValue = commentFiles[postId];

        if ((!commentValue || commentValue.trim() === '') && !fileValue) return;

        try {
            const token = localStorage.getItem('jwt_token');
            const formData = new FormData();
            if (commentValue) formData.append('text', commentValue);
            if (fileValue) formData.append('file', fileValue);

            const response = await fetch(`http://localhost:8080/api/comments/post/${postId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (!response.ok) {
                let cleanErrorMessage = 'Failed to post comment';
                try {
                    const errorData = await response.json();
                    cleanErrorMessage = errorData.message || cleanErrorMessage;
                } catch (parseErr) { console.error("An error occurred:", parseErr);}
                throw new Error(cleanErrorMessage);
            }

            toast.success("Comment added!");

            setCommentInputs(prev => ({ ...prev, [postId]: '' }));
            setCommentFiles(prev => ({ ...prev, [postId]: null }));
            setCommentPreviews(prev => ({ ...prev, [postId]: null }));

            const commentsRes = await fetch(`http://localhost:8080/api/comments/post/${postId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (commentsRes.ok) {
                const freshComments = await commentsRes.json();
                setComments(prev => ({ ...prev, [postId]: freshComments }));
                setShowComments(prev => ({ ...prev, [postId]: true }));
            }

            fetchPosts();

        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleDeleteComment = (postId, commentId) => {
        setConfirmDialog({
            title: 'Delete Comment',
            message: 'Are you sure you want to delete your comment?',
            confirmText: 'Delete',
            confirmStyle: 'bg-red-600 hover:bg-red-500 shadow-red-500/20',
            action: async () => {
                try {
                    const token = localStorage.getItem('jwt_token');
                    const response = await fetch(`http://localhost:8080/api/comments/${commentId}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!response.ok) throw new Error("Failed to delete comment");
                    toast.success("Comment deleted!");
                    await refreshComments(postId);
                } catch (err) {
                    toast.error(err.message);
                }
                setConfirmDialog(null);
            }
        });
    };

    const handleSaveCommentEdit = async (postId, commentId) => {
        try {
            const token = localStorage.getItem('jwt_token');
            const formData = new FormData();
            formData.append('text', editCommentText);

            const response = await fetch(`http://localhost:8080/api/comments/${commentId}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (!response.ok) throw new Error("Failed to update comment");

            toast.success("Comment updated!");
            setEditingCommentId(null);
            await refreshComments(postId);
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (error) {
        return <div className="text-red-400 text-center mt-10">{error}</div>;
    }
    if (loading && posts.length === 0) {
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

            <div className="relative z-10 max-w-xl mx-auto flex flex-col gap-8 w-full">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-4xl font-extrabold bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
                        Your Feed
                    </h2>
                    <div className="flex gap-3">
                        <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 bg-pink-600 hover:bg-pink-500 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-lg shadow-pink-500/20">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
                            Post
                        </button>
                        <button onClick={() => onNavigate('profile')} className="flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-white font-bold p-2.5 rounded-xl transition-all border border-zinc-700">
                            <svg className="w-6 h-6 text-zinc-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        </button>
                    </div>
                </div>

                {/* filtered */}
                <form onSubmit={handleSearchSubmit} className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <input type="text" placeholder="Search by title..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-zinc-950/50 border border-zinc-800/80 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 text-sm placeholder:text-zinc-500 transition-all shadow-inner" />
                        </div>
                        <div className="relative">
                            <input type="text" placeholder="Tag (e.g. tech)" value={tagQuery} onChange={e => setTagQuery(e.target.value)} className="w-full bg-zinc-950/50 border border-zinc-800/80 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 text-sm placeholder:text-zinc-500 transition-all shadow-inner" />
                        </div>
                        <div className="relative">
                            <input type="text" placeholder="Username" value={authorQuery} onChange={e => setAuthorQuery(e.target.value)} className="w-full bg-zinc-950/50 border border-zinc-800/80 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 text-sm placeholder:text-zinc-500 transition-all shadow-inner" />
                        </div>
                    </div>
                    <div className="flex justify-between gap-3 pt-2 border-t border-zinc-800/50 mt-1">
                        <button type="button" onClick={clearFilters} className="text-zinc-400 hover:text-white font-medium py-2 px-3 rounded-lg text-sm">Clear</button>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => { setAuthorQuery(currentUser?.username || ''); fetchPosts(searchQuery, tagQuery, currentUser?.username || ''); }} className="bg-zinc-800 text-pink-400 font-semibold py-2 px-4 rounded-xl text-sm border border-zinc-700">My Posts</button>
                            <button type="submit" className="bg-zinc-100 text-zinc-900 font-bold py-2 px-5 rounded-xl text-sm">Filter</button>
                        </div>
                    </div>
                </form>

                {/* creating a post */}
                <CreatePost isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onPostCreated={fetchPosts} />

                {/* all posts */}
                {posts.map((post) => (
                    <article key={post.postId || post.id} className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/60 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:border-zinc-700/80 group">

                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center">
                                <img src={getProfilePic(post.author.profilePictureUrl, sessionTime, 40)} className="w-10 h-10 rounded-full object-cover border-2 border-zinc-900 mr-3" />
                                <div>
                                    <span
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onNavigate('profile', post.author.username);
                                        }}
                                        className="font-bold text-sm text-zinc-100 cursor-pointer hover:text-pink-400 hover:underline transition-all"
                                    >
                                        {post.author.username}
                                    </span>
                                    <div className="text-xs text-zinc-500 flex items-center gap-2">
                                        {formatTime(post.date)}
                                        <span>•</span>
                                        <button type="button" onClick={() => onNavigate('post', post.postId || post.id)} className="hover:text-pink-400 transition-colors hover:underline">
                                            View Full Post
                                        </button>

                                        {post.status && (
                                            <>
                                                <span>•</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(post.status)}`}>
                                                    {formatStatus(post.status)}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {currentUser?.username === post.author.username && (
                                <div className="flex gap-1">
                                    {post.status !== 'OUTDATED' && (
                                        <button onClick={() => handleCloseComments(post.postId || post.id)} className="text-zinc-500 hover:text-amber-400 p-2" title="Lock Comments">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                        </button>
                                    )}
                                    <button onClick={() => openEditModal(post)} className="text-zinc-500 hover:text-blue-400 p-2" title="Edit Post"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
                                    <button onClick={() => handleDeletePost(post.postId || post.id)} className="text-zinc-500 hover:text-red-400 p-2" title="Delete Post"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                                </div>
                            )}
                        </div>

                        {post.pictureUrl && (
                            <img src={post.pictureUrl} className="w-full max-h-[600px] object-cover" />
                        )}

                        <div className="flex gap-4 px-5 pt-4 pb-2">
                            <button onClick={() => handleVote(post.postId || post.id, 'UPVOTE')} className="text-zinc-100 hover:text-pink-500"><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg></button>
                            <button onClick={() => handleVote(post.postId || post.id, 'DOWNVOTE')} className="text-zinc-100 hover:text-purple-500"><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M12 7l-2 4 4 3-2 4"></path></svg></button>
                            <button onClick={() => toggleComments(post.postId || post.id)} className={`transition-colors ${showComments[post.postId || post.id] ? 'text-zinc-400' : 'text-zinc-100'}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg></button>
                        </div>

                        <div className="px-5 pb-6">
                            <div className="font-bold text-sm mb-2">{post.voteScore} votes</div>
                            <div className="mb-3 text-sm">
                                <span className="font-bold mr-2">{post.author.username}</span>
                                <span className="font-semibold text-zinc-200">{post.title}</span>
                                <p className="text-zinc-400 mt-1">{post.text}</p>
                            </div>

                            {/* tags */}
                            {post.tags && post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3 mb-2">
                                    {post.tags.map((tag) => (
                                        <span key={tag} className="text-xs text-fuchsia-400 bg-fuchsia-500/10 px-3 py-1 rounded-full font-medium border border-fuchsia-500/20">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* comments */}
                            {showComments[post.postId || post.id] && (
                                <div className="mt-5 mb-2 pt-4 border-t border-zinc-800/60 flex flex-col gap-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                    {comments[post.postId || post.id]?.map(comment => (
                                        <div key={comment.commentId || comment.id} className="flex gap-3 items-start">
                                            <img src={getProfilePic(comment.author.profilePictureUrl, sessionTime, 32)} className="w-8 h-8 rounded-full object-cover mt-0.5" />
                                            <div className="flex-1 bg-zinc-800/30 rounded-2xl rounded-tl-sm px-4 py-2.5">

                                                <div className="flex justify-between items-start mb-1">
                                                    <div>
                                                        <span
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onNavigate('profile', comment.author.username);
                                                            }}
                                                            className="font-bold text-sm text-zinc-200 mr-2 cursor-pointer hover:text-pink-400 hover:underline transition-all"
                                                        >
                                                            {comment.author.username}
                                                        </span>
                                                        <span className="text-xs text-zinc-500">{formatTime(comment.createdAt)}</span>
                                                    </div>

                                                    {currentUser?.username === comment.author.username && (
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => { setEditingCommentId(comment.commentId || comment.id); setEditCommentText(comment.text); }} className="text-zinc-500 hover:text-blue-400"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
                                                            <button onClick={() => handleDeleteComment(post.postId || post.id, comment.commentId || comment.id)} className="text-zinc-500 hover:text-red-400"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                                                        </div>
                                                    )}
                                                </div>

                                                {editingCommentId === (comment.commentId || comment.id) ? (
                                                    <div className="mt-2 flex flex-col gap-2">
                                                        <input type="text" value={editCommentText} onChange={e => setEditCommentText(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-pink-500" />
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => setEditingCommentId(null)} className="text-xs font-bold text-zinc-400 hover:text-white">Cancel</button>
                                                            <button onClick={() => handleSaveCommentEdit(post.postId || post.id, comment.commentId || comment.id)} className="text-xs font-bold text-pink-400 hover:text-pink-300">Save</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-zinc-300">{comment.text}</span>
                                                )}

                                                {comment.pictureUrl && <img src={comment.pictureUrl} className="mt-2 w-full max-h-40 object-cover rounded-xl border border-zinc-700/50" />}

                                                <div className="flex items-center gap-3 mt-3 pt-2 border-t border-zinc-700/30">
                                                    <button onClick={() => handleCommentVote(post.postId || post.id, comment.commentId || comment.id, 'UPVOTE')} className="text-zinc-500 hover:text-pink-500 transition-colors">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"></path></svg>
                                                    </button>
                                                    <span className="text-xs font-bold text-zinc-400">{comment.voteScore || 0}</span>
                                                    <button onClick={() => handleCommentVote(post.postId || post.id, comment.commentId || comment.id, 'DOWNVOTE')} className="text-zinc-500 hover:text-purple-500 transition-colors">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                                                    </button>
                                                </div>

                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* post status */}
                            {post.status === 'OUTDATED' ? (
                                <div className="mt-2 pt-4 border-t border-zinc-800/60 text-center text-sm font-semibold text-red-400/80 bg-red-500/5 rounded-xl py-3">
                                    Comments have been disabled for this post.
                                </div>
                            ) : (
                                <div className="mt-2 pt-4 border-t border-zinc-800/60 flex items-center">
                                    <input type="file" id={`file-${post.postId || post.id}`} className="hidden" accept="image/*" onChange={(e) => handleCommentFileChange(post.postId || post.id, e)} />
                                    <label htmlFor={`file-${post.postId || post.id}`} className="text-zinc-400 cursor-pointer mr-3 hover:text-pink-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg></label>
                                    <input type="text" placeholder="Add a comment..." value={commentInputs[post.postId || post.id] || ''} onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.postId || post.id]: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && handlePostComment(post.postId || post.id)} className="bg-transparent border-none text-sm w-full focus:outline-none text-zinc-100" />
                                    <button onClick={() => handlePostComment(post.postId || post.id)} disabled={(!commentInputs[post.postId || post.id]?.trim()) && !commentFiles[post.postId || post.id]} className="text-pink-500 font-bold text-sm ml-2 disabled:opacity-50">Post</button>
                                </div>
                            )}
                        </div>
                    </article>
                ))}
            </div>

            {/* edit post modal */}
            {editingPost && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95">
                        <h3 className="text-2xl font-bold text-white mb-4">Edit Post</h3>
                        <div className="flex flex-col gap-4">
                            <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 text-white p-3 rounded-xl outline-none" />
                            <textarea value={editText} onChange={e => setEditText(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 text-white p-3 rounded-xl outline-none resize-none h-32" />
                            <div className="flex justify-end gap-3 mt-2">
                                <button onClick={() => setEditingPost(null)} className="px-4 py-2 border border-zinc-700 text-zinc-300 font-bold rounded-xl hover:bg-zinc-800 transition-colors">Cancel</button>
                                <button onClick={handleSaveEdit} className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-pink-500/20">Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* confirmation modal */}
            {confirmDialog && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95">
                        <h3 className="text-xl font-bold text-white mb-2">{confirmDialog.title}</h3>
                        <p className="text-zinc-400 text-sm mb-6">{confirmDialog.message}</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setConfirmDialog(null)}
                                className="px-4 py-2 border border-zinc-700 text-zinc-300 font-bold rounded-xl hover:bg-zinc-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDialog.action}
                                className={`px-4 py-2 text-white font-bold rounded-xl transition-all shadow-lg ${confirmDialog.confirmStyle}`}
                            >
                                {confirmDialog.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}