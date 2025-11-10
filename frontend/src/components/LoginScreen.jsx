import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { Eye, EyeOff, Lock, Mail, AlertCircle, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';

const LoginScreen = ({ isDarkMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setPendingApproval(false);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if user is approved in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (!userData.approved) {
          // User not approved - sign them out and show pending message
          await signOut(auth);
          setPendingApproval(true);
          setError('Your account is pending approval. You will be notified once approved.');
          return;
        }
      } else {
        // User document doesn't exist - this shouldn't happen but handle it
        await signOut(auth);
        setError('Account setup incomplete. Please contact support.');
        return;
      }
      
      // Login successful - user will be redirected by AuthContext
    } catch (error) {
      console.error('Login error:', error);
      
      // User-friendly error messages
      switch (error.code) {
        case 'auth/invalid-email':
          setError('Invalid email address format');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled');
          break;
        case 'auth/user-not-found':
          setError('No account found with this email');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password');
          break;
        case 'auth/invalid-credential':
          setError('Invalid email or password');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later');
          break;
        default:
          setError('Login failed. Please check your credentials');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setPendingApproval(false);

    // Validate password
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user document in Firestore with approval status
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        approved: false,
        createdAt: serverTimestamp(),
        approvedAt: null,
        approvedBy: null
      });
      
      // Create a notification document for admin (this triggers Firebase Extension email)
      await setDoc(doc(db, 'notifications', user.uid), {
        type: 'new_signup',
        userEmail: user.email,
        userId: user.uid,
        createdAt: serverTimestamp(),
        adminEmail: 'rohan.26207@gmail.com',
        status: 'pending'
      });
      
      // Sign out the user immediately since they need approval
      await signOut(auth);
      
      // Show pending approval message
      setPendingApproval(true);
      setError('');
      
    } catch (error) {
      console.error('Sign up error:', error);
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('An account with this email already exists');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address format');
          break;
        case 'auth/weak-password':
          setError('Password is too weak. Use at least 6 characters');
          break;
        default:
          setError('Sign up failed. Please try again');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      <Card className={`w-full max-w-md ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
      }`}>
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className={`p-3 rounded-full ${
              isDarkMode ? 'bg-blue-900' : 'bg-blue-100'
            }`}>
              <Lock className={`w-8 h-8 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
          </div>
          <CardTitle className={`text-2xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            {isSignUp 
              ? 'Sign up to start managing your petrol pump' 
              : 'Sign in to access your petrol pump management'
            }
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                Email Address
              </Label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`pl-10 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white'
                  }`}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                Password
              </Label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className={`pl-10 pr-10 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white'
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                    isDarkMode ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'
                  }`}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {isSignUp && (
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Password must be at least 6 characters
                </p>
              )}
            </div>

            {/* Pending Approval Success Message */}
            {pendingApproval && !error && (
              <div className={`p-3 rounded-lg flex items-start gap-2 ${
                isDarkMode 
                  ? 'bg-yellow-900/20 border border-yellow-800' 
                  : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <Clock className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                    Account Pending Approval
                  </p>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-yellow-300' : 'text-yellow-600'}`}>
                    Your account has been created successfully. An administrator will review and approve your account shortly. You will be able to login once approved.
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className={`p-3 rounded-lg flex items-start gap-2 ${
                isDarkMode 
                  ? 'bg-red-900/20 border border-red-800' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </Button>

            {/* Toggle Sign Up/Login */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setPassword('');
                }}
                className={`text-sm ${
                  isDarkMode 
                    ? 'text-blue-400 hover:text-blue-300' 
                    : 'text-blue-600 hover:text-blue-700'
                } font-medium`}
                disabled={isLoading}
              >
                {isSignUp 
                  ? 'Already have an account? Sign In' 
                  : "Don't have an account? Sign Up"
                }
              </button>
            </div>
          </form>

          {/* Info Box */}
          <div className={`mt-6 p-3 rounded-lg ${
            isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>Secure Access:</strong> Your data is protected with email/password authentication. 
              Only authorized users can access the petrol pump management system.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginScreen;
