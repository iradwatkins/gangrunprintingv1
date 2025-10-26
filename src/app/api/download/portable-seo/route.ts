import { type NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const filePath = path.join(
      process.cwd(),
      '.aaaaaa',
      'portable-seo-llm-system',
      'portable-seo-llm-system.tar.gz'
    )

    const fileBuffer = await readFile(filePath)

    return new NextResponse(fileBuffer as any, {
      headers: {
        'Content-Type': 'application/gzip',
        'Content-Disposition': 'attachment; filename="portable-seo-llm-system.tar.gz"',
        'Content-Length': fileBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
}
