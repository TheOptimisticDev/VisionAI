import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  ToggleGroup,
  ToggleGroupItem
} from '@/components/ui/toggle-group';
import { ParticleBackground } from '@/components/effects/ParticleBackground';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import {
  User,
  LogIn,
  Moon,
  Sun,
  Bell,
  Lock,
  Database,
  Server,
  BrainCircuit,
  Cog,
  Eye
} from 'lucide-react';
import { loadModel } from '@/services/aiService';
import { motion } from 'framer-motion';
import { SignInForm } from '@/components/auth/SignInForm';

const Settings = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const [selectedPreferredModel, setSelectedPreferredModel] = React.useState('mobilenet');
  const [selectedBackend, setSelectedBackend] = React.useState<'webgl' | 'cpu' | 'wasm'>('webgl');
  const [showAdvancedOptions, setShowAdvancedOptions] = React.useState(false);
  const [enableNotifications, setEnableNotifications] = React.useState(true);
  const [modelLoading, setModelLoading] = React.useState(false);
  const [showSignInForm, setShowSignInForm] = React.useState(false);

  const handlePreloadModel = async () => {
    try {
      setModelLoading(true);
      toast({
        title: 'Model Preloaded',
        description: 'AI model has been successfully preloaded',
      });
    } catch (error) {
      toast({
        title: 'Failed to Preload Model',
        description: 'There was an error preloading the AI model',
        variant: 'destructive',
      });
    } finally {
      setModelLoading(false);
    }
  };

  const handleSignIn = () => {
    setShowSignInForm(true);
  };

  const handleSignUp = () => {
    // navigate to signup if needed or show a signup form similarly
    window.location.href = '/SignUpForm';
  };

  return (
    <MainLayout>
      <div className="relative w-full overflow-hidden">
        <ParticleBackground />

        <div className="container mx-auto py-8 px-4">
          <div className="max-w-3xl mx-auto space-y-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-between"
            >
              <h1 className="text-2xl font-bold">Settings</h1>
            </motion.div>

            {/* Profile Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2" size={20} />
                    Profile
                  </CardTitle>
                  <CardDescription>
                    Manage your account settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {currentUser ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-brand-500 to-purple-500 flex items-center justify-center text-white">
                          {currentUser.email?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{currentUser.email}</p>
                          <p className="text-sm text-muted-foreground">
                            Account created: {new Date(currentUser.metadata.creationTime).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline">Edit Profile</Button>
                        <Button variant="outline">Change Password</Button>
                      </div>
                    </div>
                  ) : showSignInForm ? (
                    <SignInForm onToggleForm={function (): void {
                        throw new Error('Function not implemented.');
                      } } />
                  ) : (
                    <div className="space-y-4 text-center">
                      <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto flex items-center justify-center">
                        <User className="text-gray-500 dark:text-gray-400" size={24} />
                      </div>
                      <p className="text-muted-foreground">Sign in to access all features</p>
                      <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <Button
                          onClick={handleSignIn}
                          className="w-full sm:w-auto"
                        >
                          <LogIn className="mr-2" size={16} />
                          Sign In
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleSignUp}
                          className="w-full sm:w-auto"
                        >
                          Create Account
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Appearance Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {isDarkMode ? (
                      <Moon className="mr-2" size={20} />
                    ) : (
                      <Sun className="mr-2" size={20} />
                    )}
                    Appearance
                  </CardTitle>
                  <CardDescription>
                    Customize your theme preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 rounded-lg">
                    <div className="flex items-center space-x-4">
                      {isDarkMode ? (
                        <Moon className="text-white-300" size={20} />
                      ) : (
                        <Sun className="text-black-300" size={20} />
                      )}
                      <div>
                        <Label htmlFor="theme-mode">
                          {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Current theme: {isDarkMode ? 'Dark' : 'Light'}
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="theme-mode"
                      checked={isDarkMode}
                      onCheckedChange={toggleTheme}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* AI Engine Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BrainCircuit className="mr-2" size={20} />
                    AI Engine
                  </CardTitle>
                  <CardDescription>
                    Configure the AI recognition engine
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Preferred AI Models</Label>
                      <ToggleGroup 
                        type="single" 
                        value={selectedPreferredModel}
                        onValueChange={(value) => {
                          if (value) setSelectedPreferredModel(value);
                        }}
                        className="flex flex-wrap justify-start"
                      >
                        <ToggleGroupItem value="mobilenet" className="mr-2 mb-2">
                          Object Recognition
                        </ToggleGroupItem>
                        <ToggleGroupItem value="blazeface" className="mr-2 mb-2">
                          Face Detection
                        </ToggleGroupItem>
                        <ToggleGroupItem value="emotion" className="mb-2">
                          Emotion Analysis
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                    
                    <Button 
                      onClick={handlePreloadModel} 
                      variant="outline" 
                      disabled={modelLoading || !currentUser}
                      className="w-full"
                    >
                      {modelLoading ? 'Loading...' : 'Preload AI Models'}
                      {!currentUser && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          (Sign in required)
                        </span>
                      )}
                    </Button>
                    
                    <div className="flex items-center space-x-2 pt-2">
                      <Switch 
                        id="advanced" 
                        checked={showAdvancedOptions}
                        onCheckedChange={setShowAdvancedOptions}
                      />
                      <Label htmlFor="advanced">Show Advanced Options</Label>
                    </div>
                    
                    {showAdvancedOptions && (
                      <div className="space-y-4 pt-2">
                        <Separator />
                        <div className="space-y-2">
                          <Label htmlFor="backend">TensorFlow.js Backend</Label>
                          <Select 
                            value={selectedBackend} 
                            onValueChange={(value: 'webgl' | 'cpu' | 'wasm') => setSelectedBackend(value)}
                          >
                            <SelectTrigger id="backend">
                              <SelectValue placeholder="Select backend" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="webgl">WebGL (GPU)</SelectItem>
                              <SelectItem value="cpu">CPU</SelectItem>
                              <SelectItem value="wasm">WebAssembly</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground pt-1">
                            WebGL provides the best performance but might not be available on all devices.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="mr-2" size={20} />
                    Notifications
                  </CardTitle>
                  <CardDescription>
                    Manage your notification preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notifications">Enable Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive alerts and updates
                      </p>
                    </div>
                    <Switch 
                      id="notifications" 
                      checked={enableNotifications}
                      onCheckedChange={setEnableNotifications}
                      disabled={!currentUser}
                    />
                  </div>
                  {!currentUser && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Sign in to disable notifications
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Security & Privacy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lock className="mr-2" size={20} />
                    Security & Privacy
                  </CardTitle>
                  <CardDescription>
                    Manage your security and privacy settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="store-history">Store Scan History</Label>
                      <p className="text-sm text-muted-foreground">
                        Save your past scans for future reference
                      </p>
                    </div>
                    <Switch 
                      id="store-history" 
                      defaultChecked 
                      disabled={!currentUser}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="data-collection">Data Collection</Label>
                      <p className="text-sm text-muted-foreground">
                        Help improve our AI models by sharing anonymous data
                      </p>
                    </div>
                    <Switch 
                      id="data-collection" 
                      defaultChecked={false} 
                      disabled={!currentUser}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Data Management */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="mr-2" size={20} />
                    Data Management
                  </CardTitle>
                  <CardDescription>
                    Manage your app data and storage
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm">
                      Cached AI models and scan history are stored on your device
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button variant="outline" disabled={!currentUser}>
                        Clear Cache
                      </Button>
                      <Button 
                        variant="outline" 
                        className="text-red-500 hover:text-red-700"
                        disabled={!currentUser}
                      >
                        Delete All Data
                      </Button>
                    </div>
                    {!currentUser && (
                      <p className="text-xs text-muted-foreground">
                        Sign in to manage your data
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
