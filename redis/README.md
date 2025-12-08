# Redis

Redis serves as a storage mechanism for maintaining chat history associated with specific search sessions. Here's a detailed breakdown of the purpose of Redis in this context:

1. Session Management:

Each search session is identified by a unique search_id. Redis stores the chat history for each session, allowing the application to retrieve and update the chat history as needed.

2. Storing Chat History:

When a new search session is initiated (start_search endpoint), a new search_id is generated, and an empty list is stored in Redis for this search_id.
When a question is asked (search endpoint), the application retrieves the chat history from Redis using the search_id, processes the question, updates the chat history with the new question and response, and then stores the updated chat history back in Redis.
If a session needs to be terminated (end_search endpoint), the application deletes the stored chat history for the given search_id from Redis.

3. Efficient Data Retrieval:

Redis is known for its speed and efficiency, making it an excellent choice for storing and retrieving chat histories in real-time applications.