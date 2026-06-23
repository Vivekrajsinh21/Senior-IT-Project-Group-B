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

# 27 may 2026 : implementing of mcp
* Learned the fundamentals of MCP (Model Context Protocol) Server and its role in connecting AI models with external tools.
* Explored the architecture and workflow of MCP Server, including request and response handling.
* Understood how MCP standardizes communication between AI applications and external systems.
* Practiced setting up and running an MCP Server environment.
* Studied how AI agents can dynamically access and utilize MCP tools.
* Explored the benefits of MCP for building scalable and modular AI solutions.
* Discussed the use of MCP in intelligent workflow automation and system integration.
* Investigated the integration of MCP Server with AI platforms such as Langflow.
* Gained hands-on experience in understanding MCP-based tool connectivity and orchestration.

* # 1 June 2026: DNS, Webhooks, and Passwordless Authentication

* **Dynamic DNS & Server Configuration:** Configured a server and mapped it to a custom domain using Dynamic DNS (DDNS) services such as Dynv6 and DuckDNS, enabling reliable remote access despite changing public IP addresses.

* **Webhook Integration:** Implemented webhooks to facilitate automated, real-time communication between applications, enabling event-driven workflows and seamless system integration.

* **Passwordless SSH Authentication:** Set up secure passwordless SSH access by generating and configuring public/private SSH key pairs, improving both security and convenience for remote server management.

* # 2 June 2026 – SSH Keys, GitHub Webhooks & Docker
. Configured SSH key authentication for secure passwordless access to servers and GitHub repositories.

. Generated and managed public/private key pairs to improve security and streamline workflows.

. Set up GitHub webhooks to trigger automated actions on server-side events such as code pushes and pull requests.

. Learned Docker terminal commands for managing containers, including running, stopping, and monitoring containerized applications.

. Gained practical experience with automation, CI/CD workflows, and container management.

## 8 June 2026 – Webhook Integration & GitHub Automation

* Learned the basics of GitHub webhooks and how they enable automated communication between GitHub and a remote server.
* Configured a webhook listener to receive GitHub events triggered by repository updates.
* Explored the `hooks.json` configuration file and understood how webhook endpoints execute commands based on specific events.
* Tested webhook functionality by pushing code changes and verifying event delivery to the server.
* Investigated SSL-related issues encountered during webhook setup and learned the importance of proper SSL certificate configuration.
* Reviewed security concepts including webhook secrets and request validation.

* ## 9 June 2026 – Deployment Automation & SSL Issue Resolution

* Learned how to configure and manage services using `docker-compose.yml`.
* Studied Docker components including containers, images, networks, volumes, and environment variables.
* Explored how multiple services communicate through a shared Docker network.
* Learned deployment automation using a `deploy.sh` script to pull code, rebuild containers, and restart services.
* Integrated GitHub webhooks with deployment scripts for automatic deployments after code updates.
* Resolved an SSL-related webhook issue by modifying the deployment script and updating the webhook URL configuration in GitHub.
* Practiced troubleshooting deployment problems using logs, container status checks, and configuration reviews.
* Gained a better understanding of the CI/CD workflow from GitHub commits to automated server deployment.

## 22 June 2026: Midterm Presentation

ApexTrainer is an AI-powered fitness platform that brings workout tracking, nutrition monitoring, goal management, progress reports, and user profiles into one connected system.

The project is built using React, Node.js, PostgreSQL, Langflow, MCP tools, Docker, Caddy, and external nutrition APIs.

A working prototype has already been deployed with core features such as user login, workout logging, food tracking, water tracking, and AI-based assistance.

The current development focus is on improving Langflow–MCP integration, strengthening authentication, enhancing API security, testing the system, and building more personalized AI recommendations.

Future improvements include wearable device integration, meal-photo recognition, recovery guidance, advanced analytics, and AI-generated workout plans.

## 23 June 2026:  VPN Architecture

During today’s session, we presented the current ApexTrainer prototype, including login, workout logging, food tracking, water tracking, dashboard features, and AI assistance. We also discussed the project with other teams and received feedback on the user experience and feature flow. Some users signed up and tested the platform, which helped us understand how real users interact with the application.

We also studied how VPN-based architecture can improve our project security. We focused on WireGuard as a secure access layer. In a real deployment, ApexTrainer can run on a remote server using Docker Compose, while developers connect through WireGuard VPN to access internal services such as the backend API, PostgreSQL database, Langflow, admin tools, and monitoring tools.

Proposed architecture:

```text
Developer Laptop
      ↓ WireGuard VPN Tunnel
Project Server
      ↓ Docker Network
Frontend / Backend API / PostgreSQL / Langflow / Caddy
```

After connecting to WireGuard, the developer laptop receives a private VPN IP and can access the project through the server’s private VPN IP. This helps keep internal services private and accessible only to authorized developers.

Current focus areas:

* Improve Langflow and MCP tool integration
* Strengthen authentication and API security
* Test signup and login flow
* Improve dashboard user experience
* Explore secure deployment using WireGuard VPN
* Add personalized AI recommendations

Future improvements include wearable integration, meal-photo recognition, recovery advice, smarter analytics, and AI-generated workout plans.






