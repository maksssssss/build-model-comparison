"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Smartphone, AlertCircle } from "lucide-react"
import { ARScene } from "./ar-scene"

interface ARViewerProps {
  bimFile: File
  onExit: () => void
}

export function ARViewer({ bimFile, onExit }: ARViewerProps) {
  const [isAndroid, setIsAndroid] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase()
    const checkAndroid = /android/.test(userAgent)
    const checkMobile = /mobile|android/.test(userAgent)

    setIsAndroid(checkAndroid)
    setIsMobile(checkMobile)
  }, [])

  if (!isAndroid || !isMobile) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="absolute left-0 right-0 top-0 z-30 border-b border-orange-200 bg-white/95 backdrop-blur-sm shadow-lg">
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="text-base font-bold text-orange-900">AR Режим</h2>
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0" onClick={onExit}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex h-full items-center justify-center p-6 pt-20">
          <div className="text-center space-y-6 max-w-md">
            <div className="flex justify-center">
              <div className="rounded-full bg-orange-100 p-8">
                <AlertCircle className="h-20 w-20 text-orange-600" />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-gray-900">AR доступен только на Android</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Этот режим работает только на мобильных устройствах Android с поддержкой ARCore
              </p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 text-left space-y-3">
              <div className="flex items-start gap-3">
                <Smartphone className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-gray-900 text-sm">Требования:</p>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                    <li>Android 7.0 или новее</li>
                    <li>Google Chrome браузер</li>
                    <li>ARCore поддержка</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button variant="outline" size="lg" onClick={onExit} className="w-full bg-transparent">
              Вернуться к сравнению моделей
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="absolute left-0 right-0 top-0 z-30 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between px-3 py-3 safe-top">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-white">AR Режим</p>
              <p className="text-xs text-white/70 truncate">{bimFile.name}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0 flex-shrink-0 text-white hover:bg-white/20"
            onClick={onExit}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <ARScene bimFile={bimFile} />
    </div>
  )
}
