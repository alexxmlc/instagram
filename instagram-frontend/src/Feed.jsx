import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function Feed() {

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');


    useEffect(() => {

        // handles fetching
        const fetchPosts = async () => {
            try {
                // get the token from local storage
                const token = localStorage.getItem('jwt_token');

                // make the fetch request
                const response = await fetch('http://localhost:8080/api/posts', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch posts');
                }

                // parse the data and update the state
                const data = await response.json();
                setPosts(data);
                setLoading(false);

            } catch (err) {
                setError(err.message);
                setLoading(false);
                toast.error("Could not load feed.");
            }
        };

        fetchPosts();

    }, []); // execute this only one time when the component loads

    // ui
    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading posts...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center mt-10">{error}</div>;
    }

    return (
    <div className="max-w-xl mx-auto py-8 flex flex-col gap-8 w-full px-4">
      <h2 className="text-3xl font-bold mb-2">Your Feed</h2>

      {posts.map((post) => (
        <article key={post.postId} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          
          {/* author info */}
          <div className="flex items-center p-3">
            <img 
              src={post.author.profilePictureUrl || 'https://via.placeholder.com/40'} 
              alt={post.author.username} 
              className="w-8 h-8 rounded-full object-cover mr-3 border border-gray-300"
            />
            <span className="font-semibold text-sm text-gray-900">{post.author.username}</span>
          </div>

          {/* image */}
          {post.pictureUrl && (
            <img 
              src={post.pictureUrl} 
              alt={post.title} 
              className="w-full h-auto max-h-[600px] object-cover border-y border-gray-100"
            />
          )}

          {/* body */}
          <div className="p-4">
            
            {/* votes*/}
            <div className="font-semibold text-sm mb-2 text-gray-900">
              {post.voteScore} {post.voteScore === 1 ? 'vote' : 'votes'}
            </div>

            {/* title & text */}
            <div className="mb-2">
              <span className="font-semibold text-sm text-gray-900 mr-2">{post.author.username}</span>
              <span className="text-sm font-bold text-gray-800">{post.title}</span>
              <p className="text-sm text-gray-700 mt-1">{post.text}</p>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            
          </div>
        </article>

      ))}
      
      {posts.length === 0 && (
        <div className="text-center text-gray-500 mt-10">
          No posts yet. Be the first to post something!
        </div>
      )}

    </div>
  );
}