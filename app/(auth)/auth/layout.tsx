// Auth routes are centered, no shell (DESIGN.md §5).
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      {children}
    </div>
  )
}
