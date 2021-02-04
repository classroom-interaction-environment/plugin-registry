import { check } from "meteor/check"

export const createRegisterHandler = ({ target }) => {
  return  function (name, /* async */ importFct) {
    check(name, String)
    check(importFct, Function)
    target.registered.set(name, importFct)
  }
}
