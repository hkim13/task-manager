import Link from "next/link";
import { Twitter, Linkedin, Github } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-800 border-t border-slate-700">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Product Column */}
          <div>
            <h3 className="font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#features"
                  className="text-slate-300 hover:text-coral-400"
                >
                  Timeline View
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="text-slate-300 hover:text-coral-400"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-slate-300 hover:text-coral-400"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-300 hover:text-coral-400">
                  Mobile App
                </Link>
              </li>
            </ul>
          </div>

          {/* Features Column */}
          <div>
            <h3 className="font-semibold text-white mb-4">Features</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-slate-300 hover:text-coral-400">
                  Task Creation
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-300 hover:text-coral-400">
                  Duration Presets
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-300 hover:text-coral-400">
                  Subtasks
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-300 hover:text-coral-400">
                  Dark Mode
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-slate-300 hover:text-coral-400">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-300 hover:text-coral-400">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-300 hover:text-coral-400">
                  Community
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-300 hover:text-coral-400">
                  Tutorials
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-slate-300 hover:text-coral-400">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-300 hover:text-coral-400">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-300 hover:text-coral-400">
                  Security
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-300 hover:text-coral-400">
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-700">
          <div className="text-slate-400 mb-4 md:mb-0">
            © {currentYear} Timeline Tasks. All rights reserved.
          </div>

          <div className="flex space-x-6">
            <a href="#" className="text-slate-400 hover:text-coral-400">
              <span className="sr-only">Twitter</span>
              <Twitter className="h-6 w-6" />
            </a>
            <a href="#" className="text-slate-400 hover:text-coral-400">
              <span className="sr-only">LinkedIn</span>
              <Linkedin className="h-6 w-6" />
            </a>
            <a href="#" className="text-slate-400 hover:text-coral-400">
              <span className="sr-only">GitHub</span>
              <Github className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
