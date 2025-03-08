import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <h2 className="mt-4 text-2xl font-semibold">Page Not Found</h2>
      <p className="mt-2 text-gray-500 dark:text-gray-400">
        The user or page you're looking for doesn't exist or may be private.
      </p>
      <Link href="/" className="mt-8">
        <Button>Return Home</Button>
      </Link>
    </div>
  )
}

