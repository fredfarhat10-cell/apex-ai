export function ApexSpinner({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <div
      className={`apex-spinner ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export default ApexSpinner
