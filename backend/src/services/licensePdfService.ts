import { jsPDF } from 'jspdf'
import { LicensePurchase } from '../entities/LicensePurchase.js'
import { LicenseTierInfo, LicenseTier } from '../types.js'

const tierNames: Record<LicenseTier, string> = {
  [LicenseTier.PERSONAL]: '个人授权',
  [LicenseTier.COMMERCIAL_AD]: '商业广告授权',
  [LicenseTier.FILM_DISTRIBUTION]: '影视发行授权'
}

export const generateLicenseCertificate = async (
  purchase: LicensePurchase,
  userName: string,
  userEmail: string
): Promise<Buffer> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  doc.setFillColor(15, 23, 42)
  doc.rect(0, 0, pageWidth, 40, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.text('采样工坊', pageWidth / 2, 25, { align: 'center' })

  doc.setTextColor(15, 23, 42)
  doc.setFontSize(20)
  doc.text('授权证明书', pageWidth / 2, 70, { align: 'center' })

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Certificate of License', pageWidth / 2, 80, { align: 'center' })

  doc.setDrawColor(14, 165, 233)
  doc.setLineWidth(0.5)
  doc.line(30, 90, pageWidth - 30, 90)

  const tierInfo = LicenseTierInfo[purchase.licenseTier]
  const startY = 110

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('授权编号 (License Key):', 30, startY)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(139, 92, 246)
  doc.setFont('helvetica', 'bold')
  doc.text(purchase.licenseKey, 80, startY)

  doc.setTextColor(15, 23, 42)
  doc.setFont('helvetica', 'bold')
  doc.text('被授权方 (Licensee):', 30, startY + 15)
  doc.setFont('helvetica', 'normal')
  doc.text(`${userName} (${userEmail})`, 80, startY + 15)

  doc.setFont('helvetica', 'bold')
  doc.text('采样包 (Sample Pack):', 30, startY + 30)
  doc.setFont('helvetica', 'normal')
  doc.text(purchase.samplePack.name, 80, startY + 30)

  doc.setFont('helvetica', 'bold')
  doc.text('授权类型 (License Type):', 30, startY + 45)
  doc.setTextColor(14, 165, 233)
  doc.setFont('helvetica', 'bold')
  doc.text(tierNames[purchase.licenseTier], 80, startY + 45)

  doc.setTextColor(15, 23, 42)
  doc.setFont('helvetica', 'bold')
  doc.text('授权版本 (Version):', 30, startY + 60)
  doc.setFont('helvetica', 'normal')
  doc.text(purchase.samplePack.version, 80, startY + 60)

  doc.setFont('helvetica', 'bold')
  doc.text('购买日期 (Purchase Date):', 30, startY + 75)
  doc.setFont('helvetica', 'normal')
  doc.text(new Date(purchase.createdAt).toLocaleDateString('zh-CN'), 80, startY + 75)

  doc.setFont('helvetica', 'bold')
  doc.text('购买价格 (Price Paid):', 30, startY + 90)
  doc.setFont('helvetica', 'normal')
  doc.text(`¥ ${Number(purchase.pricePaid).toFixed(2)}`, 80, startY + 90)

  const featuresY = startY + 110
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('授权权限说明 (License Terms):', 30, featuresY)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  tierInfo.features.forEach((feature, index) => {
    doc.text(`• ${feature}`, 35, featuresY + 12 + (index * 8))
  })

  const footerY = pageHeight - 40
  doc.setDrawColor(14, 165, 233)
  doc.line(30, footerY, pageWidth - 30, footerY)

  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text('本授权证明书由采样工坊 (Sample Store) 自动生成', pageWidth / 2, footerY + 15, { align: 'center' })
  doc.text(`生成日期: ${new Date().toLocaleDateString('zh-CN')}`, pageWidth / 2, footerY + 22, { align: 'center' })
  doc.text('https://samplestore.example.com', pageWidth / 2, footerY + 29, { align: 'center' })

  const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
  return pdfBuffer
}

export const generateLicenseFileName = (purchase: LicensePurchase): string => {
  const sanitizedName = purchase.samplePack.name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')
  return `授权证明书_${sanitizedName}_${purchase.licenseKey.slice(0, 8)}.pdf`
}
