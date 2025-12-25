import type React from "react"
declare namespace JSX {
  interface IntrinsicElements {
    "model-viewer": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        src?: string
        poster?: string
        ar?: boolean
        "ar-modes"?: string
        "ar-scale"?: string
        "camera-controls"?: boolean
        "auto-rotate"?: boolean
        "shadow-intensity"?: string
        exposure?: string
        alt?: string
        loading?: string
      },
      HTMLElement
    >
  }
}
