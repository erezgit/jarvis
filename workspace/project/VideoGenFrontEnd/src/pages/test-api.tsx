import { ApiUrlTest } from '@/components/ApiUrlTest';
import { testApiUrlConstruction } from '@/utils/test-api-url';
import { useEffect } from 'react';

/**
 * Test page for API URL construction
 * This page can be used to verify that API URLs are being constructed correctly
 */
export default function TestApiPage() {
  useEffect(() => {
    // Run the test on mount
    testApiUrlConstruction();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">API URL Construction Test</h1>
      <p className="mb-4">
        This page tests API URL construction to ensure that URLs are being constructed correctly.
        Check the console for detailed logs.
      </p>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Instructions</h2>
        <ol className="list-decimal list-inside">
          <li className="mb-1">Open the browser console (F12 or Cmd+Option+I)</li>
          <li className="mb-1">Check the logs for API URL construction details</li>
          <li className="mb-1">Verify that URLs are being constructed correctly</li>
          <li className="mb-1">Use the test component below to run additional tests</li>
        </ol>
      </div>
      
      <ApiUrlTest />
    </div>
  );
} 