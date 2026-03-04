import { Badge } from "@/components/ui/badge";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <Badge className="mb-6 bg-[#ADFF44]/10 text-[#ADFF44] border-0 px-3 py-1 text-xs font-display">LEGAL</Badge>
        
        <h1 className="text-5xl font-display font-black mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert max-w-none space-y-6 text-neutral-300">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Introduction</h2>
            <p>
              At Koutuhal.ai, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Information We Collect</h2>
            <p>
              We may collect information about you in a variety of ways. The information we may collect on the site includes:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Personal Data: Name, email address, phone number, date of birth, and other identifying information you provide when registering for an account or enrolling in a course.</li>
              <li>Educational Data: Information about your learning progress, course completion, grades, and assessment results.</li>
              <li>Usage Data: Information about how you interact with our website and services, including IP address, browser type, and pages visited.</li>
              <li>Communication Data: Correspondence between you and Koutuhal, including support tickets and inquiries.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">How We Use Your Information</h2>
            <p>
              Koutuhal uses the information we collect in the following ways:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>To provide, operate, and maintain our services</li>
              <li>To improve our website and services</li>
              <li>To send promotional communications (with your consent)</li>
              <li>To respond to your inquiries and provide customer support</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Security of Your Information</h2>
            <p>
              We use administrative, technical, and physical security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at <a href="mailto:info@koutuhal.in" className="text-[#ADFF44] hover:underline">info@koutuhal.in</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
