import { useState, useRef } from 'react';
import toast from 'react-hot-toast';

export default function CreatePost({ isOpen, onClose, onPostCreated }) {
    // state variables for the form text
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [tagsInput, setTagsInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // state for the image upload
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    
    // ref to hide the default html file input
    const fileInputRef = useRef(null);

    // if modal is closed, don't render anything
    if (!isOpen) return null;

    // handle when user selects a file from their device
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            // img preview
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // validate if image is selected
        if (!selectedFile) {
            toast.error("Please select an image to upload");
            return;
        }

        // disable button while submitting to prevent double-clicks
        setIsSubmitting(true);

        try {
            // get the token from local storage
            const token = localStorage.getItem('jwt_token');
            
            // form data obj
            const formData = new FormData();
            formData.append('title', title);
            formData.append('text', text);
            formData.append('file', selectedFile); 
            
            // tags split
            const tagsArray = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
            tagsArray.forEach(tag => formData.append('tags', tag));

            // fetch the request
            const response = await fetch('http://localhost:8080/api/posts', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to create post');
            }

            toast.success('Post created successfully!');
            
            // clean form
            setTitle('');
            setText('');
            setTagsInput('');
            setSelectedFile(null);
            
            // clean up preview url memory
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl('');
            
            // tell feed to fetch new posts and close the modal
            onPostCreated();
            onClose();

        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        // modal background overlay
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            
            {/* modal container */}
            <div className="w-full max-w-lg bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                
                {/* background glow effect */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-pink-500/20 rounded-full blur-[50px] pointer-events-none"></div>

                {/* close button */}
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 text-zinc-400 hover:text-white transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                <h2 className="text-2xl font-bold mb-6 text-white">Create New Post</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
                    
                    {/* file upload box */}
                    <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Photo</label>
                        
                        {/* hidden native file input */}
                        <input 
                            type="file" 
                            accept="image/*" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            className="hidden" 
                        />

                        {/* clickable upload area */}
                        <div 
                            onClick={() => fileInputRef.current.click()}
                            className={`w-full h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group ${previewUrl ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-700 bg-zinc-800/30 hover:bg-zinc-800/50 hover:border-pink-500/50'}`}
                        >
                            {previewUrl ? (
                                <>
                                    {/* show selected image */}
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-white font-semibold">Change Photo</span>
                                    </div>
                                </>
                            ) : (
                                // empty state upload instructions
                                <div className="text-center p-4">
                                    <svg className="mx-auto h-10 w-10 text-zinc-500 mb-2 group-hover:text-pink-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    <p className="text-sm text-zinc-400 font-medium">Click to select an image</p>
                                    <p className="text-xs text-zinc-500 mt-1">PNG, JPG, WEBP</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* title input */}
                    <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-zinc-800/50 border border-zinc-700 text-white p-3 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                            required
                        />
                    </div>

                    {/* caption input */}
                    <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Caption</label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            rows="2"
                            className="w-full bg-zinc-800/50 border border-zinc-700 text-white p-3 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all resize-none"
                            required
                        ></textarea>
                    </div>

                    {/* tags input */}
                    <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Tags (Comma Separated)</label>
                        <input
                            type="text"
                            placeholder="nature, travel, photography"
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                            className="w-full bg-zinc-800/50 border border-zinc-700 text-white p-3 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all placeholder:text-zinc-600"
                        />
                    </div>

                    {/* action buttons */}
                    <div className="flex justify-end gap-3 mt-2">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pink-500/25 flex items-center justify-center min-w-[120px]"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                'New Post'
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}