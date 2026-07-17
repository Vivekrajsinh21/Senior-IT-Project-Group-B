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
2 June 2026: ssh key, Webhook&Github and command 
  1. SSH Key Authentication (Passwordless Login)
     - Configured a secure method to access remote servers or Git repositories without typing a password every time.
     - Generated a cryptographic key pair consisting of a private key (kept secure on your local machine) and a public key (uploaded to the server or GitHub).
     - Enhances security against brute-force attacks while streamlining your workflow.
  2. Webhooks & GitHub Integration
     - Set up automated communication between GitHub and external services.
     - Configured GitHub to send real-time HTTP POST payloads (events) to a specific server URL whenever an action occurs (e.g., a code push or pull request).
     - Enables Automation and Continuous Integration (CI/CD), allowing your server to automatically pull code or trigger builds the moment you update GitHub.
  3. Docker Commands via Terminal
    - Learned how to manage containerized applications directly from the command line.
    - Mastered running, stopping, and managing Docker containers using the terminal.
    - Provides full control over your development and production environments, ensuring applications run consistently across different machines.
---------------------------------------------------------------------------------------------
8 June 2026: Webhook Integration and GitHub Automation
  - Learned the fundamentals of webhooks and how they enable communication between GitHub and a remote server.
  - Studied how GitHub webhooks can automatically trigger actions when code is pushed to a repository.
  - Configured a webhook listener on the server to receive and process incoming GitHub events.
  - Explored the structure and purpose of the hooks.json configuration file.
  - Learned how webhook endpoints are defined and how commands are executed when specific events occur.
  - Tested webhook functionality by pushing code changes to GitHub and verifying that the server received the events successfully.
  - Reviewed security considerations such as webhook secrets and request validation and we got error about ssl.
---------------------------------------------------------------------------------------------
9 June 2026: Webhook Integration and GitHub Automation
  - Server Configuration and Deployment Automation
  - Learned how to configure and manage application services using docker-compose.yml.
  - Studied the roles of containers, images, networks, volumes, and environment variables within Docker Compose.
  - Reviewed how multiple services can communicate through a shared Docker network.
  - Learned how deployment automation is implemented using a deploy.sh script.
  - Configured deployment steps such as pulling the latest code, rebuilding containers, and restarting services.
  - Integrated GitHub webhooks with deployment scripts to enable automatic deployment after code updates.
  - Practiced troubleshooting deployment issues by checking logs, container status, and configuration files.
  - Gained a better understanding of the overall CI/CD workflow, from code commit in GitHub to automated deployment on the server.
  - we can reslove error about ssl by changing code in deploy.sh and url on Github
---------------------------------------------------------------------------------------------
16 June 2026: Keycloak and Authentication
  - Learned how to deploy and manage Keycloak using Portainer.
  - Configured Keycloak as an Identity and Access Management (IAM) solution.
  - Created and managed realms, clients, and users within Keycloak.
  - Configured authentication settings for Langflow to require users to log-in before accessing the application.
  - Integrated Langflow with Keycloak for centralized user authentication.
  - Learned how to set environment variables and application settings related to authentication.
  - Tested the login flow to verify that unauthorized users are redirected to the Keycloak login page.
  - Gained practical experience in securing AI applications with enterprise-style authentication mechanisms.
  ---------------------------------------------------------------------------------------------
22 June 2026: Midterm Presentation
  - ApexTrainer is an AI-powered platform that combines workout tracking, nutrition, goals, reports, and user profiles in one connected system.
  - The project uses React, Node.js, PostgreSQL, Langflow, MCP tools, Docker, Caddy, and external nutrition APIs.
  - A working prototype has been deployed with core features such as login, workout logging, food tracking, water tracking, and AI assistance.
  - The current focus is improving Langflow–MCP integration, authentication, API security, testing, and personalized AI recommendations.
  - Future development includes wearable integration, meal-photo recognition, recovery advice, smarter analytics, and AI-generated workout plans.
  ---------------------------------------------------------------------------------------------
23 June 2026: Present our system to classmates and Learning about VPN
  - Presented the ApexTrainer project and received feedback from classmates after they tested the system.
  - Explored and evaluated other groups' projects, including SafePath, MDH BookStack, Wazuh CTI, and PitSenseAI.
  - Discussed different approaches and features used in other teams' systems to gain new ideas for improving ApexTrainer.
  - Learned about VPN technologies and their role in securing production environments.
  - Studied how to use WireGuard VPN to protect internal services such as Langflow, Portainer, SSH, and databases while keeping the main website publicly accessible.
  - Learned how to restrict access to administrative tools through VPN-only connections to improve system security and reduce the attack surface.
  ---------------------------------------------------------------------------------------------
29 June 2026: – VPN Study and Planning
  - Studied the purpose of VPNs in protecting internal project services.
  - Compared three VPN solutions: WireGuard, OpenVPN, and Headscale.
  - Selected WireGuard because it is lightweight, fast, modern, and suitable for Docker-based deployment.
  - Planned the network separation between public and private services.
  - Defined the public service:
    - https://apextrainer.duckdns.org/
  - Defined the VPN-only services:
    - https://portainer.apextrainer.duckdns.org
    - https://langflow.apextrainer.duckdns.org
  - Reviewed the client-to-server VPN connection and the default WireGuard UDP port 51820.
  - Planned to use Caddy as the reverse proxy for domain routing and access control.
  ---------------------------------------------------------------------------------------------
30 June 2026 – WireGuard Installation and Testing
  - Installed WireGuard as a Docker container on the project server.
  - Created WireGuard client configuration files for team members.
  - Imported the WireGuard configuration into the client device.
  - Tested the VPN connection and confirmed that the client could reach the VPN server.
  - Configured Caddy to allow access to Portainer and Langflow only from the VPN network.
  - Confirmed that users without a VPN connection receive a “VPN access required” message.
  - Confirmed that Portainer and Langflow are accessible after connecting to WireGuard.
  - Kept the main ApexTrainer website publicly accessible through the normal internet.
  - Final access design:
    - Public Internet: https://apextrainer.duckdns.org/
    - VPN Only: https://portainer.apextrainer.duckdns.org
    - VPN Only: https://langflow.apextrainer.duckdns.org
  ---------------------------------------------------------------------------------------------
6 July 2026 – Integrating Langflow with Langfuse
  - Learned how to integrate Langflow with Langfuse for AI monitoring.
  - Configured Langflow to send conversation traces to Langfuse.
  - Connected the application using Langfuse API credentials.
  - Verified that user interactions were successfully logged.
  - Understood how Langfuse tracks:
    - User prompts
    - AI responses
    - Execution traces
    - Workflow performance
  - Tested the integration by sending sample prompts from the AI assistant.
  - Learned the importance of observability for AI applications.
  ---------------------------------------------------------------------------------------------
13 July 2026 – Monitoring and Analyzing AI Conversations
  - Explored the Langfuse dashboard for monitoring AI interactions.
  - Learned how to analyze conversation history and execution traces.
  - Monitored key performance indicators, including:
    - Response quality
    - Token usage
    - Request latency
  - Model execution time
  - Learned how Langfuse helps identify workflow failures and unexpected AI responses.
  - Used trace information to debug AI workflows more effectively.
  ---------------------------------------------------------------------------------------------
14 July 2026 – Connecting Langflow with the ApexTrainer Website
  - Learned how to integrate the ApexTrainer website with Langflow.
  - Configured the frontend and backend to communicate with Langflow using its API Key.
  - Implemented secure authentication for API requests between ApexTrainer and Langflow.
  - Connected user prompts from the ApexTrainer chat interface to Langflow.
  - Configured Langflow so that all prompts and AI responses were automatically forwarded to Langfuse for monitoring.
  - Verified that conversations initiated from the ApexTrainer website were successfully logged in the Langfuse dashboard.
  - Learned how Langflow acts as the middleware between the web application and the AI workflow.
  - Understood the complete architecture:
    - User submits a question on the ApexTrainer website.
    - The request is sent to Langflow using the API Key.
    - Langflow processes the AI workflow.
    - Conversation traces are automatically recorded in Langfuse.
    - The AI response is returned to the ApexTrainer website.
  - Tested the end-to-end integration to ensure the AI assistant, Langflow, and Langfuse worked together correctly.
  ---------------------------------------------------------------------------------------------
