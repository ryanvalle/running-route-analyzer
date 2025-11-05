'use client';

import { useState } from 'react';
import { RouteAnalysis } from '@/types';
import html2canvas from 'html2canvas';

interface EmailReportProps {
  analysis: RouteAnalysis;
  mapContainerRef?: React.RefObject<HTMLDivElement | null>;
  chartContainerRef?: React.RefObject<HTMLDivElement | null>;
}

export default function EmailReport({ analysis, mapContainerRef, chartContainerRef }: EmailReportProps) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const captureScreenshot = async (element: HTMLElement): Promise<string> => {
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher resolution
      logging: false,
      useCORS: true,
      allowTaint: true,
      ignoreElements: (el) => {
        // Skip elements that might have unsupported CSS color functions
        const computedStyle = window.getComputedStyle(el);
        const bgColor = computedStyle.backgroundColor;
        // Skip elements with lab() or other modern color functions
        return bgColor.includes('lab(') || bgColor.includes('lch(') || bgColor.includes('oklab(') || bgColor.includes('oklch(');
      },
    });
    return canvas.toDataURL('image/png');
  };

  const handleSendEmail = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setSending(true);
    setError(null);
    setSuccess(false);

    try {
      // Capture map screenshot
      let mapImage = '';
      if (mapContainerRef?.current) {
        const mapElement = mapContainerRef.current;
        mapImage = await captureScreenshot(mapElement);
      }

      // Capture chart screenshot
      let chartImage = '';
      if (chartContainerRef?.current) {
        const chartElement = chartContainerRef.current;
        chartImage = await captureScreenshot(chartElement);
      }

      // Send email request
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          analysis,
          mapImage,
          chartImage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      setSuccess(true);
      setEmail('');
      // Auto-close modal after 3 seconds on success
      setTimeout(() => {
        setShowModal(false);
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Email Button */}
      <button
        onClick={() => setShowModal(true)}
        className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-md flex items-center gap-2"
        title="Email this analysis report"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        Email Report
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Email Route Analysis
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Receive a formatted email with map and chart images
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-green-800 dark:text-green-200 font-medium">
                    Email sent successfully!
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-200 text-sm">
                  {error}
                </p>
              </div>
            )}

            {/* Email Input */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                disabled={sending}
              />
            </div>

            {/* Info Box */}
            <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>What you&apos;ll receive:</strong>
                <br />
                • Formatted HTML email with all analysis details
                <br />
                • High-resolution map and elevation chart images
                <br />
                • Mile-by-mile breakdown table
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={sending}
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                disabled={sending || !email}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  'Send Email'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
