## 28 April 2026: 
I learned about Docker is a platform that allows us to run applications in containers. Docker Compose helps us manage multiple containers such as a web application and a database. In this example, Google Maps (Archived) MCP Server Today I integrated and tested multiple Google Maps API tools, including directions, distance matrix, geocoding, reverse geocoding, elevation, place details, and place search functionalities to improve location-based services.


## 11th may 2026 : 
In today’s session, I worked on improving and simplifying the vision statement for the AI fitness ecosystem project and refined its structure for better clarity and presentation. I focused on rewriting complex descriptions into a clear and concise format, including the problem statement, solution overview, and product positioning. I also consolidated the full vision into a simpler paragraph and created a one-line summary of the product for quick understanding.

Along with this, I continued organizing and updating the project documentation to make it more readable and consistent for future development and review sessions. This work helped improve the overall clarity of the project idea and strengthened the communication of our core concept as an AI-powered fitness assistant


## 12th may 2026 :

Today, I worked on building an AI workflow using Langflow. In this session, I created a basic Retrieval-Augmented Generation (RAG) system.
 
For the implementation, I used ChromaDB as the vector database and integrated LiteLLM for handling model interactions. I also configured a simple URL-based data ingestion pipeline.
 
The workflow included components such as a URL parser, a prompt template, and LiteLLM integration to process and generate responses.
 
As a practical use case, I tested the system by scraping information from the MDH website. The goal was to retrieve and answer the question: “Where is MDH located?” The system successfully processed the web content and generated a relevant response based on the retrieved data


## 18 May 2026: Implementing Our Project Using Langflow 

Data Collection & Web Scraping
. Website Crawling: Learned how to configure an AI workflow to collect information from selected URLs, including recursive scraping with adjustable depth settings.

. Data Formatting: Explored methods to clean, organize, and structure raw webpage data using tables and preprocessing components.

  Text Handling & Chunk Management
. Chunking Large Text: Understood the need to divide lengthy articles into smaller sections because of LLM context limitations.

. Maintaining Context: Learned how chunk overlap helps preserve continuity so that important information is not lost between text segments.

Embeddings & Vector Databases
. Generating Embeddings: Learned to use embedding models such as Qwen, Ollama, and DeepSeek to transform text into semantic vector representations.

. Vector Storage: Explored storing these embeddings in vector databases like Chroma DB for efficient semantic search and retrieval.

API Development & Model Integration
. Integrating Local AI Models: Learned how to connect processed vector databases with local open-source models including Ollama and DeepSeek.

. Pipeline Deployment: Understood how to expose the complete Langflow pipeline as an API endpoint so external applications can query the database and receive AI-powered responses based on the collected data
