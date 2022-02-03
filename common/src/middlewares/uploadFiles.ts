import { BadRequestError } from "../errors/bad-request-error";
import { Request , Response , NextFunction } from "express";
import multer from 'multer';

const storage = multer.memoryStorage();
const upload  = multer({ storage });

const validationPhoto = (req : Request , res : Response , next : NextFunction) =>
{
    const files = req.files as { [fieldname : string] : Express.Multer.File[] };

    if(files.profilePicture)
    {
        files.profilePicture.map(file =>
        {
            if(!file.originalname.match(/\.(jpg|jpeg|png)/))
            {
                throw new BadRequestError(`${file.originalname} should be a valid image.`);
            }

            if(file.size > 1e6)
            {
                throw new BadRequestError(`${file.size} is Larger`);
            }
        });
    };

    if(files.coverPicture)
    {
        files.coverPicture.map(file =>
        {
            if(!file.originalname.match(/\.(jpg|jpeg|png)/))
            {
                throw new BadRequestError(`${file.originalname} should be a valid image.`);
            }

            if(file.size > 1e6)
            {
                throw new BadRequestError(`${file.size} is Larger`);
            }
        });
    };

    next();
}

export { upload , validationPhoto };

