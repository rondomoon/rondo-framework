
function attachErrorListener(
  reader: FileReader,
  file: File,
  reject: (err: Error) => void,
) {
  reader.onerror = ev => reject(new Error('Error reading file: ' + file.name))
}

export async function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result as string)
    }
    attachErrorListener(reader, file, reject)
    reader.readAsDataURL(file)
  })
}

export async function readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result as ArrayBuffer)
    }
    attachErrorListener(reader, file, reject)
    reader.readAsArrayBuffer(file)
  })
}
