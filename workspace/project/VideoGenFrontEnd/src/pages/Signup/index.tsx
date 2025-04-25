import * as React from 'react';
import { SignupForm } from '@/components/auth/SignupForm';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface LocationState {
  from?: string;
}

export const SignupPage: React.FC = () => {
  const location = useLocation();
  const from = (location.state as LocationState)?.from || '/dashboard';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          {from !== '/dashboard' && (
            <p className="text-sm text-muted-foreground">
              Sign up to continue to your requested page
            </p>
          )}
        </CardHeader>
        <CardContent>
          <SignupForm returnPath={from} />
          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
              state={{ from }}
            >
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupPage;
