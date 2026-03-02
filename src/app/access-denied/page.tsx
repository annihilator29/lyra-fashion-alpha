/**
 * Access Denied Page
 * Story 7.1a: Admin Dashboard - Foundation
 * AC1: Protected Admin Area
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Access Denied - Lyra Fashion',
  description: 'You do not have permission to access this area',
};

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4" data-testid="access-denied">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
            <ShieldAlert className="h-10 w-10 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Access Denied
        </h1>
        
        <p className="text-slate-600 mb-8">
          You do not have permission to access the admin dashboard. 
          Please contact your administrator if you believe this is an error.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Home
            </Button>
          </Link>
          
          <Link href="/login">
            <Button className="w-full sm:w-auto">
              Sign In as Admin
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
