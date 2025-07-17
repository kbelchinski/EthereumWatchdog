const formatValidationErrors = (error, fieldsMetadata) => {
  let issues = [];

  if (error.errors) {
    issues = error.errors;
  } else {
    try {
      issues = JSON.parse(error.message);
    } catch {
      return [
        {
          field: null,
          message: 'Failed to parse validation error',
          code: 'parse_error',
          fieldsMetadata,
        },
      ];
    }
  }

  return issues.map((e) => ({
    field: e.path.join('.'),
    message: e.message,
    code: e.code,
    fieldsMetadata,
  }));
};
