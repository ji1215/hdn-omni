'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { EyeIcon, EyeOffIcon, LoaderIcon } from 'lucide-react';
import { Button } from '@/components/common';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().min(1, '이메일을 입력해주세요').email('올바른 이메일 형식이 아닙니다'),
  password: z
    .string()
    .min(1, '비밀번호를 입력해주세요')
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      rememberMe: false,
    },
  });

  useEffect(() => {
    // 저장된 이메일 불러오기
    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail) {
      setValue('email', savedEmail);
      setValue('rememberMe', true);
    }
  }, [setValue]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    // 아이디 저장 처리
    if (data.rememberMe) {
      localStorage.setItem('savedEmail', data.email);
    } else {
      localStorage.removeItem('savedEmail');
    }

    // 실제 인증 없이 대시보드로 리다이렉트
    setTimeout(() => {
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
        >
          이메일
        </label>
        <input
          {...register('email')}
          type="email"
          id="email"
          autoComplete="email"
          className={cn('input', errors.email && 'border-error focus:ring-error')}
          placeholder="admin@example.com"
        />
        {errors.email && <p className="mt-1 text-sm text-error">{errors.email.message}</p>}
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
        >
          비밀번호
        </label>
        <div className="relative">
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            className={cn('input pr-10', errors.password && 'border-error focus:ring-error')}
            placeholder="••••••••"
          />
          <Button
            type="button"
            variant="icon"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3"
          >
            {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </Button>
        </div>
        {errors.password && <p className="mt-1 text-sm text-error">{errors.password.message}</p>}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            {...register('rememberMe')}
            type="checkbox"
            id="rememberMe"
            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
          />
          <label
            htmlFor="rememberMe"
            className="ml-2 block text-sm text-gray-700 dark:text-gray-200"
          >
            아이디 저장
          </label>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        fullWidth
        disabled={!isValid || isLoading}
        loading={isLoading}
        size="lg"
      >
        로그인
      </Button>
    </form>
  );
}
