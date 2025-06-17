import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface GDPRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GDPRModal = ({ isOpen, onClose }: GDPRModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">GDPR Compliance Statement</DialogTitle>
        </DialogHeader>
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-4">
            Playform Technologies Pvt. Ltd.<br />
            Effective Date: 12/06/2025<br />
            Last Updated: 12/06/2025
          </p>

          <p className="mb-4">
            At Playform, we are committed to protecting the privacy and data rights of our users, including those based in the European Union (EU) and European Economic Area (EEA). We fully comply with the General Data Protection Regulation (GDPR) (Regulation (EU) 2016/679), which governs the collection, processing, and storage of personal data of individuals within the EU/EEA.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">1. What is GDPR?</h2>
          <p className="mb-4">
            The General Data Protection Regulation (GDPR) is an EU regulation that provides individuals with greater control over their personal data. It requires companies to be transparent about how data is used and to ensure it is handled securely and lawfully.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Our Commitment to GDPR</h2>
          <p className="mb-4">Playform has implemented the following practices to align with GDPR requirements:</p>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">✅ Lawful Basis for Processing</h3>
              <p>We collect and process personal data only when we have a valid legal basis to do so:</p>
              <ul className="list-disc pl-6 mt-2">
                <li>User consent</li>
                <li>Contractual necessity</li>
                <li>Legal obligations</li>
                <li>Legitimate interests (e.g., fraud prevention, service improvement)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">✅ Transparency</h3>
              <p>We clearly explain how data is used through our:</p>
              <ul className="list-disc pl-6 mt-2">
                <li>Privacy Policy</li>
                <li>Cookie Policy</li>
                <li>Consent mechanisms</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">✅ User Consent</h3>
              <p>We obtain explicit, informed, and granular consent from users before collecting non-essential data (e.g., via cookies or marketing preferences).</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">✅ User Rights</h3>
              <p>We fully support user rights under GDPR:</p>
              <ul className="list-disc pl-6 mt-2">
                <li>Right to Access</li>
                <li>Right to Rectification</li>
                <li>Right to Erasure (Right to be Forgotten)</li>
                <li>Right to Restrict Processing</li>
                <li>Right to Data Portability</li>
                <li>Right to Object</li>
                <li>Right to withdraw consent at any time</li>
              </ul>
              <p className="mt-2">Requests can be submitted via: <a href="mailto:privacy@playform.tech" className="text-blue-600 hover:underline">privacy@playform.tech</a></p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">✅ Data Minimization & Purpose Limitation</h3>
              <p>We collect only what is necessary and use data solely for the purposes specified at the time of collection.</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">✅ Data Security</h3>
              <p>We use:</p>
              <ul className="list-disc pl-6 mt-2">
                <li>Encryption (TLS, AES-256)</li>
                <li>Firewalls and Access Controls</li>
                <li>Secure cloud infrastructure</li>
                <li>Regular security audits and vulnerability testing</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">✅ Data Retention</h3>
              <p>We retain user data only as long as necessary for business or legal purposes. Once no longer needed, data is securely deleted.</p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Data Processing & Subprocessors</h2>
          <p className="mb-4">Playform may use third-party service providers (subprocessors) to process data on our behalf. All subprocessors are:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Under strict data processing agreements</li>
            <li>GDPR-compliant</li>
            <li>Reviewed for security and privacy standards</li>
          </ul>
          <p className="mb-4">Examples:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Google Analytics (Analytics)</li>
            <li>Stripe / Razorpay (Payments)</li>
            <li>Firebase (Hosting & Notification Services)</li>
          </ul>
          <p>A full list of subprocessors is available upon request.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Cross-Border Data Transfers</h2>
          <p className="mb-4">If personal data is transferred outside the EU/EEA (e.g., to India or the United States), we ensure:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Adequate data protection mechanisms are in place</li>
            <li>Standard Contractual Clauses (SCCs) are signed where applicable</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Data Breach Notification</h2>
          <p className="mb-4">In the event of a personal data breach, Playform will:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Notify affected users within 72 hours (as required)</li>
            <li>Inform relevant supervisory authorities</li>
            <li>Provide transparent communication and remedy steps</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Data Protection Officer (DPO)</h2>
          <p className="mb-4">We have appointed a Data Protection Officer to oversee GDPR compliance.</p>
          <ul className="list-disc pl-6 mb-4">
            <li>📧 Contact: <a href="mailto:dpo@playform.tech" className="text-blue-600 hover:underline">dpo@playform.tech</a></li>
            <li>📍 Address: Playform Technologies Pvt. Ltd.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Contact & Complaints</h2>
          <p className="mb-4">If you are an EU/EEA user and believe your data has not been handled in compliance with GDPR, you may contact your local Data Protection Authority (DPA).</p>
          <p className="mb-4">For all privacy-related questions, contact:</p>
          <p>📧 <a href="mailto:privacy@playform.tech" className="text-blue-600 hover:underline">privacy@playform.tech</a></p>

          <p className="mt-8 font-semibold">✅ By using our services, you acknowledge that you have read and understood our GDPR compliance statement.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GDPRModal; 