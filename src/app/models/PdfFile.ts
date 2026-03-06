export class PdfFile {
  name: string;
  constructor(public file: File) {
    this.name = file.name;
  }
}
