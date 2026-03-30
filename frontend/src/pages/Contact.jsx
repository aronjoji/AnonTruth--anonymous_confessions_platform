import { useState } from 'react';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import { Mail, User, MessageSquare, Send, AlertTriangle, CheckCircle } from 'lucide-react';
import toast from '../components/Toast';

import { submitContactForm } from '../services/api';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', reportType: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    'Report harassment',
    'Report illegal content',
    'Account issue',
    'Content removal request',
    'Data deletion request',
    'Other inquiry'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.reportType || !form.message) {
      return toast.error('Please fill in all fields');
    }
    
    setLoading(true);
    try {
      await submitContactForm(form);
      toast.success('Your message has been submitted. We will respond within 48 hours.');
      setSubmitted(true);
    } catch (err) {
      toast.error('Failed to submit message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <PageTransition>
        <div className="max-w-4xl mx-auto px-6 pt-24 pb-20">
          <div className="text-center py-20">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="inline-flex p-6 bg-green-500/10 rounded-full mb-8"
            >
              <CheckCircle className="w-16 h-16 text-green-500" />
            </motion.div>
            <h2 className="text-3xl font-black mb-4">Message Received</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-8">
              Thank you for reaching out. Our team will review your message and respond within 48 hours.
            </p>
            <Button onClick={() => setSubmitted(false)} type="button">Send Another Message</Button>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-6 pt-24 pb-20">
        <div className="text-center mb-12">
          <div className="inline-flex p-4 bg-red-500/10 rounded-2xl mb-6">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Contact & Report Abuse</h1>
          <p className="text-gray-500 text-sm">Report violations or get help with your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <GlassCard>
            <div className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-accent-cyan outline-none transition-all text-white"
                    placeholder="Your name (can be anonymous)"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-accent-cyan outline-none transition-all text-white"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Report Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Report Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {reportTypes.map((type) => (
                    <motion.button
                      key={type}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setForm({ ...form, reportType: type })}
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-all text-left cursor-pointer ${
                        form.reportType === type
                          ? 'bg-accent-cyan text-black font-bold'
                          : 'glass hover:bg-white/5 text-gray-400'
                      }`}
                    >
                      {type}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 ml-1">Message</label>
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                  <textarea
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 min-h-[150px] resize-none focus:border-accent-cyan outline-none transition-all text-white"
                    placeholder="Describe the issue in detail..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          <Button className="w-full py-4 text-lg" icon={Send} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Report'}
          </Button>
        </form>
      </div>
    </PageTransition>
  );
};

export default Contact;
