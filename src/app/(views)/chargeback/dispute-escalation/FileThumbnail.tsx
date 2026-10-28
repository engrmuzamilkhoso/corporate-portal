import { fileTypeColors } from '@/utils/fileTypeColors'
import colorCSV from '@/assets/file-logos/colorCSV.svg'
import colorPDF from '@/assets/file-logos/colorPDF.svg'
import colorTXT from '@/assets/file-logos/colorTXT.svg'
import colorXLSX from '@/assets/file-logos/colorXLSX.svg'
import colorPNG from '@/assets/file-logos/colorPNG.svg'
import colorJPG from '@/assets/file-logos/colorJPG.svg'
import colorBMP from '@/assets/file-logos/colorBMP.svg'
import colorDOC from '@/assets/file-logos/colorDOC.svg'
import colorDOCX from '@/assets/file-logos/colorDOCX.svg'

const FileThumbnail = ({
  file,
  disabled,
  removeFile,
  fileURL = '',
}: {
  file?: File
  disabled: boolean
  removeFile?: (file?: File) => void
  fileURL?: string
}) => {
  const fileName = file?.name || fileURL.split('/').pop()
  const ext = file
    ? file.name.split('.').pop()?.toLowerCase()
    : fileURL.split('.').pop()?.toLowerCase().split(/\#|\?/)[0]

  const fileIcons: Record<string, string> = {
    "csv": colorCSV.src,
    "pdf": colorPDF.src,
    "txt": colorTXT.src,
    "xlsx": colorXLSX.src,
    "xls": colorXLSX.src,
    "png": colorPNG.src,
    "jpg": colorJPG.src,
    "jpeg": colorJPG.src,
    "bmp": colorBMP.src,
    "doc": colorDOC.src,
    "docx": colorDOCX.src
  }

  const iconSrc = fileIcons[ext || '']

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (fileURL) {
      const link = document.createElement('a')
      link.href = fileURL
      link.download = fileName || 'download'
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div
      className="d-flex align-items-center justify-content-between"
      style={{
        backgroundColor: '#e6f3ff',
        borderRadius: '6px',
        padding: '6px 10px', // tighter padding to match modal spacing
        maxWidth: '100%',
        minWidth: '200px',
      }}
    >
      {/* File Icon */}
      <img
        src={iconSrc}
        alt={ext || 'file'}
        style={{
          width: '24px',
          height: '24px',
          marginRight: '8px',
        }}
      />

      {/* File Name (truncated) */}
      <small
        className="flex-grow-1 text-truncate mt-1"
        style={{
          marginRight: '8px',
          fontSize: '0.8rem', // same as comments text
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
        title={fileName}
      >
        {fileName}
      </small>

      {/* Download */}
      {fileURL && (
        <button
          type="button"
          className="file-download-btn me-1"
          onClick={handleDownload}
          disabled={disabled}
          style={{
            backgroundColor: 'transparent',
            color: 'gray',
            border: 'none',
            lineHeight: 1,
            fontSize: '0.75rem',
          }}
        >
          <i className="bi bi-download" style={{ fontSize: '0.9rem' }}></i>
        </button>
      )}

      {/* Remove */}
      {removeFile && (
        <button
          type="button"
          onClick={() => removeFile(file)}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: 'red',
            fontSize: '1rem',
            lineHeight: 1,
            cursor: 'pointer',
          }}
        >
          &times;
        </button>
      )}
    </div>
  )
}

export default FileThumbnail
