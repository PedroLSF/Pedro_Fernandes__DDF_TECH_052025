function arrayToSpreadSheet(arr: string[][], separator: string = ';'): string {
  return arr.map((l) => l.join(separator)).join('\n');
}

export function openSpreadSheetInNewWindow(
  data: string[][],
  filename: string,
  mimeType: string = 'text/csv', // MIME type
  charset: string = 'utf-8', // Charset
  separator: string = ';'
): void {
  const csvContent = `\uFEFF${arrayToSpreadSheet(data, separator)}`;

  const encodedUri = `data:${mimeType};charset=${charset},${encodeURIComponent(csvContent)}`;

  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}.csv`);
  link.setAttribute('target', '_blank');

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
}
