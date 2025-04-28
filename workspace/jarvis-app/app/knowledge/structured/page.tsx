"use client";

import AppLayout from '../../../components/layout/AppLayout';
import Link from 'next/link';

export default function StructuredKnowledgePage() {
  return (
    <AppLayout>
      <div className="flex flex-col items-start">
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Link href="/knowledge" className="text-blue-400 hover:text-blue-300 mr-2">Knowledge</Link>
            <span className="text-gray-500 mx-2">/</span>
            <span className="text-white">Structured</span>
          </div>
          <h1 className="text-3xl font-bold mb-3">Structured Memory</h1>
          <p className="text-gray-400 mb-6">
            Organized structured data about projects, entities, and other structured information that Jarvis maintains.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Projects */}
          <div className="bg-[#1B1B1B] p-6 rounded-lg border border-[#333333]">
            <h2 className="text-xl font-semibold mb-3">Projects</h2>
            <p className="text-gray-400 mb-4">
              Information about ongoing projects, including status, team members, and progress.
            </p>
            <Link href="/knowledge/structured/projects" className="text-blue-400 hover:text-blue-300">
              Browse Projects →
            </Link>
          </div>

          {/* Entities */}
          <div className="bg-[#1B1B1B] p-6 rounded-lg border border-[#333333]">
            <h2 className="text-xl font-semibold mb-3">Entities</h2>
            <p className="text-gray-400 mb-4">
              Structured data about important entities referenced across projects.
            </p>
            <Link href="/knowledge/structured/entities" className="text-blue-400 hover:text-blue-300">
              Browse Entities →
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 