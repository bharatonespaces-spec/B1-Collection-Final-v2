# BharatOne Spaces - Rent Collection App

An interactive React prototype for managing rent collection, tenant payments, and rent calculations for BharatOne Spaces.

## Features

- **Dashboard View**: Overview of total expected and collected rent
- **Tenant Management**: View all tenants and their payment status
- **Outstanding Payments**: Track and manage outstanding rent
- **Rent Calculation**: Automatic calculation with 1st-5th discount and 6th+ late fee logic
- **Payment Recording**: Record cash/digital payments with instant updates
- **Role-Based Views**: Admin (full access) and Collector (restricted view)
- **User-Friendly UI**: Modern, responsive design with blue/orange/white branding

## Repository URL

https://github.com/bharatonespaces-spec/B1-Collection-Final-v2

## Quick Start

### Option 1: Run Locally

1. **Clone the repository**
```bash
git clone https://github.com/bharatonespaces-spec/B1-Collection-Final-v2.git
cd B1-Collection-Final-v2
```

2. **Install dependencies**
```bash
npm install
```

3. **Run development server**
```bash
npm run dev
```

4. **Open in browser**
   - Navigate to http://localhost:5173
   - The app will automatically open

### Option 2: Deploy to Vercel (Recommended)

1. Visit [Vercel](https://vercel.com)
2. Click "Import Project"
3. Connect your GitHub account
4. Select this repository: `B1-Collection-Final-v2`
5. Click "Deploy"
6. Your app will be live at: `https://your-app-name.vercel.app`

### Option 3: Deploy to Netlify

1. Visit [Netlify](https://netlify.com)
2. Click "Add new site" > "Import an existing project"
3. Connect to GitHub and select this repository
4. Build settings (auto-detected):
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Click "Deploy"

## Project Structure

```
B1-Collection-Final-v2/
├── src/
│   ├── App.jsx          # Main application component
│   └── main.jsx         # Entry point
├── index.html           # HTML template
├── package.json         # Dependencies
├── vite.config.js       # Vite configuration
└── README.md           # This file
```

## Tech Stack

- **React 18** - UI framework
- **Vite 5** - Build tool
- **Lucide React** - Icon library
- **Firebase** - Backend (for future integration)

## Usage

### Testing Different Scenarios

1. **Change Month**: Use the calendar in the dashboard
2. **Switch Roles**: Toggle between Admin and Shankar (collector) view
3. **Record Payment**: Click on a tenant > Record payment
4. **View Outstanding**: See all tenants with pending payments

### Demo Data

The app comes pre-populated with sample tenant data for testing:
- Pradeep, Tasneem, and other tenants
- Various payment statuses and amounts

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

## Development

- **Hot Module Replacement (HMR)**: Changes reflect instantly
- **Fast Refresh**: React components update without losing state
- **TypeScript Support**: Optional, can be added if needed

## License

MIT License - Feel free to use for your BharatOne Spaces business

## Support

For issues or questions:
- Email: bharatonespaces@gmail.com
- Website: bharatonespaces.com

## Deployment Status

✅ Repository Created
✅ All Essential Files Added
✅ Ready for Deployment

**Next Step**: Deploy to Vercel or Netlify using the instructions above!
