import PageTransition from '../components/PageTransition';
import GlassCard from '../components/GlassCard';
import { ShieldCheck, Bot, Flag, UserX, Trash2, Eye } from 'lucide-react';

const Section = ({ icon: Icon, title, children, color = 'accent-cyan' }) => (
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

const ContentPolicy = () => {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-20">
        <div className="text-center mb-12">
          <div className="inline-flex p-4 bg-accent-cyan/10 rounded-2xl mb-6">
            <ShieldCheck className="w-10 h-10 text-accent-cyan" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Content Policy</h1>
          <p className="text-gray-500 text-sm">How we moderate and protect the community</p>
        </div>

        <Section icon={Bot} title="Automated Moderation">
          <p>AnonTruth employs automated systems to maintain content quality:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Content is scanned for prohibited keywords and patterns upon submission.</li>
            <li>Spam detection algorithms identify and block automated or repetitive posts.</li>
            <li>Rate limiting prevents flooding and abuse of the posting system.</li>
          </ul>
        </Section>

        <Section icon={Flag} title="User Reporting System" color="yellow-500">
          <p>Every piece of content on AnonTruth can be reported by community members:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Use the <strong>Report button</strong> on any confession or comment to flag it.</li>
            <li>Select a reason for your report to help moderators prioritize review.</li>
            <li>Reports are anonymous — the reported user will not know who reported them.</li>
            <li>False or malicious reporting may result in action against the reporter.</li>
          </ul>
        </Section>

        <Section icon={Eye} title="Admin Review Process" color="accent-violet">
          <ul className="list-disc pl-5 space-y-2">
            <li>All reports are reviewed by our <strong>Oracle admin team</strong>.</li>
            <li>Admins can view reported content, the reason for the report, and relevant context.</li>
            <li>Decisions are made based on our Community Guidelines and Terms of Service.</li>
            <li>Admins have the ability to edit, hide, or delete content as necessary.</li>
          </ul>
        </Section>

        <Section icon={Trash2} title="Content Removal Policies" color="red-500">
          <p>Content will be removed if it:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Violates our Community Guidelines or Terms of Service.</li>
            <li>Contains personal information that could identify a real person.</li>
            <li>Is deemed illegal under applicable laws.</li>
            <li>Receives multiple credible reports from community members.</li>
          </ul>
        </Section>

        <Section icon={UserX} title="User Bans" color="red-500">
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>First violation</strong> — content removal and warning.</li>
            <li><strong>Second violation</strong> — temporary account suspension (7 days).</li>
            <li><strong>Third violation</strong> — permanent account ban.</li>
            <li><strong>Severe violations</strong> (threats, CSAM, doxxing) — immediate permanent ban.</li>
          </ul>
        </Section>
      </div>
    </PageTransition>
  );
};

export default ContentPolicy;
