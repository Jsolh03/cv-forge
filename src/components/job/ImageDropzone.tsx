import { useRef, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { Spinner } from '@/components/ui/Spinner'
import { cx } from '@/lib/classnames'
import { recognizeImage, type OcrProgress } from '@/services/ocr'

interface ImageDropzoneProps {
  onText: (text: string) => void
  onError: (message: string) => void
}

export function ImageDropzone({ onText, onError }: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [progress, setProgress] = useState<OcrProgress | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      onError('El archivo debe ser una imagen (PNG, JPG…).')
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    setBusy(true)
    setProgress({ status: 'Iniciando OCR…', progress: 0 })
    try {
      const text = await recognizeImage(file, setProgress)
      if (!text.trim()) {
        onError('No se detectó texto en la imagen. Prueba con una captura más nítida.')
        return
      }
      onText(text)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Error al procesar la imagen.')
    } finally {
      setBusy(false)
      setProgress(null)
    }
  }

  return (
    <div className="stack gap-3">
      <div
        className={cx('dropzone', dragging && 'dropzone--active')}
        onClick={() => !busy && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          const file = e.dataTransfer.files[0]
          if (file) void handleFile(file)
        }}
        role="button"
        tabIndex={0}
        aria-label="Subir captura de la oferta"
      >
        <div className="dropzone__icon">
          {busy ? <Spinner brand /> : <Icon name="image" size={26} />}
        </div>
        <div className="dropzone__title">
          {busy ? 'Procesando imagen…' : 'Arrastra una captura o haz clic'}
        </div>
        <div className="text-muted" style={{ fontSize: 'var(--fs-sm)' }}>
          PNG, JPG o WEBP · OCR 100% local con Tesseract.js
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleFile(file)
            e.target.value = ''
          }}
        />
      </div>

      {preview && (
        <div className="ocr-preview">
          <img src={preview} alt="Vista previa de la captura" />
          <div className="grow">
            {progress ? (
              <>
                <div className="row gap-2" style={{ fontSize: 'var(--fs-sm)', fontWeight: 600 }}>
                  <Spinner brand /> {progress.status}
                </div>
                <div className="ocr-progress">
                  <div
                    className="ocr-progress__bar"
                    style={{ width: `${Math.round(progress.progress * 100)}%` }}
                  />
                </div>
              </>
            ) : (
              <div className="row gap-2" style={{ color: 'var(--success)', fontWeight: 600 }}>
                <Icon name="check" size={16} /> Texto extraído correctamente
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
