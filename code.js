const assert = require('assert')

{
  // Container :: a -> Container a
  const Container = (a) => ({
    value: a
  })

  assert(Container(5).value, 5) // Noice!
  }
{
  // List :: a -> List a
  const List = (a) => ({
    value: a,
    // equals :: List a -> List b -> Boolean
    equals: (b) => a.every((v, i) => v === b.value[i])
  })

  assert(List([1,2,3]).equals(List([1,2,3])) === true)
  assert(List([1,2,3]).equals(List([1,2,42])) === false)
}
{
  // List :: a -> List a
  const List = (a) => ({
    value: a,
    // concat :: List -> List -> List
    concat: (b) => List(a.concat(b.value))
  })

  assert.deepEqual(
    List([1]).concat(List([42])).value, 
    List([1,42]).value)
  }
{
  // List :: a -> List a
  const List = (a) => ({
    value: a,
    // concat :: List -> List -> List
    concat: (b) => List(a.concat(b.value))
  })
  // empty :: () -> List
  List.empty = () => List([])

  assert.deepEqual(
    List([1]).concat(List.empty()).value,
    List([1]).value)
}
{
  // List :: a -> List a
  const List = (a) => ({
    value: a,
    // map :: List a -> (a -> b) -> List b
    map: (fn) => List(a.map(fn))
  })

  assert.deepEqual(
    List([1,2]).map(a => a*2).value,
    List([2,4]).value)
}
{
  // Container :: a -> Container a
  const Container = (a) => ({
    value: a,
    // map :: Container a -> (a -> b) -> Container b
    map: (fn) => Container(fn(a))
  })

  assert(
    Container(777).map(a => a*2).value, 
    Container(1554).value)
}
{
  // Maybe :: a -> Maybe a
  const Maybe = (a) => ({
    value: a,
    // map :: Maybe a -> (a -> b) -> Maybe b
    map: (fn) => a ? Maybe(fn(a)) : Maybe(null),
  })

  assert(Maybe(42).map(a => a*3).value === 126)
  assert(Maybe(42).map(a => a*3)
                  .map(a => a-126)
                  .map(a => a+10).value === null)
  assert(Maybe(43).map(a => a*3)
                  .map(a => a-126)
                  .map(a => a+10).value === 13)
  assert(Maybe(null).map(a => a*3).value === null)
}
{
  // Container :: a -> Container a
  const Container = (a) => ({
    value: a,
    // map :: Container a -> (a -> b) -> Container b
    map: (fn) => Container(fn(a)),
    // ap :: Container a -> Container (a -> b) -> Container b
    ap: (fnAp) => Container(fnAp.value(a))
  })

  assert(
    Container("WAT").ap(Container(a => a+a)).value,
    Container("WATWAT").value)
  }
{
  // Container :: a -> Container a
  const Container = (a) => ({
    value: a,
    // map :: Container a -> (a -> b) -> Container b
    map: (fn) => Container(fn(a)),
    // ap :: Container a -> Container (a -> b) -> Container b
    ap: (fnAp) => Container(fnAp.value(a))
  })
  Container.of = (a) => Container(a)

  assert(Container.of("WAT").value, Container("WAT").value)
}
{
  // Maybe :: a -> Maybe a
  const Maybe = (a) => ({
    value: a,
    // map :: Maybe a -> (a -> b) -> Maybe b
    map: (fn) => a ? Maybe(fn(a)) : Maybe(null),
    // ap :: Container a -> Container (a -> b) -> Container b
    ap: (fnAp) => a ? Maybe(fnAp.value(a)) : Maybe(null)
  })
  // get :: a -> b -> Maybe c
  const get = (property, object) => 
    Maybe(object[property])
    
  const data = { cat: 'starlord' } 
  const transformers = { cat: (a) => a.toUpperCase() }

  try {
    get('cat', data).map(get('cat', transformers))
  } catch (e) {}
  assert(get('cat', data).ap(get('cat', transformers)).value === 'STARLORD')
}
{
  // Maybe :: a -> Maybe a
  const Maybe = (a) => ({
    value: a,
    // map :: Maybe a -> (a -> b) -> Maybe b
    map: (fn) => a ? Maybe(fn(a)) : Maybe(null),
  })
  // find :: f -> [a] -> Maybe a
  const find = (predicate) => (list) => 
    Maybe(list.find(predicate))
  // get :: a -> b -> Maybe c
  const get = (property) => (object) => 
    Maybe(object[property])

  const accounts = [
    { owner: "pam", credit: 5000 }, 
    { owner: "sam", debt: 1000 }, 
  ]
  const selector = (name) => ({ owner }) => owner === name
  const pam = find(selector('pam'))(accounts)
    .map(get('credit'))
  assert(pam.value.value === 5000) // :(
  const sam = find(selector('sam'))(accounts)
    .map(get('credit'))
  assert(sam.value.value === undefined) //:(
}
{
  // Container :: a -> Container a
  const Container = (a) => ({
    value: a,
    // map :: Container a -> (a -> b) -> Container b
    map: (fn) => Container(fn(a)),
    // ap :: Container a -> Container (a -> b) -> Container b
    ap: (fnAp) => Container(fnAp.value(a)),
    // chain :: Container a -> (a -> Chain b) -> Chain b
    chain: (fnCh) => fnCh(a)  // better: map(a).value
  })

  assert(Container("WAT")
    .chain(a => Container("B" + a))
    .chain(a => Container(a + "C")).value,
    "BWATC")
}
{
  // Container :: a -> Container a
  const Container = (a) => ({
    value: a,
    // map :: Container a -> (a -> b) -> Container b
    map: (fn) => Container(fn(a)),
    // ap :: Container a -> Container (a -> b) -> Container b
    ap: (fnAp) => Container(fnAp.value(a)),
    // chain :: Container a -> (a -> Chain b) -> Chain b
    chain: (fnCh) => fnCh(a)  // better: map(a).value
  })
  Container.of = (a) => Container(a)
  //Definitely a monad
}
{
  // Maybe :: a -> Maybe a
  const Maybe = (a) => ({
    value: a,
    // map :: Maybe a -> (a -> b) -> Maybe b
    map: (fn) => a ? Maybe(fn(a)) : Maybe(null),
    // ap :: Maybe a -> Maybe (a -> b) -> Maybe b
    ap: (fnAp) => Maybe(fnAp.value(a)),
    // chain :: Maybe a -> (a -> Maybe b) -> Maybe b
    chain: (fnCh) => fnCh(a)  // or map(a).value
  })
  Maybe.of = (a) => Maybe(a)
}
{
  // Maybe :: a -> Maybe a
  const Maybe = (a) => ({
    value: a,
    // map :: Maybe a -> (a -> b) -> Maybe b
    map: (fn) => a ? Maybe(fn(a)) : Maybe(null),
    // ap :: Maybe a -> Maybe (a -> b) -> Maybe b
    ap: (fnAp) => Maybe(fnAp.value(a)),
    // chain :: Maybe a -> (a -> Maybe b) -> Maybe b
    chain: (fnCh) => fnCh(a)  // or map(a).value
  })
  Maybe.of = (a) => Maybe(a)
  // find :: f -> [a] -> Maybe a
  const find = (predicate) => (list) => 
    Maybe(list.find(predicate))
  // get :: a -> b -> Maybe c
  const get = (property) => (object) => 
    Maybe(object[property])

  const accounts = [
    { owner: "pam", credit: 5000 }, 
    { owner: "sam", debt: 1000 }, 
  ]
  const selector = (name) => ({ owner }) => owner === name
  const pam = find(selector('pam'))(accounts)
    .chain(get('credit'))
  assert(pam.value === 5000) // :)
  const sam = find(selector('sam'))(accounts)
    .chain(get('credit'))
  assert(sam.value === undefined) // :)
}
