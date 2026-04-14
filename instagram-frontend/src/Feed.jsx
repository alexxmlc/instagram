import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import CreatePost from './CreatePost';

export default function Feed() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // state for comments
    const [comments, setComments] = useState({}); 
    const [showComments, setShowComments] = useState({}); 
    const [commentInputs, setCommentInputs] = useState({}); 

    // handles fetching all posts
    const fetchPosts = async () => {
        try {
            const token = localStorage.getItem('jwt_token');
            const response = await fetch('http://localhost:8080/api/posts', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch posts');

            const data = await response.json();
            setPosts(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
            toast.error("Could not load feed.");
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    // handle voting (upvote/downvote)
    const handleVote = async (postId, voteType) => {
        try {
            const token = localStorage.getItem('jwt_token');
            // matches VoteController @PostMapping("/posts/{postId}")
            const response = await fetch(`http://localhost:8080/api/votes/posts/${postId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ voteType }) 
            });

            if (!response.ok) throw new Error('Failed to register vote');
            
            fetchPosts(); 
        } catch (err) {
            toast.error(err.message);
        }
    };

    // toggle comment section visibility and fetch them
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

    // submit a new comment
    const handlePostComment = async (postId) => {
        const commentValue = commentInputs[postId];
        if (!commentValue || commentValue.trim() === '') return;

        try {
            const token = localStorage.getItem('jwt_token');
            const response = await fetch(`http://localhost:8080/api/comments/post/${postId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text: commentValue })
            });

            // If backend throws an error (like "Comments are closed"), show it to the user!
            if (!response.ok) {
                const errorMessage = await response.text(); 
                throw new Error(errorMessage || 'Failed to post comment');
            }

            toast.success("Comment added!");
            setCommentInputs(prev => ({ ...prev, [postId]: '' }));
            setShowComments(prev => ({ ...prev, [postId]: false }));
            toggleComments(postId);

        } catch (err) {
            toast.error(err.message); // This will now show "Comments are closed for this post"
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#050505]">
                <div className="w-10 h-10 border-4 border-zinc-800 border-t-pink-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-400 text-center mt-10">{error}</div>;
    }

    return (
        <div className="relative min-h-screen py-12 px-4 overflow-hidden">
            
            {/* background glow */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px] mix-blend-screen"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full bg-pink-900/10 blur-[120px] mix-blend-screen"></div>
            </div>

            <div className="relative z-10 max-w-xl mx-auto flex flex-col gap-10 w-full">
                
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-4xl font-extrabold bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
                        Your Feed
                    </h2>
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 bg-pink-600 hover:bg-pink-500 text-white font-bold py-2.5 px-5 rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-pink-500/20"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
                        New Post
                    </button>
                </div>

                <CreatePost 
                    isOpen={isCreateModalOpen} 
                    onClose={() => setIsCreateModalOpen(false)} 
                    onPostCreated={fetchPosts} 
                />

                {posts.map((post) => ( 
                    <article key={post.postId} className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/60 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:border-zinc-700/80 hover:shadow-[0_10px_40px_rgba(168,85,247,0.1)] group">
                        
                        {/* author info */}
                        <div className="flex items-center p-4">
                            <div className="p-[2px] rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 mr-3 cursor-pointer transform transition-transform hover:scale-105">
                                <img 
                                    src={post.author.profilePictureUrl || 'https://via.placeholder.com/40'} 
                                    alt={post.author.username} 
                                    className="w-10 h-10 rounded-full object-cover border-2 border-zinc-900"
                                />
                            </div>
                            <span className="font-bold text-sm text-zinc-100 cursor-pointer hover:text-zinc-300 transition-colors">
                                {post.author.username}
                            </span>
                        </div>

                        {/* image */}
                        {post.pictureUrl && (
                            <div className="w-full relative bg-zinc-950 overflow-hidden">
                                <img 
                                    src={post.pictureUrl} 
                                    alt={post.title} 
                                    className="w-full h-auto max-h-[600px] object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                                />
                            </div>
                        )}

                        {/* action buttons */}
                        <div className="flex justify-between items-center px-5 pt-4 pb-2">
                            <div className="flex gap-4">
                                <button onClick={() => handleVote(post.postId, 'UPVOTE')} className="text-zinc-100 hover:text-pink-500 transition-colors transform hover:scale-110 active:scale-95">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                                </button>

                                <button onClick={() => handleVote(post.postId, 'DOWNVOTE')} className="text-zinc-100 hover:text-purple-500 transition-colors transform hover:scale-110 active:scale-95">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7l-2 4 4 3-2 4"></path>
                                    </svg>
                                </button>

                                <button onClick={() => toggleComments(post.postId)} className={`transition-colors transform hover:scale-110 active:scale-95 ${showComments[post.postId] ? 'text-zinc-400' : 'text-zinc-100 hover:text-zinc-400'}`}>
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                                </button>
                            </div>
                        </div>

                        {/* body info */}
                        <div className="px-5 pb-6">
                            <div className="font-bold text-sm mb-2 text-zinc-100">
                                {post.voteScore} {post.voteScore === 1 ? 'vote' : 'votes'}
                            </div>

                            <div className="mb-3 text-sm">
                                <span className="font-bold text-zinc-100 mr-2 cursor-pointer hover:underline">{post.author.username}</span>
                                <span className="font-semibold text-zinc-200">{post.title}</span>
                                <p className="text-zinc-400 mt-1.5 leading-relaxed">{post.text}</p>
                            </div>

                            {/* comments list */}
                            {showComments[post.postId] && (
                                <div className="mt-5 mb-2 pt-4 border-t border-zinc-800/60 flex flex-col gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {comments[post.postId]?.map(comment => (
                                        <div key={comment.commentId} className="flex gap-3 items-start animate-in fade-in slide-in-from-top-2 duration-300">
                                            <img 
                                                src={comment.author.profilePictureUrl || 'https://via.placeholder.com/32'} 
                                                className="w-8 h-8 rounded-full object-cover border border-zinc-700 mt-0.5" 
                                            />
                                            <div className="flex-1 bg-zinc-800/30 rounded-2xl rounded-tl-sm px-4 py-2.5">
                                                <span className="font-bold text-sm text-zinc-200 mr-2">{comment.author.username}</span>
                                                <span className="text-sm text-zinc-300 leading-relaxed">{comment.text}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {comments[post.postId]?.length === 0 && (
                                        <div className="text-center text-xs text-zinc-500 py-2">No comments yet. Be the first!</div>
                                    )}
                                </div>
                            )}
                            
                            {/* comment input bar */}
                            <div className="mt-4 pt-4 border-t border-zinc-800/60 flex items-center">
                                <input 
                                    type="text" 
                                    placeholder="Add a comment..." 
                                    value={commentInputs[post.postId] || ''}
                                    onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.postId]: e.target.value }))}
                                    onKeyDown={(e) => e.key === 'Enter' && handlePostComment(post.postId)}
                                    className="bg-transparent border-none text-sm w-full text-zinc-100 focus:ring-0 focus:outline-none placeholder:text-zinc-600"
                                />
                                <button 
                                    onClick={() => handlePostComment(post.postId)}
                                    disabled={!commentInputs[post.postId]?.trim()}
                                    className="text-pink-500 font-bold text-sm hover:text-pink-400 transition-colors ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Post
                                </button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}