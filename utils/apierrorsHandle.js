class ApiError extends Error {
          constructor(
                    statuscode,
                    messsage = "something went wrong",
                    errors = [],
                    statck = ""
          ) {
                    super(messsage);
                    this.statuscode = statuscode;
                    this.message = messsage;
                    this.errors = errors;
                    this.data = null;
                    this.success = false;
                    this.statck = statck;
          }
}

export {ApiError};
