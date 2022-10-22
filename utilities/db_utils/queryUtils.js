export const getColumns = (data) => {
  let columns = "";
  try {
    data.forEach((_, index) => {
      if (index >= data.length - 1) {
        columns += `?`;
      } else {
        columns += `?,`;
      }
    });
  } catch (error) {
    return error.message;
  }

  return columns;
};


