module.exports = {
    success: (res, message, data = null, statusCode = 200) => {
        return res.status(statusCode).json({
            status: true,
            message: message,
            data: data
        });
    },
    error: (res, message, statusCode = 400) => {
        return res.status(statusCode).json({
            status: false,
            message: message,
            data: null
        });
    }
};
