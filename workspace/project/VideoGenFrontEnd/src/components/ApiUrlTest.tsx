import { useEffect, useState } from 'react';
import { testApiUrlConstruction, logTestRequest } from '@/utils/test-api-url';
import { config } from '@/config/env';
import { getUnifiedApiClient } from '@/core/services/api/factory';

/**
 * Component for testing API URL construction
 * This component can be added to any page to test API URL construction
 */
export function ApiUrlTest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Run the test on mount
    runTest();
  }, []);

  const runTest = () => {
    setIsLoading(true);
    setTestResults([]);

    try {
      // Capture console output
      const originalConsoleLog = console.log;
      const originalConsoleWarn = console.warn;
      const logs: string[] = [];

      console.log = (...args) => {
        originalConsoleLog(...args);
        logs.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
      };
      
      console.warn = (...args) => {
        originalConsoleWarn(...args);
        logs.push(`⚠️ WARNING: ${args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ')}`);
      };

      // Run the test
      testApiUrlConstruction();

      // Log some test requests
      logTestRequest('GET', 'projects');
      logTestRequest('GET', 'projects/123');
      logTestRequest('GET', 'api/projects');
      logTestRequest('GET', '/api/projects');
      logTestRequest('POST', 'projects', { name: 'Test Project' });

      // Restore console functions
      console.log = originalConsoleLog;
      console.warn = originalConsoleWarn;

      // Update state with logs
      setTestResults(logs);
    } catch (error) {
      console.error('Error running API URL test:', error);
      setTestResults([`Error: ${error instanceof Error ? error.message : String(error)}`]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50 my-4">
      <h2 className="text-xl font-bold mb-4">API URL Construction Test</h2>
      
      <div className="mb-4">
        <p><strong>Environment:</strong> {config.environment}</p>
        <p><strong>API Base URL:</strong> {config.apiBaseUrl}</p>
        <p><strong>API Path:</strong> {config.apiPath}</p>
        <p><strong>Full API URL:</strong> {`${config.apiBaseUrl}/${config.apiPath}`.replace(/([^:]\/)\/+/g, '$1')}</p>
        <p><strong>Legacy API URL:</strong> {config.apiUrl}</p>
      </div>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={runTest}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? 'Running Test...' : 'Run Test'}
        </button>
        
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>
      
      {testResults.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Test Results:</h3>
          <pre className={`bg-gray-800 text-green-400 p-4 rounded overflow-auto ${showDetails ? 'max-h-96' : 'max-h-32'} text-sm`}>
            {testResults.join('\n')}
          </pre>
        </div>
      )}
    </div>
  );
} 