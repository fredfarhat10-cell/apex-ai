"use client"

import type React from "react"

import { useState } from "react"
import ApexSpinner from "./apex-spinner"
import { AlertTriangleIcon } from "./icons"

interface BulkImportPosition {
  ticker: string
  assetType: string
  quantity: number
  avgCost: number
  sector?: string
  region?: string
}

interface BulkImportModalProps {
  onImport: (positions: BulkImportPosition[]) => Promise<void>
  onClose: () => void
}

export default function BulkImportModal({ onImport, onClose }: BulkImportModalProps) {
  const [importMethod, setImportMethod] = useState<"csv" | "paste">("paste")
  const [pasteData, setPasteData] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [preview, setPreview] = useState<BulkImportPosition[]>([])

  const parseCSV = (csvText: string): BulkImportPosition[] => {
    const lines = csvText.trim().split("\n")
    const positions: BulkImportPosition[] = []
    const errors: string[] = []

    // Skip header row if it exists
    const startIndex = lines[0].toLowerCase().includes("ticker") ? 1 : 0

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const parts = line.split(",").map((p) => p.trim())

      if (parts.length < 4) {
        errors.push(`Line ${i + 1}: Invalid format (need at least ticker, type, quantity, cost)`)
        continue
      }

      const [ticker, assetType, quantityStr, avgCostStr, sector, region] = parts

      const quantity = Number.parseFloat(quantityStr)
      const avgCost = Number.parseFloat(avgCostStr)

      if (!ticker || !assetType) {
        errors.push(`Line ${i + 1}: Missing ticker or asset type`)
        continue
      }

      if (isNaN(quantity) || quantity <= 0) {
        errors.push(`Line ${i + 1}: Invalid quantity`)
        continue
      }

      if (isNaN(avgCost) || avgCost <= 0) {
        errors.push(`Line ${i + 1}: Invalid cost`)
        continue
      }

      const validTypes = ["stock", "etf", "bond", "crypto", "mutual_fund"]
      if (!validTypes.includes(assetType.toLowerCase())) {
        errors.push(`Line ${i + 1}: Invalid asset type (must be: ${validTypes.join(", ")})`)
        continue
      }

      positions.push({
        ticker: ticker.toUpperCase(),
        assetType: assetType.toLowerCase(),
        quantity,
        avgCost,
        sector: sector || undefined,
        region: region || undefined,
      })
    }

    setErrors(errors)
    return positions
  }

  const handlePreview = () => {
    setErrors([])
    const positions = parseCSV(pasteData)
    setPreview(positions)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      setPasteData(text)
      const positions = parseCSV(text)
      setPreview(positions)
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (preview.length === 0) return

    setIsProcessing(true)
    try {
      await onImport(preview)
      onClose()
    } catch (error) {
      console.error("[v0] Error importing positions:", error)
      setErrors(["Failed to import positions. Please try again."])
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-apex-dark border border-gray-700 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-white mb-4">Bulk Import Portfolio</h3>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setImportMethod("paste")}
            className={`px-4 py-2 rounded-md transition-all ${
              importMethod === "paste" ? "bg-apex-primary text-white" : "bg-apex-darker text-apex-gray hover:text-white"
            }`}
          >
            Paste Data
          </button>
          <button
            onClick={() => setImportMethod("csv")}
            className={`px-4 py-2 rounded-md transition-all ${
              importMethod === "csv" ? "bg-apex-primary text-white" : "bg-apex-darker text-apex-gray hover:text-white"
            }`}
          >
            Upload CSV
          </button>
        </div>

        <div className="mb-4 p-4 bg-apex-darker border border-gray-700 rounded-md">
          <p className="text-sm text-apex-gray mb-2">
            <strong>Format:</strong> ticker, asset_type, quantity, avg_cost, sector (optional), region (optional)
          </p>
          <p className="text-xs text-apex-gray">
            <strong>Example:</strong>
          </p>
          <pre className="text-xs text-apex-accent mt-1 font-mono">
            AAPL, stock, 10, 150.00, Technology, US{"\n"}
            BTC, crypto, 0.5, 45000.00{"\n"}
            VTSAX, etf, 100, 110.50, Diversified, US
          </pre>
        </div>

        {importMethod === "csv" ? (
          <div className="mb-4">
            <label className="block text-sm font-medium text-apex-gray mb-2">Upload CSV File</label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="w-full bg-apex-darker border border-gray-700 rounded-md p-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-apex-primary file:text-white hover:file:bg-apex-primary/80"
            />
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-sm font-medium text-apex-gray mb-2">Paste Portfolio Data</label>
            <textarea
              value={pasteData}
              onChange={(e) => setPasteData(e.target.value)}
              placeholder="Paste your portfolio data here (one position per line)..."
              rows={8}
              className="w-full bg-apex-darker border border-gray-700 rounded-md p-3 text-white font-mono text-sm"
            />
          </div>
        )}

        <button
          onClick={handlePreview}
          disabled={!pasteData}
          className="w-full mb-4 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Preview Import
        </button>

        {errors.length > 0 && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-md">
            <div className="flex items-start gap-2">
              <AlertTriangleIcon size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-500 mb-2">Errors Found:</p>
                <ul className="text-sm text-red-400 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {preview.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold text-white mb-2">
              Preview ({preview.length} position{preview.length !== 1 ? "s" : ""})
            </h4>
            <div className="max-h-64 overflow-y-auto border border-gray-700 rounded-md">
              <table className="w-full">
                <thead className="bg-apex-darker sticky top-0">
                  <tr>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-apex-gray">Ticker</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-apex-gray">Type</th>
                    <th className="text-right py-2 px-3 text-sm font-semibold text-apex-gray">Quantity</th>
                    <th className="text-right py-2 px-3 text-sm font-semibold text-apex-gray">Avg Cost</th>
                    <th className="text-right py-2 px-3 text-sm font-semibold text-apex-gray">Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((position, index) => (
                    <tr key={index} className="border-t border-gray-800">
                      <td className="py-2 px-3 text-white font-semibold">{position.ticker}</td>
                      <td className="py-2 px-3 text-apex-gray capitalize">{position.assetType}</td>
                      <td className="py-2 px-3 text-right text-white">{position.quantity}</td>
                      <td className="py-2 px-3 text-right text-white">${position.avgCost.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right text-white">
                        ${(position.quantity * position.avgCost).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleImport}
            disabled={isProcessing || preview.length === 0}
            className="flex-1 bg-apex-primary text-white py-3 rounded-md hover:bg-apex-primary/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <ApexSpinner size={16} />
                Importing {preview.length} positions...
              </>
            ) : (
              `Import ${preview.length} Position${preview.length !== 1 ? "s" : ""}`
            )}
          </button>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 bg-gray-700 text-white py-3 rounded-md hover:bg-gray-600 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
