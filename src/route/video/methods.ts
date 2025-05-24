// imports ================================================== //
import type { Response, Request } from "express";
import jwt from "jsonwebtoken";
import { isUserDataFromJWT } from "../../helpers/isUserDataFromJWT";
import { queryDataBase } from "../../helpers/dataBase";
import { createReadStream, existsSync, statSync } from "fs";
import path from "path";
import findFileByName from "../../helpers/findFileByName";
import { lookup } from "mime-types";

// main ===================================================== //
async function GET(request: Request, response: Response) {
    try {
        
        const { v: videoId } = request.query;

        if (!videoId) {
            return response.status(400).send('ID видео обязателен');
        }

        const uploadsDir = path.join(__dirname, '/../../../uploads/video');
        const videoFile = findFileByName(uploadsDir, videoId as string);
        
        if (!videoFile) {
            return response.status(404).send('Видеофайл не найден');
        }

        // Определяем MIME-тип по расширению файла
        const mimeType = lookup(videoFile) || 'video/mp4';
        const stat = statSync(videoFile);
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
                return response.status(416).send('Недопустимый диапазон');
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
        const readStream = createReadStream(videoFile, range ? { start, end } : {});
        
        // Обработка событий потока
        readStream.on('open', () => {
            readStream.pipe(response);
        });

        readStream.on('error', (err) => {
            console.error('Ошибка чтения видео:', err);
            if (!response.headersSent) {
                response.status(500).send('Ошибка при чтении видео');
            }
        });

        // Обработка закрытия соединения
        request.on('close', () => {
            readStream.destroy();
        });

    } catch (error) {
        console.error('Ошибка обработки запроса видео:', error);
        if (!response.headersSent) {
            response.status(500).send('Ошибка сервера');
        }
    }
}
async function POST(request: Request, response: Response) {

    if (request.cookies.access_token) {

        const userData = jwt.decode(request.cookies.access_token);

        if (isUserDataFromJWT(userData) && request.file) {

            const { filename } = request.file!;
            const id_video = filename.slice(0, filename.lastIndexOf("."));

            queryDataBase(
                async (connection) => {
                    const { title, description, age_limit, hasComments, hasDownload, levelAccess } = request.body;
                    const prepareQuery = await connection.prepare("INSERT INTO videos (id, user_id, name, description, age_limit, has_comments, level_access, has_load) VALUES (?,?,?,?,?,?,?,?)");
                    prepareQuery.execute([
                        id_video,
                        userData.user_id,
                        title,
                        description,
                        age_limit,
                        (hasComments === "on") ? "1" : "0",
                        levelAccess,
                        (hasDownload === "on") ? "1" : "0",
                    ]);
                }
            );

            return response.json({ link: `http://vision.com:3005/watch?v=${id_video}` }).end();

        }

    }

    response.status(403).json({ message: "Посмотри cookie!" });

}

// exports ================================================== //
export { GET, POST };