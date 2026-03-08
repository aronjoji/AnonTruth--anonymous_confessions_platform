import PageTransition from '../components/PageTransition';
import GlassCard from '../components/GlassCard';
import { Shield, Database, Eye, Cookie, UserX, Lock, Server } from 'lucide-react';

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

const PrivacyPolicy = () => {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-20">
        <div className="text-center mb-12">
          <div className="inline-flex p-4 bg-accent-cyan/10 rounded-2xl mb-6">
            <Shield className="w-10 h-10 text-accent-cyan" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Privacy Policy</h1>
          <p className="text-gray-500 text-sm">Last updated: March 8, 2026</p>
        </div>

        <Section icon={Database} title="Information We Collect">
          <p>We collect minimal data to ensure your anonymity while maintaining platform safety:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Email Address</strong> — collected during registration solely for account recovery and security.</li>
            <li><strong>Anonymous Username</strong> — auto-generated to protect your real identity.</li>
            <li><strong>IP Address</strong> — temporarily logged for spam prevention and abuse detection.</li>
            <li><strong>Location Data</strong> — only collected if you explicitly enable "Nearby" confessions. Never shared publicly.</li>
            <li><strong>Cookies & Session Data</strong> — used to maintain your login session and improve user experience.</li>
          </ul>
        </Section>

        <Section icon={Eye} title="How We Use Your Information">
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Account Creation</strong> — to create and manage your anonymous identity.</li>
            <li><strong>Spam & Abuse Prevention</strong> — to detect and block malicious actors.</li>
            <li><strong>User Experience</strong> — to improve the platform through aggregate, non-identifiable analytics.</li>
            <li><strong>Moderation & Safety</strong> — to enforce Community Guidelines and protect users.</li>
          </ul>
        </Section>

        <Section icon={Lock} title="Data Protection">
          <ul className="list-disc pl-5 space-y-2">
            <li>User identities remain <strong>anonymous publicly</strong> at all times.</li>
            <li>Personal data (email, IP) is stored securely using industry-standard encryption.</li>
            <li>We <strong>never sell</strong> your data to third parties under any circumstances.</li>
            <li>Access to identifiable information is restricted to authorized administrators only.</li>
          </ul>
        </Section>

        <Section icon={UserX} title="Your Rights">
          <ul className="list-disc pl-5 space-y-2">
            <li>You can <strong>delete your account</strong> at any time through your profile settings.</li>
            <li>You can <strong>request complete data removal</strong> by contacting us through the Report Abuse page.</li>
            <li>You can opt out of location-based features at any time.</li>
            <li>Upon account deletion, your confessions will remain anonymous but will no longer be linked to any account.</li>
          </ul>
        </Section>

        <Section icon={Cookie} title="Cookies Policy">
          <p>AnonTruth uses essential cookies for the following purposes:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Session Cookies</strong> — maintain your authenticated session while browsing.</li>
            <li><strong>Security Cookies</strong> — protect against cross-site request forgery and unauthorized access.</li>
            <li>We do not use third-party advertising cookies or tracking pixels.</li>
          </ul>
        </Section>

        <Section icon={Server} title="Data Retention">
          <p>We retain your account data for as long as your account is active. Upon account deletion, identifiable information is purged within 30 days. Anonymized content (confessions without account links) may remain on the platform indefinitely.</p>
        </Section>
      </div>
    </PageTransition>
  );
};

export default PrivacyPolicy;
