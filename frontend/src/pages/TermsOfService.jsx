import PageTransition from '../components/PageTransition';
import GlassCard from '../components/GlassCard';
import { FileText, AlertTriangle, Scale, Copyright, Gavel, Ban } from 'lucide-react';

const Section = ({ icon: Icon, title, children, color = 'accent-violet' }) => (
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

const TermsOfService = () => {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-20">
        <div className="text-center mb-12">
          <div className="inline-flex p-4 bg-accent-violet/10 rounded-2xl mb-6">
            <FileText className="w-10 h-10 text-accent-violet" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Terms of Service</h1>
          <p className="text-gray-500 text-sm">Last updated: March 8, 2026</p>
        </div>

        <Section icon={Gavel} title="User Agreement">
          <p>By using AnonTruth, you agree to the following terms and conditions. If you do not agree, please discontinue use of the platform immediately.</p>
        </Section>

        <Section icon={Ban} title="User Responsibilities">
          <p>By using AnonTruth, you agree to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Not post illegal content</strong> — including but not limited to threats, CSAM, or incitement to violence.</li>
            <li><strong>Not post hate speech</strong> — targeting individuals or groups based on race, religion, gender, sexuality, or disability.</li>
            <li><strong>Not harass or threaten others</strong> — even anonymously, intimidation is not tolerated.</li>
            <li><strong>Not impersonate others</strong> — creating false identities to deceive users is prohibited.</li>
            <li><strong>Not spam the platform</strong> — automated posting, advertising, or flooding is prohibited.</li>
            <li><strong>Respect Community Guidelines</strong> — all posted content must adhere to our published guidelines.</li>
          </ul>
        </Section>

        <Section icon={AlertTriangle} title="Platform Policies">
          <ul className="list-disc pl-5 space-y-2">
            <li>AnonTruth allows <strong>anonymous posting</strong> — your real identity is never publicly revealed.</li>
            <li>Content may be <strong>moderated or removed</strong> at the discretion of platform administrators.</li>
            <li>Accounts may be <strong>suspended or banned</strong> for violations of these terms.</li>
            <li>We reserve the right to modify these terms at any time with notice posted on the platform.</li>
          </ul>
        </Section>

        <Section icon={Scale} title="Limitation of Liability">
          <p>AnonTruth is provided "as is" without warranties of any kind. The platform shall not be held liable for:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>User-generated content posted on the platform.</li>
            <li>Any damages resulting from use or inability to use the service.</li>
            <li>Actions taken by other users, including harassment or defamation.</li>
            <li>Temporary service interruptions or data loss.</li>
          </ul>
        </Section>

        <Section icon={Copyright} title="Content Ownership">
          <ul className="list-disc pl-5 space-y-2">
            <li>Users retain ownership of the original content they post.</li>
            <li>By posting on AnonTruth, you grant us a <strong>non-exclusive, royalty-free license</strong> to display, distribute, and moderate your content on the platform.</li>
            <li>AnonTruth reserves the right to <strong>remove any content</strong> that violates these terms or applicable laws.</li>
          </ul>
        </Section>
      </div>
    </PageTransition>
  );
};

export default TermsOfService;
