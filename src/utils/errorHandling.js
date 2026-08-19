const Err = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((error) => {
            console.log(error);
            return res.status(500).json({ message: "Internal Error" })
        })
    }
}

module.exports = { Err }