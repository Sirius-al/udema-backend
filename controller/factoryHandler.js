
const ApiFeatures = require('./../utils/ApiFeatures')


exports.getAll = Model => async (req, res, next) => {
    try {

        let filter = {}
        if (req.params.courseId) {
            filter = {course: req.params.courseId}
        }

        const features = new ApiFeatures(Model.find(filter), req.query).filter().sort().fields().paginate();
        const doc = await features.modelObj//.explain()

        res.status(200).json({
            success: true,
            results: doc.length,
            data: {
                doc
            }
        })
    } catch (err) {
        next(err)
    }
}