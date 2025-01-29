"use client"

import { useState, useRef } from "react"
import ReactCrop, { type Crop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import { toPng } from "html-to-image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"

export default function PhotoFrame() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [croppedImage, setCroppedImage] = useState<string | null>(null)
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 90,
    height: 90,
    x: 5,
    y: 5,
  })
  const [showCropDialog, setShowCropDialog] = useState(false)
  const frameRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setSelectedImage(reader.result as string)
        setShowCropDialog(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCropComplete = async (crop: Crop) => {
    if (imgRef.current && crop.width && crop.height) {
      const croppedImageUrl = await getCroppedImg(imgRef.current, crop)
      setCroppedImage(croppedImageUrl)
    }
  }

  const getCroppedImg = (image: HTMLImageElement, crop: Crop): Promise<string> => {
    const canvas = document.createElement("canvas")
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    canvas.width = crop.width
    canvas.height = crop.height
    const ctx = canvas.getContext("2d")

    if (ctx) {
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height,
      )
    }

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(URL.createObjectURL(blob))
        }
      }, "image/jpeg")
    })
  }

  const handleCropConfirm = () => {
    setShowCropDialog(false)
  }

  const handleDownload = async () => {
    if (frameRef.current) {
      const dataUrl = await toPng(frameRef.current)
      const link = document.createElement("a")
      link.download = "framed-photo.png"
      link.href = dataUrl
      link.click()
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div ref={frameRef} className="relative w-[500px] h-[500px]">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Vyapari%20Ekta%20Painal%20Frame%20222-3iCY8prBIMdrL78SS3kdbggA38Ijki.png"
          alt="Frame"
          className="w-full h-full"
        />
        {croppedImage && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full overflow-hidden">
            <img src={croppedImage || "/placeholder.svg"} alt="Uploaded" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2">
        {!croppedImage ? (
          <Button asChild className="bg-green-500 hover:bg-green-600">
            <label>
              Choose Image
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </Button>
        ) : (
          <Button onClick={handleDownload} className="bg-blue-500 hover:bg-blue-600">
            Download
          </Button>
        )}
      </div>

      <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
        <DialogContent className="max-w-[800px] w-[90vw]">
          {selectedImage && (
            <div className="space-y-4">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => handleCropComplete(c)}
                aspect={1}
                circularCrop
              >
                <img ref={imgRef} src={selectedImage || "/placeholder.svg"} alt="Crop me" className="max-h-[60vh]" />
              </ReactCrop>
              <div className="flex justify-end">
                <Button onClick={handleCropConfirm}>Confirm Crop</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

