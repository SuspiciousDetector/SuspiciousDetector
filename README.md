# SuspiciousDetector

Command line application to detect suspicious behavior in an integrated GitHub organization.

## Prerequisites

- Node.js (v17.5 or later)
- npm (usually comes with Node.js)
- Git

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/SuspiciousDetector/SuspiciousDetector.git
   cd SuspiciousDetector
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Configuration

1. Edit `config.yml` to set your desired port and smee url:
   ```yaml
   server:
     port: 3000

   smee:
     url: 'https://smee.io/your_smee_url'
   ```

## Building the Application

To build the TypeScript code into JavaScript, run:

```
npm run build
```

This will create a `dist` folder with the compiled JavaScript files.

## Running the Application

### For Production

To run the application in production mode:

```
npm start
```

### For Development

To run the application in development mode with hot reloading:

```
npm run dev
```

## Setting Up GitHub Webhooks

1. Go to your GitHub organization's settings.
2. Navigate to Webhooks > Add webhook.
3. Generate smee.io webhook url (bridge to your localhost) via https://smee.io service.
4. Set the Payload URL to the generated url from step 3.
5. Set Content type to `application/json`.
6. Select the events you want to monitor (Repositories, Pushes, Teams), or just to choose 'Send me everything'.
7. Save the webhook.