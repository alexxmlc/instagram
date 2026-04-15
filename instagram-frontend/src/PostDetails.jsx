import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const applyCacheBuster = (url, sessionTime) => {
    if (!url) return url;
    if (url.includes('?t=') || url.includes('&t=')) return url; 
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${sessionTime}`;
};

const formatDate = (dateInput) => {
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
    switch(status) {
        case 'JUST_POSTED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        case 'FIRST_REACTIONS': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        case 'OUTDATED': return 'bg-red-500/10 text-red-400 border-red-500/20';
        default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
};

export default function PostDetails({ postId, onNavigate }) {
    const [sessionTime] = useState(Date.now());
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchPostDetails = async () => {
        try {
            const token = localStorage.getItem('jwt_token');
            const response = await fetch(`http://localhost:8080/api/posts/${postId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch post details');

            const data = await response.json();
            setPost(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
            toast.error("Could not load post.");
        }
    };

    useEffect(() => {
        if (postId) fetchPostDetails();
    }, [postId]);

    // Handle Comment Voting
    const handleCommentVote = async (commentId, voteType) => {
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
                } catch (parseErr) { }
                throw new Error(cleanErrorMessage);
            }
            fetchPostDetails(); // Refresh the whole post to update comments
        } catch (err) {
            toast.error(err.message);
        }
    };

    // Handle Post Voting
    const handlePostVote = async (voteType) => {
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
                } catch (parseErr) { }
                throw new Error(cleanErrorMessage);
            }
            fetchPostDetails(); 
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#050505]">
                <div className="w-10 h-10 border-4 border-zinc-800 border-t-pink-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !post) {
        return <div className="text-red-400 text-center mt-10">{error || "Post not found"}</div>;
    }

    return (
        <div className="relative min-h-screen py-12 px-4 overflow-hidden bg-[#050505]">
            <div className="relative z-10 max-w-2xl mx-auto flex flex-col gap-6 w-full">
                
                <button 
                    onClick={() => onNavigate('feed')}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors self-start bg-zinc-900/50 px-4 py-2 rounded-xl border border-zinc-800"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to Feed
                </button>

                <article className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/60 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="flex items-center p-5 border-b border-zinc-800/50">
                        <img 
                            src={applyCacheBuster(post.author.profilePictureUrl, sessionTime) || 'https://via.placeholder.com/40'} 
                            alt={post.author.username} 
                            className="w-12 h-12 rounded-full object-cover border-2 border-zinc-700 mr-4"
                        />
                        <div>
                            <div className="font-bold text-zinc-100">{post.author.username}</div>
                            <div className="text-xs text-zinc-500 flex items-center gap-2">
                                {formatDate(post.date)}
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

                    {post.pictureUrl && (
                        <div className="w-full bg-zinc-950">
                            <img src={post.pictureUrl} alt={post.title} className="w-full h-auto object-cover" />
                        </div>
                    )}

                    <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                            <h2 className="text-2xl font-bold text-white">{post.title}</h2>
                            
                            <div className="flex gap-2">
                                <button onClick={() => handlePostVote('UPVOTE')} className="text-zinc-400 hover:text-pink-500"><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg></button>
                                <button onClick={() => handlePostVote('DOWNVOTE')} className="text-zinc-400 hover:text-purple-500"><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M12 7l-2 4 4 3-2 4"></path></svg></button>
                            </div>
                        </div>

                        <p className="text-zinc-300 leading-relaxed mb-4">{post.text}</p>
                        
                        <div className="flex items-center text-pink-500 font-bold mb-4 pb-4 border-b border-zinc-800/50">
                            {post.voteScore} {post.voteScore === 1 ? 'vote' : 'votes'}
                        </div>

                        {/* --- MISSING TAGS RESTORED HERE --- */}
                        {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3 mb-6">
                                {post.tags.map((tag) => (
                                    <span key={tag} className="text-xs text-fuchsia-400 bg-fuchsia-500/10 px-3 py-1 rounded-full font-medium border border-fuchsia-500/20">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        <h3 className="text-lg font-bold text-zinc-200 mb-4">Comments</h3>
                        
                        <div className="flex flex-col gap-5">
                            {post.comments && post.comments.length > 0 ? (
                                post.comments.map(comment => (
                                    <div key={comment.commentId || comment.id} className="flex gap-3 items-start">
                                        <img 
                                            src={applyCacheBuster(comment.author.profilePictureUrl, sessionTime) || 'https://via.placeholder.com/32'} 
                                            className="w-10 h-10 rounded-full object-cover border border-zinc-700" 
                                        />
                                        <div className="flex-1 bg-zinc-800/40 rounded-2xl rounded-tl-sm px-5 py-3">
                                            <div className="flex justify-between items-center mb-1">
                                                <span 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onNavigate('profile', comment.author.username);
                                                    }} 
                                                    className="font-bold text-sm text-zinc-100 cursor-pointer hover:text-pink-400 hover:underline transition-all"
                                                >
                                                    {comment.author.username}
                                                </span>
                                                <span className="text-xs text-zinc-500">{formatDate(comment.createdAt)}</span>
                                            </div>
                                            <span className="text-sm text-zinc-300">{comment.text}</span>
                                            {comment.pictureUrl && (
                                                <div className="mt-3 w-full overflow-hidden rounded-xl border border-zinc-700/50">
                                                    <img src={comment.pictureUrl} alt="comment attachment" className="w-full h-auto max-h-60 object-cover" />
                                                </div>
                                            )}

                                            <div className="flex items-center gap-3 mt-3 pt-2 border-t border-zinc-700/30">
                                                <button onClick={() => handleCommentVote(comment.commentId || comment.id, 'UPVOTE')} className="text-zinc-500 hover:text-pink-500 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"></path></svg>
                                                </button>
                                                <span className="text-xs font-bold text-zinc-400">{comment.voteScore || 0}</span>
                                                <button onClick={() => handleCommentVote(comment.commentId || comment.id, 'DOWNVOTE')} className="text-zinc-500 hover:text-purple-500 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-zinc-500 text-center py-4">No comments on this post yet.</div>
                            )}
                        </div>
                    </div>
                </article>
            </div>
        </div>
    );
}