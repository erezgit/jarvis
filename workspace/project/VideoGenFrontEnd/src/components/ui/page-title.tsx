import React from 'react';

interface PageTitleProps {
  title: string;
  subtitle?: string;
  className?: string;
}

/**
 * A reusable page title component with optional subtitle
 */
export const PageTitle: React.FC<PageTitleProps> = ({ 
  title, 
  subtitle, 
  className = '' 
}) => {
  return (
    <div className={`mb-8 ${className}`}>
      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      {subtitle && (
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      )}
    </div>
  );
};

export default PageTitle; 