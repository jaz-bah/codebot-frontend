import Link from "next/link"

export default function Home() {
  return (
    <div className="flex h-svh w-full flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-2xl font-bold">Home</h2>

      <ul className="flex gap-2 justify-center text-sm text-muted-foreground">
        <li>
          <Link href="/" className="underline-offset-4 hover:underline">
            Home
          </Link>
        </li>
        <li>
          <Link href="/dashboard" className="underline-offset-4 hover:underline">
            Dashboard
          </Link>
        </li>
        <li>
          <Link
            href="/auth/sign-in"
            className="underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </li>
        <li>
          <Link
            href="/auth/sign-up"
            className="underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </li>
      </ul>
    </div>
  )
}
