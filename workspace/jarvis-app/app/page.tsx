"use client";

import Link from "next/link";
import AppLayout from "../components/layout/AppLayout";

export default function Home() {
  return (
    <AppLayout>
      <div className="flex flex-col space-y-8 bg-[#141414] text-white">
        <section className="bg-[#141414] border border-[#242424] p-8 rounded-lg shadow-md" style={{ borderWidth: '1px' }}>
          <h2 className="text-2xl font-semibold mb-6">Welcome to the Jarvis Interface</h2>
          <p className="mb-4 text-gray-300 leading-relaxed">
            This interface displays Jarvis responses in real-time as you interact through Cursor. Each response 
            Jarvis generates is saved as a page that you can reference later.
          </p>
          <p className="mb-6 text-gray-300 leading-relaxed">
            You can access all your previous Jarvis responses through the responses page, allowing you to quickly navigate 
            between different visualizations, code explanations, reports, and other outputs.
          </p>
          <Link 
            href="/responses" 
            className="inline-block px-6 py-3 bg-[#1B1B1B] text-white rounded hover:bg-[#242424] transition"
          >
            View Recent Responses
          </Link>
        </section>

        <section className="bg-[#141414] border border-[#242424] p-8 rounded-lg shadow-md" style={{ borderWidth: '1px' }}>
          <h2 className="text-2xl font-semibold mb-6">Current Session</h2>
          <div className="p-6 border rounded border-[#242424] bg-[#1B1B1B]" style={{ borderWidth: '1px' }}>
            <p className="text-gray-400 italic">
              No active response being generated. When you interact with Jarvis in Cursor, 
              the output will appear here.
            </p>
          </div>
        </section>

        <footer className="mt-auto pt-8 border-t border-[#242424]" style={{ borderWidth: '1px' }}>
          <p className="text-center text-gray-500">
            Jarvis Web Interface • Running on localhost:3000
          </p>
        </footer>
      </div>
    </AppLayout>
  );
}
