import PageTransition from '../components/PageTransition';
import GlassCard from '../components/GlassCard';
import { Users, CheckCircle, XCircle, Flag, MessageSquare } from 'lucide-react';

const Section = ({ icon: Icon, title, children, color = 'green-500' }) => (
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

const CommunityGuidelines = () => {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-20">
        <div className="text-center mb-12">
          <div className="inline-flex p-4 bg-green-500/10 rounded-2xl mb-6">
            <Users className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Community Guidelines</h1>
          <p className="text-gray-500 text-sm">Creating a safe space for anonymous expression</p>
        </div>

        <Section icon={MessageSquare} title="Our Philosophy">
          <p>AnonTruth exists to give people a safe, anonymous space to share truths they can't say elsewhere. We believe in free expression balanced with respect and safety. These guidelines help maintain a community where everyone feels secure to be honest.</p>
        </Section>

        <Section icon={CheckCircle} title="Allowed Content" color="accent-cyan">
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Personal confessions</strong> — share your secrets, experiences, and feelings freely.</li>
            <li><strong>Anonymous storytelling</strong> — tell your story without fear of judgment.</li>
            <li><strong>Advice seeking</strong> — ask for guidance from the community anonymously.</li>
            <li><strong>Funny or relatable secrets</strong> — humor and relatability are encouraged.</li>
            <li><strong>Emotional expression</strong> — venting, reflecting, and processing feelings.</li>
          </ul>
        </Section>

        <Section icon={XCircle} title="Prohibited Content" color="red-500">
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Hate speech</strong> — content targeting individuals or groups based on protected characteristics.</li>
            <li><strong>Threats of violence</strong> — direct or implied threats against any person.</li>
            <li><strong>Harassment & bullying</strong> — targeted abuse, doxxing, or intimidation.</li>
            <li><strong>Explicit illegal activity</strong> — confessions describing ongoing criminal acts.</li>
            <li><strong>Personal information leaks</strong> — posting real names, addresses, phone numbers, or other PII.</li>
            <li><strong>Spam & self-promotion</strong> — advertising, link farming, or repetitive content.</li>
            <li><strong>NSFW content involving minors</strong> — zero tolerance, immediate permanent ban.</li>
          </ul>
        </Section>

        <Section icon={Flag} title="Reporting & Moderation" color="yellow-500">
          <ul className="list-disc pl-5 space-y-2">
            <li>Every confession and comment has a <strong>Report button</strong> — use it to flag violations.</li>
            <li>Reports are reviewed by our <strong>admin moderation team</strong> within 24 hours.</li>
            <li>Confirmed violations result in content removal and may lead to account suspension.</li>
            <li><strong>Repeated violations</strong> will result in a permanent ban.</li>
            <li>If you believe your content was wrongly removed, contact us via the Report Abuse page.</li>
          </ul>
        </Section>
      </div>
    </PageTransition>
  );
};

export default CommunityGuidelines;
