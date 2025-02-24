import multer from "multer"
export const formatOptions={
    image:['image/png','image/jpeg','image/gif'],
    video: ['video/mp4', 'video/mkv', 'video/avi'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
    pdf:['application/pdf']

}
export const multerHost=(customValidation=[])=>{

    const storage= multer.diskStorage({})
    function fileFilter (req, file, cb) {
        
        if(customValidation.includes(file.mimetype)){
            cb(null,true)
        }else{
            cb(new Error('invalid extention format'),false)
        }
    }
    const upload=multer({storage,fileFilter})
    return upload

}

export const multerCompany = multer({
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb) => {
      if (["logo", "coverPic"].includes(file.fieldname) && formatOptions.image.includes(file.mimetype)) {
        return cb(null, true);
      }
      if (file.fieldname === "legalAttachment" && [...formatOptions.image, ...formatOptions.pdf].includes(file.mimetype)) {
        return cb(null, true);
      }
      cb(new Error(`Invalid file type for ${file.fieldname}.`));
    }
});