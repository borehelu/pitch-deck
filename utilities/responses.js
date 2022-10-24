const statusRes = {
  200: "Success",
  201: "Success",
  400: "Error",
  401: "Authentication error",
  403: "Error, not allowed",
  404: "Error, not found",
};

const errorResponse = (res, status, message) => {
  res.status(status).json({ status, error: message });
};

const successResponse = (res, status, message = null, payload = null) => {
  res.status(status).json({
    status: statusRes[status],
    data: {
      message,
      ...payload,
    },
  });
};

const successResponseArray = (res, status, arrayData) => {
  const response = {
    status: statusRes[status],
    data: arrayData,
  };
  res.status(status).json(response);
};

export { errorResponse, successResponse, successResponseArray };
