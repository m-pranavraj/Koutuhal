import { Badge } from "@/components/ui/badge";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <Badge className="mb-6 bg-[#ADFF44]/10 text-[#ADFF44] border-0 px-3 py-1 text-xs font-display">LEGAL</Badge>
        
        <h1 className="text-5xl font-display font-black mb-8">Terms and Conditions</h1>
        
        <div className="prose prose-invert max-w-none space-y-6 text-neutral-300">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Agreement to Terms</h2>
            <p>
              By accessing and using this website and our services, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Use Our Services</h2>
            <p>
              You agree that you will not use our services:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>In any way that violates any applicable law or regulation</li>
              <li>To transmit any harmful or malicious code</li>
              <li>To harass, abuse, or harm another person</li>
              <li>To impersonate or attempt to impersonate any person or entity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Course Content</h2>
            <p>
              All course materials, content, and resources provided by Koutuhal are for educational purposes. You agree not to reproduce, distribute, or transmit any course content without permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Limitation of Liability</h2>
            <p>
              In no event shall Koutuhal, nor its directors, employees, or agents, be liable to you for any direct, indirect, incidental, special, or consequential damages resulting from your use of or inability to use the services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Modifications to Terms</h2>
            <p>
              Koutuhal reserves the right to modify or replace these terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p>
              If you have any questions about these Terms and Conditions, please contact us at <a href="mailto:info@koutuhal.in" className="text-[#ADFF44] hover:underline">info@koutuhal.in</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
