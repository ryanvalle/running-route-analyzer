'use client';

import { useState } from 'react';
import { RouteAnalysis } from '@/types';
import { RouteAnalysisDisplayRef } from './RouteAnalysisDisplay';

interface EmailReportProps {
  analysis: RouteAnalysis;
  analysisDisplayRef?: React.RefObject<RouteAnalysisDisplayRef | null>;
}

export default function EmailReport({ analysis, analysisDisplayRef }: EmailReportProps) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const captureSVGAsImage = async (element: HTMLElement): Promise<string> => {
    // Find SVG element
    const svg = element.querySelector('svg');
    if (!svg) {
      throw new Error('No SVG found in element');
    }

    // Get dimensions
    const bbox = svg.getBoundingClientRect();
    const canvas = document.createElement('canvas');
    canvas.width = bbox.width * 2; // 2x for high resolution
    canvas.height = bbox.height * 2;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clone the SVG to avoid modifying the original
    const clonedSvg = svg.cloneNode(true) as SVGElement;
    
    // Set explicit dimensions on the cloned SVG
    clonedSvg.setAttribute('width', String(bbox.width));
    clonedSvg.setAttribute('height', String(bbox.height));
    
    // Preserve the original viewBox or create one
    const viewBox = svg.getAttribute('viewBox');
    if (viewBox) {
      clonedSvg.setAttribute('viewBox', viewBox);
    } else {
      clonedSvg.setAttribute('viewBox', `0 0 ${bbox.width} ${bbox.height}`);
    }

    // Serialize SVG to string
    const svgString = new XMLSerializer().serializeToString(clonedSvg);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });

    // Convert SVG to PNG using canvas with timeout
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(svgBlob);
      
      // Set a timeout to prevent hanging
      const timeout = setTimeout(() => {
        URL.revokeObjectURL(url);
        reject(new Error('SVG image load timeout'));
      }, 5000); // 5 second timeout

      img.onload = () => {
        clearTimeout(timeout);
        try {
          // Draw the image scaled up
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          // Clean up
          URL.revokeObjectURL(url);
          // Convert to data URL
          resolve(canvas.toDataURL('image/png'));
        } catch (err) {
          URL.revokeObjectURL(url);
          reject(err);
        }
      };

      img.onerror = () => {
        clearTimeout(timeout);
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG image'));
      };

      img.src = url;
    });
  };

  const captureMapAsImage = async (element: HTMLElement): Promise<string> => {
    // Due to CORS restrictions with external map tiles, we can only reliably capture
    // the SVG overlay (route line) without the background map tiles
    const mapContainer = element.querySelector('.leaflet-container');
    if (!mapContainer) {
      throw new Error('Leaflet container not found');
    }

    // Get the SVG overlay (polylines, markers, etc.)
    const svgOverlay = mapContainer.querySelector('.leaflet-overlay-pane svg');
    if (!svgOverlay || !(svgOverlay instanceof SVGElement)) {
      // If no SVG overlay, return empty string (email will be sent without map image)
      return '';
    }

    // Create canvas to draw the SVG
    const canvas = document.createElement('canvas');
    const bbox = element.getBoundingClientRect();
    canvas.width = bbox.width * 2; // 2x for high resolution
    canvas.height = bbox.height * 2;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Fill with light gray background to simulate map
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Serialize and draw the SVG overlay
    const svgString = new XMLSerializer().serializeToString(svgOverlay);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(svgBlob);
      
      // Set a timeout to prevent hanging
      const timeout = setTimeout(() => {
        URL.revokeObjectURL(url);
        // Return canvas with just background if SVG overlay times out
        resolve(canvas.toDataURL('image/png'));
      }, 3000); // 3 second timeout

      img.onload = () => {
        clearTimeout(timeout);
        try {
          const rect = svgOverlay.getBoundingClientRect();
          const containerRect = mapContainer.getBoundingClientRect();
          const x = (rect.left - containerRect.left) * 2;
          const y = (rect.top - containerRect.top) * 2;
          ctx.drawImage(img, x, y, rect.width * 2, rect.height * 2);
        } catch (err) {
          console.warn('Failed to draw SVG overlay:', err);
        }
        URL.revokeObjectURL(url);
        
        try {
          // This should work since we're only using local SVG content
          resolve(canvas.toDataURL('image/png'));
        } catch {
          console.error('Failed to convert canvas to data URL');
          // Return empty string if still fails
          resolve('');
        }
      };

      img.onerror = () => {
        clearTimeout(timeout);
        URL.revokeObjectURL(url);
        // Even if SVG overlay fails, return the canvas with background
        try {
          resolve(canvas.toDataURL('image/png'));
        } catch {
          resolve('');
        }
      };

      img.src = url;
    });
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
      // Get the refs from the analysis display ref
      const chartContainerRef = analysisDisplayRef?.current?.chartContainerRef;
      const mapContainerRef = analysisDisplayRef?.current?.mapContainerRef;

      console.log('Analysis display ref:', analysisDisplayRef?.current);
      console.log('Chart container ref:', chartContainerRef);
      console.log('Map container ref:', mapContainerRef);

      // Capture chart screenshot (SVG to PNG)
      let chartImage = '';
      console.log('Chart container current:', chartContainerRef?.current);
      if (chartContainerRef?.current) {
        try {
          const chartElement = chartContainerRef.current;
          console.log('Attempting to capture chart from element:', chartElement);
          console.log('Chart element HTML:', chartElement.innerHTML.substring(0, 200));
          chartImage = await captureSVGAsImage(chartElement);
          console.log('Chart image captured, length:', chartImage.length);
          console.log('Chart image preview:', chartImage.substring(0, 50));
        } catch (chartError) {
          console.error('Failed to capture chart screenshot:', chartError);
          // Continue without chart image
        }
      } else {
        console.warn('Chart container ref is not available');
      }

      // Capture map screenshot (Leaflet tiles to PNG)
      let mapImage = '';
      console.log('Map container current:', mapContainerRef?.current);
      if (mapContainerRef?.current) {
        try {
          const mapElement = mapContainerRef.current;
          console.log('Attempting to capture map from element:', mapElement);
          console.log('Map element HTML:', mapElement.innerHTML.substring(0, 200));
          mapImage = await captureMapAsImage(mapElement);
          console.log('Map image captured, length:', mapImage.length);
          console.log('Map image preview:', mapImage.substring(0, 50));
        } catch (mapError) {
          console.error('Failed to capture map screenshot:', mapError);
          // Continue without map image
        }
      } else {
        console.warn('Map container ref is not available');
      }

      // Send email request
      console.log('Sending email with images - Chart length:', chartImage.length, 'Map length:', mapImage.length);
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
      console.error('Error sending email:', err);
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
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
