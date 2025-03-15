export const getAuthorName = (author) => {
  if (!author) return 'Unknown author';

  // Check if fullName already exists
  if (author.fullName) return author.fullName;

  // Otherwise combine firstName and lastName
  return author.firstName && author.lastName
    ? `${author.firstName} ${author.lastName}`
    : author.firstName || author.lastName || 'Unknown author';
};
