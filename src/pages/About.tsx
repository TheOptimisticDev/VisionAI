import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Scan, Search, Check, FileText, ChevronRight, Zap, Globe, Database, Sparkles, Mail, Phone, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ParticleBackground } from '@/components/effects/ParticleBackground';
import { Button } from '@/components/ui/button';

const About = () => {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  const toggleStep = (index: number) => {
    setExpandedStep(expandedStep === index ? null : index);
  };

  const features = [
    {
      icon: <Zap className="text-white" size={24} />,
      title: "Lightning Fast",
      description: "Instant recognition in under 5 seconds",
      color: "from-yellow-400 to-amber-600"
    },
    {
      icon: <Globe className="text-white" size={24} />,
      title: "Global Knowledge",
      description: "Recognizes objects from all over the world",
      color: "from-blue-400 to-cyan-600"
    },
    {
      icon: <Database className="text-white" size={24} />,
      title: "Massive Database",
      description: "Over 10,000 object categories in our knowledge base",
      color: "from-purple-400 to-fuchsia-600"
    }
  ];

  const steps = [
    {
      title: "Open the Camera",
      icon: Scan,
      description: "Launch the camera from the home screen",
      details: "Tap the camera icon on the main screen to activate your device's camera. Make sure to grant camera permissions when prompted.",
      color: "from-blue-400 to-cyan-500"
    },
    {
      title: "Scan an Object",
      icon: Search,
      description: "Point your camera at the object you want to identify",
      details: "Hold your device steady about 6-12 inches from the object. Ensure good lighting and try to capture the object clearly in the frame.",
      color: "from-purple-400 to-fuchsia-500"
    },
    {
      title: "Review Results",
      icon: Check,
      description: "Get instant information about your scanned item",
      details: "Our AI will analyze the object and display detailed information including name, category, and interesting facts. Results typically appear in 2-3 seconds.",
      color: "from-green-400 to-emerald-500"
    },
    {
      title: "Save or Share",
      icon: FileText,
      description: "Save to your history or share with friends",
      details: "Tap the save button to add to your personal collection, or use the share option to send the results via messaging or social media.",
      color: "from-yellow-400 to-amber-500"
    }
  ];

  return (
    <MainLayout>
      <div className="relative w-full overflow-hidden">
        <ParticleBackground />

        <div className="flex justify-center items-center flex-col text-center max-w-full h-full px-4 sm:px-6 lg:px-8 py-12">
          <motion.img
            src="/icons/about.gif"
            alt="VisionAI"
            className="w-48 h-48 object-contain drop-shadow-lg mb-6"
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
          />

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-brand-100 text-brand-600 text-sm font-medium mb-4">
              <Sparkles className="mr-2" size={16} />
              How It Works
            </div>
            <motion.h1
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-purple-600"
            >
              Discover With VisionAI
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto"
            >
              Learn how to unlock the power of visual recognition with our simple steps
            </motion.p>
          </motion.div>

          <motion.div 
            className="w-full max-w-3xl space-y-6 mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <Card 
                  className="cursor-pointer transition-all hover:shadow-lg border-0 shadow-sm"
                  onClick={() => toggleStep(index)}
                >
                  <CardHeader className="flex flex-row items-center justify-between p-6">
                    <div className="flex items-center space-x-4 min-w-0">
                      <motion.div
                        className={`w-12 h-12 min-w-[3rem] rounded-xl flex items-center justify-center bg-gradient-to-br ${step.color}`}
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <step.icon className="h-5 w-5 text-white" />
                      </motion.div>
                      <div className="min-w-0 flex-1 text-left">
                        <CardTitle className="text-lg md:text-xl">{step.title}</CardTitle>
                        <CardDescription className="text-sm md:text-base">{step.description}</CardDescription>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedStep === index ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-shrink-0"
                    >
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </motion.div>
                  </CardHeader>
                  <AnimatePresence>
                    {expandedStep === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <CardContent className="p-6 pt-0">
                          <p className="text-sm md:text-base text-muted-foreground">{step.details}</p>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.section 
            className="w-full max-w-5xl mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <motion.h2
              className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-purple-600"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              Why Choose VisionAI?
            </motion.h2>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className={`p-6 rounded-xl shadow-sm bg-gradient-to-br ${feature.color} hover:shadow-lg`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.1, duration: 0.6 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className={`w-12 h-12 rounded-lg mb-4 flex items-center justify-center bg-white/20`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/90">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          <motion.div
            className="w-full max-w-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Mail className="h-6 w-6 text-brand-600" />
                  </motion.div>
                  <CardTitle className="text-2xl">Contact Support</CardTitle>
                </div>
                <CardDescription className="text-lg">We're here to help with any queries!</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Your Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input 
                      type="email" 
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Message</label>
                    <textarea 
                      rows={4} 
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    ></textarea>
                  </div>
                  <Button
                    size="lg"
                    className="relative overflow-hidden group text-lg py-6 px-7 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 text-white shadow-lg transition-all duration-300 transform hover:scale-105"
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                  >
                    <span className="relative z-10 flex items-center">
                      <Mail className="mr-3" size={20} />
                      Send Message
                    </span>
                    <AnimatePresence>
                      {isHovering && (
                        <motion.span
                          className="absolute inset-0 bg-gradient-to-r from-brand-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        />
                      )}
                    </AnimatePresence>
                  </Button>
                </form>

                <div className="text-sm text-muted-foreground space-y-3">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-brand-600 mr-3" />
                    <p>Soweto, Johannesburg, South Africa</p>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-brand-600 mr-3" />
                    <p>+27 (81) 344 1348</p>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-brand-600 mr-3" />
                    <p>support@vision.ai</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            className="mt-16 text-center text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
          >
            <div className="flex justify-center space-x-6 mb-4">
              <motion.a
                href="/terms"
                className="hover:text-brand-600 transition-colors"
                whileHover={{ y: -2 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                Terms & Conditions
              </motion.a>
              <motion.a
                href="/privacy"
                className="hover:text-brand-600 transition-colors"
                whileHover={{ y: -2 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                Privacy Policy
              </motion.a>
            </div>
            <p className="text-xs text-muted-foreground/70">
              © {new Date().getFullYear()} VisionAI. All rights reserved.
            </p>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};

export default About;
