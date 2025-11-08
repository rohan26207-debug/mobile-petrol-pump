import React, { useState, useEffect } from 'react';
import { db, auth } from '../services/firebase';
import { collection, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Copy, Link2, Smartphone } from 'lucide-react';

/**
 * Device Linking Component
 * Allows users to link multiple devices to the same anonymous account
 * 
 * How it works:
 * 1. Device 1 generates a 6-digit linking code
 * 2. Code is stored in Firestore with the user's UID
 * 3. Device 2 enters the code and retrieves the UID
 * 4. Device 2 stores that UID and uses it for all data operations
 */
const DeviceLinking = ({ onLinked, toast }) => {
  const [linkingCode, setLinkingCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [linkedDeviceCount, setLinkedDeviceCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isCodeGenerated, setIsCodeGenerated] = useState(false);

  // Generate a random 6-digit code
  const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Generate linking code for this device
  const handleGenerateCode = async () => {
    try {
      setLoading(true);
      const code = generateCode();
      const user = auth.currentUser;

      if (!user) {
        toast({
          title: "Error",
          description: "User not authenticated",
          variant: "destructive"
        });
        return;
      }

      // Store code in Firestore with 10-minute expiry
      await setDoc(doc(db, 'deviceLinks', code), {
        userId: user.uid,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
        deviceId: localStorage.getItem('deviceId') || 'primary'
      });

      setGeneratedCode(code);
      setIsCodeGenerated(true);

      toast({
        title: "Link Code Generated",
        description: `Code: ${code} (Valid for 10 minutes)`,
      });

    } catch (error) {
      console.error('Error generating code:', error);
      const errorMessage = error.code === 'permission-denied' 
        ? 'Firestore rules not updated. Please update security rules in Firebase Console.'
        : error.message || 'Failed to generate linking code';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Link this device using a code
  const handleLinkDevice = async () => {
    if (!linkingCode || linkingCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit code",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // Retrieve the linking info from Firestore
      const linkDoc = await getDoc(doc(db, 'deviceLinks', linkingCode));

      if (!linkDoc.exists()) {
        toast({
          title: "Invalid Code",
          description: "This code doesn't exist or has expired",
          variant: "destructive"
        });
        return;
      }

      const linkData = linkDoc.data();

      // Check if code has expired
      if (new Date(linkData.expiresAt) < new Date()) {
        await deleteDoc(doc(db, 'deviceLinks', linkingCode));
        toast({
          title: "Code Expired",
          description: "This code has expired. Please generate a new one.",
          variant: "destructive"
        });
        return;
      }

      // Store the linked user ID
      localStorage.setItem('linkedUserId', linkData.userId);
      
      // Delete the used code
      await deleteDoc(doc(db, 'deviceLinks', linkingCode));

      toast({
        title: "Device Linked Successfully! 🎉",
        description: "This device is now synced with your other device. Reloading...",
      });

      // Reload page to reinitialize with linked user ID
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Error linking device:', error);
      
      let errorMessage = "Failed to link device";
      
      if (error.code === 'permission-denied') {
        errorMessage = '🔒 Permission denied. Please update Firestore security rules in Firebase Console. See /app/FIRESTORE_RULES_UPDATE_REQUIRED.md';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Copy code to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
  };

  return (
    <div className="space-y-4">
      {/* Warning Banner - Firestore Rules Required */}
      <div className="bg-red-50 border-2 border-red-400 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-red-600 font-bold text-2xl">⚠️</div>
          <div className="flex-1">
            <h3 className="font-bold text-red-800 mb-2">Firestore Rules Update Required!</h3>
            <p className="text-sm text-red-700 mb-2">
              Before using Device Linking, you must update Firestore security rules in Firebase Console.
            </p>
            <ol className="text-sm text-red-700 space-y-1 list-decimal list-inside">
              <li>Go to Firebase Console → Firestore Database → Rules</li>
              <li>Copy rules from <code className="bg-red-100 px-1 rounded">/app/FIRESTORE_SECURITY_RULES_FIXED.txt</code></li>
              <li>Paste and click "Publish"</li>
            </ol>
            <p className="text-xs text-red-600 mt-2 font-semibold">
              See detailed instructions: <code className="bg-red-100 px-1 rounded">/app/FIRESTORE_RULES_UPDATE_REQUIRED.md</code>
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Link Devices for Sync
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Generate Code Section */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              This Device (Primary)
            </h3>
            <p className="text-sm text-gray-600">
              Generate a code to link another device to this account
            </p>
            
            {!isCodeGenerated ? (
              <Button 
                onClick={handleGenerateCode} 
                disabled={loading}
                className="w-full"
              >
                Generate Link Code
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg text-center">
                    <div className="text-3xl font-bold text-blue-600 tracking-wider">
                      {generatedCode}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Valid for 10 minutes
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyToClipboard}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <Button 
                  onClick={handleGenerateCode} 
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                >
                  Generate New Code
                </Button>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            {/* Link Device Section */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Link Another Device
              </h3>
              <p className="text-sm text-gray-600">
                Enter the 6-digit code from your other device
              </p>
              
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={linkingCode}
                  onChange={(e) => setLinkingCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center text-2xl tracking-wider font-bold"
                />
              </div>
              
              <Button 
                onClick={handleLinkDevice} 
                disabled={loading || linkingCode.length !== 6}
                className="w-full"
                variant="default"
              >
                Link This Device
              </Button>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
            <p className="font-semibold text-yellow-800 mb-1">ℹ️ How Device Linking Works:</p>
            <ul className="text-yellow-700 space-y-1 list-disc list-inside">
              <li>Generate a code on your <strong>first device</strong></li>
              <li>Enter that code on your <strong>second device</strong></li>
              <li>Both devices will sync data automatically</li>
              <li>Codes expire after 10 minutes</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeviceLinking;
