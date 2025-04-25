import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from '@/hooks/useForm';
import { useToast } from '@/hooks/useToast';
import type { SignupCredentials } from '@/types/auth';
import { authValidation } from '@/utils/validation/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SignupFormProps {
  returnPath?: string;
}

const initialValues: SignupCredentials = {
  email: '',
  password: '',
  username: '',
};

const validationRules = {
  email: authValidation.email,
  password: authValidation.password,
  username: authValidation.username,
};

export const SignupForm: React.FC<SignupFormProps> = ({ returnPath = '/dashboard' }) => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { showToast } = useToast();

  const { values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting } =
    useForm<SignupCredentials>({
      initialValues,
      validationRules,
      onSubmit: async (formData) => {
        try {
          await signup(formData);
          showToast('Account created successfully!', 'success');
          navigate(returnPath, { replace: true });
        } catch (error) {
          showToast(error instanceof Error ? error.message : 'Failed to create account', 'error');
        }
      },
    });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          name="username"
          value={values.username}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isSubmitting}
          autoFocus
          placeholder="Choose a username"
          aria-invalid={touched.username && !!errors.username}
          aria-describedby={errors.username ? 'username-error' : undefined}
        />
        {touched.username && errors.username && (
          <p id="username-error" className="text-sm text-destructive">
            {errors.username}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          name="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isSubmitting}
          placeholder="Enter your email"
          aria-invalid={touched.email && !!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {touched.email && errors.email && (
          <p id="email-error" className="text-sm text-destructive">
            {errors.email}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          name="password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isSubmitting}
          placeholder="Choose a password"
          aria-invalid={touched.password && !!errors.password}
          aria-describedby={errors.password ? 'password-error' : undefined}
        />
        {touched.password && errors.password && (
          <p id="password-error" className="text-sm text-destructive">
            {errors.password}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting} aria-busy={isSubmitting}>
        {isSubmitting ? 'Creating Account...' : 'Sign Up'}
      </Button>
    </form>
  );
};
