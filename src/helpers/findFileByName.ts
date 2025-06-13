import { readdirSync } from "fs";
import path from "path";

export default function findFileByName(dir: string, fileNameWithoutExt: string) {
    
    const files = readdirSync(dir);
    
    const foundFile = files.find(file => {
      const fileBaseName = path.basename(file, path.extname(file));
      return fileBaseName === fileNameWithoutExt;
    });
  
    return foundFile ? path.join(dir, foundFile) : null;

  }
  