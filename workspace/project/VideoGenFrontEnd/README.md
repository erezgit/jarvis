# Video Generation Application

## Environment Configuration

This application requires the following environment variables to be set:

### API Configuration
- `VITE_API_URL`: The URL of the API server
- `VITE_WS_URL`: The WebSocket URL of the API server

### Supabase Configuration
- `VITE_SUPABASE_URL`: The URL of your Supabase project
- `VITE_SUPABASE_ANON_KEY`: The anonymous key for your Supabase project

You can copy the `.env.example` file to `.env` and update the values with your actual configuration.

```bash
cp .env.example .env
```

## Development

To start the development server:

```bash
yarn dev
```

## Building for Production

To build the application for production:

```bash
yarn build
```

## Environment Validation

The application validates all required environment variables at startup. If any required variables are missing, the application will display an error message and fail to start.

## Running React on Replit

[React](https://reactjs.org/) is a popular JavaScript library for building user interfaces.

[Vite](https://vitejs.dev/) is a blazing fast frontend build tool that includes features like Hot Module Reloading (HMR), optimized builds, and TypeScript support out of the box.

Using the two in conjunction is one of the fastest ways to build a web app.

### Getting Started
- Hit run
- Edit [App.jsx](#src/App.jsx) and watch it live update!

By default, Replit runs the `dev` script, but you can configure it by changing the `run` field in the [configuration file](#.replit). Here are the vite docs for [serving production websites](https://vitejs.dev/guide/build.html)

### Typescript

Just rename any file from `.jsx` to `.tsx`. You can also try our [TypeScript Template](https://replit.com/@replit/React-TypeScript)