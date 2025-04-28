"use client";

import { useEffect, useState } from 'react';
import AppLayout from '../../../../components/layout/AppLayout';
import Link from 'next/link';

export default function StructuredEntitiesPage() {
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <AppLayout>
      <div className="flex flex-col items-start">
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Link href="/knowledge" className="text-blue-400 hover:text-blue-300 mr-2">Knowledge</Link>
            <span className="text-gray-500 mx-2">/</span>
            <Link href="/knowledge/structured" className="text-blue-400 hover:text-blue-300 mr-2">Structured</Link>
            <span className="text-gray-500 mx-2">/</span>
            <span className="text-white">Entities</span>
          </div>
          <h1 className="text-3xl font-bold mb-3">Entities</h1>
          <p className="text-gray-400 mb-6">
            Structured information about important entities referenced across projects.
          </p>
        </div>

        <div className="w-full">
          <div className="bg-[#1B1B1B] p-8 rounded-lg border border-[#333333] text-center">
            <h2 className="text-xl font-semibold mb-4">Entity Management</h2>
            <p className="text-gray-400 mb-4">
              Entity management is coming soon. This feature will allow you to create, view, and manage structured entities.
            </p>
            <Link 
              href="/knowledge/structured" 
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Back to Structured Memory
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 