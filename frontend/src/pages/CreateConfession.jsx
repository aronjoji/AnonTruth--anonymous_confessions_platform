import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Image as ImageIcon, MapPin, Hash, Shield, AlertCircle } from 'lucide-react';
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
    if (text.length < 10) return toast.error('Confession too short!');

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
      toast.success('Truth shared anonymously!');
      navigate('/home');
    } catch (err) {
      toast.error('Failed to post confession');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
    <div className="max-w-3xl mx-auto px-6 pt-24 pb-20">
      <div className="mb-10 text-center">
        <h2 className="text-4xl font-black mb-4 gradient-text">Release Your Truth</h2>
        <p className="text-gray-400">Your confession will be encrypted and shared anonymously.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <GlassCard className="p-0 overflow-hidden">
          {imagePreview && (
            <div className="relative w-full h-64 border-b border-white/10">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button 
                type="button" 
                onClick={() => { setImage(null); setImagePreview(null); }}
                className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md rounded-full hover:bg-black/70 transition-all"
              >
                <ImageIcon className="w-5 h-5 text-white" />
              </button>
            </div>
          )}
          <textarea 
            className="w-full bg-transparent p-8 text-xl min-h-[300px] outline-none resize-none placeholder:text-white/10"
            placeholder="What's your secret? Start typing here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
          <div className="bg-white/5 p-4 flex items-center justify-between border-t border-white/10">
            <div className="flex items-center gap-4">
              <label 
                className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${image ? 'bg-accent-violet/20 text-accent-violet' : 'hover:bg-white/5 text-gray-400'}`}
              >
                <ImageIcon className="w-6 h-6" />
                {image && <span className="text-xs font-bold">Image Set</span>}
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                />
              </label>
              <button 
                type="button" 
                onClick={() => setUseLocation(!useLocation)}
                className={`p-2 rounded-xl transition-all flex items-center gap-2 ${useLocation ? 'bg-accent-cyan/20 text-accent-cyan' : 'hover:bg-white/5 text-gray-400'}`}
              >
                <MapPin className="w-6 h-6" />
                {useLocation && <span className="text-xs font-bold">Location ON</span>}
              </button>
            </div>
            <span className="text-xs text-gray-500 font-medium">{text.length} characters</span>
          </div>
        </GlassCard>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-400">
              <Hash className="w-4 h-4" /> Select Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium capitalize transition-all ${category === cat ? 'bg-accent-cyan text-black font-bold' : 'glass hover:bg-white/5 text-gray-400'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass p-6 rounded-3xl border-white/10 flex items-start gap-4">
              <div className="p-2 bg-accent-violet/20 rounded-xl">
                <Shield className="w-6 h-6 text-accent-violet" />
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1">Safety First</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Avoid mentioning real names or specific addresses. Our AI moderates all content to prevent harassment.
                </p>
              </div>
            </div>
            <Button className="w-full py-4 text-lg" icon={Send} disabled={loading}>
              {loading ? 'Transmitting...' : 'Transmit Confession'}
            </Button>
          </div>
        </div>
      </form>
    </div>
    </PageTransition>
  );
};

export default CreateConfession;
