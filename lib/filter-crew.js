module.exports = function filterCrew (credit) {
  return [
    'Director',
    'Editor',
    'Director of Photography',
    'Cinematography',
    'Production Design',
    'Art Direction',
    'Book',
    'Story', 
    'Comic Book',
    'Screenstory',
    'Screenplay',
    'Writer',
    'Music',
    'Original Music Composer'].indexOf(credit.job) > -1
}
