class ApiFeatures {
    constructor(modelObj, queryString) {
        this.modelObj = modelObj;
        this.queryString = queryString;
    }

    //? 1) filetering 
    filter() {
        //? 1A) filetering easy
        const query = {
            ...this.queryString
        }
        const excludeFields = ['page', 'limit', 'sort', 'fields']
        excludeFields.forEach(el => delete query[el])

        //? 1B) Advanced filetering
        let queryStr = JSON.stringify(query)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|ne|nin)\b/g, match => `$${match}`)
        console.log(queryStr)

        this.modelObj = this.modelObj.find(JSON.parse(queryStr))

        return this
    }


    //? 2) Sorting
    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ')
            this.modelObj = this.modelObj.sort(sortBy)
        } else {
            //! this.modelObj = this.modelObj.sort('-CreatedAt')
        }

        return this
    }

    //? 3) Fields
    fields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.modelObj = this.modelObj.select(fields)
        } else {
            this.modelObj = this.modelObj.select('-__v')
        }
        return this
    }

    //? 4) pagination
    paginate() {
        const page = parseInt(this.queryString.page) || 1
        const limit = parseInt(this.queryString.limit) || 100
        const skip = (page - 1) * limit

        this.modelObj = this.modelObj.skip(skip).limit(limit)

        return this;
    }
}

module.exports = ApiFeatures