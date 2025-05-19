import Link from "next/link"
import { Store } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

interface NavbarProps {
  showNotifications?: boolean
}

export function Navbar({ showNotifications = false }: NavbarProps) {
  return (
    <header className="bg-primary text-primary-foreground">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-2">
          <Store className="h-6 w-6" />
          <span className="font-bold text-xl">Ferremas</span>
        </div>
        <nav className="flex items-center gap-6">
          <Link href="/" className="hover:underline">
            Inicio
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
