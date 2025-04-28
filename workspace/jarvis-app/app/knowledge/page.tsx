"use client";

import AppLayout from '../../components/layout/AppLayout';

export default function KnowledgePage() {
  return (
    <AppLayout>
      <div className="flex flex-col items-start">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Jarvis Knowledge System</h1>
          <p className="text-gray-400 mb-6">
            Jarvis organizes information using a cognitive-inspired memory architecture with four distinct memory types.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Semantic Memory */}
          <div className="bg-[#1B1B1B] p-6 rounded-lg border border-[#333333]">
            <h2 className="text-xl font-semibold mb-3">Semantic Memory</h2>
            <p className="text-gray-400 mb-4">
              Core knowledge, concepts, facts, and relationships that Jarvis uses for understanding and reasoning.
            </p>
            <div className="flex space-x-4">
              <a href="/knowledge/semantic/concepts" className="text-blue-400 hover:text-blue-300">Concepts</a>
              <a href="/knowledge/semantic/relationships" className="text-blue-400 hover:text-blue-300">Relationships</a>
            </div>
          </div>

          {/* Episodic Memory */}
          <div className="bg-[#1B1B1B] p-6 rounded-lg border border-[#333333]">
            <h2 className="text-xl font-semibold mb-3">Episodic Memory</h2>
            <p className="text-gray-400 mb-4">
              Records of conversations, sessions, and interactions that help maintain context over time.
            </p>
            <div className="flex space-x-4">
              <a href="/knowledge/episodic/conversations" className="text-blue-400 hover:text-blue-300">Conversations</a>
              <a href="/knowledge/episodic/sessions" className="text-blue-400 hover:text-blue-300">Sessions</a>
            </div>
          </div>

          {/* Procedural Memory */}
          <div className="bg-[#1B1B1B] p-6 rounded-lg border border-[#333333]">
            <h2 className="text-xl font-semibold mb-3">Procedural Memory</h2>
            <p className="text-gray-400 mb-4">
              Workflows, templates, and procedures that define how Jarvis performs tasks and operations.
            </p>
            <div className="flex space-x-4">
              <a href="/knowledge/procedural/workflows" className="text-blue-400 hover:text-blue-300">Workflows</a>
              <a href="/knowledge/procedural/templates" className="text-blue-400 hover:text-blue-300">Templates</a>
            </div>
          </div>

          {/* Structured Memory */}
          <div className="bg-[#1B1B1B] p-6 rounded-lg border border-[#333333]">
            <h2 className="text-xl font-semibold mb-3">Structured Memory</h2>
            <p className="text-gray-400 mb-4">
              Organized data about projects, entities, and other structured information Jarvis maintains.
            </p>
            <div className="flex space-x-4">
              <a href="/knowledge/structured/projects" className="text-blue-400 hover:text-blue-300">Projects</a>
              <a href="/knowledge/structured/entities" className="text-blue-400 hover:text-blue-300">Entities</a>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 