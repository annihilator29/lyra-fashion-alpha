import Link from 'next/link'
import { AuthForm } from '@/components/auth/AuthForm'
import { SocialLoginButton } from '@/components/auth/SocialLoginButton'


export default function RegisterPage() {
  return (
    <div className="bg-white p-8 shadow-lg sm:rounded-lg">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          Create an account
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Join Lyra Fashion regarding exclusive offers and updates
        </p>
      </div>

      <AuthForm type="register" />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <SocialLoginButton provider="google">
          Google
        </SocialLoginButton>
        <SocialLoginButton provider="apple">
          Apple
        </SocialLoginButton>
      </div>

      <div className="mt-6 text-center text-sm">
        <p className="text-gray-600">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-primary hover:text-primary/90 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}


