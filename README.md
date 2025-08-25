# OM Quote Generator

A professional quote generation system for Omega Morgan with AI-powered project information extraction.

## Features

- **Equipment Quote Form**: Capture project details, company information, and contact data
- **Logistics Quote Form**: Manage pickup/delivery addresses, item specifications, and service types
- **AI Extraction**: Automatically extract project information from emails and work orders using OpenAI
- **Quote Management**: Save, load, and manage quote history with Supabase backend
- **Template Generation**: Generate professional email and scope of work templates
- **HubSpot Integration**: Search and import contact information from HubSpot

## Environment Variables

For production deployment, you need to set these environment variables:

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_SUPABASE_MANUAL_KEY=your-supabase-service-role-key
```

## Deployment Instructions

### Netlify Deployment

1. **Environment Variables**: In your Netlify dashboard, go to Site settings → Environment variables and add:
   ```
   VITE_SUPABASE_URL = https://oorgoezqxexsewcwasvh.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vcmdvZXpxeGV4c2V3Y3dhc3ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTU0NzUsImV4cCI6MjA2ODI5MTQ3NX0.PLGUswNkjeNbbOOEsD7MpLuCY0HSwUMAGO3Q-IPAfjw
   ```

2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18

3. **Deploy**: Connect your Git repository or use drag-and-drop with the `dist` folder

### Other Hosting Platforms

1. Build the project: `npm run build`
2. Set the environment variables in your hosting platform
3. Deploy the `dist` folder

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   - Copy `.env.example` to `.env`
   - Update with your actual Supabase credentials

3. **Development**:
   ```bash
   npm run dev
   ```

4. **Build for Production**:
   ```bash
   npm run build
   ```

## AI Features Setup

To use the AI extraction features:

1. Get an OpenAI API key from [OpenAI's website](https://platform.openai.com/api-keys)
2. In the application, go to the API Key Setup section
3. Enter your OpenAI API key (it will be securely stored in Supabase)
4. You can then use the AI Extractor to automatically fill forms from text

## Database Schema

The application uses Supabase with the following main tables:
- `quotes`: Stores saved quotes with project and logistics data
- `temp_quote_data`: Temporary storage for AI extraction sessions
- `api_key_storage`: Secure storage for OpenAI API keys

## Security Notes

- API keys are encrypted before storage in the database
- All database operations use Row Level Security (RLS)
- Environment variables should never be committed to version control
- The anon key is safe to use in client-side code as it has limited permissions