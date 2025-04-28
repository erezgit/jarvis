import * as React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AuthProvider } from '@/contexts/AuthContext';
import './styles/global.css';
import validateConfig from './utils/config-validator';

// Global error handler for uncaught exceptions
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  
  // Display error on page for visibility
  const errorDiv = document.createElement('div');
  errorDiv.style.position = 'fixed';
  errorDiv.style.top = '0';
  errorDiv.style.left = '0';
  errorDiv.style.right = '0';
  errorDiv.style.padding = '20px';
  errorDiv.style.backgroundColor = '#f8d7da';
  errorDiv.style.color = '#721c24';
  errorDiv.style.zIndex = '9999';
  errorDiv.style.fontFamily = 'monospace';
  errorDiv.style.whiteSpace = 'pre-wrap';
  errorDiv.style.overflow = 'auto';
  errorDiv.style.maxHeight = '50vh';
  
  errorDiv.innerHTML = `
    <h3>JavaScript Error</h3>
    <p><strong>Message:</strong> ${event.error?.message || 'Unknown error'}</p>
    <p><strong>Stack:</strong> ${event.error?.stack || 'No stack trace available'}</p>
  `;
  
  document.body.appendChild(errorDiv);
});

// Validate configuration at startup
try {
  console.log('Validating configuration...');
  validateConfig();
  console.log('Configuration validated successfully');
} catch (error) {
  console.error('Configuration validation failed:', error);
}

// Find root element
console.log('Looking for root element...');
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('Failed to find the root element');
  throw new Error('Failed to find the root element');
}

console.log('Root element found, creating React root...');

// Create React root
try {
  const root = createRoot(rootElement);
  
  console.log('React root created, rendering app...');
  
  // Render with error boundary
  try {
    console.log('Rendering full app...');
    root.render(
      <React.StrictMode>
        <React.Suspense fallback={<div>Loading...</div>}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </React.Suspense>
      </React.StrictMode>,
    );
    console.log('App rendered successfully');
  } catch (error) {
    console.error('Error rendering app:', error);
    
    // Render a minimal error message if the app fails to render
    root.render(
      <div style={{ 
        padding: '20px', 
        margin: '20px', 
        backgroundColor: '#f8d7da', 
        color: '#721c24',
        borderRadius: '4px',
        fontFamily: 'sans-serif'
      }}>
        <h2>Application Error</h2>
        <p>The application failed to render due to an error:</p>
        <pre style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '10px', 
          borderRadius: '4px',
          overflow: 'auto'
        }}>
          {error instanceof Error ? error.message : 'Unknown error'}
        </pre>
        <p>Please check the console for more details.</p>
      </div>
    );
  }
} catch (error) {
  console.error('Error creating React root:', error);
  
  // If we can't even create the React root, display an error directly in the DOM
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; margin: 20px; background-color: #f8d7da; color: #721c24; border-radius: 4px; font-family: sans-serif;">
        <h2>Critical Application Error</h2>
        <p>Failed to initialize React:</p>
        <pre style="background-color: #f8f9fa; padding: 10px; border-radius: 4px; overflow: auto;">
          ${error instanceof Error ? error.message : 'Unknown error'}
        </pre>
      </div>
    `;
  }
}
