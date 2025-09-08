"use client";

import { useState, useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Settings, Users, Database, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminSetupPage() {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const currentUser = useQuery(api.users.getCurrentUser);
  const createSampleData = useMutation(api.sampleData.createSampleData);
  const importVendors = useMutation(api.sampleData.importVendors);
  const importBBRealData = useMutation(api.bbRealDataImport.importBBRealData);
  
  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const handleCreateSampleData = async () => {
    try {
      setIsImporting(true);
      setImportStatus("Creating sample data...");
      
      await createSampleData();
      
      toast({
        title: "Success",
        description: "Sample data created successfully!",
      });
      setImportStatus("Sample data created successfully!");
    } catch (error) {
      console.error("Error creating sample data:", error);
      toast({
        title: "Error",
        description: "Failed to create sample data. Please try again.",
        variant: "destructive",
      });
      setImportStatus("Failed to create sample data.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportVendors = async () => {
    try {
      setIsImporting(true);
      setImportStatus("Importing vendor data...");
      
      await importVendors();
      
      toast({
        title: "Success",
        description: "Vendor data imported successfully!",
      });
      setImportStatus("Vendor data imported successfully!");
    } catch (error) {
      console.error("Error importing vendor data:", error);
      toast({
        title: "Error",
        description: "Failed to import vendor data. Please try again.",
        variant: "destructive",
      });
      setImportStatus("Failed to import vendor data.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportBBRealData = async () => {
    try {
      setIsImporting(true);
      setImportStatus("Importing BB Real Data from CSV files...");
      
      const result = await importBBRealData();
      
      toast({
        title: "Success", 
        description: "BB Real Data imported successfully! Your inventory is now populated with real data.",
      });
      setImportStatus("BB Real Data imported successfully!");
    } catch (error) {
      console.error("Error importing BB real data:", error);
      toast({
        title: "Error",
        description: `Failed to import BB real data: ${error}`,
        variant: "destructive",
      });
      setImportStatus("Failed to import BB real data.");
    } finally {
      setIsImporting(false);
    }
  };

  // Prevent hydration issues
  if (!isMounted) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="mx-auto h-6 w-6 animate-spin" />
              <p className="mt-2">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="mx-auto h-6 w-6 animate-spin" />
              <p className="mt-2">Loading user information...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAdmin = currentUser?.role === "admin";

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Setup</h1>
          <p className="text-muted-foreground mt-1">
            Initialize the inventory management system with data
          </p>
        </div>
        <Button variant="outline" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>

      {/* User Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Current User
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Name:</strong> {currentUser.name}</p>
            <p><strong>Email:</strong> {currentUser.email}</p>
            <p><strong>Role:</strong> {currentUser.role}</p>
            {currentUser.title && <p><strong>Title:</strong> {currentUser.title}</p>}
            <div className="flex items-center gap-2 mt-3">
              {isAdmin ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 font-medium">Administrator Access</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-yellow-600 font-medium">Limited Access - Admin Required</span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {!isAdmin && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Administrator Access Required</p>
                <p className="text-sm">You need administrator privileges to access data import functions.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Import Options */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sample Data Import */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Sample Data
              </CardTitle>
              <CardDescription>
                Import demo data for testing and evaluation purposes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={handleCreateSampleData}
                disabled={isImporting}
                className="w-full"
                variant="outline"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  "Create Sample Data"
                )}
              </Button>
              <Button 
                onClick={handleImportVendors}
                disabled={isImporting}
                className="w-full"
                variant="outline"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  "Import Sample Vendors"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* BB Real Data Import */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                BB Real Data
              </CardTitle>
              <CardDescription>
                Import actual BB construction data from CSV files
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Real inventory items from BB construction</p>
                <p>• Actual vendors and suppliers</p>
                <p>• Current projects and employees</p>
                <p>• Production-ready data structure</p>
              </div>
              <Button 
                onClick={handleImportBBRealData}
                disabled={isImporting}
                className="w-full"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing BB Data...
                  </>
                ) : (
                  "Import BB Real Data"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Import Status */}
      {importStatus && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Import Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {isImporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : importStatus.includes("successfully") ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : importStatus.includes("Failed") ? (
                <AlertCircle className="h-4 w-4 text-red-600" />
              ) : null}
              <span className={
                importStatus.includes("successfully") ? "text-green-600" :
                importStatus.includes("Failed") ? "text-red-600" :
                "text-blue-600"
              }>
                {importStatus}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Navigation</CardTitle>
          <CardDescription>
            Access other parts of the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => router.push("/")}
            variant="outline" 
            className="w-full"
          >
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
