import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Image as ImageIcon, MapPin, Hash, Shield } from 'lucide-react';
import { createConfession } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';
import GlassCard from '../components/GlassCard';
import PageTransition from '../components/PageTransition';
import toast from '../components/Toast';

const CreateConfession = () => {
  const { user, openAuthModal } = useAuth();
  const [text, setText] = useState('');
  const [category, setCategory] = useState('random');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [useLocation, setUseLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const categories = ['relationship', 'school', 'work', 'crime', 'funny', 'random'];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return toast.error('Image too large! (Max 5MB)');
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    if (text.length < 10) return toast.error('Post too short! (Min 10 chars)');

    try {
      setLoading(true);
      let location = null;
      if (useLocation) {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        location = {
          type: 'Point',
          coordinates: [pos.coords.longitude, pos.coords.latitude]
        };
      }

      const formData = new FormData();
      formData.append('text', text);
      formData.append('category', category);
      if (image) formData.append('image', image);
      if (location) formData.append('location', JSON.stringify(location));

      await createConfession(formData);
      toast.success('Posted anonymously!');
      navigate('/home');
    } catch (err) {
      toast.error('Failed to post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
    <div className="max-w-2xl mx-auto px-4 pt-16 sm:pt-20 pb-24 lg:pb-16">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[#d7dadc]">Create a Post</h2>
        <p className="text-sm text-[#818384] mt-1">Your confession will be shared anonymously.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <GlassCard className="p-0 overflow-hidden">
          {imagePreview && (
            <div className="relative w-full h-48 sm:h-64 border-b border-[#343536]">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button 
                type="button" 
                onClick={() => { setImage(null); setImagePreview(null); }}
                className="absolute top-3 right-3 p-2 bg-black/60 rounded-lg hover:bg-black/80 transition-colors cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 text-white" />
              </button>
            </div>
          )}
          <textarea 
            className="w-full bg-transparent p-4 sm:p-6 text-[15px] sm:text-base min-h-[200px] sm:min-h-[250px] outline-none resize-none text-[#d7dadc] placeholder-[#818384]"
            placeholder="What's on your mind? Share your confession..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
          <div className="bg-[#272729] p-3 flex items-center justify-between border-t border-[#343536]">
            <div className="flex items-center gap-2">
              <label className={`p-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium ${image ? 'bg-[#FF4500]/10 text-[#FF4500]' : 'hover:bg-[#343536] text-[#818384]'}`}>
                <ImageIcon className="w-5 h-5" />
                {image && <span>Image</span>}
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
              <button 
                type="button" 
                onClick={() => setUseLocation(!useLocation)}
                className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer ${useLocation ? 'bg-[#FF4500]/10 text-[#FF4500]' : 'hover:bg-[#343536] text-[#818384]'}`}
              >
                <MapPin className="w-5 h-5" />
                {useLocation && <span>Location ON</span>}
              </button>
            </div>
            <span className="text-xs text-[#818384]">{text.length}</span>
          </div>
        </GlassCard>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-sm font-medium text-[#818384]">
              <Hash className="w-4 h-4" /> Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors cursor-pointer ${
                    category === cat 
                      ? 'bg-[#FF4500] text-white' 
                      : 'bg-[#1a1a1b] border border-[#343536] text-[#818384] hover:border-[#4a4a4b]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-[#1a1a1b] border border-[#343536] rounded-lg p-4 flex items-start gap-3">
              <Shield className="w-5 h-5 text-[#FF4500] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm text-[#d7dadc] mb-1">Safety Note</h4>
                <p className="text-xs text-[#818384] leading-relaxed">
                  Avoid mentioning real names or addresses. All content is moderated.
                </p>
              </div>
            </div>
            <Button className="w-full py-3" icon={Send} disabled={loading}>
              {loading ? 'Posting...' : 'Post Anonymously'}
            </Button>
          </div>
        </div>
      </form>
    </div>
    </PageTransition>
  );
};

export default CreateConfession;
