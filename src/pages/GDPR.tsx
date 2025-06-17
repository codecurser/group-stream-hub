import React from "react";

const GDPR = () => (
  <div className="max-w-3xl mx-auto px-4 py-12 text-gray-800">
    <h1 className="text-3xl font-bold mb-4">GDPR Compliance Statement</h1>
    <p className="mb-2 font-semibold">Playform Technologies Pvt. Ltd.</p>
    <p className="mb-2">Effective Date: 12/06/2025</p>
    <p className="mb-6">Last Updated: 12/06/2025</p>
    <p className="mb-4">At Playform, we are committed to protecting the privacy and data rights of our users, including those based in the European Union (EU) and European Economic Area (EEA). We fully comply with the General Data Protection Regulation (GDPR) (Regulation (EU) 2016/679), which governs the collection, processing, and storage of personal data of individuals within the EU/EEA.</p>
    <h2 className="text-xl font-semibold mt-8 mb-2">1. What is GDPR?</h2>
    <p className="mb-4">The General Data Protection Regulation (GDPR) is an EU regulation that provides individuals with greater control over their personal data. It requires companies to be transparent about how data is used and to ensure it is handled securely and lawfully.</p>
    <h2 className="text-xl font-semibold mt-8 mb-2">2. Our Commitment to GDPR</h2>
    <ul className="list-disc pl-6 mb-4 space-y-2">
      <li><b>Lawful Basis for Processing:</b> We collect and process personal data only when we have a valid legal basis to do so:
        <ul className="list-disc pl-6">
          <li>User consent</li>
          <li>Contractual necessity</li>
          <li>Legal obligations</li>
          <li>Legitimate interests (e.g., fraud prevention, service improvement)</li>
        </ul>
      </li>
      <li><b>Transparency:</b> We clearly explain how data is used through our:
        <ul className="list-disc pl-6">
          <li>Privacy Policy</li>
          <li>Cookie Policy</li>
          <li>Consent mechanisms</li>
        </ul>
      </li>
      <li><b>User Consent:</b> We obtain explicit, informed, and granular consent from users before collecting non-essential data (e.g., via cookies or marketing preferences).</li>
      <li><b>User Rights:</b> We fully support user rights under GDPR:
        <ul className="list-disc pl-6">
          <li>Right to Access</li>
          <li>Right to Rectification</li>
          <li>Right to Erasure (Right to be Forgotten)</li>
          <li>Right to Restrict Processing</li>
          <li>Right to Data Portability</li>
          <li>Right to Object</li>
          <li>Right to withdraw consent at any time</li>
        </ul>
        <span className="block mt-1">Requests can be submitted via: <a href="mailto:privacy@playform.tech" className="text-blue-600 underline">privacy@playform.tech</a></span>
      </li>
      <li><b>Data Minimization & Purpose Limitation:</b> We collect only what is necessary and use data solely for the purposes specified at the time of collection.</li>
      <li><b>Data Security:</b> We use:
        <ul className="list-disc pl-6">
          <li>Encryption (TLS, AES-256)</li>
          <li>Firewalls and Access Controls</li>
          <li>Secure cloud infrastructure</li>
          <li>Regular security audits and vulnerability testing</li>
        </ul>
      </li>
      <li><b>Data Retention:</b> We retain user data only as long as necessary for business or legal purposes. Once no longer needed, data is securely deleted.</li>
    </ul>
    <h2 className="text-xl font-semibold mt-8 mb-2">3. Data Processing & Subprocessors</h2>
    <p className="mb-2">Playform may use third-party service providers (subprocessors) to process data on our behalf. All subprocessors are:</p>
    <ul className="list-disc pl-6 mb-2">
      <li>Under strict data processing agreements</li>
      <li>GDPR-compliant</li>
      <li>Reviewed for security and privacy standards</li>
    </ul>
    <p className="mb-2">Examples:</p>
    <ul className="list-disc pl-6 mb-4">
      <li>Google Analytics (Analytics)</li>
      <li>Stripe / Razorpay (Payments)</li>
      <li>Firebase (Hosting & Notification Services)</li>
    </ul>
    <p className="mb-4">A full list of subprocessors is available upon request.</p>
    <h2 className="text-xl font-semibold mt-8 mb-2">4. Cross-Border Data Transfers</h2>
    <p className="mb-4">If personal data is transferred outside the EU/EEA (e.g., to India or the United States), we ensure:
      <ul className="list-disc pl-6">
        <li>Adequate data protection mechanisms are in place</li>
        <li>Standard Contractual Clauses (SCCs) are signed where applicable</li>
      </ul>
    </p>
    <h2 className="text-xl font-semibold mt-8 mb-2">5. Data Breach Notification</h2>
    <p className="mb-4">In the event of a personal data breach, Playform will:
      <ul className="list-disc pl-6">
        <li>Notify affected users within 72 hours (as required)</li>
        <li>Inform relevant supervisory authorities</li>
        <li>Provide transparent communication and remedy steps</li>
      </ul>
    </p>
    <h2 className="text-xl font-semibold mt-8 mb-2">6. Data Protection Officer (DPO)</h2>
    <ul className="list-disc pl-6 mb-4">
      <li>Contact: <a href="mailto:dpo@playform.tech" className="text-blue-600 underline">dpo@playform.tech</a></li>
      <li>Address: Playform Technologies Pvt. Ltd.</li>
    </ul>
    <h2 className="text-xl font-semibold mt-8 mb-2">7. Contact & Complaints</h2>
    <p className="mb-2">If you are an EU/EEA user and believe your data has not been handled in compliance with GDPR, you may contact your local Data Protection Authority (DPA).</p>
    <p className="mb-4">For all privacy-related questions, contact: <a href="mailto:privacy@playform.tech" className="text-blue-600 underline">privacy@playform.tech</a></p>
    <p className="mt-8">✅ By using our services, you acknowledge that you have read and understood our GDPR compliance statement.</p>
  </div>
);

export default GDPR; 