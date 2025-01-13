# BoardBlitz - Multiplayer Chess Game Server

BoardBlitz is a robust, real-time multiplayer chess game server built with modern technologies and best practices. This server powers the online chess gaming experience with features like real-time gameplay, user authentication, and game state management.

## 🛠 Tech Stack

- **Backend Framework**: Express.js with TypeScript
- **Real-time Communication**: Socket.IO
- **Database**: PostgreSQL
- **Cloud Infrastructure**: 
  - Amazon Q Developer Pro (Generative AI)
  - Amazon EC2 (Server Hosting)
  - Amazon S3 (File Storage - Used on client)
  - Amazon RDS (Postgres Database)
- **Authentication**: Session-based with express-session
- **Game Logic**: chess.js
- **Logging**: Pino
- **Security**: Helmet, Rate Limiting, XSS Protection

## 🚀 Local Setup

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- npm or yarn
- Git

### Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/lucky-chap/boardblitz-server.git
   cd boardblitz-server
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a .env file in the root directory with the following variables:
   ```env
   NODE_ENV=development
   PORT=8000
   
   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/boardblitz
   
   # Session
   SESSION_SECRET=your_session_secret
   
   # AWS (for local development, you can use mock values)
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=your_region
   S3_BUCKET_NAME=your_bucket_name
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

The server will start at http://localhost:8000

## 🌐 Production Deployment (AWS)

### Prerequisites

- AWS Account
- Domain Name (optional)
- SSH Key Pair

### AWS Setup Steps

1. **EC2 Instance Setup:**
   - Launch an EC2 instance (recommended: t2.micro for testing, t2.small/medium for production)
   - Choose Ubuntu Server 22.04 LTS
   - Configure Security Group to allow:
     - SSH (Port 22)
     - HTTP (Port 80)
     - HTTPS (Port 443)
     - Custom TCP (Port 8000)

2. **Configure PostgreSQL:**
   - Install PostgreSQL on EC2 or use Amazon RDS
   - Create database and user
   - Note down connection details

3. **S3 Bucket Setup:**
   - Create a new S3 bucket
   - Configure CORS if needed
   - Set up IAM user with appropriate permissions

4. **Deploy Application:**
   ```bash
   # SSH into your EC2 instance
   ssh -i your-key.pem ubuntu@your-ec2-ip

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Clone repository
   git clone https://github.com/lucky-chap/boardblitz-server.git
   cd boardblitz-server

   # Install dependencies
   npm install

   # Setup environment variables
   nano .env
   # Add production environment variables

   # Build application
   npm run build

   # Start server using PM2
   npm install -g pm2
   pm2 start dist/index.js --name boardblitz
   pm2 save
   ```

5. **SSL Setup (Optional):**
   ```bash
   # Install Certbot
   sudo apt-get update
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx
   ```

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| NODE_ENV | Environment (development/production) | Yes |
| PORT | Server port | Yes |
| DATABASE_URL | PostgreSQL connection string | Yes |
| SESSION_SECRET | Secret for session encryption | Yes |
| AWS_ACCESS_KEY_ID | AWS access key | Yes |
| AWS_SECRET_ACCESS_KEY | AWS secret key | Yes |
| AWS_REGION | AWS region | Yes |
| S3_BUCKET_NAME | S3 bucket name | Yes |

## 🏗 Project Structure

```
src/
├── api/          # API routes and controllers
├── common/       # Shared utilities and middleware
├── db/           # Database configuration and delegates
├── socket/       # Socket.IO event handlers
├── index.ts      # Application entry point
└── server.ts     # Express server setup
```

## 🧪 Testing

Run tests using:
```bash
npm test
# or
yarn test
```

## 🛡 Security Features

- CORS protection
- Rate limiting
- Helmet security headers
- XSS protection
- Session security

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
