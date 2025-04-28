# TodoList-Agent Architecture

## 1. Technical Architecture

### 1.1 Overall Architecture

The TodoList-Agent follows a modern, component-based architecture built on Next.js and LangChain.js:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser Client                            │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                         Next.js Frontend                         │
│                                                                  │
│  ┌──────────────────┐   ┌──────────────────┐  ┌───────────────┐  │
│  │   ChatWindow     │   │  ChatMessages    │  │    Other UI    │  │
│  └────────┬─────────┘   └──────────────────┘  └───────────────┘  │
│           │                                                      │
└───────────┼──────────────────────────────────────────────────────┘
            │
┌───────────▼──────────────────────────────────────────────────────┐
│                      Next.js API Routes (Edge)                    │
│                                                                   │
│  ┌────────────────┐ ┌────────────────┐ ┌─────────────────────┐   │
│  │ Chat Handler   │ │ Agent Handler  │ │ Retrieval Handler   │   │
│  └───────┬────────┘ └───────┬────────┘ └──────────┬──────────┘   │
│          │                  │                     │              │
└──────────┼──────────────────┼─────────────────────┼──────────────┘
           │                  │                     │
┌──────────▼──────────────────▼─────────────────────▼──────────────┐
│                         LangChain.js                              │
│                                                                   │
│  ┌────────────────┐ ┌────────────────┐ ┌─────────────────────┐   │
│  │     Chains     │ │     Agents     │ │   Vector Stores     │   │
│  └───────┬────────┘ └───────┬────────┘ └──────────┬──────────┘   │
│          │                  │                     │              │
└──────────┼──────────────────┼─────────────────────┼──────────────┘
           │                  │                     │
┌──────────▼──────────────────▼─────────────────────▼──────────────┐
│                       External Services                           │
│  ┌────────────────┐ ┌────────────────┐ ┌─────────────────────┐   │
│  │    OpenAI      │ │     SerpAPI    │ │      Supabase       │   │
│  └────────────────┘ └────────────────┘ └─────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Key Technical Components

#### Frontend Layer

- **React Components**: Built with functional components and hooks
- **TailwindCSS**: For styling with utility classes
- **Vercel AI SDK**: For streaming UI updates from AI responses
- **Next.js App Router**: For page routing and layout management

#### API Layer

- **Next.js Edge Functions**: Serverless API routes with edge runtime
- **Streaming Response Handling**: Using ReadableStream and TextEncoder
- **HTTP Headers**: For passing metadata like sources between API and client

#### AI Integration Layer

- **LangChain Expression Language**: For composing chains and agents
- **LangGraph**: For creating agent workflows
- **OpenAI API**: Primary LLM provider
- **Tool Integration**: Calculator, SerpAPI for external data access

#### Data Storage Layer

- **Supabase Vector Store**: For RAG document storage and retrieval
- **OpenAI Embeddings**: For vector representations of text

## 2. Data Flows

### 2.1 Chat Flow

```
┌──────────┐    1. Send message    ┌───────────┐
│  Browser  │──────────────────────►           │
│  Client   │                      │  Next.js  │
│           │◄─────────────────────┤   API     │
└──────────┘    5. Stream tokens   └─────┬─────┘
                                         │
                   2. Process message    │
                                         ▼
                                   ┌───────────┐
                                   │           │
                                   │ LangChain │
                                   │   Chain   │
                                   │           │
                                   └─────┬─────┘
                                         │
                 3. Generate response    │
                                         ▼
                                   ┌───────────┐
                                   │           │
                                   │  OpenAI   │
                                   │   API     │
                                   │           │
                                   └─────┬─────┘
                                         │
                   4. Stream tokens      │
                                         ▼
```

### 2.2 Retrieval Augmented Generation (RAG) Flow

```
┌─────────────┐                           ┌────────────────┐
│             │                           │                │
│  Document   │──────┐                    │   User Query   │
│    Text     │      │                    │                │
│             │      │                    └────────┬───────┘
└─────────────┘      │                             │
                     ▼                             │
              ┌─────────────┐                      │
              │             │                      │
              │   Text      │                      │
              │  Splitter   │                      │
              │             │                      │
              └──────┬──────┘                      │
                     │                             │
                     ▼                             ▼
              ┌─────────────┐             ┌────────────────┐
              │             │             │                │
              │  OpenAI     │             │  Standalone    │
              │ Embeddings  │             │    Query       │
              │             │             │                │
              └──────┬──────┘             └────────┬───────┘
                     │                             │
                     ▼                             │
              ┌─────────────┐                      │
              │             │                      │
              │  Supabase   │◄─────────────────────┘
              │Vector Store │    Similarity Search
              │             │
              └──────┬──────┘
                     │
                     │  Retrieved Documents
                     ▼
              ┌─────────────┐
              │             │
              │  Context    │
              │  Builder    │
              │             │
              └──────┬──────┘
                     │
                     ▼
              ┌─────────────┐
              │             │
              │  Prompt     │
              │  Template   │
              │             │
              └──────┬──────┘
                     │
                     ▼
              ┌─────────────┐
              │             │
              │   OpenAI    │
              │    LLM      │
              │             │
              └──────┬──────┘
                     │
                     ▼
              ┌─────────────┐
              │             │
              │ Response    │
              │             │
              └─────────────┘
```

### 2.3 Agent Workflow

```
┌────────────────┐
│                │
│   User Query   │
│                │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│                │
│   LangGraph    │
│    Agent       │
│                │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│  Tool needed?  │
└───────┬────────┘
        │
   ┌────┴─────┐
   │          │
   ▼          ▼
┌─────┐    ┌─────┐
│ Yes │    │ No  │
└──┬──┘    └──┬──┘
   │          │
   ▼          │
┌─────────────┐ │
│ Tool        │ │
│ Selection   │ │
└──────┬──────┘ │
       │        │
       ▼        ▼
┌──────────┐ ┌──────────┐
│ Execute  │ │ Generate │
│ Tool     │ │ Response │
└────┬─────┘ └─────┬────┘
     │             │
     │             │
     └─────┬───────┘
           │
           ▼
    ┌─────────────┐
    │ Stream      │
    │ Response    │
    └─────────────┘
```

## 3. Integration Points

### 3.1 External Service Integrations

| Service     | Purpose                             | Integration Method                       |
|-------------|-------------------------------------|------------------------------------------|
| OpenAI      | LLM provider for text generation    | API calls via LangChain.js wrappers     |
| Supabase    | Vector database for RAG             | API calls via SupabaseVectorStore class |
| SerpAPI     | Web search capability for agents    | API calls via SerpAPI tool class        |

### 3.2 Key Internal Integration Points

#### Frontend to API
- **Vercel AI SDK**: Handles streaming from API to UI
- **HTTP Headers**: For metadata exchange (sources, message indexes)
- **JSON Serialization**: For non-streaming data exchange

#### API to LangChain
- **Direct Function Calls**: API routes directly instantiate and use LangChain components
- **Config Injection**: Environment variables passed to LangChain classes
- **Event Handling**: Callbacks for tracking agent steps

#### LangChain to External Services
- **LangChain Wrappers**: Classes that abstract API calls to external services
- **Streaming Interfaces**: For token-by-token streaming from LLMs
- **Tool Interfaces**: Standardized interfaces for external tools

## 4. Customization Points

The architecture provides several key points for customization to extend the Todo List agent:

1. **Prompt Templates**: Modify the system prompts to change agent behavior
2. **Tool Integration**: Add custom tools for task management functionality
3. **Custom Chains**: Create specialized chains for specific todo operations
4. **Vector Store**: Replace or enhance the RAG system for task knowledge
5. **UI Components**: Extend the UI for todo-specific functionality

## 5. Implementation Considerations

### 5.1 Performance Optimization

- **Edge Functions**: Deployed close to users for lower latency
- **Streaming Responses**: Immediate feedback to user inputs
- **Chunked Processing**: Document splitting for efficient embedding

### 5.2 Security Considerations

- **Environment Variables**: Secure storage for API keys
- **Server-Side API Calls**: No exposure of API keys to client
- **Input Validation**: Sanitizing user inputs before processing

### 5.3 Scalability Aspects

- **Serverless Architecture**: Auto-scaling with demand
- **Stateless API Handlers**: No server-side session state
- **External Vector Store**: Separate scaling for document storage

This architecture document provides a detailed view of how the TodoList-Agent is structured, how data flows through the system, and how the various components integrate with each other. 