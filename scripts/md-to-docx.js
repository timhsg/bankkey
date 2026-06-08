// ════════════════════════════════════════════════════════════════════════
//  Convertit nos fichiers .md (OUTREACH, DEMO-PLAYBOOK, STRATEGY) en .docx
//  Usage : node scripts/md-to-docx.js
// ════════════════════════════════════════════════════════════════════════

const fs = require('fs')
const path = require('path')
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, LevelFormat, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageOrientation,
} = require('docx')

const COLOR = {
  text: '0F172A',
  muted: '475569',
  brand: '1E40AF',
  code: 'F1F5F9',
  border: 'CBD5E1',
}

// ── Parser markdown très simple ────────────────────────────────────────

function parseInline(text) {
  // Découpe le texte en runs : bold (**), italic (*), code (`), normal
  const runs = []
  let i = 0
  let current = ''

  function flush(extraProps = {}) {
    if (current) {
      runs.push(new TextRun({ text: current, font: 'Calibri', size: 22, color: COLOR.text, ...extraProps }))
      current = ''
    }
  }

  while (i < text.length) {
    // **bold**
    if (text[i] === '*' && text[i + 1] === '*') {
      flush()
      const end = text.indexOf('**', i + 2)
      if (end > -1) {
        runs.push(new TextRun({ text: text.slice(i + 2, end), bold: true, font: 'Calibri', size: 22, color: COLOR.text }))
        i = end + 2
        continue
      }
    }
    // `code`
    if (text[i] === '`') {
      flush()
      const end = text.indexOf('`', i + 1)
      if (end > -1) {
        runs.push(new TextRun({
          text: text.slice(i + 1, end),
          font: 'Courier New', size: 20, color: COLOR.text,
          shading: { fill: COLOR.code, type: ShadingType.CLEAR },
        }))
        i = end + 1
        continue
      }
    }
    // *italic*
    if (text[i] === '*' && text[i - 1] !== '*' && text[i + 1] !== '*') {
      flush()
      const end = text.indexOf('*', i + 1)
      if (end > -1 && text[end - 1] !== '*') {
        runs.push(new TextRun({ text: text.slice(i + 1, end), italics: true, font: 'Calibri', size: 22, color: COLOR.text }))
        i = end + 1
        continue
      }
    }
    current += text[i]
    i++
  }
  flush()
  return runs.length > 0 ? runs : [new TextRun({ text: ' ', font: 'Calibri', size: 22 })]
}

// ── Conversion d'un bloc markdown en éléments docx ────────────────────

function convertMarkdown(md) {
  const children = []
  const lines = md.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Heading H1-H4
    const h = line.match(/^(#{1,6})\s+(.+?)$/)
    if (h) {
      const level = h[1].length
      const text = h[2].replace(/^[🎯🔑🛡️🚀💼🟢🟡🔴⚠️✅❌📝📊📧🔄🧰📚🔮🟠🤖💡📋📁📲🌐🔵🔧🎬✉️⭐🎨🆕📞🟩🚨📣💼📈📦🥇🥈🥉]+\s*/g, '')
      const headingLevel = ['', HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3, HeadingLevel.HEADING_4, HeadingLevel.HEADING_5, HeadingLevel.HEADING_6][level]
      children.push(new Paragraph({
        heading: headingLevel,
        children: [new TextRun({ text, bold: true, font: 'Calibri', size: [0, 36, 30, 26, 24, 22, 22][level] || 22, color: COLOR.text })],
        spacing: { before: level === 1 ? 360 : 240, after: 120 },
      }))
      i++
      continue
    }

    // Horizontal rule
    if (line.match(/^---+$/)) {
      children.push(new Paragraph({
        children: [],
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: COLOR.border, space: 1 } },
        spacing: { before: 120, after: 240 },
      }))
      i++
      continue
    }

    // Bloc code (```)
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim()
      i++
      const codeLines = []
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++ // skip closing ```
      // Bloc de code dans une cellule grise
      children.push(new Paragraph({
        children: [new TextRun({
          text: codeLines.join('\n'),
          font: 'Courier New', size: 18, color: COLOR.text,
        })],
        shading: { fill: COLOR.code, type: ShadingType.CLEAR },
        spacing: { before: 120, after: 120 },
      }))
      continue
    }

    // Tableau markdown
    if (line.includes('|') && i + 1 < lines.length && lines[i + 1].match(/^\s*\|?\s*:?-+:?/)) {
      const rows = []
      const headerCells = line.split('|').map(c => c.trim()).filter(c => c.length > 0)
      rows.push(headerCells)
      i += 2 // skip separator line
      while (i < lines.length && lines[i].includes('|')) {
        const cells = lines[i].split('|').map(c => c.trim()).filter(c => c.length > 0)
        if (cells.length === 0) break
        rows.push(cells)
        i++
      }
      // Construit le tableau docx
      const colCount = Math.max(...rows.map(r => r.length))
      const colWidth = Math.floor(9360 / colCount)
      const tableRows = rows.map((row, rowIdx) => new TableRow({
        children: Array.from({ length: colCount }, (_, c) => {
          const cellText = row[c] ?? ''
          return new TableCell({
            width: { size: colWidth, type: WidthType.DXA },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: COLOR.border },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: COLOR.border },
              left: { style: BorderStyle.SINGLE, size: 1, color: COLOR.border },
              right: { style: BorderStyle.SINGLE, size: 1, color: COLOR.border },
            },
            shading: rowIdx === 0 ? { fill: 'E2E8F0', type: ShadingType.CLEAR } : undefined,
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({
              children: parseInline(cellText).map(r => {
                if (rowIdx === 0) return new TextRun({ ...r.options, bold: true })
                return r
              }),
            })],
          })
        }),
      }))
      children.push(new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: Array.from({ length: colCount }, () => colWidth),
        rows: tableRows,
      }))
      children.push(new Paragraph({ children: [new TextRun({ text: '' })], spacing: { after: 120 } }))
      continue
    }

    // Quote (>)
    if (line.startsWith('> ')) {
      const text = line.slice(2)
      children.push(new Paragraph({
        children: parseInline(text).map(r => new TextRun({ ...r.options, italics: true, color: COLOR.muted })),
        indent: { left: 360 },
        border: { left: { style: BorderStyle.SINGLE, size: 12, color: COLOR.brand, space: 8 } },
        spacing: { before: 60, after: 60 },
      }))
      i++
      continue
    }

    // Liste à puces (-)
    if (line.match(/^[-*]\s+/)) {
      const text = line.replace(/^[-*]\s+/, '')
      children.push(new Paragraph({
        numbering: { reference: 'bullets', level: 0 },
        children: parseInline(text),
        spacing: { before: 30, after: 30 },
      }))
      i++
      continue
    }

    // Liste numérotée
    if (line.match(/^\d+\.\s+/)) {
      const text = line.replace(/^\d+\.\s+/, '')
      children.push(new Paragraph({
        numbering: { reference: 'numbers', level: 0 },
        children: parseInline(text),
        spacing: { before: 30, after: 30 },
      }))
      i++
      continue
    }

    // Ligne vide
    if (line.trim() === '') {
      children.push(new Paragraph({ children: [new TextRun({ text: '' })], spacing: { after: 60 } }))
      i++
      continue
    }

    // Paragraphe normal
    children.push(new Paragraph({
      children: parseInline(line),
      spacing: { before: 60, after: 60 },
    }))
    i++
  }

  return children
}

// ── Génération d'un fichier ────────────────────────────────────────────

async function convert(srcPath, outPath, title) {
  const md = fs.readFileSync(srcPath, 'utf-8')
  const children = convertMarkdown(md)

  const doc = new Document({
    creator: 'BankKey',
    title,
    description: 'Document interne BankKey',
    numbering: {
      config: [
        {
          reference: 'bullets',
          levels: [{
            level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          }],
        },
        {
          reference: 'numbers',
          levels: [{
            level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          }],
        },
      ],
    },
    styles: {
      default: {
        document: { run: { font: 'Calibri', size: 22, color: COLOR.text } },
      },
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 }, // A4
          margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 }, // 2cm
        },
      },
      children,
    }],
  })

  const buffer = await Packer.toBuffer(doc)
  fs.writeFileSync(outPath, buffer)
  console.log(`✓ ${path.basename(outPath)} (${(buffer.length / 1024).toFixed(1)} ko)`)
}

// ── Main ───────────────────────────────────────────────────────────────

async function main() {
  const root = path.resolve(__dirname, '..')
  const exportsDir = path.join(root, 'exports')
  if (!fs.existsSync(exportsDir)) fs.mkdirSync(exportsDir, { recursive: true })

  await convert(
    path.join(root, 'OUTREACH-2026.md'),
    path.join(exportsDir, '01-OUTREACH-2026.docx'),
    'Outreach BankKey - Plan d action concret',
  )
  await convert(
    path.join(root, 'DEMO-PLAYBOOK.md'),
    path.join(exportsDir, '02-DEMO-PLAYBOOK.docx'),
    'Demo Playbook BankKey - Script de vente',
  )
  await convert(
    path.join(root, 'STRATEGY.md'),
    path.join(exportsDir, '03-STRATEGY.docx'),
    'Strategie BankKey - Concurrents et equipe',
  )

  console.log('\n✅ 3 fichiers Word generes dans : ' + exportsDir)
}

main().catch(err => {
  console.error('Erreur :', err)
  process.exit(1)
})
