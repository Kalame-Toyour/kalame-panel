'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, Lock, Users, Database, Globe, Mail } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div dir="ltr" className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <motion.div 
        className="bg-white shadow-sm border-b"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
              <p className="text-gray-600">Your privacy is important to us</p>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Effective Date:</strong> July 2025 | <strong>Last Updated:</strong> August 2025
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        className="max-w-4xl mx-auto px-4 py-12"
        variants={staggerChildren}
        initial="initial"
        animate="animate"
      >
        {/* Introduction */}
        <motion.section variants={fadeInUp} className="mb-12">
          <div className="bg-white rounded-2xl shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Eye className="h-6 w-6 text-blue-600" />
              Introduction
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Welcome to <strong>Kalame AI Chatbot</strong>! We&apos;re thrilled you&apos;ve chosen our platform for your AI-powered conversations. At Kalame, we take your privacy seriously and want to be completely transparent about how we handle your information. This privacy policy explains everything you need to know about how we collect, use, and protect your data when you use our chatbot service.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We&apos;ve designed our service to work with multiple AI models including GPT-4, Claude, Gemini, and others, giving you the best possible experience. By using Kalame, you&apos;re agreeing to the practices described in this policy. If you have any questions or concerns, we&apos;re here to help!
            </p>
          </div>
        </motion.section>

        {/* Information We Collect */}
        <motion.section variants={fadeInUp} className="mb-12">
          <div className="bg-white rounded-2xl shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Database className="h-6 w-6 text-green-600" />
              Information We Collect
            </h2>
            
            <div className="space-y-6">
              <p className="text-gray-700 leading-relaxed">
                Here&apos;s what we collect when you use Kalame. We&apos;ve organized this into clear categories so you know exactly what we&apos;re talking about:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="font-semibold text-red-800 mb-2">Personal Information</h3>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• Your phone number (needed for account security)</li>
                      <li>• Email address (if you choose to provide it)</li>
                      <li>• Username and any profile details you share</li>
                      <li>• Payment details (handled securely by our payment partners)</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-2">Your Conversations</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Chat messages and conversations with our AI</li>
                      <li>• Which AI models you prefer to use</li>
                      <li>• How you interact with different features</li>
                      <li>• Your app usage patterns and preferences</li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="font-semibold text-purple-800 mb-2">Technical Information</h3>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• What device you&apos;re using (phone, tablet, etc.)</li>
                      <li>• Your operating system and app version</li>
                      <li>• General location data (country/region level)</li>
                      <li>• Crash reports to help us fix bugs</li>
                    </ul>
                  </div>
                  
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h3 className="font-semibold text-orange-800 mb-2">Analytics & Performance</h3>
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li>• How you use the app (anonymized)</li>
                      <li>• Performance metrics to improve speed</li>
                      <li>• Error logs to fix technical issues</li>
                      <li>• Usage patterns to enhance your experience</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* How We Use Information */}
        <motion.section variants={fadeInUp} className="mb-12">
          <div className="bg-white rounded-2xl shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Users className="h-6 w-6 text-indigo-600" />
              How We Use Your Information
            </h2>
            
            <div className="space-y-6">
              <p className="text-gray-700 leading-relaxed">
                We use your information to make Kalame work better for you. Here&apos;s the honest breakdown of why we need this data:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Making Kalame Work</h3>
                      <p className="text-sm text-gray-600">We use your data to provide our AI chatbot services and connect you with the right AI models</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Personalizing Your Experience</h3>
                      <p className="text-sm text-gray-600">We remember your preferences and customize the app to work the way you like it</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Keeping Your Account Secure</h3>
                      <p className="text-sm text-gray-600">We verify it&apos;s really you logging in and protect your account from unauthorized access</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Improving the App</h3>
                      <p className="text-sm text-gray-600">We analyze how you use Kalame to fix bugs, add features, and make everything faster</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Staying in Touch</h3>
                      <p className="text-sm text-gray-600">We send you important updates about the app and respond to your support requests</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Following the Rules</h3>
                      <p className="text-sm text-gray-600">We comply with legal requirements and enforce our terms of service to keep everyone safe</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Data Sharing */}
        <motion.section variants={fadeInUp} className="mb-12">
          <div className="bg-white rounded-2xl shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Globe className="h-6 w-6 text-teal-600" />
              Data Sharing and Disclosure
            </h2>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <Lock className="h-5 w-5" />
                We Don&apos;t Sell Your Data
              </h3>
              <p className="text-green-700 text-sm">
                Let&apos;s be crystal clear: we never sell, trade, or rent your personal information to anyone for marketing purposes. Your data stays with us.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">AI Model Partners</h3>
                <p className="text-sm text-gray-600 mb-2">
                  When you chat with our AI, we send your messages to companies like OpenAI, Anthropic, and Google so they can generate responses. 
                  These companies have their own privacy policies and may use your data to improve their AI models.
                </p>
                <div className="text-xs text-gray-500 bg-yellow-50 p-2 rounded">
                  <strong>Pro tip:</strong> Avoid sharing sensitive personal information in your chats, just to be extra safe.
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Our Trusted Partners</h3>
                <p className="text-sm text-gray-600">
                  We work with companies that help us run Kalame, like payment processors, analytics services, and cloud providers. 
                  They&apos;re all bound by strict agreements to keep your data safe and can&apos;t use it for their own purposes.
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">When the Law Requires It</h3>
                <p className="text-sm text-gray-600">
                  In rare cases, we might have to share information if required by law, court order, or to protect our rights and safety, 
                  or that of our users and the public.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Data Security */}
        <motion.section variants={fadeInUp} className="mb-12">
          <div className="bg-white rounded-2xl shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Lock className="h-6 w-6 text-red-600" />
              Data Security
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-3">Technical Measures</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    End-to-end encryption for sensitive data
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    Secure HTTPS connections
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    Regular security audits and updates
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    Access controls and authentication
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-3">Organizational Measures</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    Staff training on data protection
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    Limited access to personal data
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    Incident response procedures
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    Regular policy reviews and updates
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Real talk:</strong> While we do everything we can to keep your data safe, no system is 100% secure. 
                We&apos;re committed to protecting your information, but we want to be honest about the reality of online security.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Your Rights */}
        <motion.section variants={fadeInUp} className="mb-12">
          <div className="bg-white rounded-2xl shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Users className="h-6 w-6 text-purple-600" />
              Your Rights
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                  <h3 className="font-semibold text-purple-800 mb-2">Access & Portability</h3>
                  <p className="text-sm text-purple-700">
                    Request a copy of all personal data we hold about you in a structured, machine-readable format.
                  </p>
                </div>
                
                <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                  <h3 className="font-semibold text-purple-800 mb-2">Correction</h3>
                  <p className="text-sm text-purple-700">
                    Request correction of inaccurate or incomplete personal information.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                  <h3 className="font-semibold text-purple-800 mb-2">Deletion</h3>
                  <p className="text-sm text-purple-700">
                    Request deletion of your personal data, subject to legal and operational requirements.
                  </p>
                </div>
                
                <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                  <h3 className="font-semibold text-purple-800 mb-2">Objection</h3>
                  <p className="text-sm text-purple-700">
                    Object to processing of your personal data for certain purposes.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Want to exercise any of these rights?</strong> Just reach out to us using the contact info below. 
                We&apos;ll get back to you within 30 days (though usually much faster). We might need to verify your identity first, 
                but that&apos;s just to make sure we&apos;re talking to the right person.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Data Retention */}
        <motion.section variants={fadeInUp} className="mb-12">
          <div className="bg-white rounded-2xl shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Retention</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Chat Messages</h3>
                  <p className="text-sm text-gray-600">Retained for 2 years for service improvement and support purposes</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Account Information</h3>
                  <p className="text-sm text-gray-600">Retained while your account is active and for 1 year after closure</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Analytics Data</h3>
                  <p className="text-sm text-gray-600">Retained for 3 years in anonymized form for business intelligence</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* International Transfers */}
        <motion.section variants={fadeInUp} className="mb-12">
          <div className="bg-white rounded-2xl shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">International Data Transfers</h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-blue-800 mb-4">
                Your data may be transferred to and processed in countries other than your own, including the United States, 
                where our AI model providers are located. We ensure appropriate safeguards are in place for such transfers.
              </p>
              
              <div className="space-y-2 text-sm text-blue-700">
                <p><strong>• Standard Contractual Clauses:</strong> We use EU-approved standard contractual clauses for data transfers</p>
                <p><strong>• Adequacy Decisions:</strong> We rely on adequacy decisions where applicable</p>
                <p><strong>• Privacy Shield:</strong> We ensure our US partners maintain appropriate data protection standards</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Children's Privacy */}
        <motion.section variants={fadeInUp} className="mb-12">
          <div className="bg-white rounded-2xl shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Children's Privacy</h2>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <p className="text-orange-800 mb-4">
                Our service is not intended for children under 13 years of age. We do not knowingly collect personal 
                information from children under 13. If you are a parent or guardian and believe your child has provided 
                us with personal information, please contact us immediately.
              </p>
              
              <p className="text-sm text-orange-700">
                If we discover that we have collected personal information from a child under 13 without parental consent, 
                we will take steps to delete such information from our servers.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Changes to Policy */}
        <motion.section variants={fadeInUp} className="mb-12">
          <div className="bg-white rounded-2xl shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Changes to This Privacy Policy</h2>
            
            <div className="space-y-4">
              <p className="text-gray-700">
                We might update this privacy policy from time to time as we improve Kalame or when laws change. 
                When we make important changes, we&apos;ll let you know by:
              </p>
              
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  Updating this page with the new policy
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  Sending you an email (if you&apos;ve given us your email address)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  Showing a notice in the app when you open it
                </li>
              </ul>
              
              <p className="text-sm text-gray-600 mt-4">
                If you keep using Kalame after we update this policy, that means you&apos;re okay with the changes. 
                If you&apos;re not comfortable with the updates, you can always stop using the app.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Contact Information */}
        <motion.section variants={fadeInUp} className="mb-12">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Mail className="h-6 w-6" />
              Contact Us
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-200" />
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-sm text-blue-100">privacy@kalame.chat</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-blue-200" />
                  <div>
                    <p className="font-semibold">Website</p>
                    <p className="text-sm text-blue-100">https://kalame.chat</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-white/10 rounded-lg">
              <p className="text-sm text-blue-100">
                Got questions about this privacy policy? We&apos;re here to help! Drop us a line anytime and we&apos;ll get back to you as soon as we can. 
                We genuinely care about your privacy and want to make sure you feel comfortable using Kalame.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <motion.div 
          variants={fadeInUp}
          className="text-center text-gray-500 text-sm py-8"
        >
          <p>&copy; 2024 Kalame AI Technologies. All rights reserved.</p>
          <p className="mt-2">This Privacy Policy is effective as of July 2025.</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
