
# VisionAI - AI-Powered Object Recognition

![VisionAI Logo](public/placeholder.svg)

VisionAI is a modern web application that uses artificial intelligence to recognize and identify objects through your camera. Built with React, TypeScript, and TensorFlow.js, this application brings powerful object recognition capabilities directly to you without requiring server-side processing.

## Features

- **Real-time Object Recognition**: Instantly identify objects using your device's camera
- **Offline Capability**: Works even without internet connection thanks to TensorFlow.js
- **User-friendly Interface**: Clean, responsive design for all devices
- **Scan History**: Keep track of all your previous object scans
- **Dark Mode Support**: Comfortable viewing experience in any lighting condition

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **AI/ML**: TensorFlow.js, MobileNet model
- **Build Tool**: Vite
- **Authentication**: Firebase Authentication
- **Styling**: Tailwind CSS with custom animations

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone [your-repo-url]

# Navigate to the project directory
cd VisionAI

# Install dependencies
yarn install

# Start the development server
yarn run dev
```

The application will be available at `http://localhost:8080/`.

## Usage

1. Grant camera permissions when prompted
2. Point your camera at any object you want to identify
3. Click the scan button in the center of the bottom navigation
4. View the detailed results of the object recognition
5. Browse your scan history to see previous identifications

## Project Structure

```
src/
├── components/        # UI components
│   ├── layout/        # Layout components (Header, BottomNavigation)
│   ├── scanner/       # Scanner-related components
│   ├── ui/            # Reusable UI components (shadcn)
├── context/           # React context providers
├── hooks/             # Custom React hooks
├── lib/               # Utility libraries
├── pages/             # Page components
├── services/          # Service layers (AI, history)
```

## Deployment

This project can be deployed to any static hosting service. We recommend:

- Vercel
- Netlify
- GitHub Pages
- Firebase Hosting

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- TensorFlow.js and the MobileNet model for enabling client-side object recognition
- The shadcn/ui team for their excellent component library
- The React and TypeScript communities for their fantastic tools and resources
