import { CDropdown, CDropdownToggle, CDropdownMenu, CDropdownItem } from '@coreui/react-pro'
import { cilFile, cibExpertsExchange } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import Image from 'next/image'
import PDFImage from '@/public/images/downloadIcon/oldcolorPDF.svg'
import CSVImage from '@/public/images/downloadIcon/oldcolorCSV.svg'

interface ExportDropdownProps {
  onPDFExport: () => void
  onCSVExport: () => void
}

const ExportDropdownComponent = ({ onPDFExport, onCSVExport }: ExportDropdownProps) => {
  return (
    <CDropdown className="">
      <CDropdownToggle className="filter-btn" color="light" size="sm" caret={false}>
        <i className="bi bi-download"></i> Export
      </CDropdownToggle>
      <CDropdownMenu>
        <CDropdownItem onClick={onPDFExport}>
          {/* <CIcon icon={cilFile} size="sm" />  */}
          <Image className="downloadIcon" src={PDFImage} alt="head" />
          PDF
        </CDropdownItem>
        <CDropdownItem onClick={onCSVExport}>
          {/* <CIcon icon={cibExpertsExchange} size="sm" />  */}
          <Image className="downloadIcon" src={CSVImage} alt="head" />
          CSV
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default ExportDropdownComponent
