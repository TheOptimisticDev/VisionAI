
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ParticleBackground } from '@/components/effects/ParticleBackground';

const NotFound = () => {
  return (
    <MainLayout>
      <ParticleBackground />
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <motion.img
          src="/icons/404.PNG"
          alt="VisionAI"
          className="w-58 h-58 object-contain drop-shadow-lg"
          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
        />
        <p className="text-muted-foreground mt-2 max-w-md">
          We apologize — the page you're looking for couldn't be found. You're viewing an enhanced version of our platform, and we're actively working to bring more features and improvements soon.
        </p>
        <Button asChild className="mt-8">
          <Link to="/">Go back home</Link>
        </Button>
      </div>
    </MainLayout>
  );
};

export default NotFound;
