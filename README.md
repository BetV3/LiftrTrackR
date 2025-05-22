# LiftrTrackR

LiftrTrackR is a comprehensive workout tracking application designed for weightlifters to monitor their progress, identify plateaus, and analyze their performance across multiple gyms.

## Features

- **Workout Logging**: Track sets, reps, and weight for various lifts
- **Gym Management**: Add and manage gyms with location data
- **Leaderboards**: View top performers at each gym for specific lifts
- **Progress Charts**: Visualize your progress with 1RM and volume charts
- **Plateau Detection**: Get alerts when your progress stalls (via PlateauBreaker service)

## Project Structure

```
LiftrTrackR/
├── api/                # Node.js Express backend
│   ├── src/
│   │   ├── config/     # Database and app configuration
│   │   ├── controllers/ # API route handlers
│   │   ├── middleware/ # Auth and validation middleware
│   │   ├── models/     # TypeORM entities
│   │   ├── routes/     # API route definitions
│   │   ├── migrations/ # Database migrations
│   │   └── utils/      # Helper functions
│   └── ...
├── frontend/           # React frontend
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── services/   # API client services
│   │   └── utils/      # Helper functions
│   └── ...
├── services/           # Microservices
│   ├── plateaubreaker/ # Python service for detecting plateaus
│   └── ...
└── docker-compose.yml  # Docker configuration
```

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- Python 3.11+ (for local development of services)

### Installation and Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/LiftrTrackR.git
   cd LiftrTrackR
   ```

2. Start the application using Docker Compose:
   ```bash
   docker-compose up
   ```

3. The application will be available at:
   - Frontend: http://localhost
   - API: http://localhost:3000
   - PlateauBreaker service: http://localhost:5000
   - RabbitMQ Management: http://localhost:15672 (guest/guest)

### Local Development

#### API (Node.js)

```bash
cd api
npm install
npm run dev
```

#### Frontend (React)

```bash
cd frontend
npm install
npm start
```

#### PlateauBreaker Service (Python)

```bash
cd services/plateaubreaker
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user

### Workouts
- `POST /api/workouts` - Log a new workout
- `GET /api/workouts` - Get workouts with pagination and filtering

### Gyms
- `POST /api/gyms` - Create a new gym
- `GET /api/gyms` - Get all gyms
- `GET /api/gyms/:id` - Get gym by ID
- `PUT /api/gyms/:id` - Update a gym
- `DELETE /api/gyms/:id` - Delete a gym
- `GET /api/gyms/:gym_id/leaderboard` - Get gym leaderboard for a specific lift

### PlateauBreaker
- `GET /api/plateau-check` - Check if a user has plateaued in a specific lift

## Architecture

LiftrTrackR uses a microservices architecture:

1. **Core API** (Node.js/Express): Handles authentication, workout logging, and gym management
2. **PlateauBreaker** (Python/Flask): Analyzes workout data to detect plateaus
3. **Frontend** (React): Provides the user interface

Communication between services happens via:
- Direct API calls for synchronous operations
- RabbitMQ for asynchronous events (e.g., workout creation triggering plateau analysis)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.