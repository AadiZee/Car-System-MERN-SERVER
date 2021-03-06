//this is used to paginate and get records based on specific keywords from database
//this is not being used in this app.
const sortArgsHelper = (sort) => {
  //sorting arguments
  let sortArgs = { sortBy: "_id", order: "desc", limit: "3", skip: "0" };

  for (key in sort) {
    if (sort[key]) {
      sortArgs[key] = sort[key];
    }
  }

  return sortArgs;
};

module.exports = { sortArgsHelper };

// {sortBy: "_id", order: "dsc", limit: "6", skip:"0"}
