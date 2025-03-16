export const getAuthorName = (author) => {
  if (!author) return 'Unknown author'

  if (author.fullName) return author.fullName

  return author.firstName && author.lastName
    ? `${author.firstName} ${author.lastName}`
    : author.firstName || author.lastName || 'Unknown author'
}
