27 April 2026: Team Collaboration & Infrastructure Tools
GitHub Collaboration:
 - Learned to use GitHub for team-based development.
 - Improved skills in code management, version control (tracking changes), and workflow efficiency.
 - Docker & System Visualization:
 - Explored running systems locally on a laptop using Docker.
 - Understood how to create consistent environments for easier testing and implementation.
Automation & AI Tools:
 - n8n: Explored as a tool for building and automating complex workflows.
 - LM Studio: Studied for local AI model integration and development.
Tool Selection:
 - Gained a better understanding of how to evaluate and combine different tools to build effective project architectures.
---------------------------------------------------------------------------------------------

28 April 2026: Containerization & Multi-Container Management
Docker Fundamentals:
 - Defined Docker as a platform that packages and runs applications inside isolated containers.
Docker Compose:
 - Learned to use Docker Compose to orchestrate multiple containers (e.g., connecting a web app to a database) simultaneously.
 - Practical Implementation:
 - Successfully deployed OpenMRS (Medical Record System) alongside a MySQL database.
 - Demonstrated the efficiency of using a single command (docker-compose up) to spin up an entire application stack.
---------------------------------------------------------------------------------------------

4 May 2026: Connecting FastAPI with Local Tools using Docker
Moving FastAPI into Docker:
 - Learned how to take a Python FastAPI project and run it inside a Docker container.
 - Successfully set up a Dockerfile and Docker Compose to manage the project automatically.
Solving the Localhost:
 - Understood that localhost inside Docker is different from localhost on my laptop.
 - Learned how to bridge the gap so that the code running inside Docker can talk to AI tools (like LM Studio) already running on my laptop.
 - Learned how to properly refresh and "rebuild" the system after making changes to the code.
Testing via Swagger:
 - Successfully opened the interactive API page (Swagger UI) in the browser to test that the system was working correctly.
Planning the Fitness AI Project:
 - Began designing a personal fitness AI advisor that runs entirely through these tools.
 - Mapped out how the different parts (the screen, the brain, and the AI) will talk to each other to give fitness advice.
 - tools that is recommendation from professor
   - https://hub.docker.com/r/aronwk/wger 
   - https://hub.docker.com/r/ennoluto/workout-tracker
   - https://github.com/CodeWithCJ/SparkyFitness
---------------------------------------------------------------------------------------------

11 May 2026: Project management update

  Our group discussed and updated the progress of our AI Fitness Application project. We reviewed the overall project direction, system planning, and development preparation.
- Learned how to set up the development environment using GitHub and Visual Studio Code
- Explored the structure of the existing fitness application project
- Discussed how AI features can improve the fitness application experience
- Learned the basic system architecture of mobile app, backend server, database, and AI integration
- Planned the overall development workflow and project structure for the mid semester presentation

Completed Tasks for doing mid-term presentation
 - Group members finalized
 - Vision statement completed
 - Persona design completed
 - User scenarios completed
 - Architecture Design using Docker Compose
 - User stories planning
 - Application feature planning
 - Sprint timetable and project schedule
---------------------------------------------------------------------------------------------

12 May 2026: How to implement our project by Langflow
- Learned how to run Langflow
- locally on a laptop using Docker and Langflow.
- Practiced using Docker commands to start and manage Langflow containers.
- Learned how port mapping works in Docker, especially when running Langflow on port 7860.
- Understood how to access Langflow through a local browser using localhost.
- Explored how local AI services such as Ollama and LiteLLM can connect with Langflow.
- Learned how Docker containers communicate with services running on the host machine.
- Practiced troubleshooting Docker issues such as “port already allocated” errors.
- Learned how to stop, restart, and manage running Docker containers using terminal commands.
- Gained hands-on experience building and testing AI workflows directly on a personal laptop environment.
---------------------------------------------------------------------------------------------

18 May 2026: How to implement our project by Langflow (2)
1. Data Ingestion & Web Scraping
   - Targeting URLs: Learned how to point an AI pipeline to specific web links to fetch live or unstructured content recursively using depth controls.
   - Data Structuring: Discovered how to take raw webpage content and convert/clean it using table operations or data structuring components.
2. Text Processing & Chunking
   - Text Splitting: Learned that LLMs have context limits, requiring long web articles to be broken down into smaller, digestible blocks (Chunk Size).
   - Context Retention: Understood the importance of Chunk Overlap to ensure critical information isn't cut in half between two chunks.
3. Vector Databases & Embeddings
   - Vector Embeddings: Learned how to use embedding models (like Qwen/Ollama/DeepSeek) to convert text chunks into numerical vectors that capture the semantic meaning of the words.
   - Vector Storage: Discovered how to save these vectors into a specialized database (like Chroma DB) so the AI can perform lightning-fast semantic searches later.
4. API Creation & Model Integration
   - Connecting Local Models: Learned how to hook up your processed database to powerful open-source models like Ollama and DeepSeek.
   - Exposing the Pipeline: Understood how to turn this entire visual flow into a functional API endpoint, allowing other applications to send questions, search your database, and get AI-generated answers based on your collected data.
---------------------------------------------------------------------------------------------

19 May 2026: Connecting langflow with our projects
   - Reviewed and updated project progress with the team.
   - Finalized the group members and confirmed the vision statement.
   - Discussed and designed the initial system architecture using Docker Compose.
   - Completed persona and scenario preparation for the project.
   - Continued defining user stories and identifying key system features.
   - Worked on connecting an LLM to an external application workflow using Langflow.
   - Explored API integration concepts and tested API connectivity using Postman.
   - Learned how authentication and session handling work when connecting services.
   - Investigated how to configure API requests and connect tools within Langflow.
   - Planned the next development activities and sprint timeline.
---------------------------------------------------------------------------------------------
27 May 2026: MCP Server
   - Learned the basic concept of MCP (Model Context Protocol) Server.
   - Understood how MCP Server enables communication between AI models and external tools.
   - Explored the architecture and workflow of MCP Server.
   - Learned how MCP standardizes tool connections for AI applications.
   - Practiced setting up and running an MCP Server environment.
   - Understood how MCP Server handles requests and responses between systems.
   - Explored how AI agents can use MCP tools dynamically.
   - Learned the benefits of MCP for scalability and modular AI development.
   - Discussed the role of MCP in building intelligent workflow systems.
   - Improved understanding of integrating MCP Server with AI platforms such as Langflow.
---------------------------------------------------------------------------------------------
1 June 2026: DNS, Webhook and Passwordless
  1. Dynamic DNS & Server Configuration:
     - Set up a server and linked it to a domain name using Dynamic DNS (DDNS) providers like dynv6.com and DuckDNS.
  2. Webhook Integration:
     - Learned how to create and implement webhooks to enable automated, real-time communication and event triggers between different applications or systems.
  3. Passwordless SSH Authentication:
     - Configured Secure Shell (SSH) to allow secure remote logins without requiring a password, typically by generating and exchanging SSH key pairs (public and private keys).
---------------------------------------------------------------------------------------------
