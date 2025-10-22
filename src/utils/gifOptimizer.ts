import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
import os from 'os'

const execAsync = promisify(exec)

export async function optimizeGif(inputBuffer: Buffer): Promise<Buffer> {
  // Skip optimization for files larger than 10MB to prevent timeouts
  if (inputBuffer.length > 10 * 1024 * 1024) {
    console.log(`GIF too large (${Math.round(inputBuffer.length / 1024 / 1024)}MB), skipping optimization`)
    return inputBuffer
  }

  // Create temporary files
  const tempDir = os.tmpdir()
  const inputPath = path.join(tempDir, `input-${Date.now()}.gif`)
  const outputPath = path.join(tempDir, `output-${Date.now()}.gif`)

  try {
    // Write input buffer to temporary file
    await fs.promises.writeFile(inputPath, inputBuffer)

    // Run gifsicle optimization with balanced settings
    const command = `npx gifsicle --optimize=3 --colors=256 --lossy=20 --resize-fit 1500x1500 "${inputPath}" -o "${outputPath}"`

    await execAsync(command, {
      timeout: 20000, // 20 second timeout
      maxBuffer: 20 * 1024 * 1024 // 20MB buffer
    })

    // Read optimized file
    const optimizedBuffer = await fs.promises.readFile(outputPath)

    // Cleanup temp files
    await Promise.all([
      fs.promises.unlink(inputPath).catch(() => {}),
      fs.promises.unlink(outputPath).catch(() => {})
    ])

    // Only return optimized version if it's actually smaller
    if (optimizedBuffer.length < inputBuffer.length) {
      const reduction = Math.round((1 - optimizedBuffer.length / inputBuffer.length) * 100)
      console.log(`GIF optimized: ${inputBuffer.length} → ${optimizedBuffer.length} bytes (${reduction}% reduction)`)
      return optimizedBuffer
    } else {
      console.log('GIF optimization did not reduce size, keeping original')
      return inputBuffer
    }

  } catch (error) {
    console.error('GIF optimization failed:', error)

    // Cleanup temp files on error
    await Promise.all([
      fs.promises.unlink(inputPath).catch(() => {}),
      fs.promises.unlink(outputPath).catch(() => {})
    ])

    // Return original buffer if optimization fails
    return inputBuffer
  }
}