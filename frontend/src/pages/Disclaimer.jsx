import PageTransition from '../components/PageTransition';
import GlassCard from '../components/GlassCard';
import { AlertTriangle, HelpCircle, FileWarning, Scale } from 'lucide-react';

const Section = ({ icon: Icon, title, children, color = 'yellow-500' }) => (
  <GlassCard className="mb-6">
    <div className="flex items-start gap-4">
      <div className={`p-3 bg-${color}/10 rounded-2xl shrink-0`}>
        <Icon className={`w-6 h-6 text-${color}`} />
      </div>
      <div>
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <div className="text-gray-400 leading-relaxed space-y-3 text-sm">{children}</div>
      </div>
    </div>
  </GlassCard>
);

const Disclaimer = () => {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-20">
        <div className="text-center mb-12">
          <div className="inline-flex p-4 bg-yellow-500/10 rounded-2xl mb-6">
            <AlertTriangle className="w-10 h-10 text-yellow-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Disclaimer</h1>
          <p className="text-gray-500 text-sm">Important notices about platform content</p>
        </div>

        <Section icon={FileWarning} title="User-Generated Content">
          <p>All confessions, comments, and reactions posted on AnonTruth are <strong>user-generated content</strong>. The platform serves as a medium for anonymous expression and does not create, endorse, or verify any content posted by its users.</p>
        </Section>

        <Section icon={HelpCircle} title="No Verification of Truth">
          <p>AnonTruth does <strong>not verify whether posts are true or false</strong>. The "True" and "Fake" voting system is a community-driven feature that reflects collective opinion, not factual verification. Users should not treat vote results as statements of fact.</p>
        </Section>

        <Section icon={Scale} title="Opinions & Responsibility">
          <ul className="list-disc pl-5 space-y-2">
            <li>Content posted on AnonTruth represents the <strong>opinions and experiences of individual users</strong>.</li>
            <li>The platform is <strong>not responsible</strong> for inaccurate, misleading, or harmful confessions.</li>
            <li>Users are personally responsible for the content they post, even anonymously.</li>
            <li>AnonTruth cooperates with law enforcement when legally required to do so.</li>
          </ul>
        </Section>

        <Section icon={AlertTriangle} title="No Professional Advice" color="red-500">
          <p>Content on AnonTruth should <strong>not be treated as professional advice</strong>. This includes but is not limited to medical, legal, financial, or psychological guidance. If you need professional help, please consult a qualified professional in your area.</p>
        </Section>
      </div>
    </PageTransition>
  );
};

export default Disclaimer;
