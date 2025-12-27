from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import load_prompt
from langchain_openai import ChatOpenAI
from langchain_core.runnables import RunnablePassthrough
from app.vector_store import retriever
from langchain_ollama.chat_models import ChatOllama

# Load Prompts
rephrase_prompt = load_prompt("prompts/rephrase-prompt.json")
answer_prompt = load_prompt("prompts/answer-prompt.json")

# Configure Chains
output_parser = StrOutputParser()

# rephrase_model = ChatOllama(base_url="http://localhost:11434", model="llama3.1:8b", temperature=0)
rephrase_model = ChatOpenAI(model="gpt-4-turbo-2024-04-09", temperature=0, max_tokens=None, max_retries=2)
rephrase_chain = rephrase_prompt | rephrase_model | output_parser

# answer_model = ChatOllama(base_url="http://localhost:11434", model="llama3.1:8b", temperature=0)
answer_model = ChatOpenAI(model="gpt-4-turbo-2024-04-09", temperature=0, max_tokens=None, max_retries=2)
answer_chain = (
        {"context": retriever, "question": RunnablePassthrough()}
        | answer_prompt
        | answer_model
        | output_parser
)

final_chain = rephrase_chain | answer_chain
