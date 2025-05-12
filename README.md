# AgentDock

AgentDock is a Model Context Protocol (MCP) server with a clean UI to register, manage, and interact with intelligent agents. It enables multi-agent orchestration, tool integrations (e.g., GitHub, Slack, Jira), and LLM-powered interactions via Groq.

## Features

- **MCP-Compatible Agent Server**: Implement the Model Context Protocol standard for agent interactions
- **Multi-Agent Support**: Register and manage multiple specialized agents
- **Tool Integrations**: Connect with GitHub, Slack, Jira, and more
- **Natural Language Interface**: Interact with agents using Groq LLM
- **Clean UI**: Modern React frontend with Material UI
- **Modular Architecture**: Easily extend with new integrations
- **Monitoring & Logs**: Track agent activities and system logs

## Architecture

```
AgentDock/
├── backend/                # Node.js MCP server
│   ├── server/             # Core MCP server implementation
│   ├── agents/             # Multi-agent support
│   ├── tools/              # Tool integrations
│   └── api/                # REST API
├── frontend/               # React frontend with Material UI
├── docker/                 # Docker configuration
└── docs/                   # Documentation
```

## Prerequisites

- Node.js 16+ and npm
- Docker and Docker Compose
- Groq API key (for LLM capabilities)
- API tokens for tool integrations (GitHub, Slack, Jira)

## Installation

### Using Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/AgentDock.git
   cd AgentDock
   ```

2. Create a `.env` file in the root directory with your API keys:
   ```
   # Server Configuration
   PORT=3001
   LOG_LEVEL=info
   
   # Groq Configuration
   GROQ_API_KEY=your_groq_api_key
   GROQ_MODEL=llama-3.1-8b-instant
   
   # Tool Integrations (Optional)
   GITHUB_TOKEN=your_github_token
   SLACK_TOKEN=your_slack_token
   JIRA_HOST=https://your-domain.atlassian.net
   JIRA_USERNAME=your_email@example.com
   JIRA_API_TOKEN=your_jira_api_token
   ```

3. Build and start the Docker containers:
   ```bash
   docker-compose up -d
   ```

4. Access the web interface at: `http://localhost:3000`

### Manual Setup

#### Backend

1. Navigate to the backend directory:
   ```bash
   cd AgentDock/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the same content as in the Docker installation.

4. Build and start the server:
   ```bash
   npm run build
   npm start
   ```

#### Frontend

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd AgentDock/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Access the web interface at: `http://localhost:3000`

## Usage

### Managing Agents

1. Navigate to the "Agents" page.
2. Click "Add Agent" to create a new agent.
3. Provide a name, description, and select the tools the agent can use.
4. Toggle the "Enabled" switch to activate the agent.

### Tool Integrations

1. Navigate to the "Tools" page.
2. Select the integration tab (GitHub, Slack, or Jira).
3. Configure API credentials for each integration.
4. Save settings to enable the integration.

### Interacting with Agents

1. Navigate to the "Chat" page.
2. Select an agent from the dropdown or use the general chat.
3. Type your query and press Enter or click the send button.
4. View the agent's response in the chat window.

### Monitoring Activity

1. Navigate to the "Logs" page to view query history and system logs.
2. Use filters to search for specific information.
3. View detailed logs for troubleshooting.

## Development

### Project Structure

- `backend/src/server/`: MCP server implementation
- `backend/src/agents/`: Agent management logic
- `backend/src/tools/`: Tool integration implementations
- `backend/src/api/`: REST API endpoints
- `frontend/src/components/`: React components
- `frontend/src/pages/`: Page components
- `frontend/src/services/`: API service clients
- `frontend/src/context/`: React context providers

### Adding a New Tool Integration

1. Create a new file in `backend/src/tools/` for your integration.
2. Implement the required functions using the MCP SDK.
3. Register your tool in `backend/src/server/mcpServer.ts`.
4. Update the frontend to include UI elements for your tool.

### Adding a New Agent Type

1. Define the agent capabilities in `backend/src/agents/`.
2. Update the agent registration logic in the API.
3. Add UI components to support the new agent type.

## Docker Configuration

The project includes a `docker-compose.yml` file that sets up the following containers:

- `agentdock-backend`: Node.js server for the backend
- `agentdock-frontend`: React application for the frontend

Both containers are configured to restart automatically and share the necessary environment variables.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
