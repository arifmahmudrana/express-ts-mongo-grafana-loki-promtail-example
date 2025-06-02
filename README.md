# Express TypeScript MongoDB with Grafana Logging

A complete example application demonstrating Express.js with TypeScript, MongoDB, and log visualization using Grafana, Loki, and Promtail using winston.

## Features

- **Express.js with TypeScript**: RESTful API with proper TypeScript typing
- **MongoDB**: Database integration with Mongoose
- **Winston Logging**: Structured logging with multiple transports
- **Grafana**: Log visualization and monitoring
- **Loki**: Log aggregation and storage
- **Promtail**: Log collection agent
- **Docker Compose**: Complete containerized setup

## Quick Start

1. **Start the Application**
   ```bash
   docker-compose up
   ```

2. **Wait for Services to Start**
   ```bash
   # Check if all services are running
   docker-compose ps
   ```

## Access Points

- **Express API**: http://localhost:3000
- **Grafana Dashboard**: http://localhost:3001 (admin/admin123)
- **MongoDB**: localhost:27017 (admin/password123)
- **Loki**: http://localhost:3100

## API Endpoints

### GET /
Returns a hello world message with timestamp.

```bash
curl http://localhost:3000/
```

### GET /health
Health check endpoint showing server status.

```bash
curl http://localhost:3000/health
```

### POST /users
Create a new user.

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'
```

### GET /users
Get all users.

```bash
curl http://localhost:3000/users
```

## Grafana Setup

1. **Access Grafana**: http://localhost:3001
2. **Login**: admin/admin123
3. **Data Source**: Loki is pre-configured
4. **Create Dashboard**:
   - Go to Dashboards → New → New Dashboard
   - Add a new panel
   - Select Loki as data source
   - Use queries like:
     - `{job="express-app"}` - All app logs
     - `{job="express-app", level="ERROR"}` - Error logs only
     - `{job="docker", container_name="express-app"}` - Docker logs

## Example Log Queries

### View All Application Logs
```
{job="express-app"}
```

### View Error Logs Only
```
{job="express-app", level="ERROR"}
```

### View API Request Logs
```
{job="express-app"} |= "Incoming request"
```

### View User Creation Logs
```
{job="express-app"} |= "New user created"
```

## Project Structure

```
├── src/
│   ├── index.ts          # Main Express application
│   └── logger.ts         # Winston logger configuration
├── grafana/
│   └── provisioning/     # Grafana configuration
├── logs/                 # Application log files
├── docker-compose.yml    # Docker services configuration
├── Dockerfile           # Express app container
├── loki-config.yaml     # Loki configuration
├── promtail-config.yaml # Promtail configuration
├── package.json         # Node.js dependencies
└── tsconfig.json        # TypeScript configuration
```

## Troubleshooting

### Services Not Starting
```bash
# Check service logs
docker-compose logs <service-name>

# Restart services
docker-compose restart
```

### Grafana Can't Connect to Loki
1. Check if Loki is running: `docker-compose ps`
2. Check Loki logs: `docker-compose logs loki`
3. Verify network connectivity between containers

### No Logs in Grafana
1. Check Promtail logs: `docker-compose logs promtail`
2. Verify log files are being created in `/logs` directory
3. Check Promtail configuration paths

### MongoDB Connection Issues
1. Check MongoDB logs: `docker-compose logs mongodb`
2. Verify connection string in environment variables
3. Ensure MongoDB is fully started before the app

## Cleanup

```bash
# Stop all services
docker-compose down

# Remove volumes (WARNING: This deletes all data)
docker-compose down -v

# Remove images
docker-compose down --rmi all
```
