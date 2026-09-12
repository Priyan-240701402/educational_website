const router=require('express').Router(); const upload=require('../middleware/upload'); const { authenticate,authorize }=require('../middleware/auth');
router.post('/',authenticate,authorize('ADMIN','STAFF'),upload.single('file'),(req,res)=>{if(!req.file)return res.status(400).json({success:false,message:'A file is required.'});res.status(201).json({success:true,message:'File uploaded successfully',data:{url:`${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`,filename:req.file.filename,mimetype:req.file.mimetype}});});
module.exports=router;
