

function predictors (username, classifier) {

  const m = many() 


  pull(
    //   m,
    //   map(p => {
    //     console.log(p)
    //     return p
    //   }),
    once(username),
    asyncMap((username, cb) => trainingSet({ username }, cb)),
      flatten(),
    map((row) => [{ [personKey(row)]: 1 }, { [genreKey(row)]: 1 }]),
      flatten(),
    unique((predictor) => Object.keys(predictor)[0]),
      map((predictor) => {
      return {
        key: Object.keys(predictor)[0],
        score: getTrueScore(classifier.classify(predictor, 0, true))
      }
    }),
    //  map(p => {
    //    console.log(p)
    //    return p
    //  }),
    //   filter((p) => p.key[0] === 'g'),
    //  filter((p) => p.score >=0),
    sort((a, b) => b.score - a.score),
      take(100),
    collect((err, results) => {

      console.log('predictors', results, results.length)
    })
  )

  // m.add(pull(
  //   once(username),
  //   asyncMap((username, cb) => trainingSet({ username }, cb)),
  //   flatten(),
  //   map((row) => [{ [personKey(row)]: 1 }, { [genreKey(row)]: 1 }]),
  //   flatten(),
  //   unique((predictor) => Object.keys(predictor)[0])
  // ))

  //  m.add(values([
  //    { audienceFav: 1 },
  //    { audienceLike: 1 },
  //    { criticFav: 1 },
  //    { criticLike: 1 }
  //  ]))
}

