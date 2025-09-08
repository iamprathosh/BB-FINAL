"use client";

import { useState, useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { SignInMethodDivider } from "@/components/SignInMethodDivider";
import { 
  Package, 
  Users, 
  Building2, 
  TrendingUp, 
  Plus, 
  Settings, 
  Database,
  FileText,
  Loader2,
  LogIn,
  UserPlus
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { signIn, signOut } = useAuthActions();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isImporting, setIsImporting] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const currentUser = useQuery(api.users.getCurrentUser);
  const createSampleData = useMutation(api.sampleData.createSampleData);
  const importVendors = useMutation(api.sampleData.importVendors);
  
  // Get dashboard stats
  const products = useQuery(api.products.getProducts);
  const vendors = useQuery(api.vendors.getVendors);
  const projects = useQuery(api.projects.getProjects);
  const users = useQuery(api.users.getUsers);

  const handleSignIn = () => {
    signIn("password", { flow: "signIn" });
  };

  const handleSignUp = () => {
    signIn("password", { flow: "signUp" });
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleCreateSampleData = async () => {
    try {
      setIsImporting(true);
      await createSampleData();
      
      toast({
        title: "Success",
        description: "Sample data created successfully!",
      });
    } catch (error) {
      console.error("Error creating sample data:", error);
      toast({
        title: "Error",
        description: "Failed to create sample data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportVendors = async () => {
    try {
      setIsImporting(true);
      await importVendors();
      
      toast({
        title: "Success",
        description: "Vendor data imported successfully!",
      });
    } catch (error) {
      console.error("Error importing vendor data:", error);
      toast({
        title: "Error",
        description: "Failed to import vendor data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Prevent hydration issues by only rendering after mount
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show login screen
  if (currentUser === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">BB Inventory System</CardTitle>
            <CardDescription>
              Sign in to access the construction inventory management system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showSignUp ? (
              <>
                <Button onClick={handleSignIn} className="w-full" size="lg">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
                <SignInMethodDivider />
                <Button
                  onClick={() => setShowSignUp(true)}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create New Account
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleSignUp} className="w-full" size="lg">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </Button>
                <SignInMethodDivider />
                <Button
                  onClick={() => setShowSignUp(false)}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Back to Sign In
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user data is still loading
  if (currentUser === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Main dashboard for authenticated users
  const isAdmin = currentUser?.role === "admin";
  const totalProducts = products?.length || 0;
  const totalVendors = vendors?.length || 0;
  const totalProjects = projects?.length || 0;
  const totalUsers = users?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  BB Inventory Management
                </h1>
                <p className="text-gray-600">Construction Materials & Equipment</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-medium text-gray-900">{currentUser.name}</p>
                <p className="text-sm text-gray-600 capitalize">{currentUser.role}</p>
              </div>
              {isAdmin && (
                <Button
                  onClick={() => router.push("/admin-setup")}
                  variant="outline"
                  size="sm"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Admin Setup
                </Button>
              )}
              <Button onClick={handleSignOut} variant="outline" size="sm">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                Inventory items
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalVendors}</div>
              <p className="text-xs text-muted-foreground">
                Supplier relationships
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProjects}</div>
              <p className="text-xs text-muted-foreground">
                Construction sites
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                System users
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        {totalProducts === 0 && isAdmin && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Database className="h-5 w-5" />
                Get Started - Import Data
              </CardTitle>
              <CardDescription className="text-blue-700">
                Your inventory is empty. Import sample data or use the admin setup to populate your system.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                <Button 
                  onClick={handleCreateSampleData}
                  disabled={isImporting}
                  variant="default"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Create Sample Data
                    </>
                  )}
                </Button>
                <Button 
                  onClick={handleImportVendors}
                  disabled={isImporting}
                  variant="outline"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Users className="mr-2 h-4 w-4" />
                      Import Vendors
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => router.push("/admin-setup")}
                  variant="outline"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Admin Setup
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity / Data Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Products</CardTitle>
              <CardDescription>
                Latest inventory items
              </CardDescription>
            </CardHeader>
            <CardContent>
              {products && products.length > 0 ? (
                <div className="space-y-3">
                  {products.slice(0, 5).map((product) => (
                    <div key={product._id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${product.price}</p>
                        <p className="text-sm text-gray-600">Qty: {product.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No products available</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Vendors</CardTitle>
              <CardDescription>
                Supplier companies
              </CardDescription>
            </CardHeader>
            <CardContent>
              {vendors && vendors.length > 0 ? (
                <div className="space-y-3">
                  {vendors.slice(0, 5).map((vendor) => (
                    <div key={vendor._id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{vendor.name}</p>
                        {vendor.email && (
                          <p className="text-sm text-gray-600">{vendor.email}</p>
                        )}
                      </div>
                      {vendor.phone && (
                        <p className="text-sm text-gray-600">{vendor.phone}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No vendors available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
