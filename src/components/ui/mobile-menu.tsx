"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { BarChart3, Menu, X, ChevronRight, Github, Database } from "lucide-react"
import { LucideIcon } from 'lucide-react'

interface MobileMenuProps {
  currentPage?: string
}

interface MenuItem {
  href: string
  label: string
  icon?: LucideIcon
  description?: string
  active?: boolean
}

interface MenuSection {
  id: string
  title: string
  expandable?: boolean
  items: MenuItem[]
}

export function MobileMenu({ currentPage }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  const menuSections: MenuSection[] = [
    {
      id: 'main',
      title: 'NAVIGATION',
      items: [
        { href: '/', label: 'Overview', icon: BarChart3, description: 'Data Visualisation overview', active: currentPage === 'home' },
        { href: '/model', label: 'Four Corner Model', icon: Database, description: 'FA Four Corner Model showcase', active: currentPage === 'model' },
      ]
    }
  ]

  return (
    <>
      {/* Mobile Menu Button - Hidden on desktop */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleMenu}
        className="lg:hidden flex items-center"
        aria-label="Open mobile menu"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Background overlay */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            onClick={closeMenu}
          />
          
          {/* Menu panel */}
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white/95 backdrop-blur-lg shadow-xl border-l border-slate-200">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="font-bold text-slate-900">Data Visualisation</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeMenu}
                  className="text-slate-600 hover:text-slate-900"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              {/* Menu content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {menuSections.map((section) => (
                  <div key={section.id} className="space-y-2">
                    {/* Section header */}
                    <div className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                      {section.title}
                    </div>

                    {/* Section items */}
                    <div className="space-y-1">
                      {section.items.map((item, index) => (
                        <Link
                          key={index}
                          href={item.href}
                          onClick={closeMenu}
                          className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                            item.active 
                              ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {item.icon && <item.icon className="h-5 w-5 flex-shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{item.label}</div>
                            {item.description && (
                              <div className="text-sm text-slate-500 mt-1">
                                {item.description}
                              </div>
                            )}
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer actions */}
              <div className="p-4 border-t border-slate-200 space-y-3">
                <Link
                  href="https://github.com/zenifieduk/dna-1"
                  target="_blank"
                  onClick={closeMenu}
                  className="flex items-center space-x-3 p-3 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Github className="h-5 w-5" />
                  <span className="font-medium">GitHub Repository</span>
                  <ChevronRight className="h-4 w-4 text-slate-400 ml-auto" />
                </Link>
                
                <div className="text-center p-3 text-sm text-slate-500">
                  FA Four Corner Model<br />
                  Data Visualisation Platform
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 