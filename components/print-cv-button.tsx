"use client"

import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PrintCVButton() {
  return <Button variant="outline" className="print:hidden" onClick={() => window.print()}>
    <Printer aria-hidden="true" className="mr-2 h-4 w-4" /> Print or save PDF
  </Button>
}
