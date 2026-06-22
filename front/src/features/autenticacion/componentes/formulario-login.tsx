'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ErrorDisplay } from '@/components/feedback/error-display';
import { loginSchema, type LoginFormValues } from '../esquemas/login.schema';
import { usarIniciarSesion } from '../hooks/usar-iniciar-sesion';

export function FormularioLogin(): React.JSX.Element {
  const router = useRouter();
  const { mutate, isPending, error } = usarIniciarSesion();
  const [verPassword, setVerPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (datos: LoginFormValues) => {
    mutate(datos, {
      onSuccess: () => {
        router.push('/seleccionar-contexto');
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div aria-live="assertive" className="empty:hidden">
        {error && <ErrorDisplay error={error} />}
      </div>


      <div className="space-y-1.5">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="usuario@institución.edu.pe"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          {...register('email')}
        />
        {errors.email && (
          <p id="email-error" className="text-xs text-red-600" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Contraseña</Label>
        <div className="relative">
          <Input
            id="password"
            type={verPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            className="pr-10"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setVerPassword((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[--color-text-muted] hover:text-[--color-text-secondary]"
            aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {verPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p id="password-error" className="text-xs text-red-600" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {isPending ? 'Iniciando sesión…' : 'Iniciar sesión'}
      </Button>
    </form>
  );
}
