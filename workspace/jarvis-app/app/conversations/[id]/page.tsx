import AppLayout from '../../../components/layout/AppLayout';

// Mock conversation data
const mockMessages = [
  { id: 1, role: 'user', content: 'Hey Jarvis, can you help me with a React component?', timestamp: '10:30 AM' },
  { id: 2, role: 'assistant', content: 'Of course! What kind of component do you need help with?', timestamp: '10:31 AM' },
  { id: 3, role: 'user', content: 'I need to create a sidebar that shows different navigation items.', timestamp: '10:32 AM' },
  { id: 4, role: 'assistant', content: 'I can definitely help with that. A sidebar typically consists of a container with navigation links. Let me show you how to create one using React and Tailwind CSS.', timestamp: '10:33 AM' },
];

export default function ConversationPage({ params }: { params: { id: string } }) {
  const conversationId = params.id;
  
  return (
    <AppLayout>
      <div className="flex h-full flex-col">
        <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-4 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Conversation #{conversationId}
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-4">
            {mockMessages.map((message) => (
              <div 
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.role === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs text-right mt-1 opacity-70">{message.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 sm:px-6">
          <div className="flex space-x-3">
            <div className="flex-grow">
              <textarea
                rows={1}
                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 bg-white dark:bg-gray-800"
                placeholder="Type your message..."
              />
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 