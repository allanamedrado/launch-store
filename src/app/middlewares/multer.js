const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images')
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now().toString()}-${file.originalname}`)
    }
 })

 const fileFilter = (req, file, cb) => {
     console.log(file)
    const isAccepted = ['image/png', 'image/jped', 'image/jpg'].find(acceptedFormat => acceptedFormat == file.mimetype)

    if(isAccepted) {
        return cb(null, true)
    }

    return cb(null, false)
 }

module.exports = multer({
    storage,
    fileFilter
})