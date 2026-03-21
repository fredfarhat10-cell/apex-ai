import type React from "react"

interface WidgetProps {
  title: string
  children: React.ReactNode
  className?: string
  icon?: React.ReactNode
}

export default function Widget({ title, children, className = "", icon }: WidgetProps) {
  return (
    <div
      className={`bg-apex-dark border border-gray-800 rounded-lg p-4 flex flex-col animate-in fade-in duration-300 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-apex-light flex items-center gap-2">
          {icon}
          {title}
        </h3>
      </div>
      <div className="flex-grow">{children}</div>
    </div>
  )
}
