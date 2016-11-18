module.exports = function mapToCredit (movieId, credit) {
  return {
    id: credit.credit_id,
    job: jobName(credit),
    person_id: credit.id,
    movie_id: movieId,
    name: credit.name
  }
}

function jobName (credit) {
  switch (credit.order) {
    case undefined:
      return consolidateJobs(credit.job)
    case 0:
      return 'Lead Actor'
    default:
      return 'Supporting Actor'
  }
}

function consolidateJobs (job) {
  if ([
    'Story', 
    'Writer', 
    'Screenplay', 
    'Screenstory'].indexOf(job) > -1) return 'Writer'
  if (['Book', 'Comic Book'].indexOf(job) > -1) return 'Book'
  if ([
    'Music', 
    'Original Music Composer'].indexOf(job) > -1) return 'Music'
  if ([
    'Director of Photography',
    'Cinematography'].indexOf(job) > -1) return 'Cinematography'
  if ([
    'Art Direction',
    'Production Design'].indexOf(job) > -1) return 'Production Design'

  return job
}

