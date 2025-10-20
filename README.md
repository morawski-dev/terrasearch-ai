# TerraSearch AI

## Overview

Terra Search AI is an AI-powered conversational search platform designed to enhance Earth Observation data discovery and access. The application leverages Large Language Models (LLMs) and Retrieval-Augmented Generation (RAG) to provide intuitive, context-aware search capabilities for Global Earth Monitoring System data.

### Key Features

- **Conversational AI Interface**: Natural language question-answering with context-aware responses
- **RAG Architecture**: Combines vector similarity search with LLM reasoning for accurate, grounded answers
- **Session-Based Chat**: Maintains conversation history with context carryover across questions
- **Multi-Source Attribution**: Tracks and displays data sources for each response
- **Security Features**: Input sanitization, rate limiting, and sensitive data redaction
- **Monitoring & Observability**: Integrated Langfuse tracing and LangChain monitoring
- **LLM Response Caching**: Redis-based caching to reduce API costs and improve response times