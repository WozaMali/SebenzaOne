import React from 'react'

interface CoverPageProps {
  ourCompanyName: string
  clientCompanyName: string
  ourCompanyLogo?: string // URL or path to logo
  clientCompanyLogo?: string // URL or path to logo
}

const CoverPage: React.FC<CoverPageProps> = ({ 
  ourCompanyName, 
  clientCompanyName, 
  ourCompanyLogo, 
  clientCompanyLogo 
}) => {
  return (
    <div style={{
      width: '210mm', // A4 width
      height: '297mm', // A4 height
      padding: '20mm',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      textAlign: 'center',
      border: '1px solid #eee',
      boxSizing: 'border-box',
      pageBreakAfter: 'always',
    }}>
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        {ourCompanyLogo && (
          <img src={ourCompanyLogo} alt="Our Company Logo" style={{ maxWidth: '150px', marginBottom: '20px' }} />
        )}
        <h1 style={{ fontSize: '2em', marginBottom: '1em' }}>{ourCompanyName}</h1>
        
        <h2 style={{ fontSize: '1.5em', marginTop: '2em', marginBottom: '1em' }}>Presents to</h2>

        {clientCompanyLogo && (
          <img src={clientCompanyLogo} alt="Client Company Logo" style={{ maxWidth: '150px', marginBottom: '20px' }} />
        )}
        <h1 style={{ fontSize: '2em' }}>{clientCompanyName}</h1>
      </div>
      <div style={{ fontSize: '0.8em', color: '#777' }}>
        Generated on {new Date().toLocaleDateString()}
      </div>
    </div>
  )
}

export default CoverPage
