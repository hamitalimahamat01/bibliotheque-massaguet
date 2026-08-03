import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { promisify } from 'util';
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as 'image' | 'document';

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const tempDir = '/tmp/optimize';
    await fs.mkdir(tempDir, { recursive: true });
    
    const inputPath = path.join(tempDir, `input-${Date.now()}-${file.name}`);
    const outputPath = path.join(tempDir, `output-${Date.now()}.${type === 'image' ? 'avif' : 'pdf'}`);

    await fs.writeFile(inputPath, buffer);

    if (type === 'image') {
      await sharp(inputPath)
        .avif({
          quality: 80,
          effort: 6,
        })
        .resize(1200, null, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toFile(outputPath);

      const optimizedBuffer = await fs.readFile(outputPath);
      
      await fs.unlink(inputPath).catch(() => {});
      await fs.unlink(outputPath).catch(() => {});

      return new NextResponse(optimizedBuffer, {
        headers: {
          'Content-Type': 'image/avif',
          'Content-Disposition': `attachment; filename="${file.name.replace(/\.[^.]+$/, '')}.avif"`,
        },
      });
    } else if (type === 'document') {
      try {
        await execAsync(`gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/screen -dNOPAUSE -dQUIET -dBATCH -sOutputFile=${outputPath} ${inputPath}`);
        
        const stats = await fs.stat(outputPath);
        if (stats.size < buffer.length) {
          const optimizedBuffer = await fs.readFile(outputPath);
          await fs.unlink(inputPath).catch(() => {});
          await fs.unlink(outputPath).catch(() => {});
          
          return new NextResponse(optimizedBuffer, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="${file.name}"`,
            },
          });
        }
      } catch (error) {
        console.warn('Ghostscript non disponible, retour fichier original');
      }
      
      await fs.unlink(inputPath).catch(() => {});
      await fs.unlink(outputPath).catch(() => {});
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': file.type,
          'Content-Disposition': `attachment; filename="${file.name}"`,
        },
      });
    }

    return NextResponse.json({ error: 'Type non supporté' }, { status: 400 });
  } catch (error) {
    console.error('Erreur optimisation:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'optimisation' }, { status: 500 });
  }
}
