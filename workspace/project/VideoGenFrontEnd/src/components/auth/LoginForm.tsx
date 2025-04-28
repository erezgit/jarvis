import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from '@/hooks/useForm';
import { useToast } from '@/hooks/useToast';
import type { LoginCredentials } from '@/types/auth';
import { authValidation } from '@/utils/validation/auth';

const initialValues: LoginCredentials = {
  email: '',
  password: '',
};

const validationRules = {
  email: authValidation.email,
  password: authValidation.password,
};

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const { values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting } =
    useForm<LoginCredentials>({
      initialValues,
      validationRules,
      onSubmit: async (formData) => {
        try {
          await login(formData);
          showToast('Login successful!', 'success');
          navigate('/dashboard');
        } catch (error) {
          showToast(error instanceof Error ? error.message : 'Login failed', 'error');
        }
      },
    });

  const handleDemoLogin = useCallback(() => {
    handleChange({
      target: { name: 'email', value: 'demo@example.com' },
    } as React.ChangeEvent<HTMLInputElement>);
    handleChange({
      target: { name: 'password', value: 'demo123' },
    } as React.ChangeEvent<HTMLInputElement>);

    handleSubmit(new Event('submit') as unknown as React.FormEvent<HTMLFormElement>);
  }, [handleChange, handleSubmit]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          name="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isSubmitting}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${
            touched.email && errors.email ? 'border-red-500' : ''
          }`}
        />
        {touched.email && errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          name="password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isSubmitting}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${
            touched.password && errors.password ? 'border-red-500' : ''
          }`}
        />
        {touched.password && errors.password && (
          <p className="mt-1 text-sm text-red-500">{errors.password}</p>
        )}
      </div>

      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={isSubmitting}
          className="flex w-full justify-center rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
        >
          Demo Login
        </button>
      </div>
    </form>
  );
};
