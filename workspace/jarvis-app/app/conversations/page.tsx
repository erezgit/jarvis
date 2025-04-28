import Link from 'next/link';
import AppLayout from '../../components/layout/AppLayout';

// Mock data for conversations
const conversations = [
  { id: 1, title: 'Project Planning', lastUpdated: '2023-05-15', preview: 'We discussed the new features for the app...' },
  { id: 2, title: 'Bug Fixes', lastUpdated: '2023-05-14', preview: 'Fixed the authentication issue in the login flow...' },
  { id: 3, title: 'Design Review', lastUpdated: '2023-05-12', preview: 'Discussed the new UI components and their implementation...' },
];

export default function ConversationsPage() {
  return (
    <AppLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Conversations</h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              A list of all your conversations with Jarvis.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
            >
              New Conversation
            </button>
          </div>
        </div>
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {conversations.map((conversation) => (
                    <Link
                      key={conversation.id}
                      href={`/conversations/${conversation.id}`}
                      className="block hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                            {conversation.title}
                          </h2>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {conversation.lastUpdated}
                          </p>
                        </div>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                          {conversation.preview}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 