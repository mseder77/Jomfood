import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CommonLayout from '../components/layout/CommonLayout';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicyPage = () => {
  const { t } = useTranslation();
  const currentDate = new Date().toLocaleDateString('en-GB', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <CommonLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center text-primary hover:text-primary-600 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span>{t('common.backToHome')}</span>
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Privacy Policy
            </h1>
            <p className="text-gray-600">
              Last updated: {currentDate}
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 lg:p-10 prose prose-lg max-w-none">
            <div className="mb-8">
              <p className="text-gray-700 leading-relaxed">
                Welcome to jomfood.my ("we", "our", "us"). We value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard information when you visit our website jomfood.my, which provides listings, promotions, and deals related to restaurants across Malaysia.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                By accessing or using our website, you agree to the terms outlined in this Privacy Policy.
              </p>
            </div>

            {/* Section 1 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may collect the following types of information:
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">1.1 Personal Information</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                Information you provide voluntarily, such as:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Delivery or location details</li>
                <li>Account login information (if applicable)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">1.2 Usage & Technical Data</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                Automatically collected when you browse our platform:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Device information</li>
                <li>Pages visited and time spent</li>
                <li>Cookies and tracking technologies</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">1.3 Third-Party Data</h3>
              <p className="text-gray-700 leading-relaxed">
                If you engage with external restaurant partners, delivery services, or promo providers through our website, they may share limited information with us to process your request.
              </p>
            </section>

            {/* Section 2 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We use collected information for the following purposes:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>To operate and maintain the jomfood.my website</li>
                <li>To improve user experience and website performance</li>
                <li>To send newsletters, promotions, alerts, or deal updates</li>
                <li>To personalize content, recommendations, and restaurant deals</li>
                <li>To communicate with you regarding support or inquiries</li>
                <li>To prevent fraudulent activities and enhance security</li>
                <li>To comply with legal or regulatory requirements</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Cookies & Tracking Technologies</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We use cookies, web beacons, and analytics tools to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                <li>Track website performance</li>
                <li>Offer personalized deals</li>
                <li>Understand user preferences</li>
                <li>Improve functionality</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                You may disable cookies in your browser settings, but certain site features may not work properly.
              </p>
            </section>

            {/* Section 4 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Sharing of Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4 font-semibold">
                We do not sell your personal information.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may share your data only with:
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.1 Restaurant Partners & Service Providers</h3>
              <p className="text-gray-700 leading-relaxed">
                To show deals, process inquiries, or provide relevant promotional content.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.2 Third-Party Tools</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                Such as:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Website analytics providers (e.g., Google Analytics)</li>
                <li>Email marketing platforms</li>
                <li>Customer support tools</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.3 Legal & Compliance</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                We may disclose information if required:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>By law, regulation, or court order</li>
                <li>To protect our rights, security, and users</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Protection & Security</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We implement industry-standard security measures, including:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                <li>Encryption</li>
                <li>Secure data storage</li>
                <li>Access controls</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                While we strive to protect your data, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            {/* Section 6 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Depending on Malaysian privacy laws, you may:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                <li>Request access to your personal data</li>
                <li>Request correction or updates</li>
                <li>Request deletion of your account or information</li>
                <li>Opt out of marketing communications</li>
                <li>Withdraw consent at any time</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                To exercise your rights, contact us at: <a href="mailto:info@jomfood.my" className="text-primary hover:underline">info@jomfood.my</a>
              </p>
            </section>

            {/* Section 7 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Third-Party Links</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                jomfood.my may contain links to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                <li>Restaurant websites</li>
                <li>Food delivery platforms</li>
                <li>External deal providers</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                We are not responsible for the privacy practices of external sites. Please review their policies separately.
              </p>
            </section>

            {/* Section 8 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                jomfood.my does not knowingly collect information from children under the age of 13. If such data is unknowingly collected, we will delete it promptly upon discovery.
              </p>
            </section>

            {/* Section 9 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We may update this Privacy Policy from time to time. Any changes will be posted on this page with a revised Last Updated date.
              </p>
            </section>

            {/* Contact Section */}
            <section className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at:{' '}
                <a href="mailto:info@jomfood.my" className="text-primary hover:underline">info@jomfood.my</a>
              </p>
            </section>
          </div>

          {/* Back to top link */}
          <div className="mt-8 text-center">
            <Link
              to="/"
              className="inline-flex items-center text-primary hover:text-primary-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span>{t('common.backToHome')}</span>
            </Link>
          </div>
        </div>
      </div>
    </CommonLayout>
  );
};

export default PrivacyPolicyPage;

