// imports ================================================== //
import type { Response, Request } from "express";
import jwt from "jsonwebtoken";
import { isUserDataFromJWT } from "../../helpers/isUserDataFromJWT";
import { queryDataBase } from "../../helpers/dataBase";
import path from "path";
import { createReadStream, statSync } from "fs";
import findFileByName from "../../helpers/findFileByName";
import { lookup } from "mime-types";

// main ===================================================== //
async function GET(request: Request, response: Response) {
    try {

        const { id } = request.query;

        if (!id) {
            return response.status(400).send('ID параметр обязателен');
        }

        const uploadsDir = path.join(__dirname, '/../../../uploads/photo');
        const photoFile = findFileByName(uploadsDir, id as string);
        if (!photoFile) {
            return response.status(404).send('Файл не найден');
        }

        // Определяем MIME-тип по расширению файла
        const mimeType = lookup(photoFile) || 'application/octet-stream';
        const stat = statSync(photoFile);
        const fileSize = stat.size;

        let start = 0;
        let end = fileSize - 1;

        const range = request.headers.range;
        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            start = parseInt(parts[0], 10);
            end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            
            // Проверка корректности диапазона
            if (start >= fileSize || end >= fileSize) {
                response.setHeader('Content-Range', `bytes */${fileSize}`);
                return response.status(416).send('Запрашиваемый диапазон не может быть удовлетворен');
            }

            // Устанавливаем заголовки для частичного содержимого
            response.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': end - start + 1,
                'Content-Type': mimeType,
                'Cache-Control': 'public, max-age=31536000'
            });
        } else {
            // Если диапазон не указан, отправляем весь файл
            response.writeHead(200, {
                'Content-Length': fileSize,
                'Content-Type': mimeType,
                'Cache-Control': 'public, max-age=31536000'
            });
        }

        // Создаем поток для чтения файла
        const readStream = createReadStream(photoFile, range ? { start, end } : {});
        
        // Обработка событий потока
        readStream.on('open', () => {
            readStream.pipe(response);
        });

        readStream.on('error', (err) => {
            console.error('Ошибка при чтении файла:', err);
            if (!response.headersSent) {
                response.status(500).send('Ошибка при чтении файла');
            }
        });

        // Обработка закрытия соединения
        request.on('close', () => {
            readStream.destroy();
        });

    } catch (error) {
        console.error('Ошибка обработки запроса:', error);
        if (!response.headersSent) {
            response.status(500).send('Внутренняя ошибка сервера');
        }
    }
}
async function POST(request: Request, response: Response) {

    if (request.cookies.access_token) {

        const userData = jwt.decode(request.cookies.access_token);

        if (isUserDataFromJWT(userData) && request.file) {

            const { filename } = request.file!;
            const id_photo = filename.slice(0, filename.lastIndexOf("."));

            queryDataBase(
                async (connection) => {
                    const prepareQuery = await connection.prepare("INSERT INTO photos (id, user_id) VALUES (?,?)");
                    prepareQuery.execute([
                        id_photo,
                        userData.user_id,
                    ]);
                }
            );

            return response.status(200).json({ url: `http://s3.vision.com:3002/photo?id=${id_photo}` });

        }

    }

    response.status(403).json({ message: "Посмотри cookie!" });

}


// exports ================================================== //
export { GET, POST };